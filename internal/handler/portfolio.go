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

// UpdateCompany updates an existing portfolio company
func (h *PortfolioHandler) UpdateCompany(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Get existing company
	existing, err := h.portfolioRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	// Bind updated fields
	var updates models.PortfolioCompany
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	existing.Name = updates.Name
	existing.Sector = updates.Sector
	existing.AmountInvested = updates.AmountInvested
	existing.CurrentValuation = updates.CurrentValuation
	existing.RoundStage = updates.RoundStage
	existing.InvestedAt = updates.InvestedAt
	existing.CashRemaining = updates.CashRemaining
	existing.MonthlyBurnRate = updates.MonthlyBurnRate
	existing.MonthlyRevenue = updates.MonthlyRevenue

	if err := h.portfolioRepo.Update(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	existing.CalculateHealthStatus()
	c.JSON(http.StatusOK, existing)
}

// DeleteCompany soft deletes a portfolio company
func (h *PortfolioHandler) DeleteCompany(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Verify company exists
	_, err = h.portfolioRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	if err := h.portfolioRepo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Company deleted successfully"})
}

// ToggleNotifications toggles the updates notifications for a company
func (h *PortfolioHandler) ToggleNotifications(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Get existing company
	company, err := h.portfolioRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	// Parse request body
	var request struct {
		Enabled bool `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update notification setting
	company.UpdatesNotificationsEnabled = request.Enabled

	if err := h.portfolioRepo.Update(company); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":                     "Notifications updated successfully",
		"updatesNotificationsEnabled": company.UpdatesNotificationsEnabled,
	})
}
