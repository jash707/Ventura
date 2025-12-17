package main

import (
	"log"
	"ventura/internal/database"
	"ventura/internal/di"
	"ventura/internal/routes"
	"ventura/internal/worker"
)

func main() {
	// Connect to database and run migrations
	db := database.Connect()

	// Initialize dependency injection container
	container := di.NewContainer(db)

	// Start background workers
	worker.StartNewsFetcher()

	// Setup routes and start server
	router := routes.Setup(container)

	log.Println("Server starting on :8080")
	router.Run(":8080")
}
