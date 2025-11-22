package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/khidmat/backend/internal/middleware"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var userID int
	var userType string
	var passwordHash string

	err := h.DB.QueryRow(
		"SELECT id, user_type, password_hash FROM users WHERE username = $1",
		req.Username,
	).Scan(&userID, &userType, &passwordHash)

	if err == sql.ErrNoRows {
		sendJSONError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err != nil {
		sendJSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		sendJSONError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := middleware.GenerateToken(userID, userType)
	if err != nil {
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	sendJSONResponse(w, map[string]interface{}{
		"token":     token,
		"user_id":   userID,
		"user_type": userType,
	}, http.StatusOK)
}

func (h *Handlers) Signup(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
		UserType string `json:"user_type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.UserType != "master_admin" && req.UserType != "account_admin" {
		sendJSONError(w, "Invalid user type", http.StatusBadRequest)
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		sendJSONError(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	var userID int
	err = h.DB.QueryRow(
		"INSERT INTO users (username, email, password_hash, user_type) VALUES ($1, $2, $3, $4) RETURNING id",
		req.Username, req.Email, string(passwordHash), req.UserType,
	).Scan(&userID)

	if err != nil {
		sendJSONError(w, "Failed to create user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	token, err := middleware.GenerateToken(userID, req.UserType)
	if err != nil {
		sendJSONError(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	sendJSONResponse(w, map[string]interface{}{
		"token":     token,
		"user_id":   userID,
		"user_type": req.UserType,
	}, http.StatusOK)
}

func getUserIDFromRequest(r *http.Request) int {
	userIDStr := r.Header.Get("X-User-ID")
	if userIDStr == "" {
		return 0
	}
	userID, _ := strconv.Atoi(userIDStr)
	return userID
}

func getUserTypeFromRequest(r *http.Request) string {
	return r.Header.Get("X-User-Type")
}
