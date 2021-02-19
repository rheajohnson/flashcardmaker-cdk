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
    public readonly userCreate: Function;
    public readonly userGet: Function;
    public readonly userUpdate: Function;
    public readonly userDelete: Function;

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

        // user resource
        const userGet = new Function(this, 'userGet', {
            code: new AssetCode('src'),
            handler: 'user-get.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const userCreate = new Function(this, 'userCreate', {
            code: new AssetCode('src'),
            handler: 'user-create.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const userUpdate = new Function(this, 'userUpdate', {
            code: new AssetCode('src'),
            handler: 'user-update.handler',
            timeout: Duration.seconds(15),
            runtime: Runtime.NODEJS_12_X,
            environment: {
                TABLE_NAME: props.dynamoTable.tableName
            }
        });

        const userDelete = new Function(this, 'userDelete', {
            code: new AssetCode('src'),
            handler: 'user-delete.handler',
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
        props.dynamoTable.grantReadWriteData(userCreate);
        props.dynamoTable.grantReadWriteData(userGet);
        props.dynamoTable.grantReadWriteData(userUpdate);
        props.dynamoTable.grantReadWriteData(userDelete);

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
        this.userCreate = userCreate;
        this.userGet = userGet;
        this.userUpdate = userUpdate;
        this.userDelete = userDelete;
    }
}
