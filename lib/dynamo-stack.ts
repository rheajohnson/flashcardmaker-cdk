import { AttributeType, Table, BillingMode } from '@aws-cdk/aws-dynamodb';
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { DynamoDB } from 'aws-sdk';

interface Props extends StackProps {
    modelName: string;
}

export class DynamoStack extends Stack {
    public readonly dynamoTable: Table;
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        // creating dynamo table
        const dynamoTable = new Table(this, props.modelName, {
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
            tableName: props.modelName,
        });

        dynamoTable.addLocalSecondaryIndex({
            indexName: "item_type", sortKey: {
                name: "item_type", type: AttributeType.STRING,
            }
        })

        // sharing between stacks
        this.dynamoTable = dynamoTable;
    }
}
