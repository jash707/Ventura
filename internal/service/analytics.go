package service

import (
	"math"
	"time"
	"ventura/internal/models"

	"github.com/shopspring/decimal"
)

type AnalyticsService struct{}

func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{}
}

// CashFlow represents a single cash flow event
type CashFlow struct {
	Date   time.Time
	Amount decimal.Decimal
}

// CalculateXIRR calculates the Internal Rate of Return using Newton-Raphson method
// Handles irregular cash flows (different time intervals)
func (s *AnalyticsService) CalculateXIRR(cashFlows []CashFlow, guess float64) (float64, error) {
	if len(cashFlows) < 2 {
		return 0, nil
	}

	rate := guess
	epsilon := 0.0001
	maxIterations := 100

	for i := 0; i < maxIterations; i++ {
		npv := decimal.Zero
		dnpv := decimal.Zero
		baseDate := cashFlows[0].Date

		for _, cf := range cashFlows {
			daysDiff := cf.Date.Sub(baseDate).Hours() / 24
			years := daysDiff / 365.25

			// NPV calculation
			factor := math.Pow(1+rate, -years)
			npv = npv.Add(cf.Amount.Mul(decimal.NewFromFloat(factor)))

			// Derivative for Newton-Raphson
			dfactor := -years * math.Pow(1+rate, -years-1)
			dnpv = dnpv.Add(cf.Amount.Mul(decimal.NewFromFloat(dfactor)))
		}

		npvFloat, _ := npv.Float64()
		dnpvFloat, _ := dnpv.Float64()

		if math.Abs(npvFloat) < epsilon {
			return rate, nil
		}

		if dnpvFloat == 0 {
			return 0, nil
		}

		rate = rate - npvFloat/dnpvFloat
	}

	return rate, nil
}

// CalculateMOIC calculates Multiple on Invested Capital
// Formula: (Current Value + Distributions) / Total Invested Capital
func (s *AnalyticsService) CalculateMOIC(totalInvested, currentValue, distributions decimal.Decimal) decimal.Decimal {
	if totalInvested.IsZero() {
		return decimal.Zero
	}
	return currentValue.Add(distributions).Div(totalInvested)
}

// SectorAllocation represents portfolio allocation by sector
type SectorAllocation struct {
	Sector     string          `json:"sector"`
	Value      decimal.Decimal `json:"value"`
	Percentage float64         `json:"percentage"`
}

// GetSectorAllocation calculates portfolio distribution across sectors
func (s *AnalyticsService) GetSectorAllocation(companies []models.PortfolioCompany) []SectorAllocation {
	sectorMap := make(map[string]decimal.Decimal)
	total := decimal.Zero

	for _, company := range companies {
		sectorMap[company.Sector] = sectorMap[company.Sector].Add(company.CurrentValuation)
		total = total.Add(company.CurrentValuation)
	}

	var allocations []SectorAllocation
	for sector, value := range sectorMap {
		percentage := 0.0
		if !total.IsZero() {
			pct, _ := value.Div(total).Mul(decimal.NewFromInt(100)).Float64()
			percentage = pct
		}

		allocations = append(allocations, SectorAllocation{
			Sector:     sector,
			Value:      value,
			Percentage: percentage,
		})
	}

	return allocations
}

// PortfolioHealth categorizes companies by runway status
type PortfolioHealth struct {
	Green  []models.PortfolioCompany
	Yellow []models.PortfolioCompany
	Red    []models.PortfolioCompany
}

// GetPortfolioHealth categorizes companies based on financial health
func (s *AnalyticsService) GetPortfolioHealth(companies []models.PortfolioCompany) PortfolioHealth {
	health := PortfolioHealth{
		Green:  []models.PortfolioCompany{},
		Yellow: []models.PortfolioCompany{},
		Red:    []models.PortfolioCompany{},
	}

	for _, company := range companies {
		company.CalculateHealthStatus()

		switch company.HealthStatus {
		case "green":
			health.Green = append(health.Green, company)
		case "yellow":
			health.Yellow = append(health.Yellow, company)
		case "red":
			health.Red = append(health.Red, company)
		}
	}

	return health
}

// DashboardMetrics aggregates all dashboard data
type DashboardMetrics struct {
	TotalDeployed    decimal.Decimal
	CurrentValuation decimal.Decimal
	UnrealizedGains  decimal.Decimal
	IRR              float64
	MOIC             decimal.Decimal
	SectorAllocation []SectorAllocation
	PortfolioHealth  PortfolioHealth
}

// GetDashboardMetrics calculates all dashboard metrics
func (s *AnalyticsService) GetDashboardMetrics(companies []models.PortfolioCompany) DashboardMetrics {
	totalDeployed := decimal.Zero
	currentValue := decimal.Zero
	distributions := decimal.Zero // Assuming no distributions for now

	var cashFlows []CashFlow

	for _, company := range companies {
		totalDeployed = totalDeployed.Add(company.AmountInvested)
		currentValue = currentValue.Add(company.CurrentValuation)

		// Add investment as negative cash flow
		cashFlows = append(cashFlows, CashFlow{
			Date:   company.InvestedAt,
			Amount: company.AmountInvested.Neg(),
		})
	}

	// Add current value as positive cash flow (today)
	if !currentValue.IsZero() {
		cashFlows = append(cashFlows, CashFlow{
			Date:   time.Now(),
			Amount: currentValue,
		})
	}

	// Calculate IRR
	irr, _ := s.CalculateXIRR(cashFlows, 0.1) // 10% initial guess

	return DashboardMetrics{
		TotalDeployed:    totalDeployed,
		CurrentValuation: currentValue,
		UnrealizedGains:  currentValue.Sub(totalDeployed),
		IRR:              irr * 100, // Convert to percentage
		MOIC:             s.CalculateMOIC(totalDeployed, currentValue, distributions),
		SectorAllocation: s.GetSectorAllocation(companies),
		PortfolioHealth:  s.GetPortfolioHealth(companies),
	}
}
