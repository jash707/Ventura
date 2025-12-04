package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type InvestmentRepository struct {
	DB *gorm.DB
}

func NewInvestmentRepository(db *gorm.DB) *InvestmentRepository {
	return &InvestmentRepository{DB: db}
}

func (r *InvestmentRepository) Create(investment *models.Investment) error {
	return r.DB.Create(investment).Error
}
