import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';

export class TodoAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const todoTable = new dynamodb.Table(this, 'TodoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'Todos',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // 開発環境用
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda Function
    const todoFunction = new lambda.Function(this, 'TodoFunction', {
      runtime: lambda.Runtime.GO_1_X,
      handler: 'main',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda'), {
        bundling: {
          image: lambda.Runtime.GO_1_X.bundlingImage,
          command: [
            'bash', '-c', [
              'go mod download',
              'go build -o /asset-output/main',
            ].join(' && '),
          ],
          user: 'root',
        },
      }),
      environment: {
        AWS_REGION: cdk.Stack.of(this).region,
      },
    });

    // DynamoDBへのアクセス権限を付与
    todoTable.grantReadWriteData(todoFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Origin'],
        allowCredentials: true,
      },
    });

    const todos = api.root.addResource('todos');
    const todo = todos.addResource('{id}');

    // GET /todos
    todos.addMethod('GET', new apigateway.LambdaIntegration(todoFunction));

    // POST /todos
    todos.addMethod('POST', new apigateway.LambdaIntegration(todoFunction));

    // PATCH /todos/{id}
    todo.addMethod('PATCH', new apigateway.LambdaIntegration(todoFunction));

    // DELETE /todos/{id}
    todo.addMethod('DELETE', new apigateway.LambdaIntegration(todoFunction));

    // Output
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
    });
  }
}
