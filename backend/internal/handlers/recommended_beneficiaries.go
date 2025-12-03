package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/khidmat/backend/internal/models"
)

func (h *Handlers) CreateRecommendedBeneficiary(w http.ResponseWriter, r *http.Request) {
	var beneficiary models.RecommendedBeneficiary
	if err := json.NewDecoder(r.Body).Decode(&beneficiary); err != nil {
		sendJSONError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	adminID := getUserIDFromRequest(r)
	if adminID == 0 {
		sendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var beneficiaryID int
	err := h.DB.QueryRow(
		"INSERT INTO recommended_beneficiaries (beneficiary_name, relative_name, mobile_no, address, reason, recommended_by, admin_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
		beneficiary.BeneficiaryName, beneficiary.RelativeName, beneficiary.MobileNo, beneficiary.Address, beneficiary.Reason, beneficiary.RecommendedBy, adminID,
	).Scan(&beneficiaryID)

	if err != nil {
		log.Printf("Error creating recommended beneficiary: %v", err)
		sendJSONError(w, "Failed to create recommendation. Please try again later.", http.StatusInternalServerError)
		return
	}

	beneficiary.ID = beneficiaryID
	beneficiary.AdminID = adminID
	beneficiary.CreatedAt = time.Now()

	sendJSONResponse(w, beneficiary, http.StatusCreated)
}

func (h *Handlers) GetRecommendedBeneficiaries(w http.ResponseWriter, r *http.Request) {
	// Get current month
	now := time.Now()
	year, month := now.Year(), now.Month()
	startOfMonth := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	query := `
		SELECT 
			rb.id,
			rb.beneficiary_name,
			rb.relative_name,
			rb.mobile_no,
			rb.address,
			rb.reason,
			rb.recommended_by,
			rb.admin_id,
			u.username as admin_name,
			rb.created_at
		FROM recommended_beneficiaries rb
		LEFT JOIN users u ON rb.admin_id = u.id
		WHERE rb.created_at >= $1 AND rb.created_at < $2
		ORDER BY rb.created_at DESC
	`

	rows, err := h.DB.Query(query, startOfMonth, endOfMonth)
	if err != nil {
		log.Printf("Error fetching recommended beneficiaries: %v", err)
		sendJSONError(w, "Failed to fetch recommended beneficiaries. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var beneficiaries []models.RecommendedBeneficiary
	for rows.Next() {
		var beneficiary models.RecommendedBeneficiary
		err := rows.Scan(
			&beneficiary.ID,
			&beneficiary.BeneficiaryName,
			&beneficiary.RelativeName,
			&beneficiary.MobileNo,
			&beneficiary.Address,
			&beneficiary.Reason,
			&beneficiary.RecommendedBy,
			&beneficiary.AdminID,
			&beneficiary.AdminName,
			&beneficiary.CreatedAt,
		)
		if err != nil {
			continue
		}
		beneficiaries = append(beneficiaries, beneficiary)
	}

	sendJSONResponse(w, beneficiaries, http.StatusOK)
}
