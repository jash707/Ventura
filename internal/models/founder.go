package models

import "time"

type Founder struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"not null" json:"name"`
	Email       string `gorm:"uniqueIndex;not null" json:"email"`
	Role        string `gorm:"not null" json:"role"` // CEO, CTO, COO, CFO, etc.
	LinkedInURL string `json:"linkedInUrl,omitempty"`

	CompanyID uint             `gorm:"index" json:"companyId"`
	Company   PortfolioCompany `gorm:"foreignKey:CompanyID" json:"-"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
