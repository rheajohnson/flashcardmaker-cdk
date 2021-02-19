#!/usr/bin/env node

import * as cdk from '@aws-cdk/core';
import { DynamoStack } from '../lib/dynamo-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ApiCognitoStack } from '../lib/api-cognito-stack';

const app = new cdk.App();

const modelName = 'flashcard-maker';

const dynamoStack = new DynamoStack(app, `${modelName}-dynamo-stack`, { modelName });
const lambdaStack = new LambdaStack(app, `${modelName}-lambda-stack`, { dynamoTable: dynamoStack.dynamoTable });
new ApiCognitoStack(app, `${modelName}-api-cognito-stack`, {
    modelName,
    setGetAll: lambdaStack.setGetAll,
    setCreate: lambdaStack.setCreate,
    setGet: lambdaStack.setGet,
    setUpdate: lambdaStack.setUpdate,
    setDelete: lambdaStack.setDelete,
    flashcardGetAll: lambdaStack.flashcardGetAll,
    flashcardCreate: lambdaStack.flashcardCreate,
    flashcardGet: lambdaStack.flashcardGet,
    flashcardUpdate: lambdaStack.flashcardUpdate,
    flashcardDelete: lambdaStack.flashcardDelete,
    userCreate: lambdaStack.userCreate,
    userGet: lambdaStack.userGet,
    userUpdate: lambdaStack.userUpdate,
    userDelete: lambdaStack.userDelete,
});
