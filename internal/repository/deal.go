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

func (r *DealRepository) GetAll() ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Order("created_at DESC").Find(&deals).Error
	return deals, err
}

func (r *DealRepository) GetByStage(stage models.DealStage) ([]models.Deal, error) {
	var deals []models.Deal
	err := r.DB.Where("stage = ?", stage).Order("created_at DESC").Find(&deals).Error
	return deals, err
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
