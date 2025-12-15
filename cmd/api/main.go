package main

import (
	"log"
	"os"
	"strings"
	"ventura/internal/handler"
	"ventura/internal/middleware"
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
	// Database connection
	// Check for DATABASE_URL (Neon/Render format: postgres://user:pass@host/db?sslmode=require)
	// Falls back to local DSN if not set
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		// Local development fallback
		dsn = "host=127.0.0.1 user=postgres password=postgres dbname=ventura port=5433 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	// Auto Migrate all models
	db.AutoMigrate(
		&models.User{},
		&models.Investment{},
		&models.Metrics{},
		&models.PortfolioCompany{},
		&models.Deal{},
		&models.Founder{},
		&models.MonthlyUpdate{},
		&models.Document{},
	)

	// Repositories
	userRepo := repository.NewUserRepository(db)
	investmentRepo := repository.NewInvestmentRepository(db)
	portfolioRepo := repository.NewPortfolioRepository(db)
	dealRepo := repository.NewDealRepository(db)
	founderRepo := repository.NewFounderRepository(db)

	// Services
	investmentService := service.NewInvestmentService(investmentRepo)
	analyticsService := service.NewAnalyticsService()

	// Handlers
	authHandler := handler.NewAuthHandler(userRepo)
	investmentHandler := handler.NewInvestmentHandler(investmentService)
	dashboardHandler := handler.NewDashboardHandler(portfolioRepo, analyticsService)
	dealHandler := handler.NewDealHandler(dealRepo)
	portfolioHandler := handler.NewPortfolioHandler(portfolioRepo)
	founderHandler := handler.NewFounderHandler(founderRepo, portfolioRepo)

	// Start Background Workers
	worker.StartNewsFetcher()

	// Router
	r := gin.Default()

	// CORS Configuration - Support both production and local development
	allowedOrigins := []string{"http://localhost:3000"}
	if frontendURL := os.Getenv("FRONTEND_URL"); frontendURL != "" {
		// Add production frontend URL(s) - can be comma-separated
		for _, origin := range strings.Split(frontendURL, ",") {
			origin = strings.TrimSpace(origin)
			if origin != "" {
				allowedOrigins = append(allowedOrigins, origin)
			}
		}
	}
	log.Printf("CORS allowed origins: %v", allowedOrigins)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health Check (public)
	r.GET("/health", handler.HealthCheck)

	// Auth Routes (public)
	auth := r.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/refresh", authHandler.Refresh)
		auth.POST("/logout", authHandler.Logout)
		auth.GET("/me", middleware.AuthMiddleware(), authHandler.Me)
	}

	// Legacy Investment Routes (public for now)
	r.POST("/investments", investmentHandler.CreateInvestment)

	// Protected API Routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware()) // Require authentication for all /api routes
	{
		// Dashboard Routes
		dashboard := api.Group("/dashboard")
		{
			dashboard.GET("", dashboardHandler.GetDashboard)
			dashboard.GET("/aum", dashboardHandler.GetAUM)
			dashboard.GET("/performance", dashboardHandler.GetPerformance)
			dashboard.GET("/sectors", dashboardHandler.GetSectors)
			dashboard.GET("/health", dashboardHandler.GetHealth)
			dashboard.GET("/history", dashboardHandler.GetDashboardHistory)
		}

		// Portfolio Routes
		portfolio := api.Group("/portfolio")
		{
			portfolio.GET("/companies", portfolioHandler.GetCompanies)
			portfolio.GET("/companies/:id", portfolioHandler.GetCompany)
			portfolio.POST("/companies", portfolioHandler.CreateCompany)
			portfolio.PUT("/companies/:id", portfolioHandler.UpdateCompany)
			portfolio.DELETE("/companies/:id", portfolioHandler.DeleteCompany)
		}

		// Deal Flow Routes
		deals := api.Group("/deals")
		{
			deals.GET("", dealHandler.GetDeals)
			deals.POST("", dealHandler.CreateDeal)
			deals.PATCH("/:id/stage", dealHandler.UpdateDealStage)
		}

		// Founder Routes
		founders := api.Group("/founders")
		{
			founders.GET("", founderHandler.GetFounders)
			founders.GET("/:id", founderHandler.GetFounder)
			founders.PUT("/:id", founderHandler.UpdateFounder)
			founders.DELETE("/:id", founderHandler.DeleteFounder)
		}

		// Company-specific founder routes
		api.GET("/companies/:id/founders", founderHandler.GetFoundersByCompany)
		api.POST("/companies/:id/founders", founderHandler.CreateFounder)
	}

	// Start server
	log.Println("Server starting on :8080")
	r.Run(":8080")
}
