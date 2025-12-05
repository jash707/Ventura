package handler

import (
	"net/http"
	"strconv"
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

// GetCompany returns a single portfolio company by ID
func (h *PortfolioHandler) GetCompany(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	company, err := h.portfolioRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	// Calculate health status
	company.CalculateHealthStatus()

	c.JSON(http.StatusOK, company)
}
