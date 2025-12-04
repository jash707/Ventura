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

// GetDeals returns all deals, optionally filtered by stage
func (h *DealHandler) GetDeals(c *gin.Context) {
	stage := c.Query("stage")

	var deals []models.Deal
	var err error

	if stage != "" {
		deals, err = h.dealRepo.GetByStage(models.DealStage(stage))
	} else {
		deals, err = h.dealRepo.GetAll()
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
	var deal models.Deal
	if err := c.ShouldBindJSON(&deal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.dealRepo.Create(&deal); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	deal.CalculateTotalScore()
	c.JSON(http.StatusCreated, deal)
}

// UpdateDealStage updates a deal's pipeline stage
func (h *DealHandler) UpdateDealStage(c *gin.Context) {
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

	if err := h.dealRepo.UpdateStage(uint(id), input.Stage); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stage updated successfully"})
}
