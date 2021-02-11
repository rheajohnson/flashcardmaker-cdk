
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (event: any = {}): Promise<any> => {

    const requestedSetId = event.pathParameters.set_id;
    const requestedFlashcardId = event.pathParameters.flashcard_id;
    if (!requestedSetId || !requestedFlashcardId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const flashcardPutParams = {
        TableName: TABLE_NAME,
        Key: {
            pk: "sets",
            sk: `set#${requestedSetId}#flashcard#${requestedFlashcardId}`
        }
    };

    const setPutParams: any = {
        TableName: TABLE_NAME,
        Key: {
            pk: `sets`,
            sk: `metadata#set#${requestedSetId}`
        },
        UpdateExpression: `set count = :count`,
        ExpressionAttributeValues: { ":count": { "N": "1" } },
        ReturnValues: 'UPDATED_NEW'
    }

    try {
        await db.delete(flashcardPutParams).promise();
        await db.update(setPutParams).promise();
        return { statusCode: 200, body: '' };
    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};