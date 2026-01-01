package routes

import (
	"ventura/internal/config"
	"ventura/internal/di"
	"ventura/internal/handler"
	"ventura/internal/middleware"

	"github.com/gin-gonic/gin"
)

// Setup configures all routes and returns the router
func Setup(container *di.Container) *gin.Engine {
	r := gin.Default()

	// CORS Configuration
	r.Use(config.SetupCORS())

	// Health Check (public)
	r.GET("/health", handler.HealthCheck)

	// Register route groups
	registerAuthRoutes(r, container)
	registerLegacyRoutes(r, container)
	registerAPIRoutes(r, container)

	return r
}

// registerAuthRoutes sets up authentication routes (public)
func registerAuthRoutes(r *gin.Engine, c *di.Container) {
	auth := r.Group("/auth")
	{
		auth.POST("/register", c.AuthHandler.Register)
		auth.POST("/login", c.AuthHandler.Login)
		auth.POST("/refresh", c.AuthHandler.Refresh)
		auth.POST("/logout", c.AuthHandler.Logout)
		auth.GET("/me", middleware.AuthMiddleware(), c.AuthHandler.Me)
	}
}

// registerLegacyRoutes sets up legacy routes for backward compatibility
func registerLegacyRoutes(r *gin.Engine, c *di.Container) {
	r.POST("/investments", c.InvestmentHandler.CreateInvestment)
}

// registerAPIRoutes sets up all protected API routes
func registerAPIRoutes(r *gin.Engine, c *di.Container) {
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// Search endpoint
		api.GET("/search", c.SearchHandler.GlobalSearch)

		registerDashboardRoutes(api, c)
		registerPortfolioRoutes(api, c)
		registerDealRoutes(api, c)
		registerFounderRoutes(api, c)
		registerMonthlyUpdateRoutes(api, c)
		registerTeamRoutes(api, c)
		registerAdminRoutes(api, c)
	}
}

// registerDashboardRoutes sets up dashboard routes
func registerDashboardRoutes(api *gin.RouterGroup, c *di.Container) {
	dashboard := api.Group("/dashboard")
	{
		dashboard.GET("", c.DashboardHandler.GetDashboard)
		dashboard.GET("/aum", c.DashboardHandler.GetAUM)
		dashboard.GET("/performance", c.DashboardHandler.GetPerformance)
		dashboard.GET("/sectors", c.DashboardHandler.GetSectors)
		dashboard.GET("/health", c.DashboardHandler.GetHealth)
		dashboard.GET("/history", c.DashboardHandler.GetDashboardHistory)
		dashboard.GET("/missing-updates", c.DashboardHandler.GetMissingUpdates)
	}
}

// registerPortfolioRoutes sets up portfolio routes
func registerPortfolioRoutes(api *gin.RouterGroup, c *di.Container) {
	portfolio := api.Group("/portfolio")
	{
		portfolio.GET("/companies", c.PortfolioHandler.GetCompanies)
		portfolio.GET("/companies/:id", c.PortfolioHandler.GetCompany)
		portfolio.POST("/companies", c.PortfolioHandler.CreateCompany)
		portfolio.PUT("/companies/:id", c.PortfolioHandler.UpdateCompany)
		portfolio.DELETE("/companies/:id", c.PortfolioHandler.DeleteCompany)
		portfolio.PATCH("/companies/:id/notifications", c.PortfolioHandler.ToggleNotifications)
	}
}

// registerDealRoutes sets up deal flow routes
func registerDealRoutes(api *gin.RouterGroup, c *di.Container) {
	deals := api.Group("/deals")
	{
		deals.GET("", c.DealHandler.GetDeals)
		deals.POST("", c.DealHandler.CreateDeal)
		deals.PATCH("/:id/stage", c.DealHandler.UpdateDealStage)
	}
}

// registerFounderRoutes sets up founder routes
func registerFounderRoutes(api *gin.RouterGroup, c *di.Container) {
	founders := api.Group("/founders")
	{
		founders.GET("", c.FounderHandler.GetFounders)
		founders.GET("/:id", c.FounderHandler.GetFounder)
		founders.PUT("/:id", c.FounderHandler.UpdateFounder)
		founders.DELETE("/:id", c.FounderHandler.DeleteFounder)
	}

	// Company-specific founder routes
	api.GET("/companies/:id/founders", c.FounderHandler.GetFoundersByCompany)
	api.POST("/companies/:id/founders", c.FounderHandler.CreateFounder)
}

// registerMonthlyUpdateRoutes sets up monthly update routes
func registerMonthlyUpdateRoutes(api *gin.RouterGroup, c *di.Container) {
	updates := api.Group("/monthly-updates")
	{
		updates.GET("", c.MonthlyUpdateHandler.GetMonthlyUpdates)
		updates.GET("/:id", c.MonthlyUpdateHandler.GetMonthlyUpdate)
		updates.PUT("/:id", c.MonthlyUpdateHandler.UpdateMonthlyUpdate)
		updates.DELETE("/:id", c.MonthlyUpdateHandler.DeleteMonthlyUpdate)
	}

	// Company-specific monthly update routes
	api.GET("/companies/:id/updates", c.MonthlyUpdateHandler.GetMonthlyUpdatesByCompany)
	api.POST("/companies/:id/updates", c.MonthlyUpdateHandler.CreateMonthlyUpdate)
}

// registerTeamRoutes sets up team assignment routes
func registerTeamRoutes(api *gin.RouterGroup, c *di.Container) {
	// Team routes are nested under companies
	api.GET("/companies/:id/team", c.TeamHandler.GetCompanyTeam)
	api.POST("/companies/:id/team", c.TeamHandler.AddTeamMember)
	api.DELETE("/companies/:id/team/:userId", c.TeamHandler.RemoveTeamMember)
}

// registerAdminRoutes sets up admin-only routes
func registerAdminRoutes(api *gin.RouterGroup, c *di.Container) {
	admin := api.Group("/admin")
	admin.Use(middleware.RequireRole("admin"))
	{
		// User management
		admin.GET("/users", c.UserHandler.GetUsers)
		admin.GET("/users/:id", c.UserHandler.GetUser)
		admin.PUT("/users/:id", c.UserHandler.UpdateUser)
		admin.DELETE("/users/:id", c.UserHandler.DeleteUser)
		admin.POST("/users/invite", c.UserHandler.InviteUser)

		// Audit logs
		admin.GET("/audit-logs", c.AuditHandler.GetAuditLogs)
	}
}
