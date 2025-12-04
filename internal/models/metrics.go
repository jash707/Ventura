package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type Metrics struct {
	ID             uint            `gorm:"primaryKey"`
	InvestmentID   uint            `gorm:"not null;index"`
	MonthlyRevenue decimal.Decimal `gorm:"type:decimal(20,2);not null"`
	BurnRate       decimal.Decimal `gorm:"type:decimal(20,2);not null"`
	CashRemaining  decimal.Decimal `gorm:"type:decimal(20,2);not null"`
	Date           time.Time       `gorm:"not null"`
	Investment     Investment      `gorm:"foreignKey:InvestmentID"`
}
