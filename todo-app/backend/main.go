package main

import (
	"context"
	"log"
	"todo-app/handlers"
	"todo-app/repository"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// AWS設定の読み込み
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatal(err)
	}

	// DynamoDBクライアントの作成
	client := dynamodb.NewFromConfig(cfg)

	// リポジトリの初期化
	repo := repository.NewTodoRepository(client, "Todos")

	// テーブルの作成（存在しない場合）
	if err := repo.CreateTable(context.TODO()); err != nil {
		log.Printf("Failed to create table: %v", err)
	}

	// ハンドラーの初期化
	todoHandler := handlers.NewTodoHandler(repo)

	// Ginルーターの設定
	r := gin.Default()

	// CORSミドルウェアの設定
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// ルートの設定
	r.GET("/todos", todoHandler.GetAll)
	r.POST("/todos", todoHandler.Create)
	r.PATCH("/todos/:id", todoHandler.Update)
	r.DELETE("/todos/:id", todoHandler.Delete)

	// サーバーの起動
	if err := r.Run(":3000"); err != nil {
		log.Fatal(err)
	}
}
