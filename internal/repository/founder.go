package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type FounderRepository struct {
	DB *gorm.DB
}

func NewFounderRepository(db *gorm.DB) *FounderRepository {
	return &FounderRepository{DB: db}
}

// GetAll returns all founders
func (r *FounderRepository) GetAll() ([]models.Founder, error) {
	var founders []models.Founder
	err := r.DB.Find(&founders).Error
	return founders, err
}

// GetByID returns a single founder by ID
func (r *FounderRepository) GetByID(id uint) (*models.Founder, error) {
	var founder models.Founder
	err := r.DB.First(&founder, id).Error
	return &founder, err
}

// GetByCompanyID returns all founders for a specific company
func (r *FounderRepository) GetByCompanyID(companyID uint) ([]models.Founder, error) {
	var founders []models.Founder
	err := r.DB.Where("company_id = ?", companyID).Find(&founders).Error
	return founders, err
}

// Create creates a new founder
func (r *FounderRepository) Create(founder *models.Founder) error {
	return r.DB.Create(founder).Error
}

// Update updates an existing founder
func (r *FounderRepository) Update(founder *models.Founder) error {
	return r.DB.Save(founder).Error
}

// Delete deletes a founder by ID
func (r *FounderRepository) Delete(id uint) error {
	return r.DB.Delete(&models.Founder{}, id).Error
}
