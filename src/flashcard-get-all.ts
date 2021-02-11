
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: any = {}): Promise<any> => {

    const requestedSetId = event.pathParameters.set_id;
    if (!requestedSetId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const params: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and sk begins_with :sk',
        ExpressionAttributeValues: {
            ':pk': "sets",
            ':sk': `set#${requestedSetId}#flashcard`
        }
    }

    try {
        const response = await db.scan(params).promise();
        return { statusCode: 200, body: JSON.stringify(response.Items) };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};