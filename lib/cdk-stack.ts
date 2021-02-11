import { Cors, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi, IResource } from '@aws-cdk/aws-apigateway';
import { AttributeType, Table, BillingMode } from '@aws-cdk/aws-dynamodb';
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');

export class ApigCrudStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const modelName = 'flashcard-maker';

    const dynamoTable = new Table(this, modelName, {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: `pk`,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: `sk`,
        type: AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: modelName,
    });

    const api = new RestApi(this, `${modelName}-api`, {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      restApiName: `${modelName} Service`,
    });

    // sets resource
    const setGetAll = new lambda.Function(this, 'setGetAll', {
      code: new lambda.AssetCode('src'),
      handler: 'sets-get-all.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setGet = new lambda.Function(this, 'setGet', {
      code: new lambda.AssetCode('src'),
      handler: 'sets-get.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setCreate = new lambda.Function(this, 'setCreate', {
      code: new lambda.AssetCode('src'),
      handler: 'sets-create.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setUpdate = new lambda.Function(this, 'setUpdate', {
      code: new lambda.AssetCode('src'),
      handler: 'sets-update-one.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setDelete = new lambda.Function(this, 'setDelete', {
      code: new lambda.AssetCode('src'),
      handler: 'sets-delete-one.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    dynamoTable.grantReadWriteData(setGetAll);
    dynamoTable.grantReadWriteData(setGet);
    dynamoTable.grantReadWriteData(setCreate);
    dynamoTable.grantReadWriteData(setUpdate);
    dynamoTable.grantReadWriteData(setDelete);

    const setResource = api.root.addResource('sets');
    const setGetAllIntegration = new LambdaIntegration(setGetAll);
    setResource.addMethod('GET', setGetAllIntegration);

    const setCreateIntegration = new LambdaIntegration(setCreate);
    setResource.addMethod('POST', setCreateIntegration);

    const singleSetResource = setResource.addResource('{set_id}');
    const setGetIntegration = new LambdaIntegration(setGet);
    singleSetResource.addMethod('GET', setGetIntegration);

    const setUpdateIntegration = new LambdaIntegration(setUpdate);
    singleSetResource.addMethod('PATCH', setUpdateIntegration);

    const setDeleteIntegration = new LambdaIntegration(setDelete);
    singleSetResource.addMethod('DELETE', setDeleteIntegration);


    // flashcard resource
    const flashcardGetAll = new lambda.Function(this, 'flashcardGetAll', {
      code: new lambda.AssetCode('src'),
      handler: 'flashcard-get-all.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardGet = new lambda.Function(this, 'flashcardGet', {
      code: new lambda.AssetCode('src'),
      handler: 'flashcard-get.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardCreate = new lambda.Function(this, 'flashcardCreate', {
      code: new lambda.AssetCode('src'),
      handler: 'flashcard-create.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardUpdate = new lambda.Function(this, 'flashcardUpdate', {
      code: new lambda.AssetCode('src'),
      handler: 'flashcard-update-one.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardDelete = new lambda.Function(this, 'flashcardDelete', {
      code: new lambda.AssetCode('src'),
      handler: 'flashcard-delete-one.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    dynamoTable.grantReadWriteData(flashcardGetAll);
    dynamoTable.grantReadWriteData(flashcardGet);
    dynamoTable.grantReadWriteData(flashcardCreate);
    dynamoTable.grantReadWriteData(flashcardUpdate);
    dynamoTable.grantReadWriteData(flashcardDelete);

    const flashcardResource = setResource.addResource('flashcards');
    const flashcardGetAllIntegration = new LambdaIntegration(flashcardGetAll);
    flashcardResource.addMethod('GET', flashcardGetAllIntegration);

    const flashcardCreateIntegration = new LambdaIntegration(flashcardCreate);
    flashcardResource.addMethod('POST', flashcardCreateIntegration);

    const singleFlashcardResource = flashcardResource.addResource('{flashcard_id}');
    const flashcardGetIntegration = new LambdaIntegration(flashcardGet);
    singleFlashcardResource.addMethod('GET', flashcardGetIntegration);

    const flashcardUpdateIntegration = new LambdaIntegration(flashcardUpdate);
    singleFlashcardResource.addMethod('PATCH', flashcardUpdateIntegration);

    const flashcardDeleteIntegration = new LambdaIntegration(flashcardDelete);
    singleFlashcardResource.addMethod('DELETE', flashcardDeleteIntegration);
  }
}


export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod('OPTIONS', new MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })
}