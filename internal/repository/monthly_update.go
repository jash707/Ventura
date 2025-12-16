package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type MonthlyUpdateRepository struct {
	DB *gorm.DB
}

func NewMonthlyUpdateRepository(db *gorm.DB) *MonthlyUpdateRepository {
	return &MonthlyUpdateRepository{DB: db}
}

// GetAll returns all monthly updates
func (r *MonthlyUpdateRepository) GetAll() ([]models.MonthlyUpdate, error) {
	var updates []models.MonthlyUpdate
	err := r.DB.Order("report_month DESC").Find(&updates).Error
	return updates, err
}

// GetByID returns a single monthly update by ID
func (r *MonthlyUpdateRepository) GetByID(id uint) (*models.MonthlyUpdate, error) {
	var update models.MonthlyUpdate
	err := r.DB.First(&update, id).Error
	return &update, err
}

// GetByCompanyID returns all monthly updates for a specific company, ordered by date
func (r *MonthlyUpdateRepository) GetByCompanyID(companyID uint) ([]models.MonthlyUpdate, error) {
	var updates []models.MonthlyUpdate
	err := r.DB.Where("company_id = ?", companyID).Order("report_month DESC").Find(&updates).Error
	return updates, err
}

// GetLatestByCompanyID returns the most recent update for a company
func (r *MonthlyUpdateRepository) GetLatestByCompanyID(companyID uint) (*models.MonthlyUpdate, error) {
	var update models.MonthlyUpdate
	err := r.DB.Where("company_id = ?", companyID).Order("report_month DESC").First(&update).Error
	return &update, err
}

// Create creates a new monthly update
func (r *MonthlyUpdateRepository) Create(update *models.MonthlyUpdate) error {
	return r.DB.Create(update).Error
}

// Update updates an existing monthly update
func (r *MonthlyUpdateRepository) Update(update *models.MonthlyUpdate) error {
	return r.DB.Save(update).Error
}

// Delete deletes a monthly update by ID
func (r *MonthlyUpdateRepository) Delete(id uint) error {
	return r.DB.Delete(&models.MonthlyUpdate{}, id).Error
}
