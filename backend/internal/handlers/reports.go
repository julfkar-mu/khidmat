package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/khidmat/backend/internal/models"
)

func (h *Handlers) GetAdminPaymentsReport(w http.ResponseWriter, r *http.Request) {
	now := time.Now()
	year, month := now.Year(), now.Month()
	startOfMonth := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	query := `
		WITH admin_members AS (
			SELECT u.id as admin_id, u.username as admin_name, COUNT(m.id) as total_members
			FROM users u
			LEFT JOIN members m ON u.id = m.admin_id AND m.is_active = true
			WHERE u.user_type = 'account_admin'
			GROUP BY u.id, u.username
		),
		paid_members AS (
			SELECT p.admin_id, COUNT(DISTINCT p.member_id) as paid_count, COALESCE(SUM(p.amount), 0) as total_amount
			FROM payments p
			WHERE p.payment_date >= $1 AND p.payment_date < $2
			GROUP BY p.admin_id
		)
		SELECT 
			am.admin_id,
			am.admin_name,
			COALESCE(pm.paid_count, 0) as paid_members,
			(am.total_members - COALESCE(pm.paid_count, 0)) as pending_members,
			COALESCE(pm.total_amount, 0) as total_amount
		FROM admin_members am
		LEFT JOIN paid_members pm ON am.admin_id = pm.admin_id
		ORDER BY am.admin_name
	`

	rows, err := h.DB.Query(query, startOfMonth, endOfMonth)
	if err != nil {
		log.Printf("Error fetching admin payments report: %v", err)
		sendJSONError(w, "Failed to fetch report. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var reports []models.AdminPaymentReport
	for rows.Next() {
		var report models.AdminPaymentReport
		err := rows.Scan(
			&report.AdminID, &report.AdminName, &report.PaidMembers, &report.PendingMembers, &report.TotalAmount,
		)
		if err != nil {
			continue
		}
		reports = append(reports, report)
	}

	sendJSONResponse(w, reports, http.StatusOK)
}

func (h *Handlers) GetMonthlyCollection(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			TO_CHAR(payment_date, 'YYYY-MM') as month,
			SUM(amount) as total
		FROM payments
		GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
		ORDER BY month DESC
		LIMIT 12
	`

	rows, err := h.DB.Query(query)
	if err != nil {
		log.Printf("Error fetching monthly collection: %v", err)
		sendJSONError(w, "Failed to fetch monthly collection. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var collections []models.MonthlyCollection
	for rows.Next() {
		var collection models.MonthlyCollection
		err := rows.Scan(&collection.Month, &collection.Total)
		if err != nil {
			continue
		}
		collections = append(collections, collection)
	}

	sendJSONResponse(w, collections, http.StatusOK)
}

func (h *Handlers) GetMonthlyCollectionDetails(w http.ResponseWriter, r *http.Request) {
	// Get month parameter from query string, default to current month
	monthParam := r.URL.Query().Get("month")
	var startOfMonth, endOfMonth time.Time

	if monthParam != "" {
		// Parse month in YYYY-MM format
		parsedTime, err := time.Parse("2006-01", monthParam)
		if err != nil {
			sendJSONError(w, "Invalid month format. Use YYYY-MM", http.StatusBadRequest)
			return
		}
		startOfMonth = time.Date(parsedTime.Year(), parsedTime.Month(), 1, 0, 0, 0, 0, time.UTC)
		endOfMonth = startOfMonth.AddDate(0, 1, 0)
	} else {
		// Default to current month
		now := time.Now()
		startOfMonth = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		endOfMonth = startOfMonth.AddDate(0, 1, 0)
	}

	query := `
		SELECT 
			p.member_name,
			p.contact_no,
			p.amount,
			u.username as admin_name,
			TO_CHAR(p.payment_date, 'YYYY-MM-DD') as payment_date
		FROM payments p
		LEFT JOIN users u ON p.admin_id = u.id
		WHERE p.payment_date >= $1 AND p.payment_date < $2
		ORDER BY p.payment_date DESC, p.member_name
	`

	rows, err := h.DB.Query(query, startOfMonth, endOfMonth)
	if err != nil {
		log.Printf("Error fetching monthly collection details: %v", err)
		sendJSONError(w, "Failed to fetch monthly collection details. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var details []models.MonthlyCollectionDetail
	var totalAmount float64

	for rows.Next() {
		var detail models.MonthlyCollectionDetail
		err := rows.Scan(
			&detail.MemberName,
			&detail.ContactNo,
			&detail.Amount,
			&detail.AdminName,
			&detail.PaymentDate,
		)
		if err != nil {
			continue
		}
		totalAmount += detail.Amount
		details = append(details, detail)
	}

	// Return both the details and total
	sendJSONResponse(w, map[string]interface{}{
		"details": details,
		"total":   totalAmount,
		"month":   startOfMonth.Format("2006-01"),
	}, http.StatusOK)
}

func (h *Handlers) GetMonthlyDonations(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			TO_CHAR(donation_date, 'YYYY-MM') as month,
			SUM(amount) as total
		FROM donations
		GROUP BY TO_CHAR(donation_date, 'YYYY-MM')
		ORDER BY month DESC
		LIMIT 12
	`

	rows, err := h.DB.Query(query)
	if err != nil {
		log.Printf("Error fetching monthly donations: %v", err)
		sendJSONError(w, "Failed to fetch monthly donations. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var donations []models.MonthlyDonation
	for rows.Next() {
		var donation models.MonthlyDonation
		err := rows.Scan(&donation.Month, &donation.Total)
		if err != nil {
			continue
		}
		donations = append(donations, donation)
	}

	sendJSONResponse(w, donations, http.StatusOK)
}

func (h *Handlers) GetMonthlyDonationDetails(w http.ResponseWriter, r *http.Request) {
	// Get month parameter from query string, default to current month
	monthParam := r.URL.Query().Get("month")
	var startOfMonth, endOfMonth time.Time

	if monthParam != "" {
		// Parse month in YYYY-MM format
		parsedTime, err := time.Parse("2006-01", monthParam)
		if err != nil {
			sendJSONError(w, "Invalid month format. Use YYYY-MM", http.StatusBadRequest)
			return
		}
		startOfMonth = time.Date(parsedTime.Year(), parsedTime.Month(), 1, 0, 0, 0, 0, time.UTC)
		endOfMonth = startOfMonth.AddDate(0, 1, 0)
	} else {
		// Default to current month
		now := time.Now()
		startOfMonth = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		endOfMonth = startOfMonth.AddDate(0, 1, 0)
	}

	query := `
		SELECT 
			d.beneficiary_name,
			d.contact_no,
			d.amount,
			u.username as admin_name,
			TO_CHAR(d.donation_date, 'YYYY-MM-DD') as donation_date
		FROM donations d
		LEFT JOIN users u ON d.admin_id = u.id
		WHERE d.donation_date >= $1 AND d.donation_date < $2
		ORDER BY d.donation_date DESC, d.beneficiary_name
	`

	rows, err := h.DB.Query(query, startOfMonth, endOfMonth)
	if err != nil {
		log.Printf("Error fetching monthly donation details: %v", err)
		sendJSONError(w, "Failed to fetch monthly donation details. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var details []models.MonthlyDonationDetail
	var totalAmount float64

	for rows.Next() {
		var detail models.MonthlyDonationDetail
		err := rows.Scan(
			&detail.BeneficiaryName,
			&detail.ContactNo,
			&detail.Amount,
			&detail.AdminName,
			&detail.DonationDate,
		)
		if err != nil {
			continue
		}
		totalAmount += detail.Amount
		details = append(details, detail)
	}

	// Return both the details and total
	sendJSONResponse(w, map[string]interface{}{
		"details": details,
		"total":   totalAmount,
		"month":   startOfMonth.Format("2006-01"),
	}, http.StatusOK)
}

func (h *Handlers) GetPoolBalance(w http.ResponseWriter, r *http.Request) {
	var totalPayments float64
	var totalDonations float64

	h.DB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM payments").Scan(&totalPayments)
	h.DB.QueryRow("SELECT COALESCE(SUM(amount), 0) FROM donations").Scan(&totalDonations)

	balance := totalPayments - totalDonations

	sendJSONResponse(w, map[string]interface{}{
		"total_payments":  totalPayments,
		"total_donations": totalDonations,
		"balance":         balance,
	}, http.StatusOK)
}

func (h *Handlers) GetPaidMembersReport(w http.ResponseWriter, r *http.Request) {
	// Get current month
	now := time.Now()
	year, month := now.Year(), now.Month()
	startOfMonth := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	// Get user info
	adminID := getUserIDFromRequest(r)
	userType := getUserTypeFromRequest(r)

	var query string
	var rows *sql.Rows
	var err error

	if userType == "master_admin" {
		// Master admin sees all paid members
		query = `
			SELECT 
				p.member_name,
				p.contact_no as mobile_no,
				p.amount as paid_amount,
				TO_CHAR(p.payment_date, 'YYYY-MM-DD') as payment_date,
				u.username as admin_name
			FROM payments p
			LEFT JOIN users u ON p.admin_id = u.id
			WHERE p.payment_date >= $1 AND p.payment_date < $2
			ORDER BY p.payment_date DESC, p.member_name
		`
		rows, err = h.DB.Query(query, startOfMonth, endOfMonth)
	} else {
		// Account admin sees only their paid members
		query = `
			SELECT 
				p.member_name,
				p.contact_no as mobile_no,
				p.amount as paid_amount,
				TO_CHAR(p.payment_date, 'YYYY-MM-DD') as payment_date,
				u.username as admin_name
			FROM payments p
			LEFT JOIN users u ON p.admin_id = u.id
			WHERE p.payment_date >= $1 AND p.payment_date < $2
				AND p.admin_id = $3
			ORDER BY p.payment_date DESC, p.member_name
		`
		rows, err = h.DB.Query(query, startOfMonth, endOfMonth, adminID)
	}

	if err != nil {
		log.Printf("Error fetching paid members report: %v", err)
		sendJSONError(w, "Failed to fetch paid members report. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var paidMembers []models.PaidMemberReport
	for rows.Next() {
		var member models.PaidMemberReport
		err := rows.Scan(
			&member.MemberName,
			&member.MobileNo,
			&member.PaidAmount,
			&member.PaymentDate,
			&member.AdminName,
		)
		if err != nil {
			continue
		}
		paidMembers = append(paidMembers, member)
	}

	sendJSONResponse(w, paidMembers, http.StatusOK)
}

func (h *Handlers) GetUnpaidMembersReport(w http.ResponseWriter, r *http.Request) {
	// Get current month
	now := time.Now()
	year, month := now.Year(), now.Month()
	startOfMonth := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	// Get user info
	adminID := getUserIDFromRequest(r)
	userType := getUserTypeFromRequest(r)

	var query string
	var rows *sql.Rows
	var err error

	if userType == "master_admin" {
		// Master admin sees all unpaid members
		query = `
			SELECT DISTINCT
				m.name as member_name,
				m.mobile_no,
				u.username as admin_name
			FROM members m
			INNER JOIN users u ON m.admin_id = u.id
			WHERE m.is_active = true
				AND m.id NOT IN (
					SELECT DISTINCT p.member_id
					FROM payments p
					WHERE p.payment_date >= $1 AND p.payment_date < $2
				)
			ORDER BY u.username, m.name
		`
		rows, err = h.DB.Query(query, startOfMonth, endOfMonth)
	} else {
		// Account admin sees only their unpaid members
		query = `
			SELECT DISTINCT
				m.name as member_name,
				m.mobile_no,
				u.username as admin_name
			FROM members m
			INNER JOIN users u ON m.admin_id = u.id
			WHERE m.is_active = true
				AND m.admin_id = $3
				AND m.id NOT IN (
					SELECT DISTINCT p.member_id
					FROM payments p
					WHERE p.payment_date >= $1 AND p.payment_date < $2
				)
			ORDER BY m.name
		`
		rows, err = h.DB.Query(query, startOfMonth, endOfMonth, adminID)
	}

	if err != nil {
		log.Printf("Error fetching unpaid members report: %v", err)
		sendJSONError(w, "Failed to fetch unpaid members report. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var unpaidMembers []models.UnpaidMemberReport
	for rows.Next() {
		var member models.UnpaidMemberReport
		err := rows.Scan(
			&member.MemberName,
			&member.MobileNo,
			&member.AdminName,
		)
		if err != nil {
			continue
		}
		unpaidMembers = append(unpaidMembers, member)
	}

	sendJSONResponse(w, unpaidMembers, http.StatusOK)
}
