package main

import (
	"log"
	"ventura/internal/handler"
	"ventura/internal/models"
	"ventura/internal/repository"
	"ventura/internal/service"
	"ventura/internal/worker"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Database connection (using default for now, should be env var)
	dsn := "host=127.0.0.1 user=postgres password=postgres dbname=ventura port=5433 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	db.AutoMigrate(&models.Investment{}, &models.Metrics{})

	// Repositories
	investmentRepo := repository.NewInvestmentRepository(db)

	// Services
	investmentService := service.NewInvestmentService(investmentRepo)

	// Handlers
	investmentHandler := handler.NewInvestmentHandler(investmentService)

	// Start Background Workers
	worker.StartNewsFetcher()

	// Router
	r := gin.Default()

	// Routes
	r.GET("/health", handler.HealthCheck)
	r.POST("/investments", investmentHandler.CreateInvestment)

	// Start server
	r.Run(":8080")
}
