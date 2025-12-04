package main

import (
	"log"
	"ventura/internal/handler"
	"ventura/internal/models"
	"ventura/internal/repository"
	"ventura/internal/service"
	"ventura/internal/worker"

	"github.com/gin-contrib/cors"
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

	// Auto Migrate all models
	db.AutoMigrate(
		&models.Investment{},
		&models.Metrics{},
		&models.PortfolioCompany{},
		&models.Deal{},
		&models.Founder{},
		&models.MonthlyUpdate{},
		&models.Document{},
	)

	// Repositories
	investmentRepo := repository.NewInvestmentRepository(db)
	portfolioRepo := repository.NewPortfolioRepository(db)
	dealRepo := repository.NewDealRepository(db)

	// Services
	investmentService := service.NewInvestmentService(investmentRepo)
	analyticsService := service.NewAnalyticsService()

	// Handlers
	investmentHandler := handler.NewInvestmentHandler(investmentService)
	dashboardHandler := handler.NewDashboardHandler(portfolioRepo, analyticsService)
	dealHandler := handler.NewDealHandler(dealRepo)
	portfolioHandler := handler.NewPortfolioHandler(portfolioRepo)

	// Start Background Workers
	worker.StartNewsFetcher()

	// Router
	r := gin.Default()

	// CORS Middleware for frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health Check
	r.GET("/health", handler.HealthCheck)

	// Legacy Investment Routes
	r.POST("/investments", investmentHandler.CreateInvestment)

	// API Routes
	api := r.Group("/api")
	{
		// Dashboard Routes
		dashboard := api.Group("/dashboard")
		{
			dashboard.GET("", dashboardHandler.GetDashboard)
			dashboard.GET("/aum", dashboardHandler.GetAUM)
			dashboard.GET("/performance", dashboardHandler.GetPerformance)
			dashboard.GET("/sectors", dashboardHandler.GetSectors)
			dashboard.GET("/health", dashboardHandler.GetHealth)
		}

		// Portfolio Routes
		portfolio := api.Group("/portfolio")
		{
			portfolio.GET("/companies", portfolioHandler.GetCompanies)
			portfolio.POST("/companies", portfolioHandler.CreateCompany)
		}

		// Deal Flow Routes
		deals := api.Group("/deals")
		{
			deals.GET("", dealHandler.GetDeals)
			deals.POST("", dealHandler.CreateDeal)
			deals.PATCH("/:id/stage", dealHandler.UpdateDealStage)
		}
	}

	// Start server
	log.Println("Server starting on :8080")
	r.Run(":8080")
}
