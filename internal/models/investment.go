package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type Investment struct {
	ID               uint            `gorm:"primaryKey"`
	StartupName      string          `gorm:"not null"`
	AmountInvested   decimal.Decimal `gorm:"type:decimal(20,2);not null"`
	CurrentValuation decimal.Decimal `gorm:"type:decimal(20,2);not null"`
	RoundStage       string          `gorm:"not null"`
	InvestedAt       time.Time       `gorm:"not null"`
}
