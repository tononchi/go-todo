package models

import "time"

type Todo struct {
	ID        string    `json:"id" dynamodbav:"id"`
	Title     string    `json:"title" dynamodbav:"title"`
	Completed bool      `json:"completed" dynamodbav:"completed"`
	CreatedAt time.Time `json:"createdAt" dynamodbav:"createdAt"`
}

type CreateTodoInput struct {
	Title string `json:"title" binding:"required"`
}

type UpdateTodoInput struct {
	Completed bool `json:"completed"`
}
