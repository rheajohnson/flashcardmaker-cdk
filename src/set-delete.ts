import AWS = require('aws-sdk');
import { Json } from 'aws-sdk/clients/robomaker';
import { PromiseResult } from 'aws-sdk/lib/request';

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

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

    const getAllFlaschardsParams: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': "sets",
            ':sk': "metadata#"
        }
    }
    try {
        await db.delete(deleteSetParams).promise();
        const getAllFlashcardsResponse: Promise<Json> = Promise.resolve<any>(db.query(getAllFlaschardsParams).promise());
        const getAllFlashcards = JSON.parse(await getAllFlashcardsResponse)
        for (const item of getAllFlashcards) {
            const deleteFlashcardParams: any = {
                TableName: TABLE_NAME,
                KeyConditionExpression: 'pk = :pk and sk begins_with :sk',
                ExpressionAttributeValues: {
                    ':pk': "sets",
                    ':sk': `set#${requestedItemId}#flashcard#${item.id}`
                }
            }
            await db.delete(deleteFlashcardParams).promise();
        }
        return { statusCode: 200, body: '' };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};