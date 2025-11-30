# Khidmat - Donation Management System

Khidmat is a web application for managing donations where account admins register members and track their monthly contributions of ₹200. All contributions are accumulated in a pool from which donations are made to needy persons.

## Features

1. **User Authentication**: Login/Signup for Master Admin and Account Admin
2. **Member Management**: Register and manage members with their details
3. **Payment Tracking**: Record member payments
4. **Donation Management**: Record donations made to beneficiaries
5. **Reports**: View comprehensive reports including:
   - Account admin wise payment reports
   - Monthly collection reports
   - Monthly donation reports
   - Pool balance

## Technology Stack

### Backend
- **Language**: Go (Golang)
- **Database**: PostgreSQL
- **Framework**: Gorilla Mux
- **Authentication**: JWT

### Frontend
- **Framework**: React.js
- **UI Components**: React Data Table Component
- **HTTP Client**: Axios
- **Routing**: React Router

## Setup Instructions

### Backend Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE khidmat;
```

2. Navigate to the backend directory:
```bash
cd backend
```

3. Create a `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=khidmat
DB_SSLMODE=disable
PORT=8080
```

4. Install dependencies:
```bash
go mod download
```

5. Run the backend server:
```bash
go run main.go
```

The backend API will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## User Types

1. **Master Admin**: Full access to all features
2. **Account Admin**: Can register members, record payments and donations
3. **Member**: Registered users who make monthly contributions (view-only access through admin)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Signup

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create a new member
- `PUT /api/members/{id}/toggle-status` - Toggle member status

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create a new payment

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create a new donation

### Reports
- `GET /api/reports/admin-payments` - Get admin payments report
- `GET /api/reports/monthly-collection` - Get monthly collection
- `GET /api/reports/monthly-donations` - Get monthly donations
- `GET /api/reports/pool-balance` - Get pool balance

## Database Schema

The application uses the following main tables:
- `users` - Store admin users
- `members` - Store registered members
- `payments` - Store payment records
- `donations` - Store donation records

## License

MIT





