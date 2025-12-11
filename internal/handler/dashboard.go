package handler

import (
	"net/http"
	"ventura/internal/repository"
	"ventura/internal/service"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	portfolioRepo *repository.PortfolioRepository
	analytics     *service.AnalyticsService
}

func NewDashboardHandler(portfolioRepo *repository.PortfolioRepository, analytics *service.AnalyticsService) *DashboardHandler {
	return &DashboardHandler{
		portfolioRepo: portfolioRepo,
		analytics:     analytics,
	}
}

// GetDashboard returns all dashboard metrics in one call
func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	companies, err := h.portfolioRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	metrics := h.analytics.GetDashboardMetrics(companies)

	c.JSON(http.StatusOK, gin.H{
		"aum": gin.H{
			"totalDeployed":    metrics.TotalDeployed,
			"currentValuation": metrics.CurrentValuation,
			"unrealizedGains":  metrics.UnrealizedGains,
		},
		"performance": gin.H{
			"irr":           metrics.IRR,
			"moic":          metrics.MOIC,
			"totalDeployed": metrics.TotalDeployed,
			"currentValue":  metrics.CurrentValuation,
			"distributions": 0,
		},
		"sectorAllocation": metrics.SectorAllocation,
		"portfolioHealth": gin.H{
			"green":  metrics.PortfolioHealth.Green,
			"yellow": metrics.PortfolioHealth.Yellow,
			"red":    metrics.PortfolioHealth.Red,
		},
	})
}

// GetAUM returns Assets Under Management metrics
func (h *DashboardHandler) GetAUM(c *gin.Context) {
	companies, err := h.portfolioRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	metrics := h.analytics.GetDashboardMetrics(companies)

	c.JSON(http.StatusOK, gin.H{
		"totalDeployed":    metrics.TotalDeployed,
		"currentValuation": metrics.CurrentValuation,
		"unrealizedGains":  metrics.UnrealizedGains,
	})
}

// GetPerformance returns performance metrics (IRR, MOIC)
func (h *DashboardHandler) GetPerformance(c *gin.Context) {
	companies, err := h.portfolioRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	metrics := h.analytics.GetDashboardMetrics(companies)

	c.JSON(http.StatusOK, gin.H{
		"irr":           metrics.IRR,
		"moic":          metrics.MOIC,
		"totalDeployed": metrics.TotalDeployed,
		"currentValue":  metrics.CurrentValuation,
		"distributions": 0,
	})
}

// GetSectors returns sector allocation
func (h *DashboardHandler) GetSectors(c *gin.Context) {
	companies, err := h.portfolioRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	sectors := h.analytics.GetSectorAllocation(companies)

	c.JSON(http.StatusOK, sectors)
}

// GetHealth returns portfolio health breakdown
func (h *DashboardHandler) GetHealth(c *gin.Context) {
	companies, err := h.portfolioRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	health := h.analytics.GetPortfolioHealth(companies)

	c.JSON(http.StatusOK, gin.H{
		"green":  health.Green,
		"yellow": health.Yellow,
		"red":    health.Red,
	})
}

// GetDashboardHistory returns historical metrics for charts
func (h *DashboardHandler) GetDashboardHistory(c *gin.Context) {
	companies, err := h.portfolioRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Generate portfolio history based on investment dates
	portfolioHistory := h.analytics.GetPortfolioHistory(companies)

	// Generate investment timeline
	investmentTimeline := h.analytics.GetInvestmentTimeline(companies)

	// Generate sector comparison with MOIC
	sectorComparison := h.analytics.GetSectorComparison(companies)

	c.JSON(http.StatusOK, gin.H{
		"portfolioHistory":   portfolioHistory,
		"investmentTimeline": investmentTimeline,
		"sectorComparison":   sectorComparison,
	})
}
