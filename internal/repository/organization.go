package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type OrganizationRepository struct {
	db *gorm.DB
}

func NewOrganizationRepository(db *gorm.DB) *OrganizationRepository {
	return &OrganizationRepository{db: db}
}

// Create creates a new organization
func (r *OrganizationRepository) Create(org *models.Organization) error {
	return r.db.Create(org).Error
}

// FindByID finds an organization by ID
func (r *OrganizationRepository) FindByID(id uint) (*models.Organization, error) {
	var org models.Organization
	err := r.db.First(&org, id).Error
	return &org, err
}

// FindBySlug finds an organization by slug
func (r *OrganizationRepository) FindBySlug(slug string) (*models.Organization, error) {
	var org models.Organization
	err := r.db.Where("slug = ?", slug).First(&org).Error
	return &org, err
}

// Update updates an organization
func (r *OrganizationRepository) Update(org *models.Organization) error {
	return r.db.Save(org).Error
}

// GetInviteCodeByCode finds an invite code by its code string
func (r *OrganizationRepository) GetInviteCodeByCode(code string) (*models.InviteCode, error) {
	var invite models.InviteCode
	err := r.db.Preload("Organization").Where("code = ?", code).First(&invite).Error
	return &invite, err
}

// CreateInviteCode creates a new invite code
func (r *OrganizationRepository) CreateInviteCode(invite *models.InviteCode) error {
	return r.db.Create(invite).Error
}

// MarkInviteCodeUsed marks an invite code as used
func (r *OrganizationRepository) MarkInviteCodeUsed(inviteID uint, userID uint) error {
	return r.db.Model(&models.InviteCode{}).Where("id = ?", inviteID).Updates(map[string]interface{}{
		"used_by_id": userID,
		"used_at":    gorm.Expr("NOW()"),
	}).Error
}

// GetInviteCodesByOrganization gets all invite codes for an organization
func (r *OrganizationRepository) GetInviteCodesByOrganization(orgID uint) ([]models.InviteCode, error) {
	var invites []models.InviteCode
	err := r.db.Where("organization_id = ?", orgID).Preload("CreatedBy").Find(&invites).Error
	return invites, err
}
