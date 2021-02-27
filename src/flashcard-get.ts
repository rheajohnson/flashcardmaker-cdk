import AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || 'pk';

export const handler = async (event: any = {}): Promise<any> => {

    const requestedSetId = event.pathParameters.set_id;
    const requestedFlashcardId = event.pathParameters.flashcard_id;
    if (!requestedSetId || !requestedFlashcardId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const params = {
        TableName: TABLE_NAME,
        Key: {
            [PRIMARY_KEY]: `set#${requestedSetId}#flashcard${requestedFlashcardId}`,
        }
    };

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
