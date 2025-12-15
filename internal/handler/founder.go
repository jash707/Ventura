package handler

import (
	"net/http"
	"strconv"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type FounderHandler struct {
	founderRepo   *repository.FounderRepository
	portfolioRepo *repository.PortfolioRepository
}

func NewFounderHandler(founderRepo *repository.FounderRepository, portfolioRepo *repository.PortfolioRepository) *FounderHandler {
	return &FounderHandler{
		founderRepo:   founderRepo,
		portfolioRepo: portfolioRepo,
	}
}

// GetFounders returns all founders
func (h *FounderHandler) GetFounders(c *gin.Context) {
	founders, err := h.founderRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, founders)
}

// GetFounder returns a single founder by ID
func (h *FounderHandler) GetFounder(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid founder ID"})
		return
	}

	founder, err := h.founderRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Founder not found"})
		return
	}

	c.JSON(http.StatusOK, founder)
}

// GetFoundersByCompany returns all founders for a specific company
func (h *FounderHandler) GetFoundersByCompany(c *gin.Context) {
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

	founders, err := h.founderRepo.GetByCompanyID(uint(companyID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, founders)
}

// CreateFounder creates a new founder for a company
func (h *FounderHandler) CreateFounder(c *gin.Context) {
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

	var founder models.Founder
	if err := c.ShouldBindJSON(&founder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	founder.CompanyID = uint(companyID)

	if err := h.founderRepo.Create(&founder); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, founder)
}

// UpdateFounder updates an existing founder
func (h *FounderHandler) UpdateFounder(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid founder ID"})
		return
	}

	// Get existing founder
	existing, err := h.founderRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Founder not found"})
		return
	}

	// Bind updated fields
	var updates models.Founder
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update fields
	existing.Name = updates.Name
	existing.Email = updates.Email
	existing.Role = updates.Role
	existing.LinkedInURL = updates.LinkedInURL

	if err := h.founderRepo.Update(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, existing)
}

// DeleteFounder deletes a founder
func (h *FounderHandler) DeleteFounder(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid founder ID"})
		return
	}

	// Verify founder exists
	_, err = h.founderRepo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Founder not found"})
		return
	}

	if err := h.founderRepo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Founder deleted successfully"})
}
