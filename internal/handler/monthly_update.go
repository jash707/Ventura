package handler

import (
	"net/http"
	"strconv"
	"time"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type MonthlyUpdateHandler struct {
	updateRepo    *repository.MonthlyUpdateRepository
	portfolioRepo *repository.PortfolioRepository
}

func NewMonthlyUpdateHandler(updateRepo *repository.MonthlyUpdateRepository, portfolioRepo *repository.PortfolioRepository) *MonthlyUpdateHandler {
	return &MonthlyUpdateHandler{
		updateRepo:    updateRepo,
		portfolioRepo: portfolioRepo,
	}
}

// GetMonthlyUpdates returns all monthly updates
func (h *MonthlyUpdateHandler) GetMonthlyUpdates(c *gin.Context) {
	updates, err := h.updateRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updates)
}

// GetMonthlyUpdate returns a single monthly update by ID
func (h *MonthlyUpdateHandler) GetMonthlyUpdate(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid update ID"})
		return
	}

	update, err := h.updateRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Monthly update not found"})
		return
	}

	c.JSON(http.StatusOK, update)
}

// GetMonthlyUpdatesByCompany returns all monthly updates for a specific company
func (h *MonthlyUpdateHandler) GetMonthlyUpdatesByCompany(c *gin.Context) {
	companyIDParam := c.Param("id")
	companyID, err := strconv.ParseUint(companyIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Verify company exists
	_, err = h.portfolioRepo.GetByID(uint(companyID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	updates, err := h.updateRepo.GetByCompanyID(uint(companyID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updates)
}

// CreateMonthlyUpdate creates a new monthly update for a company
// and syncs the financial metrics to the company
func (h *MonthlyUpdateHandler) CreateMonthlyUpdate(c *gin.Context) {
	companyIDParam := c.Param("id")
	companyID, err := strconv.ParseUint(companyIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Get company (we'll need to update it)
	company, err := h.portfolioRepo.GetByID(uint(companyID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	var update models.MonthlyUpdate
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate that the report month has ended (cannot submit for current or future months)
	now := time.Now()
	// Get the first day of current month
	firstOfCurrentMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	// Get the first day of the report month
	reportMonthStart := time.Date(update.ReportMonth.Year(), update.ReportMonth.Month(), 1, 0, 0, 0, 0, time.UTC)

	if !reportMonthStart.Before(firstOfCurrentMonth) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cannot submit update for current or future month. Please wait until the month has ended.",
		})
		return
	}

	update.CompanyID = uint(companyID)

	if err := h.updateRepo.Create(&update); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Sync monthly update data to company's financial metrics
	company.CashRemaining = update.CashInBank
	company.MonthlyBurnRate = update.BurnRate
	company.MonthlyRevenue = update.MRR // Using MRR as monthly revenue

	if err := h.portfolioRepo.Update(company); err != nil {
		// Log the error but don't fail the request since the update was created
		c.JSON(http.StatusCreated, gin.H{
			"update":  update,
			"warning": "Monthly update created but failed to sync company metrics",
		})
		return
	}

	c.JSON(http.StatusCreated, update)
}

// UpdateMonthlyUpdate updates an existing monthly update
func (h *MonthlyUpdateHandler) UpdateMonthlyUpdate(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid update ID"})
		return
	}

	// Get existing update
	existing, err := h.updateRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Monthly update not found"})
		return
	}

	// Bind updated fields
	var updates models.MonthlyUpdate
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	existing.MRR = updates.MRR
	existing.ARR = updates.ARR
	existing.CashInBank = updates.CashInBank
	existing.BurnRate = updates.BurnRate
	existing.NewCustomers = updates.NewCustomers
	existing.ChurnRate = updates.ChurnRate
	existing.ReportMonth = updates.ReportMonth
	existing.Notes = updates.Notes

	if err := h.updateRepo.Update(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existing)
}

// DeleteMonthlyUpdate deletes a monthly update
func (h *MonthlyUpdateHandler) DeleteMonthlyUpdate(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid update ID"})
		return
	}

	// Verify update exists
	_, err = h.updateRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Monthly update not found"})
		return
	}

	if err := h.updateRepo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Monthly update deleted successfully"})
}
