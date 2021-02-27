import AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: any = {}): Promise<any> => {

    const requestedItemId = event.pathParameters.set_id;
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const params: any = {
        TableName: TABLE_NAME,
        Key: {
            pk: `sets`,
            sk: `metadata#set#${requestedItemId}`
        }
    }

    try {
        const response = await db.get(params).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(response.Item)
        };
    } catch (dbError) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(dbError)
        };
    }
};