package repository

import (
	"ventura/internal/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// FindByEmail finds a user by email
func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update updates a user
func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

// Delete deletes a user
func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

// GetAll returns all users
func (r *UserRepository) GetAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Find(&users).Error
	return users, err
}

// GetAllByOrganization returns all users in an organization
func (r *UserRepository) GetAllByOrganization(orgID uint) ([]models.User, error) {
	var users []models.User
	err := r.db.Where("organization_id = ?", orgID).Find(&users).Error
	return users, err
}

// FindByEmailWithOrganization finds a user by email and preloads organization
func (r *UserRepository) FindByEmailWithOrganization(email string) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Organization").Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindByIDWithOrganization finds a user by ID and preloads organization
func (r *UserRepository) FindByIDWithOrganization(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Organization").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
