package models

import (
	"time"
)

// AuditLog tracks user actions for audit trail
type AuditLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"userId"`
	UserEmail string    `gorm:"not null" json:"userEmail"`
	UserName  string    `gorm:"not null" json:"userName"`
	Action    string    `gorm:"not null" json:"action"`   // "create", "update", "delete", "login", "logout"
	Entity    string    `gorm:"not null" json:"entity"`   // "company", "deal", "user", "founder", etc.
	EntityID  uint      `json:"entityId"`                 // ID of the affected entity (0 if N/A)
	Details   string    `gorm:"type:text" json:"details"` // JSON with change details
	IPAddress string    `json:"ipAddress"`
	CreatedAt time.Time `gorm:"index" json:"createdAt"`
}

// Common action constants
const (
	ActionCreate = "create"
	ActionUpdate = "update"
	ActionDelete = "delete"
	ActionLogin  = "login"
	ActionLogout = "logout"
	ActionInvite = "invite"
)

// Common entity constants
const (
	EntityUser    = "user"
	EntityCompany = "company"
	EntityDeal    = "deal"
	EntityFounder = "founder"
	EntityTeam    = "team_assignment"
)
