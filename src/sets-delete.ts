
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || 'pk';

export const handler = async (event: any = {}): Promise<any> => {

    const requestedItemId = event.pathParameters.set_id;
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const deleteSetParams = {
        TableName: TABLE_NAME,
        Key: {
            pk: `sets`,
            sk: `metadata#set#${requestedItemId}`
        }
    };

    const deleteFlashcardParams: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and sk begins_with :sk',
        ExpressionAttributeValues: {
            ':pk': "sets",
            ':sk': `set#${requestedItemId}#flashcard`
        }
    }

    try {
        await db.delete(deleteSetParams).promise();
        await db.delete(deleteFlashcardParams).promise();
        return { statusCode: 200, body: '' };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};