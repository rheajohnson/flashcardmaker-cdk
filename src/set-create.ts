import AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {
    console.log("BOOOOOOO");
    console.log("event: ", event.body);

    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    console.log("item: ", item)
    const requiredFields = ["name", "description"]
    for (const requiredField of requiredFields) {
        if (!(requiredField in item)) {
            return { statusCode: 400, body: `invalid request, you are missing the body parameter: ${requiredField}` };
        }
    }
    const key = uuidv4();
    const date = new Date();
    const params = {
        TableName: TABLE_NAME,
        Item: {
            pk: 'sets',
            sk: `metadata#set#${key}`,
            id: key,
            name: item.name || "",
            description: item.description || "",
            count: 0,
            created_on: date.getTime(),
            flashcards: []
        }
    };

    try {
        await db.put(params).promise();
        return { statusCode: 201, body: JSON.stringify({ id: key }) };
    } catch (dbError) {
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};