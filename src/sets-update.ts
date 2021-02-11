
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || '';

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {

    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }

    const editedItemId = event.pathParameters.set_id;
    if (!editedItemId) {
        return { statusCode: 400, body: 'invalid request, you are missing the path parameter id' };
    }

    const editedItem: any = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    const editedItemProperties = Object.keys(editedItem);
    if (!editedItem || editedItemProperties.length < 1) {
        return { statusCode: 400, body: 'invalid request, no arguments provided' };
    }

    const allowedProperties = ["name", "description"]
    const editedItemPropertiesFiltered: Array<string> = editedItemProperties.filter(editedItemProperty => editedItemProperty in allowedProperties)

    if (editedItemPropertiesFiltered.length < 1) {
        return { statusCode: 400, body: 'invalid request, no valid arguments provided' };
    }

    const date = new Date();
    editedItem.updated_on = date.getTime();
    editedItemPropertiesFiltered.push("updated_on")

    const firstProperty = editedItemPropertiesFiltered.splice(0, 1);
    const params: any = {
        TableName: TABLE_NAME,
        Key: {
            pk: `sets`,
            sk: `metadata#set#${editedItemId}`
        },
        UpdateExpression: `set ${firstProperty} = :${firstProperty}`,
        ExpressionAttributeValues: {},
        ReturnValues: 'UPDATED_NEW'
    }
    params.ExpressionAttributeValues[`:${firstProperty}`] = editedItem[`${firstProperty}`];

    editedItemPropertiesFiltered.forEach(property => {
        params.UpdateExpression += `, ${property} = :${property}`;
        params.ExpressionAttributeValues[`:${property}`] = editedItem[property];
    });

    try {
        await db.update(params).promise();
        return { statusCode: 204, body: '' };
    } catch (dbError) {
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};