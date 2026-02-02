package repository

import (
	"time"
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

// GetActiveByOrganization returns all non-archived deals for an organization
func (r *DealRepository) GetActiveByOrganization(orgID uint) ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Where("organization_id = ? AND archived_at IS NULL", orgID).Order("created_at DESC").Find(&deals).Error
	return deals, err
}

// GetArchivedByOrganization returns all archived deals for an organization
func (r *DealRepository) GetArchivedByOrganization(orgID uint) ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Where("organization_id = ? AND archived_at IS NOT NULL", orgID).Order("archived_at DESC").Find(&deals).Error
	return deals, err
}

// ArchiveDeal archives a deal by setting archived_at timestamp
func (r *DealRepository) ArchiveDeal(id uint, orgID uint) error {
	now := time.Now()
	return r.DB.Model(&models.Deal{}).Where("id = ? AND organization_id = ?", id, orgID).Updates(map[string]interface{}{
		"archived_at": now,
	}).Error
}

// SetLossReasonAndArchive sets the loss reason and archives the deal
func (r *DealRepository) SetLossReasonAndArchive(id uint, reason string, orgID uint) error {
	now := time.Now()
	return r.DB.Model(&models.Deal{}).Where("id = ? AND organization_id = ?", id, orgID).Updates(map[string]interface{}{
		"loss_reason": reason,
		"stage":       models.StageLost,
		"archived_at": now,
	}).Error
}

// CloseAndConvert closes a deal and links it to a converted company
func (r *DealRepository) CloseAndConvert(id uint, companyID uint, orgID uint) error {
	now := time.Now()
	return r.DB.Model(&models.Deal{}).Where("id = ? AND organization_id = ?", id, orgID).Updates(map[string]interface{}{
		"stage":                models.StageClosed,
		"archived_at":          now,
		"converted_company_id": companyID,
	}).Error
}

// CloseDeal closes a deal without conversion
func (r *DealRepository) CloseDeal(id uint, orgID uint) error {
	now := time.Now()
	return r.DB.Model(&models.Deal{}).Where("id = ? AND organization_id = ?", id, orgID).Updates(map[string]interface{}{
		"stage":       models.StageClosed,
		"archived_at": now,
	}).Error
}
