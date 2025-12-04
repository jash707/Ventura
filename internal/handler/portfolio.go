package handler

import (
	"net/http"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type PortfolioHandler struct {
	portfolioRepo *repository.PortfolioRepository
}

func NewPortfolioHandler(portfolioRepo *repository.PortfolioRepository) *PortfolioHandler {
	return &PortfolioHandler{portfolioRepo: portfolioRepo}
}

// GetCompanies returns all portfolio companies
func (h *PortfolioHandler) GetCompanies(c *gin.Context) {
	companies, err := h.portfolioRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate health status for each company
	for i := range companies {
		companies[i].CalculateHealthStatus()
	}

	c.JSON(http.StatusOK, companies)
}

// CreateCompany creates a new portfolio company
func (h *PortfolioHandler) CreateCompany(c *gin.Context) {
	var company models.PortfolioCompany
	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.portfolioRepo.Create(&company); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, company)
}
