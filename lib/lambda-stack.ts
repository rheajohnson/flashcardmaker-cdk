import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import { Function, Runtime, AssetCode } from '@aws-cdk/aws-lambda';
import { Table } from '@aws-cdk/aws-dynamodb';

interface Props extends StackProps {
    dynamoTable: Table;
}

export class LambdaStack extends Stack {
    public readonly setGetAll: Function;
    public readonly setCreate: Function;
    public readonly setGet: Function;
    public readonly setUpdate: Function;
    public readonly setDelete: Function;
    public readonly flashcardGetAll: Function;
    public readonly flashcardCreate: Function;
    public readonly flashcardGet: Function;
    public readonly flashcardUpdate: Function;
    public readonly flashcardDelete: Function;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        // sets resource
        const setGetAll = new Function(this, 'setGetAll', {
            code: new AssetCode('src'),
            handler: 'set-get-all.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const setGet = new Function(this, 'setGet', {
            code: new AssetCode('src'),
            handler: 'set-get.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const setCreate = new Function(this, 'setCreate', {
            code: new AssetCode('src'),
            handler: 'set-create.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const setUpdate = new Function(this, 'setUpdate', {
            code: new AssetCode('src'),
            handler: 'set-update.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const setDelete = new Function(this, 'setDelete', {
            code: new AssetCode('src'),
            handler: 'set-delete.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        // flashcard resource
        const flashcardGetAll = new Function(this, 'flashcardGetAll', {
            code: new AssetCode('src'),
            handler: 'flashcard-get-all.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const flashcardGet = new Function(this, 'flashcardGet', {
            code: new AssetCode('src'),
            handler: 'flashcard-get.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const flashcardCreate = new Function(this, 'flashcardCreate', {
            code: new AssetCode('src'),
            handler: 'flashcard-create.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const flashcardUpdate = new Function(this, 'flashcardUpdate', {
            code: new AssetCode('src'),
            handler: 'flashcard-update.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const flashcardDelete = new Function(this, 'flashcardDelete', {
            code: new AssetCode('src'),
            handler: 'flashcard-delete.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        // granting permissions for all lambdas
        props.dynamoTable.grantReadWriteData(setGetAll);
        props.dynamoTable.grantReadWriteData(setCreate);
        props.dynamoTable.grantReadWriteData(setGet);
        props.dynamoTable.grantReadWriteData(setUpdate);
        props.dynamoTable.grantReadWriteData(setDelete);
        props.dynamoTable.grantReadWriteData(flashcardGetAll);
        props.dynamoTable.grantReadWriteData(flashcardCreate);
        props.dynamoTable.grantReadWriteData(flashcardGet);
        props.dynamoTable.grantReadWriteData(flashcardUpdate);
        props.dynamoTable.grantReadWriteData(flashcardDelete);

        // sharing between stacks
        this.setGetAll = setGetAll;
        this.setCreate = setCreate;
        this.setGet = setGet;
        this.setUpdate = setUpdate;
        this.setDelete = setDelete;
        this.flashcardGetAll = flashcardGetAll;
        this.flashcardCreate = flashcardCreate;
        this.flashcardGet = flashcardGet;
        this.flashcardUpdate = flashcardUpdate;
        this.flashcardDelete = flashcardDelete;
    }
}
