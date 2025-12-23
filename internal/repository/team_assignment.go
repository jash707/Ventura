package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type TeamAssignmentRepository struct {
	db *gorm.DB
}

func NewTeamAssignmentRepository(db *gorm.DB) *TeamAssignmentRepository {
	return &TeamAssignmentRepository{db: db}
}

// Create creates a new team assignment
func (r *TeamAssignmentRepository) Create(assignment *models.TeamAssignment) error {
	return r.db.Create(assignment).Error
}

// GetByCompanyID returns all team assignments for a company with user details
func (r *TeamAssignmentRepository) GetByCompanyID(companyID uint) ([]models.TeamAssignment, error) {
	var assignments []models.TeamAssignment
	err := r.db.Preload("User").Where("company_id = ?", companyID).Find(&assignments).Error
	return assignments, err
}

// GetByUserID returns all team assignments for a user with company details
func (r *TeamAssignmentRepository) GetByUserID(userID uint) ([]models.TeamAssignment, error) {
	var assignments []models.TeamAssignment
	err := r.db.Preload("Company").Where("user_id = ?", userID).Find(&assignments).Error
	return assignments, err
}

// GetByID returns a team assignment by ID
func (r *TeamAssignmentRepository) GetByID(id uint) (*models.TeamAssignment, error) {
	var assignment models.TeamAssignment
	err := r.db.Preload("User").Preload("Company").First(&assignment, id).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

// GetByUserAndCompany returns a team assignment by user and company
func (r *TeamAssignmentRepository) GetByUserAndCompany(userID, companyID uint) (*models.TeamAssignment, error) {
	var assignment models.TeamAssignment
	err := r.db.Where("user_id = ? AND company_id = ?", userID, companyID).First(&assignment).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}

// Update updates a team assignment
func (r *TeamAssignmentRepository) Update(assignment *models.TeamAssignment) error {
	return r.db.Save(assignment).Error
}

// Delete deletes a team assignment
func (r *TeamAssignmentRepository) Delete(id uint) error {
	return r.db.Delete(&models.TeamAssignment{}, id).Error
}

// DeleteByUserAndCompany deletes a team assignment by user and company
func (r *TeamAssignmentRepository) DeleteByUserAndCompany(userID, companyID uint) error {
	return r.db.Where("user_id = ? AND company_id = ?", userID, companyID).Delete(&models.TeamAssignment{}).Error
}
