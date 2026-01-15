package repository

import (
	"time"
	"ventura/internal/models"

	"gorm.io/gorm"
)

type PortfolioRepository struct {
	DB *gorm.DB
}

func NewPortfolioRepository(db *gorm.DB) *PortfolioRepository {
	return &PortfolioRepository{DB: db}
}

// GetAll returns all portfolio companies (deprecated - use GetAllByOrganization)
func (r *PortfolioRepository) GetAll() ([]models.PortfolioCompany, error) {
	var companies []models.PortfolioCompany
	err := r.DB.Find(&companies).Error
	return companies, err
}

// GetAllByOrganization returns all portfolio companies for an organization
func (r *PortfolioRepository) GetAllByOrganization(orgID uint) ([]models.PortfolioCompany, error) {
	var companies []models.PortfolioCompany
	err := r.DB.Where("organization_id = ?", orgID).Find(&companies).Error
	return companies, err
}

// GetByID returns a portfolio company by ID
func (r *PortfolioRepository) GetByID(id uint) (*models.PortfolioCompany, error) {
	var company models.PortfolioCompany
	err := r.DB.First(&company, id).Error
	return &company, err
}

// GetByIDAndOrganization returns a portfolio company by ID only if it belongs to the organization
func (r *PortfolioRepository) GetByIDAndOrganization(id uint, orgID uint) (*models.PortfolioCompany, error) {
	var company models.PortfolioCompany
	err := r.DB.Where("id = ? AND organization_id = ?", id, orgID).First(&company).Error
	return &company, err
}

func (r *PortfolioRepository) Create(company *models.PortfolioCompany) error {
	return r.DB.Create(company).Error
}

func (r *PortfolioRepository) Update(company *models.PortfolioCompany) error {
	return r.DB.Save(company).Error
}

func (r *PortfolioRepository) Delete(id uint) error {
	return r.DB.Delete(&models.PortfolioCompany{}, id).Error
}

// DeleteByIDAndOrganization deletes a company only if it belongs to the organization
func (r *PortfolioRepository) DeleteByIDAndOrganization(id uint, orgID uint) error {
	return r.DB.Where("id = ? AND organization_id = ?", id, orgID).Delete(&models.PortfolioCompany{}).Error
}

// MissingUpdateInfo represents a company with missing update info
type MissingUpdateInfo struct {
	ID              uint       `json:"id"`
	Name            string     `json:"name"`
	Sector          string     `json:"sector"`
	LastUpdateDate  *time.Time `json:"lastUpdateDate"`
	DaysSinceUpdate int        `json:"daysSinceUpdate"`
}

// GetCompaniesWithMissingUpdates returns companies that haven't submitted updates for last month
func (r *PortfolioRepository) GetCompaniesWithMissingUpdates() ([]MissingUpdateInfo, error) {
	var result []MissingUpdateInfo

	// Get first day of last month
	now := time.Now()
	firstOfCurrentMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	firstOfLastMonth := firstOfCurrentMonth.AddDate(0, -1, 0)

	// Query companies with notifications enabled that don't have an update for last month
	rows, err := r.DB.Raw(`
		SELECT 
			pc.id,
			pc.name,
			pc.sector,
			(SELECT MAX(mu.report_month) FROM monthly_updates mu WHERE mu.company_id = pc.id) as last_update_date
		FROM portfolio_companies pc
		WHERE pc.deleted_at IS NULL
		AND pc.updates_notifications_enabled = true
		AND NOT EXISTS (
			SELECT 1 FROM monthly_updates mu 
			WHERE mu.company_id = pc.id 
			AND mu.report_month >= ?
			AND mu.report_month < ?
		)
	`, firstOfLastMonth, firstOfCurrentMonth).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var info MissingUpdateInfo
		var lastUpdate *time.Time
		if err := rows.Scan(&info.ID, &info.Name, &info.Sector, &lastUpdate); err != nil {
			return nil, err
		}
		info.LastUpdateDate = lastUpdate
		if lastUpdate != nil {
			info.DaysSinceUpdate = int(now.Sub(*lastUpdate).Hours() / 24)
		} else {
			info.DaysSinceUpdate = -1 // Never submitted
		}
		result = append(result, info)
	}

	return result, nil
}

// GetCompaniesWithMissingUpdatesByOrganization returns companies missing updates for a specific organization
func (r *PortfolioRepository) GetCompaniesWithMissingUpdatesByOrganization(orgID uint) ([]MissingUpdateInfo, error) {
	var result []MissingUpdateInfo

	now := time.Now()
	firstOfCurrentMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	firstOfLastMonth := firstOfCurrentMonth.AddDate(0, -1, 0)

	rows, err := r.DB.Raw(`
		SELECT 
			pc.id,
			pc.name,
			pc.sector,
			(SELECT MAX(mu.report_month) FROM monthly_updates mu WHERE mu.company_id = pc.id) as last_update_date
		FROM portfolio_companies pc
		WHERE pc.deleted_at IS NULL
		AND pc.organization_id = ?
		AND pc.updates_notifications_enabled = true
		AND NOT EXISTS (
			SELECT 1 FROM monthly_updates mu 
			WHERE mu.company_id = pc.id 
			AND mu.report_month >= ?
			AND mu.report_month < ?
		)
	`, orgID, firstOfLastMonth, firstOfCurrentMonth).Rows()

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var info MissingUpdateInfo
		var lastUpdate *time.Time
		if err := rows.Scan(&info.ID, &info.Name, &info.Sector, &lastUpdate); err != nil {
			return nil, err
		}
		info.LastUpdateDate = lastUpdate
		if lastUpdate != nil {
			info.DaysSinceUpdate = int(now.Sub(*lastUpdate).Hours() / 24)
		} else {
			info.DaysSinceUpdate = -1
		}
		result = append(result, info)
	}

	return result, nil
}
