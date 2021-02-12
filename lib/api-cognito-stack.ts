import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { Function } from '@aws-cdk/aws-lambda';
import { AuthorizationType } from '@aws-cdk/aws-apigateway';
import { CfnAuthorizer } from '@aws-cdk/aws-apigateway';
import { Cors, MockIntegration, PassthroughBehavior } from '@aws-cdk/aws-apigateway';
import { UserPool, OAuthScope, CfnUserPoolResourceServer } from '@aws-cdk/aws-cognito'

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
            },
            restApiName: `${props.modelName} Service`,
        });

        // adding root get method
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

        // cognito
        const userPool = new UserPool(this, "userPool", {
            selfSignUpEnabled: true, // Allow users to sign up
            autoVerify: { email: true }, // Verify email addresses by sending a verification code
            signInAliases: { email: true }, // Set email as an alias

        });

        userPool.addClient("client", {
            generateSecret: true,
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
        });

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