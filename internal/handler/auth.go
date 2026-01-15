package handler

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
	"ventura/internal/auth"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo *repository.UserRepository
	orgRepo  *repository.OrganizationRepository
}

func NewAuthHandler(userRepo *repository.UserRepository, orgRepo *repository.OrganizationRepository) *AuthHandler {
	return &AuthHandler{userRepo: userRepo, orgRepo: orgRepo}
}

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	Email            string `json:"email" binding:"required,email"`
	Password         string `json:"password" binding:"required,min=8"`
	Name             string `json:"name" binding:"required"`
	OrganizationName string `json:"organizationName"` // Optional: create new org
	InviteCode       string `json:"inviteCode"`       // Optional: join existing org
}

// LoginRequest represents the login request body
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	User         UserResponse `json:"user"`
	AccessToken  string       `json:"access_token,omitempty"`  // Only for debugging
	RefreshToken string       `json:"refresh_token,omitempty"` // Only for debugging
}

// UserResponse represents a user in responses (without password)
type UserResponse struct {
	ID               uint            `json:"id"`
	Email            string          `json:"email"`
	Name             string          `json:"name"`
	Role             models.UserRole `json:"role"`
	OrganizationID   uint            `json:"organizationId"`
	OrganizationName string          `json:"organizationName,omitempty"`
}

// generateSlug creates a URL-friendly slug from a name
func generateSlug(name string) string {
	// Convert to lowercase
	slug := strings.ToLower(name)
	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove non-alphanumeric characters except hyphens
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")
	// Remove consecutive hyphens
	reg = regexp.MustCompile("-+")
	slug = reg.ReplaceAllString(slug, "-")
	// Trim hyphens from ends
	slug = strings.Trim(slug, "-")
	// Add random suffix to ensure uniqueness
	randomBytes := make([]byte, 4)
	rand.Read(randomBytes)
	return slug + "-" + hex.EncodeToString(randomBytes)
}

// generateInviteCode creates a random invite code
func generateInviteCode() string {
	randomBytes := make([]byte, 16)
	rand.Read(randomBytes)
	return hex.EncodeToString(randomBytes)
}

// Register creates a new user account
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	existingUser, _ := h.userRepo.FindByEmail(req.Email)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Validate: must either provide organization name OR invite code
	if req.OrganizationName == "" && req.InviteCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either organizationName or inviteCode is required"})
		return
	}

	var organizationID uint
	var organizationName string

	if req.InviteCode != "" {
		// Join existing organization via invite code
		invite, err := h.orgRepo.GetInviteCodeByCode(req.InviteCode)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invite code"})
			return
		}

		// Check if invite is expired
		if time.Now().After(invite.ExpiresAt) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invite code has expired"})
			return
		}

		// Check if invite is already used
		if invite.UsedByID != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invite code has already been used"})
			return
		}

		organizationID = invite.OrganizationID
		organizationName = invite.Organization.Name
	} else {
		// Create new organization
		org := &models.Organization{
			Name: req.OrganizationName,
			Slug: generateSlug(req.OrganizationName),
		}

		if err := h.orgRepo.Create(org); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
			return
		}

		organizationID = org.ID
		organizationName = org.Name
	}

	// Create user (password will be hashed by BeforeCreate hook)
	user := &models.User{
		OrganizationID: organizationID,
		Email:          strings.ToLower(req.Email),
		Password:       req.Password,
		Name:           req.Name,
		Role:           models.RoleAdmin, // First user in org is admin
	}

	// If joining via invite, make them a viewer by default
	if req.InviteCode != "" {
		user.Role = models.RoleViewer
	}

	if err := h.userRepo.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Mark invite code as used if applicable
	if req.InviteCode != "" {
		invite, _ := h.orgRepo.GetInviteCodeByCode(req.InviteCode)
		if invite != nil {
			h.orgRepo.MarkInviteCodeUsed(invite.ID, user.ID)
		}
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshToken, err := auth.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Set httpOnly cookies
	setAuthCookies(c, accessToken, refreshToken)

	c.JSON(http.StatusCreated, AuthResponse{
		User: UserResponse{
			ID:               user.ID,
			Email:            user.Email,
			Name:             user.Name,
			Role:             user.Role,
			OrganizationID:   organizationID,
			OrganizationName: organizationName,
		},
	})
}

