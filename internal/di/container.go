package di

import (
	"ventura/internal/handler"
	"ventura/internal/repository"
	"ventura/internal/service"

	"gorm.io/gorm"
)

// Container holds all application dependencies
type Container struct {
	// Handlers
	AuthHandler          *handler.AuthHandler
	InvestmentHandler    *handler.InvestmentHandler
	DashboardHandler     *handler.DashboardHandler
	DealHandler          *handler.DealHandler
	PortfolioHandler     *handler.PortfolioHandler
	FounderHandler       *handler.FounderHandler
	MonthlyUpdateHandler *handler.MonthlyUpdateHandler
	UserHandler          *handler.UserHandler
	AuditHandler         *handler.AuditHandler
	TeamHandler          *handler.TeamHandler
	SearchHandler        *handler.SearchHandler
}

// NewContainer creates and wires up all dependencies
func NewContainer(db *gorm.DB) *Container {
	// Repositories
	userRepo := repository.NewUserRepository(db)
	orgRepo := repository.NewOrganizationRepository(db)
	investmentRepo := repository.NewInvestmentRepository(db)
	portfolioRepo := repository.NewPortfolioRepository(db)
	dealRepo := repository.NewDealRepository(db)
	founderRepo := repository.NewFounderRepository(db)
	monthlyUpdateRepo := repository.NewMonthlyUpdateRepository(db)
	auditLogRepo := repository.NewAuditLogRepository(db)
	teamAssignmentRepo := repository.NewTeamAssignmentRepository(db)

	// Services
	investmentService := service.NewInvestmentService(investmentRepo)
	analyticsService := service.NewAnalyticsService()

	// Handlers
	return &Container{
		AuthHandler:          handler.NewAuthHandler(userRepo, orgRepo),
		InvestmentHandler:    handler.NewInvestmentHandler(investmentService),
		DashboardHandler:     handler.NewDashboardHandler(portfolioRepo, analyticsService),
		DealHandler:          handler.NewDealHandler(dealRepo, portfolioRepo),
		PortfolioHandler:     handler.NewPortfolioHandler(portfolioRepo),
		FounderHandler:       handler.NewFounderHandler(founderRepo, portfolioRepo),
		MonthlyUpdateHandler: handler.NewMonthlyUpdateHandler(monthlyUpdateRepo, portfolioRepo),
		UserHandler:          handler.NewUserHandler(userRepo, auditLogRepo),
		AuditHandler:         handler.NewAuditHandler(auditLogRepo),
		TeamHandler:          handler.NewTeamHandler(teamAssignmentRepo, userRepo, portfolioRepo, auditLogRepo),
		SearchHandler:        handler.NewSearchHandler(portfolioRepo, dealRepo, userRepo),
	}
}
