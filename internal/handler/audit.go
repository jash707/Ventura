package handler

import (
	"net/http"
	"strconv"
	"ventura/internal/models"
	"ventura/internal/repository"

	"github.com/gin-gonic/gin"
)

type AuditHandler struct {
	auditLogRepo *repository.AuditLogRepository
}

func NewAuditHandler(auditLogRepo *repository.AuditLogRepository) *AuditHandler {
	return &AuditHandler{auditLogRepo: auditLogRepo}
}

// AuditLogResponse represents the paginated audit log response
type AuditLogResponse struct {
	Logs  []models.AuditLog `json:"logs"`
	Total int64             `json:"total"`
	Page  int               `json:"page"`
	Limit int               `json:"limit"`
}

// GetAuditLogs returns paginated audit logs with optional filters
func (h *AuditHandler) GetAuditLogs(c *gin.Context) {
	// Parse pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	offset := (page - 1) * limit

	// Parse filters
	userIDStr := c.Query("userId")
	entity := c.Query("entity")
	action := c.Query("action")

	var userID uint
	if userIDStr != "" {
		id, err := strconv.ParseUint(userIDStr, 10, 32)
		if err == nil {
			userID = uint(id)
		}
	}

	// Get filtered logs
	logs, total, err := h.auditLogRepo.GetFiltered(userID, entity, action, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch audit logs"})
		return
	}

	c.JSON(http.StatusOK, AuditLogResponse{
		Logs:  logs,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}
