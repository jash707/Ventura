package handler

import (
	"net/http"
	"strconv"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type DealHandler struct {
	dealRepo *repository.DealRepository
}

func NewDealHandler(dealRepo *repository.DealRepository) *DealHandler {
	return &DealHandler{dealRepo: dealRepo}
}

// GetDeals returns all deals for the user's organization, optionally filtered by stage
func (h *DealHandler) GetDeals(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	stage := c.Query("stage")

	var deals []models.Deal
	var err error

	if stage != "" {
		deals, err = h.dealRepo.GetByStageAndOrganization(models.DealStage(stage), orgID.(uint))
	} else {
		deals, err = h.dealRepo.GetAllByOrganization(orgID.(uint))
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
