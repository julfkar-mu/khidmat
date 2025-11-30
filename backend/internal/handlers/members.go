package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/khidmat/backend/internal/models"
)

func (h *Handlers) CreateMember(w http.ResponseWriter, r *http.Request) {
	var member models.Member
	if err := json.NewDecoder(r.Body).Decode(&member); err != nil {
		sendJSONError(w, "Invalid request", http.StatusBadRequest)
		return
	}

	adminID := getUserIDFromRequest(r)
	if adminID == 0 {
		sendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var memberID int
	err := h.DB.QueryRow(
		"INSERT INTO members (name, mobile_no, address, admin_id) VALUES ($1, $2, $3, $4) RETURNING id",
		member.Name, member.MobileNo, member.Address, adminID,
	).Scan(&memberID)

	if err != nil {
		log.Printf("Error creating member: %v", err)
		sendJSONError(w, "Failed to create member. Please try again later.", http.StatusInternalServerError)
		return
	}

	member.ID = memberID
	member.AdminID = adminID

	sendJSONResponse(w, member, http.StatusCreated)
}

func (h *Handlers) GetMembers(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT m.id, m.name, m.mobile_no, m.address, m.admin_id, u.username, m.is_active, m.created_at, m.updated_at
		FROM members m
		LEFT JOIN users u ON m.admin_id = u.id
		ORDER BY m.created_at DESC
	`

	rows, err := h.DB.Query(query)
	if err != nil {
		log.Printf("Error fetching members: %v", err)
		sendJSONError(w, "Failed to fetch members. Please try again later.", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var members []models.Member
	for rows.Next() {
		var m models.Member
		err := rows.Scan(
			&m.ID, &m.Name, &m.MobileNo, &m.Address, &m.AdminID, &m.AdminName, &m.IsActive, &m.CreatedAt, &m.UpdatedAt,
		)
		if err != nil {
			continue
		}
		members = append(members, m)
	}

	sendJSONResponse(w, members, http.StatusOK)
}

func (h *Handlers) ToggleMemberStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	memberID, err := strconv.Atoi(vars["id"])
	if err != nil {
		sendJSONError(w, "Invalid member ID", http.StatusBadRequest)
		return
	}

	var isActive bool
	err = h.DB.QueryRow("SELECT is_active FROM members WHERE id = $1", memberID).Scan(&isActive)
	if err != nil {
		log.Printf("Error fetching member for status toggle: %v", err)
		sendJSONError(w, "Member not found", http.StatusNotFound)
		return
	}

	_, err = h.DB.Exec("UPDATE members SET is_active = $1 WHERE id = $2", !isActive, memberID)
	if err != nil {
		log.Printf("Error updating member status: %v", err)
		sendJSONError(w, "Failed to update member status. Please try again later.", http.StatusInternalServerError)
		return
	}

	sendJSONResponse(w, map[string]interface{}{
		"id":        memberID,
		"is_active": !isActive,
	}, http.StatusOK)
}
