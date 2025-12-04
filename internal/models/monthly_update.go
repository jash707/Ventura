package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type MonthlyUpdate struct {
	ID        uint             `gorm:"primaryKey"`
	CompanyID uint             `gorm:"not null;index"`
	Company   PortfolioCompany `gorm:"foreignKey:CompanyID"`

	// Revenue Metrics
	MRR decimal.Decimal `gorm:"type:decimal(20,2)"` // Monthly Recurring Revenue
	ARR decimal.Decimal `gorm:"type:decimal(20,2)"` // Annual Recurring Revenue

	// Financial Health
	CashInBank decimal.Decimal `gorm:"type:decimal(20,2);not null"`
	BurnRate   decimal.Decimal `gorm:"type:decimal(20,2);not null"`

	// Growth Metrics (optional)
	NewCustomers int
	ChurnRate    decimal.Decimal `gorm:"type:decimal(5,2)"` // Percentage

	// Metadata
	ReportMonth time.Time `gorm:"not null;index"`
	Notes       string    `gorm:"type:text"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
