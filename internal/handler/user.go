package handler

import (
	"net/http"
	"strconv"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userRepo     *repository.UserRepository
	auditLogRepo *repository.AuditLogRepository
}

func NewUserHandler(userRepo *repository.UserRepository, auditLogRepo *repository.AuditLogRepository) *UserHandler {
	return &UserHandler{
		userRepo:     userRepo,
		auditLogRepo: auditLogRepo,
	}
}

// UserListResponse represents a user in the admin list
type UserListResponse struct {
	ID        uint            `json:"id"`
	Email     string          `json:"email"`
	Name      string          `json:"name"`
	Role      models.UserRole `json:"role"`
	CreatedAt string          `json:"createdAt"`
}

// UpdateUserRequest represents the update user request body
type UpdateUserRequest struct {
	Name string          `json:"name"`
	Role models.UserRole `json:"role" binding:"omitempty,oneof=admin viewer"`
}

// InviteUserRequest represents the invite user request body
type InviteUserRequest struct {
	Email string          `json:"email" binding:"required,email"`
	Name  string          `json:"name" binding:"required"`
	Role  models.UserRole `json:"role" binding:"omitempty,oneof=admin viewer"`
}

// GetUsers returns all users (admin only)
func (h *UserHandler) GetUsers(c *gin.Context) {
	users, err := h.userRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	response := make([]UserListResponse, len(users))
	for i, user := range users {
		response[i] = UserListResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			Role:      user.Role,
			CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetUser returns a single user by ID
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := h.userRepo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, UserListResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Role:      user.Role,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// UpdateUser updates a user's name and/or role
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userRepo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update fields if provided
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Role != "" {
		user.Role = req.Role
	}

	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// Log the action
	h.logAction(c, models.ActionUpdate, models.EntityUser, user.ID, "Updated user details")

	c.JSON(http.StatusOK, UserListResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		Role:      user.Role,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// DeleteUser deletes a user
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Prevent self-deletion
	currentUserID, _ := c.Get("user_id")
	if currentUserID.(uint) == uint(id) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete your own account"})
		return
	}

	user, err := h.userRepo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := h.userRepo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	// Log the action
	h.logAction(c, models.ActionDelete, models.EntityUser, uint(id), "Deleted user: "+user.Email)

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// InviteUser creates a new user with a temporary password
func (h *UserHandler) InviteUser(c *gin.Context) {
	var req InviteUserRequest
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

	// Set default role if not specified
	role := req.Role
	if role == "" {
		role = models.RoleViewer
	}

	// Generate a temporary password (in production, you'd send this via email)
	tempPassword := "TempPass123!" // In production, generate a random password

	user := &models.User{
		Email:    req.Email,
		Name:     req.Name,
		Password: tempPassword,
		Role:     role,
	}

	if err := h.userRepo.Create(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Log the action
	h.logAction(c, models.ActionInvite, models.EntityUser, user.ID, "Invited new user: "+user.Email)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User invited successfully",
		"user": UserListResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			Role:      user.Role,
			CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
		"tempPassword": tempPassword, // In production, send via email instead
	})
}

// Helper function to log audit actions
func (h *UserHandler) logAction(c *gin.Context, action, entity string, entityID uint, details string) {
	userID, _ := c.Get("user_id")
	userEmail, _ := c.Get("user_email")
	userName := ""
	if user, err := h.userRepo.FindByID(userID.(uint)); err == nil {
		userName = user.Name
	}

	log := &models.AuditLog{
		UserID:    userID.(uint),
		UserEmail: userEmail.(string),
		UserName:  userName,
		Action:    action,
		Entity:    entity,
		EntityID:  entityID,
		Details:   details,
		IPAddress: c.ClientIP(),
	}
	h.auditLogRepo.Create(log)
}
