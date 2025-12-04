package handler

import (
	"net/http"
	"ventura/internal/models"
	"ventura/internal/service"

	"github.com/gin-gonic/gin"
)

type InvestmentHandler struct {
	Service *service.InvestmentService
}

func NewInvestmentHandler(service *service.InvestmentService) *InvestmentHandler {
	return &InvestmentHandler{Service: service}
}

func (h *InvestmentHandler) CreateInvestment(c *gin.Context) {
	var investment models.Investment
	if err := c.ShouldBindJSON(&investment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.CreateInvestment(&investment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, investment)
}
