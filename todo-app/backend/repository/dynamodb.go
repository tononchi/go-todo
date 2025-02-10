package repository

import (
	"context"
	"time"
	"todo-app/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
)

type TodoRepository struct {
	client    *dynamodb.Client
	tableName string
}

func NewTodoRepository(client *dynamodb.Client, tableName string) *TodoRepository {
	return &TodoRepository{
		client:    client,
		tableName: tableName,
	}
}

func (r *TodoRepository) CreateTable(ctx context.Context) error {
	_, err := r.client.CreateTable(ctx, &dynamodb.CreateTableInput{
		AttributeDefinitions: []types.AttributeDefinition{
			{
				AttributeName: aws.String("id"),
				AttributeType: types.ScalarAttributeTypeS,
			},
		},
		KeySchema: []types.KeySchemaElement{
			{
				AttributeName: aws.String("id"),
				KeyType:       types.KeyTypeHash,
			},
		},
		TableName:   aws.String(r.tableName),
		BillingMode: types.BillingModePayPerRequest,
	})
	return err
}

func (r *TodoRepository) GetAll(ctx context.Context) ([]models.Todo, error) {
	result, err := r.client.Scan(ctx, &dynamodb.ScanInput{
		TableName: aws.String(r.tableName),
	})
	if err != nil {
		return nil, err
	}

	var todos []models.Todo
	err = attributevalue.UnmarshalListOfMaps(result.Items, &todos)
	if err != nil {
		return nil, err
	}

	return todos, nil
}

func (r *TodoRepository) Create(ctx context.Context, input models.CreateTodoInput) (*models.Todo, error) {
	todo := &models.Todo{
		ID:        uuid.New().String(),
		Title:     input.Title,
		Completed: false,
		CreatedAt: time.Now(),
	}

	item, err := attributevalue.MarshalMap(todo)
	if err != nil {
		return nil, err
	}

	_, err = r.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(r.tableName),
		Item:      item,
	})
	if err != nil {
		return nil, err
	}

	return todo, nil
}

func (r *TodoRepository) Update(ctx context.Context, id string, input models.UpdateTodoInput) (*models.Todo, error) {
	result, err := r.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(r.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})
	if err != nil {
		return nil, err
	}

	var todo models.Todo
	err = attributevalue.UnmarshalMap(result.Item, &todo)
	if err != nil {
		return nil, err
	}

	todo.Completed = input.Completed

	item, err := attributevalue.MarshalMap(todo)
	if err != nil {
		return nil, err
	}

	_, err = r.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(r.tableName),
		Item:      item,
	})
	if err != nil {
		return nil, err
	}

	return &todo, nil
}

func (r *TodoRepository) Delete(ctx context.Context, id string) error {
	_, err := r.client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(r.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: id},
		},
	})
	return err
}
