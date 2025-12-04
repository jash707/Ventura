package main

import (
	"log"
	"time"
	"ventura/internal/models"

	"github.com/shopspring/decimal"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=127.0.0.1 user=postgres password=postgres dbname=ventura port=5433 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Starting database seeding...")

	// Sample portfolio companies matching frontend mock data
	companies := []models.PortfolioCompany{
		{
			Name:             "CloudSync AI",
			Sector:           "SaaS",
			AmountInvested:   decimal.NewFromInt(2000000),
			CurrentValuation: decimal.NewFromInt(8000000),
			RoundStage:       "Series A",
			InvestedAt:       time.Now().AddDate(-2, 0, 0),
			CashRemaining:    decimal.NewFromInt(1500000),
			MonthlyBurnRate:  decimal.NewFromInt(150000),
			MonthlyRevenue:   decimal.NewFromInt(300000),
		},
		{
			Name:             "FinPay Solutions",
			Sector:           "Fintech",
			AmountInvested:   decimal.NewFromInt(3000000),
			CurrentValuation: decimal.NewFromInt(12000000),
			RoundStage:       "Series B",
			InvestedAt:       time.Now().AddDate(-1, -6, 0),
			CashRemaining:    decimal.NewFromInt(800000),
			MonthlyBurnRate:  decimal.NewFromInt(200000),
			MonthlyRevenue:   decimal.NewFromInt(450000),
		},
		{
			Name:             "HealthTech Pro",
			Sector:           "BioTech",
			AmountInvested:   decimal.NewFromInt(5000000),
			CurrentValuation: decimal.NewFromInt(15000000),
			RoundStage:       "Series A",
			InvestedAt:       time.Now().AddDate(-2, -3, 0),
			CashRemaining:    decimal.NewFromInt(2000000),
			MonthlyBurnRate:  decimal.NewFromInt(250000),
			MonthlyRevenue:   decimal.NewFromInt(200000),
		},
		{
			Name:             "AI Vision Labs",
			Sector:           "AI",
			AmountInvested:   decimal.NewFromInt(1500000),
			CurrentValuation: decimal.NewFromInt(10000000),
			RoundStage:       "Seed",
			InvestedAt:       time.Now().AddDate(-1, 0, 0),
			CashRemaining:    decimal.NewFromInt(600000),
			MonthlyBurnRate:  decimal.NewFromInt(180000),
			MonthlyRevenue:   decimal.NewFromInt(100000),
		},
		{
			Name:             "DataVault Security",
			Sector:           "SaaS",
			AmountInvested:   decimal.NewFromInt(2500000),
			CurrentValuation: decimal.NewFromInt(7500000),
			RoundStage:       "Series A",
			InvestedAt:       time.Now().AddDate(-1, -9, 0),
			CashRemaining:    decimal.NewFromInt(250000),
			MonthlyBurnRate:  decimal.NewFromInt(200000),
			MonthlyRevenue:   decimal.NewFromInt(180000),
		},
		{
			Name:             "NeuralNet Corp",
			Sector:           "AI",
			AmountInvested:   decimal.NewFromInt(4000000),
			CurrentValuation: decimal.NewFromInt(18000000),
			RoundStage:       "Series B",
			InvestedAt:       time.Now().AddDate(-2, -6, 0),
			CashRemaining:    decimal.NewFromInt(3000000),
			MonthlyBurnRate:  decimal.NewFromInt(300000),
			MonthlyRevenue:   decimal.NewFromInt(600000),
		},
		{
			Name:             "CryptoLedger",
			Sector:           "Fintech",
			AmountInvested:   decimal.NewFromInt(1800000),
			CurrentValuation: decimal.NewFromInt(5000000),
			RoundStage:       "Seed",
			InvestedAt:       time.Now().AddDate(-1, -3, 0),
			CashRemaining:    decimal.NewFromInt(400000),
			MonthlyBurnRate:  decimal.NewFromInt(150000),
			MonthlyRevenue:   decimal.NewFromInt(80000),
		},
		{
			Name:             "BioGen Therapeutics",
			Sector:           "BioTech",
			AmountInvested:   decimal.NewFromInt(6000000),
			CurrentValuation: decimal.NewFromInt(20000000),
			RoundStage:       "Series B",
			InvestedAt:       time.Now().AddDate(-3, 0, 0),
			CashRemaining:    decimal.NewFromInt(4500000),
			MonthlyBurnRate:  decimal.NewFromInt(500000),
			MonthlyRevenue:   decimal.NewFromInt(300000),
		},
	}

	for _, company := range companies {
		if err := db.Create(&company).Error; err != nil {
			log.Printf("Error creating %s: %v\n", company.Name, err)
		} else {
			log.Printf("✓ Created %s\n", company.Name)
		}
	}

	log.Println("Database seeding completed!")
}
