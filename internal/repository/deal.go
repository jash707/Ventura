package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type DealRepository struct {
	DB *gorm.DB
}

func NewDealRepository(db *gorm.DB) *DealRepository {
	return &DealRepository{DB: db}
}

// GetAll returns all deals (deprecated - use GetAllByOrganization)
func (r *DealRepository) GetAll() ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Order("created_at DESC").Find(&deals).Error
	return deals, err
}

// GetAllByOrganization returns all deals for an organization
func (r *DealRepository) GetAllByOrganization(orgID uint) ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Where("organization_id = ?", orgID).Order("created_at DESC").Find(&deals).Error
	return deals, err
}

// GetByStage returns deals filtered by stage (deprecated - use GetByStageAndOrganization)
func (r *DealRepository) GetByStage(stage models.DealStage) ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Where("stage = ?", stage).Order("created_at DESC").Find(&deals).Error
	return deals, err
}

// GetByStageAndOrganization returns deals filtered by stage for an organization
func (r *DealRepository) GetByStageAndOrganization(stage models.DealStage, orgID uint) ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Where("stage = ? AND organization_id = ?", stage, orgID).Order("created_at DESC").Find(&deals).Error
	return deals, err
}

// GetByID returns a deal by ID
func (r *DealRepository) GetByID(id uint) (*models.Deal, error) {
	var deal models.Deal
	err := r.DB.First(&deal, id).Error
	return &deal, err
}

// GetByIDAndOrganization returns a deal by ID only if it belongs to the organization
func (r *DealRepository) GetByIDAndOrganization(id uint, orgID uint) (*models.Deal, error) {
	var deal models.Deal
	err := r.DB.Where("id = ? AND organization_id = ?", id, orgID).First(&deal).Error
	return &deal, err
}

func (r *DealRepository) Create(deal *models.Deal) error {
	return r.DB.Create(deal).Error
}

func (r *DealRepository) Update(deal *models.Deal) error {
	return r.DB.Save(deal).Error
}

func (r *DealRepository) UpdateStage(id uint, stage models.DealStage) error {
	return r.DB.Model(&models.Deal{}).Where("id = ?", id).Update("stage", stage).Error
}

// UpdateStageByOrganization updates stage only if deal belongs to organization
func (r *DealRepository) UpdateStageByOrganization(id uint, stage models.DealStage, orgID uint) error {
	return r.DB.Model(&models.Deal{}).Where("id = ? AND organization_id = ?", id, orgID).Update("stage", stage).Error
}
