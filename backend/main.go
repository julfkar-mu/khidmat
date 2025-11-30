package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/khidmat/backend/internal/database"
	"github.com/khidmat/backend/internal/handlers"
	"github.com/khidmat/backend/internal/middleware"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize handlers
	h := handlers.NewHandlers(db)

	// Setup routes
	r := mux.NewRouter()

	// CORS middleware
	r.Use(middleware.CORS)

	// Auth routes
	r.HandleFunc("/api/auth/login", h.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/auth/signup", h.Signup).Methods("POST", "OPTIONS")

	// Protected routes
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware)

	// Member routes
	api.HandleFunc("/members", h.CreateMember).Methods("POST", "OPTIONS")
	api.HandleFunc("/members", h.GetMembers).Methods("GET", "OPTIONS")
	api.HandleFunc("/members/{id}/toggle-status", h.ToggleMemberStatus).Methods("PUT", "OPTIONS")

	// Payment routes
	api.HandleFunc("/payments", h.CreatePayment).Methods("POST", "OPTIONS")
	api.HandleFunc("/payments", h.GetPayments).Methods("GET", "OPTIONS")

	// Donation routes
	api.HandleFunc("/donations", h.CreateDonation).Methods("POST", "OPTIONS")
	api.HandleFunc("/donations", h.GetDonations).Methods("GET", "OPTIONS")

	// Report routes
	api.HandleFunc("/reports/admin-payments", h.GetAdminPaymentsReport).Methods("GET", "OPTIONS")
	api.HandleFunc("/reports/paid-members", h.GetPaidMembersReport).Methods("GET", "OPTIONS")
	api.HandleFunc("/reports/unpaid-members", h.GetUnpaidMembersReport).Methods("GET", "OPTIONS")
	api.HandleFunc("/reports/monthly-collection", h.GetMonthlyCollection).Methods("GET", "OPTIONS")
	api.HandleFunc("/reports/monthly-collection-details", h.GetMonthlyCollectionDetails).Methods("GET", "OPTIONS")
	api.HandleFunc("/reports/monthly-donations", h.GetMonthlyDonations).Methods("GET", "OPTIONS")
	api.HandleFunc("/reports/monthly-donation-details", h.GetMonthlyDonationDetails).Methods("GET", "OPTIONS")
	api.HandleFunc("/reports/pool-balance", h.GetPoolBalance).Methods("GET", "OPTIONS")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
