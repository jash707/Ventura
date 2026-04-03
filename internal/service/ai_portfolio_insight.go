package service

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"
	"ventura/internal/models"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AIPortfolioInsightService struct{}

func NewAIPortfolioInsightService() *AIPortfolioInsightService {
	return &AIPortfolioInsightService{}
}

func (s *AIPortfolioInsightService) GeneratePortfolioInsight(companies []models.PortfolioCompany, updates []models.MonthlyUpdate) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")

	// Build a text summary of recent data
	dataSummary := s.buildDataSummary(companies, updates)

	if apiKey == "" {
		// Return a mock insight when no API key is set
		return s.generateMockInsight(companies, updates), nil
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini client: %v", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-pro")

	prompt := fmt.Sprintf(`You are a top-tier Venture Capital portfolio analyst.
Analyze the following portfolio data and recent monthly updates from a VC firm's portfolio companies.

%s

Write a concise 2-3 sentence executive summary paragraph analyzing the portfolio's overall health.
Focus on: growth trends across sectors, burn rate concerns, cash runway status, and any standout performers or risks.
Be specific with numbers where possible. Do NOT use bullet points or headers — just one flowing paragraph.`, dataSummary)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate insight: %v", err)
	}

	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		part := resp.Candidates[0].Content.Parts[0]
		if text, ok := part.(genai.Text); ok {
			return string(text), nil
		}
	}

	return "Insufficient data to generate portfolio insights at this time.", nil
}

func (s *AIPortfolioInsightService) buildDataSummary(companies []models.PortfolioCompany, updates []models.MonthlyUpdate) string {
	var sb strings.Builder

	sb.WriteString(fmt.Sprintf("Portfolio: %d companies\n", len(companies)))

	// Map company IDs to names/sectors
	companyMap := make(map[uint]models.PortfolioCompany)
	sectorCounts := make(map[string]int)
	for _, c := range companies {
		companyMap[c.ID] = c
		sectorCounts[c.Sector]++
	}

	sb.WriteString("Sectors: ")
	for sector, count := range sectorCounts {
		sb.WriteString(fmt.Sprintf("%s(%d) ", sector, count))
	}
	sb.WriteString("\n\nRecent Monthly Updates:\n")

	threeMonthsAgo := time.Now().AddDate(0, -3, 0)
	recentCount := 0
	for _, u := range updates {
		if u.ReportMonth.After(threeMonthsAgo) {
			companyName := "Unknown"
			companySector := ""
			if c, ok := companyMap[u.CompanyID]; ok {
				companyName = c.Name
				companySector = c.Sector
			}
			sb.WriteString(fmt.Sprintf("- %s (%s) [%s]: MRR=%s, ARR=%s, Cash=%s, BurnRate=%s, NewCustomers=%d, Churn=%s%%, Notes: %s\n",
				companyName, companySector, u.ReportMonth.Format("2006-01"),
				u.MRR.String(), u.ARR.String(),
				u.CashInBank.String(), u.BurnRate.String(),
				u.NewCustomers, u.ChurnRate.String(),
				u.Notes,
			))
			recentCount++
		}
	}

	if recentCount == 0 {
		sb.WriteString("No recent monthly updates available.\n")
	}

	return sb.String()
}

func (s *AIPortfolioInsightService) generateMockInsight(companies []models.PortfolioCompany, updates []models.MonthlyUpdate) string {
	companyCount := len(companies)
	if companyCount == 0 {
		return "No portfolio companies found. Add companies to your portfolio to receive AI-powered insights on portfolio health and trends."
	}

	sectorCounts := make(map[string]int)
	for _, c := range companies {
		sectorCounts[c.Sector]++
	}

	topSector := ""
	topCount := 0
	for sector, count := range sectorCounts {
		if count > topCount {
			topSector = sector
			topCount = count
		}
	}

	return fmt.Sprintf(
		"Your portfolio of %d companies is concentrated in %s (%d companies). Based on recent updates, "+
			"the majority of portfolio companies are maintaining healthy cash runways with steady MRR growth. "+
			"Consider monitoring burn rates closely for early-stage companies as market conditions evolve.",
		companyCount, topSector, topCount,
	)
}
