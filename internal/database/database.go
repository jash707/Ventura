package database

import (
	"log"
	"os"
	"ventura/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Connect establishes a database connection and runs migrations
func Connect() *gorm.DB {
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
	runMigrations(db)

	return db
}

// runMigrations runs all database migrations
func runMigrations(db *gorm.DB) {
	db.AutoMigrate(
		&models.Organization{},
		&models.InviteCode{},
		&models.User{},
		&models.Investment{},
		&models.Metrics{},
		&models.PortfolioCompany{},
		&models.Deal{},
		&models.Founder{},
		&models.MonthlyUpdate{},
		&models.Document{},
		&models.AuditLog{},
		&models.TeamAssignment{},
	)
}
