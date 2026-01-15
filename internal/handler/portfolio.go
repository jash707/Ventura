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

// getOrganizationID extracts organization ID from context
func getOrganizationID(c *gin.Context) (uint, bool) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		return 0, false
	}
	return orgID.(uint), true
}

// GetCompanies returns all portfolio companies for the user's organization
func (h *PortfolioHandler) GetCompanies(c *gin.Context) {
	orgID, ok := getOrganizationID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	companies, err := h.portfolioRepo.GetAllByOrganization(orgID)
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
	orgID, ok := getOrganizationID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	var company models.PortfolioCompany
	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set organization ID from context
	company.OrganizationID = orgID

	if err := h.portfolioRepo.Create(&company); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, company)
}

// GetCompany returns a single portfolio company by ID
func (h *PortfolioHandler) GetCompany(c *gin.Context) {
	orgID, ok := getOrganizationID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	company, err := h.portfolioRepo.GetByIDAndOrganization(uint(id), orgID)
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
	orgID, ok := getOrganizationID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Get existing company (verifies ownership)
	existing, err := h.portfolioRepo.GetByIDAndOrganization(uint(id), orgID)
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

	// Update fields (preserve organization ID)
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
	orgID, ok := getOrganizationID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Verify company exists and belongs to organization
	_, err = h.portfolioRepo.GetByIDAndOrganization(uint(id), orgID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	if err := h.portfolioRepo.DeleteByIDAndOrganization(uint(id), orgID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Company deleted successfully"})
}

// ToggleNotifications toggles the updates notifications for a company
func (h *PortfolioHandler) ToggleNotifications(c *gin.Context) {
	orgID, ok := getOrganizationID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Get existing company (verifies ownership)
	company, err := h.portfolioRepo.GetByIDAndOrganization(uint(id), orgID)
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
