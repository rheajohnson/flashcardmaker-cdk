import AWS = require('aws-sdk');
import { Json } from 'aws-sdk/clients/robomaker';

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: any = {}): Promise<any> => {

    const requestedItemId = event.pathParameters.email;
    if (!requestedItemId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const getUserParams: any = {
        TableName: TABLE_NAME,
        Key: {
            pk: `users`,
            sk: `${requestedItemId}`
        }
    }

    const deleteUserParams = {
        TableName: TABLE_NAME,
        Key: {
            pk: `users`,
            sk: `${requestedItemId}`,
        }
    };


    try {
        const user: any = await db.get(getUserParams).promise();
        for (const set of user.Item.set) {
            const deleteSetParams = {
                TableName: TABLE_NAME,
                Key: {
                    pk: `sets`,
                    sk: `metadata#set#${set.id}`
                }
            };

            const getAllFlashcardParams: any = {
                TableName: TABLE_NAME,
                KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
                ExpressionAttributeValues: {
                    ':pk': "sets",
                    ':sk': `set#${set.id}`
                }
            }
            await db.delete(deleteSetParams).promise();
            const getAllFlashcardsResponse: Promise<Json> = Promise.resolve<any>(db.query(getAllFlashcardParams).promise());
            const getAllFlashcards: any = await getAllFlashcardsResponse;
            for (const flashcard of getAllFlashcards.Items) {
                const deleteFlashcardParams: any = {
                    TableName: TABLE_NAME,
                    Key: {
                        pk: "sets",
                        sk: `set#${set.id}#flashcard#${flashcard.id} `
                    }
                }
                await db.delete(deleteFlashcardParams).promise();
            }
        }
        await db.delete(deleteUserParams).promise();
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