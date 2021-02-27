import AWS = require('aws-sdk');
import { Json } from 'aws-sdk/clients/robomaker';

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

    const getAllFlashcardParams: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': "sets",
            ':sk': `set#${requestedItemId}`
        }
    }
    try {
        await db.delete(deleteSetParams).promise();
        const getAllFlashcardsResponse: Promise<Json> = Promise.resolve<any>(db.query(getAllFlashcardParams).promise());
        const getAllFlashcards: any = await getAllFlashcardsResponse;
        for (const item of getAllFlashcards.Items) {
            const deleteFlashcardParams: any = {
                TableName: TABLE_NAME,
                Key: {
                    pk: "sets",
                    sk: `set#${requestedItemId}#flashcard#${item.id}`
                }
            }
            await db.delete(deleteFlashcardParams).promise();
        }
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: ''
        };
    } catch (dbError) {
        console.error(dbError)
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(dbError)
        };
    }
};