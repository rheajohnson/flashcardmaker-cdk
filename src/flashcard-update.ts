
import AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const RESERVED_RESPONSE = `Error:You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error:Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {

    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }

    const requestedSetId = event.pathParameters.set_id;
    const requestedFlashcardId = event.pathParameters.flashcard_id;
    if (!requestedSetId || !requestedFlashcardId) {
        return { statusCode: 400, body: `Error: You are missing the path parameter id` };
    }

    const editedItem: any = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const editedItemProperties = Object.keys(editedItem);
    const allowedProperties = ["term", "definition"]
    const editedItemPropertiesFiltered: Array<string> = editedItemProperties.filter(editedItemProperty => allowedProperties.includes(editedItemProperty))
    if (!editedItem || editedItemProperties.length < 1 || editedItemPropertiesFiltered.length < 1) {
        return { statusCode: 400, body: 'invalid request, no arguments provided' };
    }

    const date = new Date();
    editedItem.updated_on = date.getTime();
    editedItemPropertiesFiltered.push("updated_on")

    const firstProperty = editedItemPropertiesFiltered.splice(0, 1);
    const params: any = {
        TableName: TABLE_NAME,
        Key: {
            pk: `sets`,
            sk: `set#${requestedSetId}#flashcard#${requestedFlashcardId}`
        },
        UpdateExpression: `set #${firstProperty} = :${firstProperty}`,
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {},
        ReturnValues: 'UPDATED_NEW'
    }
    params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];
    params.ExpressionAttributeNames[`#${firstProperty}`] = firstProperty;

    editedItemPropertiesFiltered.forEach(property => {
        params.UpdateExpression += `, #${property} = :${property}`;
        params.ExpressionAttributeValues[`:${property}`] = `${editedItem[property]}`;
        params.ExpressionAttributeNames[`#${property}`] = property;
    });

    try {
        await db.update(params).promise();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: ''
        };
    } catch (dbError) {
        console.error(dbError.message)
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: errorResponse
        };
    }
};