import { Cors, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi, IResource } from '@aws-cdk/aws-apigateway';
import { AttributeType, Table, BillingMode } from '@aws-cdk/aws-dynamodb';
import { Construct, RemovalPolicy, Stack, StackProps, Duration } from '@aws-cdk/core';
import { Function, Runtime, AssetCode } from '@aws-cdk/aws-lambda';

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
    const setGetAll = new Function(this, 'setGetAll', {
      code: new AssetCode('src'),
      handler: 'set-get-all.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setGet = new Function(this, 'setGet', {
      code: new AssetCode('src'),
      handler: 'set-get.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setCreate = new Function(this, 'setCreate', {
      code: new AssetCode('src'),
      handler: 'set-create.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setUpdate = new Function(this, 'setUpdate', {
      code: new AssetCode('src'),
      handler: 'set-update.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const setDelete = new Function(this, 'setDelete', {
      code: new AssetCode('src'),
      handler: 'set-delete.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    dynamoTable.grantReadWriteData(setGetAll);
    dynamoTable.grantReadWriteData(setGet);
    dynamoTable.grantReadWriteData(setCreate);
    dynamoTable.grantReadWriteData(setUpdate);
    dynamoTable.grantReadWriteData(setDelete);

    api.root.addMethod('GET', new MockIntegration({
      integrationResponses: [{
        statusCode: '200',
      }],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': '{ "statusCode": 200 }',
      },
    }), {
      methodResponses: [{ statusCode: '200' }],
    });

    const setResource = api.root.addResource('sets');
    const setGetAllIntegration = new LambdaIntegration(setGetAll);
    setResource.addMethod('GET', setGetAllIntegration);

    const setCreateIntegration = new LambdaIntegration(setCreate);
    setResource.addMethod('POST', setCreateIntegration);

    const singleSetResource = setResource.addResource('{set_id}');
    const setGetIntegration = new LambdaIntegration(setGet);
    singleSetResource.addMethod('GET', setGetIntegration);

    const setUpdateIntegration = new LambdaIntegration(setUpdate);
    singleSetResource.addMethod('PUT', setUpdateIntegration);

    const setDeleteIntegration = new LambdaIntegration(setDelete);
    singleSetResource.addMethod('DELETE', setDeleteIntegration);

    // flashcard resource
    const flashcardGetAll = new Function(this, 'flashcardGetAll', {
      code: new AssetCode('src'),
      handler: 'flashcard-get-all.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardGet = new Function(this, 'flashcardGet', {
      code: new AssetCode('src'),
      handler: 'flashcard-get.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardCreate = new Function(this, 'flashcardCreate', {
      code: new AssetCode('src'),
      handler: 'flashcard-create.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardUpdate = new Function(this, 'flashcardUpdate', {
      code: new AssetCode('src'),
      handler: 'flashcard-update.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    const flashcardDelete = new Function(this, 'flashcardDelete', {
      code: new AssetCode('src'),
      handler: 'flashcard-delete.handler',
      timeout: Duration.seconds(15),
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName
      }
    });

    dynamoTable.grantReadWriteData(flashcardGetAll);
    dynamoTable.grantReadWriteData(flashcardGet);
    dynamoTable.grantReadWriteData(flashcardCreate);
    dynamoTable.grantReadWriteData(flashcardUpdate);
    dynamoTable.grantReadWriteData(flashcardDelete);

    const flashcardResource = singleSetResource.addResource('flashcards');
    const flashcardGetAllIntegration = new LambdaIntegration(flashcardGetAll);
    flashcardResource.addMethod('GET', flashcardGetAllIntegration);

    const flashcardCreateIntegration = new LambdaIntegration(flashcardCreate);
    flashcardResource.addMethod('POST', flashcardCreateIntegration);

    const singleFlashcardResource = flashcardResource.addResource('{flashcard_id}');
    const flashcardGetIntegration = new LambdaIntegration(flashcardGet);
    singleFlashcardResource.addMethod('GET', flashcardGetIntegration);

    const flashcardUpdateIntegration = new LambdaIntegration(flashcardUpdate);
    singleFlashcardResource.addMethod('PUT', flashcardUpdateIntegration);

    const flashcardDeleteIntegration = new LambdaIntegration(flashcardDelete);
    singleFlashcardResource.addMethod('DELETE', flashcardDeleteIntegration);
  }
}
