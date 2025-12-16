package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type MonthlyUpdate struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	CompanyID uint             `gorm:"not null;index" json:"companyId"`
	Company   PortfolioCompany `gorm:"foreignKey:CompanyID" json:"-"`

	// Revenue Metrics
	MRR decimal.Decimal `gorm:"type:decimal(20,2)" json:"mrr"` // Monthly Recurring Revenue
	ARR decimal.Decimal `gorm:"type:decimal(20,2)" json:"arr"` // Annual Recurring Revenue

	// Financial Health
	CashInBank decimal.Decimal `gorm:"type:decimal(20,2);not null" json:"cashInBank"`
	BurnRate   decimal.Decimal `gorm:"type:decimal(20,2);not null" json:"burnRate"`

	// Growth Metrics (optional)
	NewCustomers int             `json:"newCustomers"`
	ChurnRate    decimal.Decimal `gorm:"type:decimal(5,2)" json:"churnRate"` // Percentage

	// Metadata
	ReportMonth time.Time `gorm:"not null;index" json:"reportMonth"`
	Notes       string    `gorm:"type:text" json:"notes"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
