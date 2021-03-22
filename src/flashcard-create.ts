import AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {

    const requestedSetId = event.pathParameters.set_id;

    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const requiredFields = ["term", "definition"]
    for (const requiredField of requiredFields) {
        if (!(requiredField in item)) {
            return { statusCode: 400, body: `invalid request, you are missing the body parameter ${requiredField}` };
        }
    }
    const key = uuidv4();
    const date = new Date();
    const flashcardPutParams = {
        TableName: TABLE_NAME,
        Item: {
            pk: 'sets',
            sk: `set#${requestedSetId}#flashcard#${key}`,
            term: item.term || "",
            definition: item.definition || "",
            id: key,
            created_on: date.getTime()
        }
    };

    const setPutParams: any = {
        TableName: TABLE_NAME,
        Key: {
            pk: `sets`,
            sk: `metadata#set#${requestedSetId}`
        },
        UpdateExpression: 'add #count :count',
        ExpressionAttributeNames: {
            '#count': 'count'
        },
        ExpressionAttributeValues: { ":count": 1 },
        ReturnValues: 'UPDATED_NEW'
    }

    try {
        await db.put(flashcardPutParams).promise();
        await db.update(setPutParams).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(flashcardPutParams.Item)
        };
    } catch (dbError) {
        console.error(dbError.message)
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: errorResponse
        };
    }
};