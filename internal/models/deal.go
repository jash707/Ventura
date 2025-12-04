package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type DealStage string

const (
	StageIncoming     DealStage = "incoming"
	StageScreening    DealStage = "screening"
	StageDueDiligence DealStage = "due_diligence"
	StageTermSheet    DealStage = "term_sheet"
	StageClosed       DealStage = "closed"
	StageLost         DealStage = "lost"
)

type Deal struct {
	ID          uint      `gorm:"primaryKey"`
	CompanyName string    `gorm:"not null"`
	Sector      string    `gorm:"not null"`
	Stage       DealStage `gorm:"type:varchar(50);not null;default:'incoming'"`

	// Deal Details
	RequestedAmount decimal.Decimal `gorm:"type:decimal(20,2)"`
	Valuation       decimal.Decimal `gorm:"type:decimal(20,2)"`
	RoundStage      string          // Seed, Series A, etc.

	// Scoring (1-10)
	TeamScore     int `gorm:"default:0"`
	ProductScore  int `gorm:"default:0"`
	MarketScore   int `gorm:"default:0"`
	TractionScore int `gorm:"default:0"`
	TotalScore    int `gorm:"-"` // Calculated

	// Contact
	FounderName  string
	FounderEmail string

	// Metadata
	Notes     string `gorm:"type:text"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// CalculateTotalScore computes the aggregate deal score
func (d *Deal) CalculateTotalScore() {
	d.TotalScore = d.TeamScore + d.ProductScore + d.MarketScore + d.TractionScore
}
