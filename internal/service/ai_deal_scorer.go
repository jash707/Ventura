package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"ventura/internal/models"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AIDealScorerService struct {
	apiKey string
}

func NewAIDealScorerService() *AIDealScorerService {
	// Let the user set this in environment, or default if empty
	key := os.Getenv("GEMINI_API_KEY")
	if key == "" {
		key = "PLACEHOLDER_KEY" // Fallback placeholder
	}
	return &AIDealScorerService{apiKey: key}
}

type AIDealScoreResult struct {
	TeamScore     int    `json:"teamScore"`
	ProductScore  int    `json:"productScore"`
	MarketScore   int    `json:"marketScore"`
	TractionScore int    `json:"tractionScore"`
	Summary       string `json:"summary"`
	KeyStrengths  string `json:"keyStrengths"`
	KeyRisks      string `json:"keyRisks"`
}

func (s *AIDealScorerService) ScoreDeal(ctx context.Context, deal *models.Deal) (*AIDealScoreResult, error) {
	if s.apiKey == "PLACEHOLDER_KEY" {
		// Mock response if using placeholder
		return &AIDealScoreResult{
			TeamScore:     8,
			ProductScore:  7,
			MarketScore:   9,
			TractionScore: 6,
			Summary:       "This is a placeholder summary. Please set GEMINI_API_KEY to use the real AI integration.",
			KeyStrengths:  "- Strong market potential\n- Experienced team",
			KeyRisks:      "- Early stage traction\n- Highly competitive sector",
		}, nil
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(s.apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create genai client: %v", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-pro")
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Sprintf(`You are an expert Venture Capital analyst. Evaluate the following startup deal and provide scores from 1 to 10 for Team, Product, Market, and Traction. Also provide a 2-sentence summary, key strengths, and key risks. Return the result strictly as JSON with this schema: 
{"teamScore": int, "productScore": int, "marketScore": int, "tractionScore": int, "summary": "string", "keyStrengths": "string", "keyRisks": "string"}

Deal Details:
Company Name: %s
Sector: %s
Requested Amount: %s
Valuation: %s
Round Stage: %s
Notes: %s`, deal.CompanyName, deal.Sector, deal.RequestedAmount.String(), deal.Valuation.String(), deal.RoundStage, deal.Notes)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("failed to generate AI content: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from AI")
	}

	part := resp.Candidates[0].Content.Parts[0]
	text, ok := part.(genai.Text)
	if !ok {
		return nil, fmt.Errorf("unexpected response type from AI")
	}

	var result AIDealScoreResult
	if err := json.Unmarshal([]byte(string(text)), &result); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return &result, nil
}
