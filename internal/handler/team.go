package handler

import (
	"net/http"
	"strconv"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type TeamHandler struct {
	teamRepo      *repository.TeamAssignmentRepository
	userRepo      *repository.UserRepository
	portfolioRepo *repository.PortfolioRepository
	auditLogRepo  *repository.AuditLogRepository
}

func NewTeamHandler(
	teamRepo *repository.TeamAssignmentRepository,
	userRepo *repository.UserRepository,
	portfolioRepo *repository.PortfolioRepository,
	auditLogRepo *repository.AuditLogRepository,
) *TeamHandler {
	return &TeamHandler{
		teamRepo:      teamRepo,
		userRepo:      userRepo,
		portfolioRepo: portfolioRepo,
		auditLogRepo:  auditLogRepo,
	}
}

// TeamMemberResponse represents a team member in responses
type TeamMemberResponse struct {
	ID        uint            `json:"id"`
	UserID    uint            `json:"userId"`
	UserEmail string          `json:"userEmail"`
	UserName  string          `json:"userName"`
	Role      models.TeamRole `json:"role"`
	CreatedAt string          `json:"createdAt"`
}

// AddTeamMemberRequest represents the request to add a team member
type AddTeamMemberRequest struct {
	UserID uint            `json:"userId" binding:"required"`
	Role   models.TeamRole `json:"role" binding:"omitempty,oneof=lead analyst observer"`
}

// GetCompanyTeam returns all team members for a company
func (h *TeamHandler) GetCompanyTeam(c *gin.Context) {
	companyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	// Check if company exists
	_, err = h.portfolioRepo.GetByID(uint(companyID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	assignments, err := h.teamRepo.GetByCompanyID(uint(companyID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch team members"})
		return
	}

	response := make([]TeamMemberResponse, len(assignments))
	for i, a := range assignments {
		response[i] = TeamMemberResponse{
			ID:        a.ID,
			UserID:    a.UserID,
			UserEmail: "",
			UserName:  "",
			Role:      a.Role,
			CreatedAt: a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
		if a.User != nil {
			response[i].UserEmail = a.User.Email
			response[i].UserName = a.User.Name
		}
	}

	c.JSON(http.StatusOK, response)
}

// AddTeamMember adds a user to a company's team
func (h *TeamHandler) AddTeamMember(c *gin.Context) {
	companyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	var req AddTeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if company exists
	company, err := h.portfolioRepo.GetByID(uint(companyID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	// Check if user exists
	user, err := h.userRepo.FindByID(req.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if assignment already exists
	existing, _ := h.teamRepo.GetByUserAndCompany(req.UserID, uint(companyID))
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User is already assigned to this company"})
		return
	}

	// Set default role
	role := req.Role
	if role == "" {
		role = models.TeamRoleObserver
	}

	assignment := &models.TeamAssignment{
		UserID:    req.UserID,
		CompanyID: uint(companyID),
		Role:      role,
	}

	if err := h.teamRepo.Create(assignment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add team member"})
		return
	}

	// Log the action
	h.logAction(c, models.ActionCreate, models.EntityTeam, assignment.ID,
		"Added "+user.Name+" to "+company.Name+" as "+string(role))

	c.JSON(http.StatusCreated, TeamMemberResponse{
		ID:        assignment.ID,
		UserID:    assignment.UserID,
		UserEmail: user.Email,
		UserName:  user.Name,
		Role:      assignment.Role,
		CreatedAt: assignment.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// RemoveTeamMember removes a user from a company's team
func (h *TeamHandler) RemoveTeamMember(c *gin.Context) {
	companyID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
		return
	}

	userID, err := strconv.ParseUint(c.Param("userId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Check if assignment exists
	assignment, err := h.teamRepo.GetByUserAndCompany(uint(userID), uint(companyID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team assignment not found"})
		return
	}

	if err := h.teamRepo.Delete(assignment.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove team member"})
		return
	}

	// Log the action
	h.logAction(c, models.ActionDelete, models.EntityTeam, assignment.ID,
		"Removed user from company team")

	c.JSON(http.StatusOK, gin.H{"message": "Team member removed successfully"})
}

// Helper function to log audit actions
func (h *TeamHandler) logAction(c *gin.Context, action, entity string, entityID uint, details string) {
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
