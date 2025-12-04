package models

import "time"

type Founder struct {
	ID       uint   `gorm:"primaryKey"`
	Name     string `gorm:"not null"`
	Email    string `gorm:"uniqueIndex;not null"`
	Password string `gorm:"not null"` // Hashed

	CompanyID uint             `gorm:"index"`
	Company   PortfolioCompany `gorm:"foreignKey:CompanyID"`

	CreatedAt time.Time
	UpdatedAt time.Time
}
