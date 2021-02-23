import AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

export const handler = async (): Promise<any> => {

    const params: any = {
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk and begins_with(item_type, :item_type)',
        ExpressionAttributeValues: {
            ':pk': "sets",
            ':item_type': "type#public#set",
        },
        IndexName: "item_type"
    }

    try {
        const response = await db.query(params).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(response.Items)
        };

    } catch (dbError) {
        return { statusCode: 500, body: JSON.stringify(dbError) };
    }
};