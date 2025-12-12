package handler

import (
	"net/http"
	"os"
	"strings"
	"ventura/internal/auth"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo *repository.UserRepository
}

func NewAuthHandler(userRepo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{userRepo: userRepo}
}

// RegisterRequest represents the registration request body
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required"`
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
	ID    uint            `json:"id"`
	Email string          `json:"email"`
	Name  string          `json:"name"`
	Role  models.UserRole `json:"role"`
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

	// Create user (password will be hashed by BeforeCreate hook)
	user := &models.User{
		Email:    strings.ToLower(req.Email),
		Password: req.Password,
		Name:     req.Name,
		Role:     models.RoleViewer, // Default role
	}

	if err := h.userRepo.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
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

	c.JSON(http.StatusCreated, AuthResponse{
		User: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
			Role:  user.Role,
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

	// Find user by email
	user, err := h.userRepo.FindByEmail(strings.ToLower(req.Email))
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

	c.JSON(http.StatusOK, AuthResponse{
		User: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  user.Name,
			Role:  user.Role,
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

	user, err := h.userRepo.FindByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, UserResponse{
		ID:    user.ID,
		Email: user.Email,
		Name:  user.Name,
		Role:  user.Role,
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
