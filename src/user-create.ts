import AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const requiredFields = ["email", "id"]
    for (const requiredField of requiredFields) {
        if (!(requiredField in item)) {
            return { statusCode: 400, body: `invalid request, you are missing the body parameter: ${requiredField}` };
        }
    }
    const date = new Date();
    const params = {
        TableName: TABLE_NAME,
        Item: {
            pk: 'users',
            sk: `${event.body.email}`,
            sets: [],
            created_on: date.getTime(),
            id: `${event.body.email}`
        }
    };

    try {
        await db.put(params).promise();
        return { statusCode: 201, body: JSON.stringify({ ...params.Item }) };
    } catch (dbError) {
        console.error(dbError)
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};