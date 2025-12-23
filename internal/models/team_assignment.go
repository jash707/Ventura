package models

import (
	"time"
)

// TeamRole represents the role a user has for a company
type TeamRole string

const (
	TeamRoleLead     TeamRole = "lead"
	TeamRoleAnalyst  TeamRole = "analyst"
	TeamRoleObserver TeamRole = "observer"
)

// TeamAssignment links users to portfolio companies
type TeamAssignment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index;uniqueIndex:idx_user_company" json:"userId"`
	CompanyID uint      `gorm:"not null;index;uniqueIndex:idx_user_company" json:"companyId"`
	Role      TeamRole  `gorm:"type:varchar(20);not null;default:'observer'" json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// Relationships (for preloading)
	User    *User             `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Company *PortfolioCompany `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
}
