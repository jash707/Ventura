package handler

import (
	"net/http"
	"strconv"
	"time"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

type DealHandler struct {
	dealRepo      *repository.DealRepository
	portfolioRepo *repository.PortfolioRepository
}

func NewDealHandler(dealRepo *repository.DealRepository, portfolioRepo *repository.PortfolioRepository) *DealHandler {
	return &DealHandler{dealRepo: dealRepo, portfolioRepo: portfolioRepo}
}

// GetDeals returns all deals for the user's organization, optionally filtered by stage or archived status
func (h *DealHandler) GetDeals(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	stage := c.Query("stage")
	archived := c.Query("archived")

	var deals []models.Deal
	var err error

	switch {
	case archived == "true":
		deals, err = h.dealRepo.GetArchivedByOrganization(orgID.(uint))
	case archived == "false":
		deals, err = h.dealRepo.GetActiveByOrganization(orgID.(uint))
	case stage != "":
		deals, err = h.dealRepo.GetByStageAndOrganization(models.DealStage(stage), orgID.(uint))
	default:
		// By default, return only active deals
		deals, err = h.dealRepo.GetActiveByOrganization(orgID.(uint))
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate total scores
	for i := range deals {
		deals[i].CalculateTotalScore()
	}

	c.JSON(http.StatusOK, deals)
}

// CreateDeal creates a new deal
func (h *DealHandler) CreateDeal(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	var deal models.Deal
	if err := c.ShouldBindJSON(&deal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set organization ID from context
	deal.OrganizationID = orgID.(uint)

	if err := h.dealRepo.Create(&deal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	deal.CalculateTotalScore()
	c.JSON(http.StatusCreated, deal)
}

// UpdateDealStage updates a deal's pipeline stage
func (h *DealHandler) UpdateDealStage(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var input struct {
		Stage models.DealStage `json:"stage" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify deal belongs to organization
	_, err = h.dealRepo.GetByIDAndOrganization(uint(id), orgID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	if err := h.dealRepo.UpdateStageByOrganization(uint(id), input.Stage, orgID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stage updated successfully"})
}

// CloseDeal closes a deal, optionally converting it to a portfolio company
func (h *DealHandler) CloseDeal(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Get the deal first
	deal, err := h.dealRepo.GetByIDAndOrganization(uint(id), orgID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	var input struct {
		ConvertToPortfolio bool `json:"convertToPortfolio"`
		// Company data for conversion
		AmountInvested  float64 `json:"amountInvested"`
		CashRemaining   float64 `json:"cashRemaining"`
		MonthlyBurnRate float64 `json:"monthlyBurnRate"`
		MonthlyRevenue  float64 `json:"monthlyRevenue"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.ConvertToPortfolio {
		// Create portfolio company from deal data
		company := models.PortfolioCompany{
			OrganizationID:   orgID.(uint),
			Name:             deal.CompanyName,
			Sector:           deal.Sector,
			AmountInvested:   deal.RequestedAmount,
			CurrentValuation: deal.Valuation,
			CashRemaining:    decimal.NewFromFloat(input.CashRemaining),
			MonthlyBurnRate:  decimal.NewFromFloat(input.MonthlyBurnRate),
			MonthlyRevenue:   decimal.NewFromFloat(input.MonthlyRevenue),
			RoundStage:       deal.RoundStage,
			InvestedAt:       time.Now(),
		}

		if err := h.portfolioRepo.Create(&company); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create company: " + err.Error()})
			return
		}

		// Close deal and link to company
		if err := h.dealRepo.CloseAndConvert(uint(id), company.ID, orgID.(uint)); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":   "Deal closed and converted to portfolio company",
			"companyId": company.ID,
		})
		return
	}

	// Just close the deal without conversion
	if err := h.dealRepo.CloseDeal(uint(id), orgID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deal closed"})
}

// LoseDeal marks a deal as lost with a reason and archives it
func (h *DealHandler) LoseDeal(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	// Verify deal exists
	_, err = h.dealRepo.GetByIDAndOrganization(uint(id), orgID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	var input struct {
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate reason is one of allowed values
	validReasons := map[string]bool{
		models.LossReasonPassed:      true,
		models.LossReasonValuation:   true,
		models.LossReasonCompetitor:  true,
		models.LossReasonFounder:     true,
		models.LossReasonFellThrough: true,
		models.LossReasonOther:       true,
	}

	if !validReasons[input.Reason] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid loss reason"})
		return
	}

	if err := h.dealRepo.SetLossReasonAndArchive(uint(id), input.Reason, orgID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deal marked as lost and archived"})
}
