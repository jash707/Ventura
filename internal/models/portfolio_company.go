package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type PortfolioCompany struct {
	ID               uint            `gorm:"primaryKey" json:"id"`
	Name             string          `gorm:"not null" json:"name"`
	Sector           string          `gorm:"not null" json:"sector"` // SaaS, Fintech, AI, BioTech
	AmountInvested   decimal.Decimal `gorm:"type:decimal(20,2);not null" json:"amountInvested"`
	CurrentValuation decimal.Decimal `gorm:"type:decimal(20,2);not null" json:"currentValuation"`
	RoundStage       string          `gorm:"not null" json:"roundStage"` // Seed, Series A, B, C, etc.
	InvestedAt       time.Time       `gorm:"not null" json:"investedAt"`

	// Financial Health
	CashRemaining   decimal.Decimal `gorm:"type:decimal(20,2)" json:"cashRemaining"`
	MonthlyBurnRate decimal.Decimal `gorm:"type:decimal(20,2)" json:"monthlyBurnRate"`
	MonthlyRevenue  decimal.Decimal `gorm:"type:decimal(20,2)" json:"monthlyRevenue"`

	// Calculated fields
	RunwayMonths int    `gorm:"-" json:"runwayMonths"` // Calculated: CashRemaining / MonthlyBurnRate
	HealthStatus string `gorm:"-" json:"healthStatus"` // green, yellow, red

	// Relations
	MonthlyUpdates []MonthlyUpdate `gorm:"foreignKey:CompanyID" json:"monthlyUpdates,omitempty"`
	Documents      []Document      `gorm:"foreignKey:CompanyID" json:"documents,omitempty"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// CalculateRunway computes the remaining runway in months
func (p *PortfolioCompany) CalculateRunway() {
	if p.MonthlyBurnRate.GreaterThan(decimal.Zero) {
		runway := p.CashRemaining.Div(p.MonthlyBurnRate)
		p.RunwayMonths = int(runway.IntPart())
	} else {
		p.RunwayMonths = 999 // Infinite runway if no burn
	}
}

// CalculateHealthStatus determines health based on runway
func (p *PortfolioCompany) CalculateHealthStatus() {
	p.CalculateRunway()
	if p.RunwayMonths >= 6 {
		p.HealthStatus = "green"
	} else if p.RunwayMonths >= 3 {
		p.HealthStatus = "yellow"
	} else {
		p.HealthStatus = "red"
	}
}
