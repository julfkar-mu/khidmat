package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/khidmat/backend/internal/models"
)

func (h *Handlers) CreateDonation(w http.ResponseWriter, r *http.Request) {
	var donation models.Donation
	if err := json.NewDecoder(r.Body).Decode(&donation); err != nil {
		sendJSONError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	adminID := getUserIDFromRequest(r)
	if adminID == 0 {
		sendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var donationID int
	err := h.DB.QueryRow(
		"INSERT INTO donations (beneficiary_name, contact_no, amount, admin_id) VALUES ($1, $2, $3, $4) RETURNING id",
		donation.BeneficiaryName, donation.ContactNo, donation.Amount, adminID,
	).Scan(&donationID)

	if err != nil {
		sendJSONError(w, "Failed to create donation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	donation.ID = donationID
	donation.AdminID = adminID
	donation.DonationDate = time.Now()

	sendJSONResponse(w, donation, http.StatusCreated)
}

func (h *Handlers) GetDonations(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT d.id, d.beneficiary_name, d.contact_no, d.amount, d.admin_id, u.username, d.donation_date, d.created_at
		FROM donations d
		LEFT JOIN users u ON d.admin_id = u.id
		ORDER BY d.created_at DESC
	`

	rows, err := h.DB.Query(query)
	if err != nil {
		sendJSONError(w, "Failed to fetch donations", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var donations []models.Donation
	for rows.Next() {
		var d models.Donation
		err := rows.Scan(
			&d.ID, &d.BeneficiaryName, &d.ContactNo, &d.Amount, &d.AdminID, &d.AdminName, &d.DonationDate, &d.CreatedAt,
		)
		if err != nil {
			continue
		}
		donations = append(donations, d)
	}

	sendJSONResponse(w, donations, http.StatusOK)
}
