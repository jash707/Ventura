package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type PortfolioRepository struct {
	DB *gorm.DB
}

func NewPortfolioRepository(db *gorm.DB) *PortfolioRepository {
	return &PortfolioRepository{DB: db}
}

func (r *PortfolioRepository) GetAll() ([]models.PortfolioCompany, error) {
	var companies []models.PortfolioCompany
	err := r.DB.Find(&companies).Error
	return companies, err
}

func (r *PortfolioRepository) GetByID(id uint) (*models.PortfolioCompany, error) {
	var company models.PortfolioCompany
	err := r.DB.First(&company, id).Error
	return &company, err
}

func (r *PortfolioRepository) Create(company *models.PortfolioCompany) error {
	return r.DB.Create(company).Error
}

func (r *PortfolioRepository) Update(company *models.PortfolioCompany) error {
	return r.DB.Save(company).Error
}
