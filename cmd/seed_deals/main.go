package main

import (
	"log"
	"os"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Minimal Deal struct for seeding
type Deal struct {
	ID             uint   `gorm:"primaryKey"`
	OrganizationID uint   `gorm:"not null;index"`
	CompanyName    string `gorm:"not null"`
	Sector         string `gorm:"not null"`
	Stage          string `gorm:"type:varchar(50);not null;default:'incoming'"`

	RequestedAmount decimal.Decimal `gorm:"type:decimal(20,2)"`
	Valuation       decimal.Decimal `gorm:"type:decimal(20,2)"`
	RoundStage      string

	TeamScore     int `gorm:"default:0"`
	ProductScore  int `gorm:"default:0"`
	MarketScore   int `gorm:"default:0"`
	TractionScore int `gorm:"default:0"`

	FounderName  string
	FounderEmail string

	LossReason         string     `gorm:"type:varchar(255)"`
	ArchivedAt         *time.Time `gorm:"index"`
	ConvertedCompanyID *uint

	Notes     string `gorm:"type:text"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=127.0.0.1 user=postgres password=postgres dbname=ventura port=5433 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Connected to database, seeding deals...")

	// Get first organization ID
	var orgID uint
	db.Raw("SELECT id FROM organizations LIMIT 1").Scan(&orgID)
	if orgID == 0 {
		log.Fatal("No organizations found. Please create an organization first.")
	}

	log.Printf("Using organization ID: %d", orgID)

	deals := []Deal{
		// Incoming stage
		{
			OrganizationID:  orgID,
			CompanyName:     "TechFlow AI",
			Sector:          "AI/ML",
			Stage:           "incoming",
			RequestedAmount: decimal.NewFromInt(2000000),
			Valuation:       decimal.NewFromInt(10000000),
			RoundStage:      "Seed",
			TeamScore:       8,
			ProductScore:    7,
			MarketScore:     9,
			TractionScore:   6,
			FounderName:     "Sarah Chen",
			FounderEmail:    "sarah@techflow.ai",
			Notes:           "Strong AI team from Google. Working on enterprise automation.",
		},
		{
			OrganizationID:  orgID,
			CompanyName:     "GreenEnergy Solutions",
			Sector:          "CleanTech",
			Stage:           "incoming",
			RequestedAmount: decimal.NewFromInt(1500000),
			Valuation:       decimal.NewFromInt(6000000),
			RoundStage:      "Pre-Seed",
			TeamScore:       7,
			ProductScore:    8,
			MarketScore:     8,
			TractionScore:   5,
			FounderName:     "Michael Green",
			FounderEmail:    "michael@greenenergy.io",
			Notes:           "Novel solar panel technology. Patent pending.",
		},
		// Screening stage
		{
			OrganizationID:  orgID,
			CompanyName:     "FinanceBot",
			Sector:          "Fintech",
			Stage:           "screening",
			RequestedAmount: decimal.NewFromInt(3000000),
			Valuation:       decimal.NewFromInt(15000000),
			RoundStage:      "Series A",
			TeamScore:       9,
			ProductScore:    8,
			MarketScore:     7,
			TractionScore:   8,
			FounderName:     "David Kim",
			FounderEmail:    "david@financebot.com",
			Notes:           "B2B payment automation. 50K MRR already.",
		},
		{
			OrganizationID:  orgID,
			CompanyName:     "HealthTrack Pro",
			Sector:          "HealthTech",
			Stage:           "screening",
			RequestedAmount: decimal.NewFromInt(1000000),
			Valuation:       decimal.NewFromInt(5000000),
			RoundStage:      "Seed",
			TeamScore:       7,
			ProductScore:    9,
			MarketScore:     8,
			TractionScore:   6,
			FounderName:     "Dr. Emily Watson",
			FounderEmail:    "emily@healthtrack.pro",
			Notes:           "FDA-cleared wearable device. Strong clinical validation.",
		},
		// Due Diligence stage
		{
			OrganizationID:  orgID,
			CompanyName:     "CloudSecurity Inc",
			Sector:          "Cybersecurity",
			Stage:           "due_diligence",
			RequestedAmount: decimal.NewFromInt(5000000),
			Valuation:       decimal.NewFromInt(25000000),
			RoundStage:      "Series A",
			TeamScore:       9,
			ProductScore:    9,
			MarketScore:     9,
			TractionScore:   7,
			FounderName:     "Alex Rodriguez",
			FounderEmail:    "alex@cloudsec.io",
			Notes:           "Zero-trust security platform. Fortune 500 clients.",
		},
		{
			OrganizationID:  orgID,
			CompanyName:     "EduLearn Platform",
			Sector:          "EdTech",
			Stage:           "due_diligence",
			RequestedAmount: decimal.NewFromInt(2500000),
			Valuation:       decimal.NewFromInt(12000000),
			RoundStage:      "Seed",
			TeamScore:       8,
			ProductScore:    8,
			MarketScore:     7,
			TractionScore:   8,
			FounderName:     "Jennifer Liu",
			FounderEmail:    "jen@edulearn.com",
			Notes:           "AI tutoring platform. 100K active students.",
		},
		// Term Sheet stage
		{
			OrganizationID:  orgID,
			CompanyName:     "LogiChain",
			Sector:          "Supply Chain",
			Stage:           "term_sheet",
			RequestedAmount: decimal.NewFromInt(4000000),
			Valuation:       decimal.NewFromInt(20000000),
			RoundStage:      "Series A",
			TeamScore:       8,
			ProductScore:    9,
			MarketScore:     8,
			TractionScore:   9,
			FounderName:     "Robert Park",
			FounderEmail:    "robert@logichain.io",
			Notes:           "Blockchain-based supply chain visibility. $2M ARR.",
		},
	}

	for _, deal := range deals {
		result := db.Create(&deal)
		if result.Error != nil {
			log.Printf("Error creating deal %s: %v", deal.CompanyName, result.Error)
		} else {
			log.Printf("Created deal: %s (%s) in %s stage", deal.CompanyName, deal.Sector, deal.Stage)
		}
	}

	log.Println("Seed complete!")
}
