package handler

import (
	"net/http"
	"strconv"
	"strings"

	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	portfolioRepo *repository.PortfolioRepository
	dealRepo      *repository.DealRepository
	userRepo      *repository.UserRepository
}

func NewSearchHandler(portfolioRepo *repository.PortfolioRepository, dealRepo *repository.DealRepository, userRepo *repository.UserRepository) *SearchHandler {
	return &SearchHandler{
		portfolioRepo: portfolioRepo,
		dealRepo:      dealRepo,
		userRepo:      userRepo,
	}
}

// SearchResult represents a single search result
type SearchResult struct {
	ID          uint   `json:"id"`
	Type        string `json:"type"` // "company", "deal", "user"
	Name        string `json:"name"`
	Description string `json:"description"` // Sector, stage, email, etc.
	URL         string `json:"url"`         // Frontend route
}

// SearchResponse contains categorized search results
type SearchResponse struct {
	Companies []SearchResult `json:"companies"`
	Deals     []SearchResult `json:"deals"`
	Users     []SearchResult `json:"users"`
	Pages     []SearchResult `json:"pages"`
}

// GlobalSearch handles GET /api/search?q={query}
func (h *SearchHandler) GlobalSearch(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	query := strings.TrimSpace(c.Query("q"))
	if query == "" {
		c.JSON(http.StatusOK, SearchResponse{
			Companies: []SearchResult{},
			Deals:     []SearchResult{},
			Users:     []SearchResult{},
			Pages:     getStaticPages(""),
		})
		return
	}

	queryLower := strings.ToLower(query)
	response := SearchResponse{
		Companies: []SearchResult{},
		Deals:     []SearchResult{},
		Users:     []SearchResult{},
		Pages:     getStaticPages(queryLower),
	}

	// Search companies within organization
	companies, err := h.portfolioRepo.GetAllByOrganization(orgID.(uint))
	if err == nil {
		for _, company := range companies {
			if strings.Contains(strings.ToLower(company.Name), queryLower) ||
				strings.Contains(strings.ToLower(company.Sector), queryLower) {
				response.Companies = append(response.Companies, SearchResult{
					ID:          company.ID,
					Type:        "company",
					Name:        company.Name,
					Description: company.Sector + " • " + company.RoundStage,
					URL:         "/portfolio/" + uintToString(company.ID),
				})
			}
		}
	}

	// Search deals within organization
	deals, err := h.dealRepo.GetAllByOrganization(orgID.(uint))
	if err == nil {
		for _, deal := range deals {
			if strings.Contains(strings.ToLower(deal.CompanyName), queryLower) ||
				strings.Contains(strings.ToLower(deal.Sector), queryLower) {
				response.Deals = append(response.Deals, SearchResult{
					ID:          deal.ID,
					Type:        "deal",
					Name:        deal.CompanyName,
					Description: deal.Sector + " • " + string(deal.Stage),
					URL:         "/deals",
				})
			}
		}
	}

	// Search users within organization (admin only - check role from context)
	userRole, roleExists := c.Get("user_role")
	if roleExists && userRole == "admin" {
		users, err := h.userRepo.GetAllByOrganization(orgID.(uint))
		if err == nil {
			for _, user := range users {
				if strings.Contains(strings.ToLower(user.Name), queryLower) ||
					strings.Contains(strings.ToLower(user.Email), queryLower) {
					response.Users = append(response.Users, SearchResult{
						ID:          user.ID,
						Type:        "user",
						Name:        user.Name,
						Description: user.Email + " • " + string(user.Role),
						URL:         "/admin",
					})
				}
			}
		}
	}

	// Limit results
	if len(response.Companies) > 5 {
		response.Companies = response.Companies[:5]
	}
	if len(response.Deals) > 5 {
		response.Deals = response.Deals[:5]
	}
	if len(response.Users) > 5 {
		response.Users = response.Users[:5]
	}

	c.JSON(http.StatusOK, response)
}

// getStaticPages returns quick navigation pages that match the query
func getStaticPages(query string) []SearchResult {
	allPages := []SearchResult{
		{Type: "page", Name: "Dashboard", Description: "Home dashboard", URL: "/"},
		{Type: "page", Name: "Portfolio", Description: "Portfolio companies", URL: "/portfolio"},
		{Type: "page", Name: "Deals", Description: "Deal flow pipeline", URL: "/deals"},
		{Type: "page", Name: "Admin Panel", Description: "User management & audit logs", URL: "/admin"},
		{Type: "page", Name: "Documentation", Description: "Platform documentation", URL: "/docs"},
		{Type: "page", Name: "API Reference", Description: "API documentation", URL: "/api-reference"},
	}

	if query == "" {
		return allPages
	}

	var filtered []SearchResult
	for _, page := range allPages {
		if strings.Contains(strings.ToLower(page.Name), query) ||
			strings.Contains(strings.ToLower(page.Description), query) {
			filtered = append(filtered, page)
		}
	}
	return filtered
}

// Helper to convert uint to string
func uintToString(n uint) string {
	return strconv.FormatUint(uint64(n), 10)
}
