package service

import (
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/shopspring/decimal"
)

type InvestmentService struct {
	Repo *repository.InvestmentRepository
}

func NewInvestmentService(repo *repository.InvestmentRepository) *InvestmentService {
	return &InvestmentService{Repo: repo}
}

func (s *InvestmentService) CreateInvestment(investment *models.Investment) error {
	return s.Repo.Create(investment)
}

func (s *InvestmentService) CalculateIRR(investment *models.Investment) decimal.Decimal {
	// Stub implementation
	return decimal.NewFromFloat(0.15) // Dummy 15%
}
