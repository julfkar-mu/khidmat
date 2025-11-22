package models

import "time"

type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	UserType     string    `json:"user_type"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Member struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	MobileNo  string    `json:"mobile_no"`
	Address   string    `json:"address"`
	AdminID   int       `json:"admin_id"`
	AdminName string    `json:"admin_name,omitempty"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Payment struct {
	ID          int       `json:"id"`
	MemberID    int       `json:"member_id"`
	MemberName  string    `json:"member_name"`
	ContactNo   string    `json:"contact_no"`
	Amount      float64   `json:"amount"`
	AdminID     int       `json:"admin_id"`
	AdminName   string    `json:"admin_name,omitempty"`
	PaymentDate time.Time `json:"payment_date"`
	CreatedAt   time.Time `json:"created_at"`
}

type Donation struct {
	ID              int       `json:"id"`
	BeneficiaryName string    `json:"beneficiary_name"`
	ContactNo       string    `json:"contact_no"`
	Amount          float64   `json:"amount"`
	AdminID         int       `json:"admin_id"`
	AdminName       string    `json:"admin_name,omitempty"`
	DonationDate    time.Time `json:"donation_date"`
	CreatedAt       time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type SignupRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	UserType string `json:"user_type"`
}

type AdminPaymentReport struct {
	AdminID        int     `json:"admin_id"`
	AdminName      string  `json:"admin_name"`
	PaidMembers    int     `json:"paid_members"`
	PendingMembers int     `json:"pending_members"`
	TotalAmount    float64 `json:"total_amount"`
}

type MonthlyCollection struct {
	Month string  `json:"month"`
	Total float64 `json:"total"`
}

type MonthlyDonation struct {
	Month string  `json:"month"`
	Total float64 `json:"total"`
}

type MonthlyCollectionDetail struct {
	MemberName  string  `json:"member_name"`
	ContactNo   string  `json:"contact_no"`
	Amount      float64 `json:"amount"`
	AdminName   string  `json:"admin_name"`
	PaymentDate string  `json:"payment_date"`
}

type MonthlyDonationDetail struct {
	BeneficiaryName string  `json:"beneficiary_name"`
	ContactNo       string  `json:"contact_no"`
	Amount          float64 `json:"amount"`
	AdminName       string  `json:"admin_name"`
	DonationDate    string  `json:"donation_date"`
}