// Login authenticates a user and returns JWT tokens
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user by email with organization preloaded
	user, err := h.userRepo.FindByEmailWithOrganization(strings.ToLower(req.Email))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate tokens
	accessToken, err := auth.GenerateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshToken, err := auth.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	// Set httpOnly cookies
	setAuthCookies(c, accessToken, refreshToken)

	orgName := ""
	if user.Organization != nil {
		orgName = user.Organization.Name
	}

	c.JSON(http.StatusOK, AuthResponse{
		User: UserResponse{
			ID:               user.ID,
			Email:            user.Email,
			Name:             user.Name,
			Role:             user.Role,
			OrganizationID:   user.OrganizationID,
			OrganizationName: orgName,
		},
	})
}

// Refresh generates a new access token from a refresh token
func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No refresh token provided"})
		return
	}

	// Generate new access token
	accessToken, err := auth.RefreshAccessToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	// Set new access token cookie with production-aware settings
	isProduction := os.Getenv("GIN_MODE") == "release"
	secure := isProduction
	sameSite := http.SameSiteLaxMode
	if isProduction {
		sameSite = http.SameSiteNoneMode
	}

	c.SetSameSite(sameSite)
	c.SetCookie(
		"access_token",
		accessToken,
		int(auth.AccessTokenExpiry.Seconds()),
		"/",
		"",
		secure,
		true, // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed successfully"})
}

// Me returns the current authenticated user's information
func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	user, err := h.userRepo.FindByIDWithOrganization(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	orgName := ""
	if user.Organization != nil {
		orgName = user.Organization.Name
	}

	c.JSON(http.StatusOK, UserResponse{
		ID:               user.ID,
		Email:            user.Email,
		Name:             user.Name,
		Role:             user.Role,
		OrganizationID:   user.OrganizationID,
		OrganizationName: orgName,
	})
}

// Logout clears the authentication cookies
func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear cookies by setting them to expired with production-aware settings
	isProduction := os.Getenv("GIN_MODE") == "release"
	secure := isProduction
	sameSite := http.SameSiteLaxMode
	if isProduction {
		sameSite = http.SameSiteNoneMode
	}

	c.SetSameSite(sameSite)
	c.SetCookie("access_token", "", -1, "/", "", secure, true)
	c.SetSameSite(sameSite)
	c.SetCookie("refresh_token", "", -1, "/", "", secure, true)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// CreateInviteCode creates a new invite code for the current user's organization
func (h *AuthHandler) CreateInviteCode(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	// Create invite code that expires in 7 days
	invite := &models.InviteCode{
		OrganizationID: orgID.(uint),
		Code:           generateInviteCode(),
		CreatedByID:    userID.(uint),
		ExpiresAt:      time.Now().AddDate(0, 0, 7),
	}

	if err := h.orgRepo.CreateInviteCode(invite); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invite code"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":      invite.Code,
		"expiresAt": invite.ExpiresAt,
	})
}

// GetInviteCodes returns all invite codes for the current user's organization
func (h *AuthHandler) GetInviteCodes(c *gin.Context) {
	orgID, exists := c.Get("organization_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization not found"})
		return
	}

	invites, err := h.orgRepo.GetInviteCodesByOrganization(orgID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get invite codes"})
		return
	}

	c.JSON(http.StatusOK, invites)
}

// Helper function to set auth cookies
// In production (GIN_MODE=release), sets Secure=true and SameSite=None for cross-origin cookies
func setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	isProduction := os.Getenv("GIN_MODE") == "release"

	// Cookie settings based on environment
	secure := isProduction
	sameSite := http.SameSiteLaxMode
	if isProduction {
		sameSite = http.SameSiteNoneMode
	}

	// Set access token cookie using SetSameSite for proper SameSite control
	c.SetSameSite(sameSite)
	c.SetCookie(
		"access_token",
		accessToken,
		int(auth.AccessTokenExpiry.Seconds()),
		"/",
		"",
		secure,
		true, // httpOnly
	)

	// Set refresh token cookie
	c.SetSameSite(sameSite)
	c.SetCookie(
		"refresh_token",
		refreshToken,
		int(auth.RefreshTokenExpiry.Seconds()),
		"/",
		"",
		secure,
		true, // httpOnly
	)
}
