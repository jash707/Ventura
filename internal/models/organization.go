package models

import (
	"time"

	"gorm.io/gorm"
)

// Organization represents a tenant/firm in the multi-tenant system
type Organization struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Slug      string         `gorm:"uniqueIndex;not null" json:"slug"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Users []User `gorm:"foreignKey:OrganizationID" json:"users,omitempty"`
}

// InviteCode represents an invitation to join an organization
type InviteCode struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	OrganizationID uint           `gorm:"not null;index" json:"organizationId"`
	Code           string         `gorm:"uniqueIndex;not null" json:"code"`
	CreatedByID    uint           `gorm:"not null" json:"createdById"`
	UsedByID       *uint          `json:"usedById,omitempty"`
	ExpiresAt      time.Time      `gorm:"not null" json:"expiresAt"`
	UsedAt         *time.Time     `json:"usedAt,omitempty"`
	CreatedAt      time.Time      `json:"createdAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Organization *Organization `gorm:"foreignKey:OrganizationID" json:"organization,omitempty"`
	CreatedBy    *User         `gorm:"foreignKey:CreatedByID" json:"createdBy,omitempty"`
	UsedBy       *User         `gorm:"foreignKey:UsedByID" json:"usedBy,omitempty"`
}
