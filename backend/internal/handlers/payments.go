package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/khidmat/backend/internal/models"
)

func (h *Handlers) CreatePayment(w http.ResponseWriter, r *http.Request) {
	var payment models.Payment
	if err := json.NewDecoder(r.Body).Decode(&payment); err != nil {
		sendJSONError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	adminID := getUserIDFromRequest(r)
	if adminID == 0 {
		sendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var paymentID int
	err := h.DB.QueryRow(
		"INSERT INTO payments (member_id, member_name, contact_no, amount, admin_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		payment.MemberID, payment.MemberName, payment.ContactNo, payment.Amount, adminID,
	).Scan(&paymentID)

	if err != nil {
		log.Printf("Error creating payment: %v", err)
		sendJSONError(w, "Failed to create payment. Please try again later.", http.StatusInternalServerError)
		return
	}

	payment.ID = paymentID
	payment.AdminID = adminID
	payment.PaymentDate = time.Now()

	sendJSONResponse(w, payment, http.StatusCreated)
}

func (h *Handlers) GetPayments(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT p.id, p.member_id, p.member_name, p.contact_no, p.amount, p.admin_id, u.username, p.payment_date, p.created_at
		FROM payments p
		LEFT JOIN users u ON p.admin_id = u.id
		ORDER BY p.created_at DESC
	`

	rows, err := h.DB.Query(query)
	if err != nil {
		log.Printf("Error fetching payments: %v", err)
		sendJSONError(w, "Failed to fetch payments. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var payments []models.Payment
	for rows.Next() {
		var p models.Payment
		err := rows.Scan(
			&p.ID, &p.MemberID, &p.MemberName, &p.ContactNo, &p.Amount, &p.AdminID, &p.AdminName, &p.PaymentDate, &p.CreatedAt,
		)
		if err != nil {
			continue
		}
		payments = append(payments, p)
	}

	sendJSONResponse(w, payments, http.StatusOK)
}
