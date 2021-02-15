import { LambdaIntegration, RestApi, CfnAuthorizer, PassthroughBehavior, MockIntegration, Cors, IResource } from '@aws-cdk/aws-apigateway';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Function } from '@aws-cdk/aws-lambda';
import { AuthorizationType } from '@aws-cdk/aws-apigateway';
import { UserPool, AccountRecovery } from '@aws-cdk/aws-cognito'

interface Props extends StackProps {
    modelName: string;
    setGetAll: Function;
    setCreate: Function;
    setGet: Function;
    setUpdate: Function;
    setDelete: Function;
    flashcardGetAll: Function;
    flashcardCreate: Function;
    flashcardGet: Function;
    flashcardUpdate: Function;
    flashcardDelete: Function;
}

export class ApiCognitoStack extends Stack {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        // creating api
        const api = new RestApi(this, `${props.modelName}-api`, {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials']
            },
            restApiName: `${props.modelName}-service`,
        });

        // adding root get method
        api.root.addMethod('GET', new MockIntegration({
            integrationResponses: [{
                statusCode: '200',
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,Access-Control-Allow-Credentials'",
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


        // cognito
        const userPool = new UserPool(this, "userPool", {
            accountRecovery: AccountRecovery.EMAIL_ONLY,
            selfSignUpEnabled: true,
            autoVerify: { email: true },
            signInAliases: { email: true, username: true },
            signInCaseSensitive: false,
        });

        userPool.addClient("client", {
            generateSecret: false,
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                }
            },
        });

        userPool.addDomain("domain", {
            cognitoDomain: {
                domainPrefix: `${props.modelName}`,
            },
        });

        const authorizer = new CfnAuthorizer(this, 'cfnAuth', {
            restApiId: api.restApiId,
            name: `${props.modelName}-authorizer`,
            type: 'COGNITO_USER_POOLS',
            identitySource: 'method.request.header.Authorization',
            providerArns: [userPool.userPoolArn],
        })

        // sets resource
        const setResource = api.root.addResource('sets');

        const setGetAllIntegration = new LambdaIntegration(props.setGetAll);

        setResource.addMethod('GET', setGetAllIntegration, {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.ref
            }
        })

        const setCreateIntegration = new LambdaIntegration(props.setCreate);
        setResource.addMethod('POST', setCreateIntegration);

        const singleSetResource = setResource.addResource('{set_id}');
        const setGetIntegration = new LambdaIntegration(props.setGet);
        singleSetResource.addMethod('GET', setGetIntegration);

        const setUpdateIntegration = new LambdaIntegration(props.setUpdate);
        singleSetResource.addMethod('PUT', setUpdateIntegration);

        const setDeleteIntegration = new LambdaIntegration(props.setDelete);
        singleSetResource.addMethod('DELETE', setDeleteIntegration);

        // flashcards resource
        const flashcardResource = singleSetResource.addResource('flashcards');

        const flashcardGetAllIntegration = new LambdaIntegration(props.flashcardGetAll);
        flashcardResource.addMethod('GET', flashcardGetAllIntegration);

        const flashcardCreateIntegration = new LambdaIntegration(props.flashcardCreate);
        flashcardResource.addMethod('POST', flashcardCreateIntegration);

        const singleFlashcardResource = flashcardResource.addResource('{flashcard_id}');
        const flashcardGetIntegration = new LambdaIntegration(props.flashcardGet);
        singleFlashcardResource.addMethod('GET', flashcardGetIntegration);

        const flashcardUpdateIntegration = new LambdaIntegration(props.flashcardUpdate);
        singleFlashcardResource.addMethod('PUT', flashcardUpdateIntegration);

        const flashcardDeleteIntegration = new LambdaIntegration(props.flashcardDelete);
        singleFlashcardResource.addMethod('DELETE', flashcardDeleteIntegration);
    }
}
