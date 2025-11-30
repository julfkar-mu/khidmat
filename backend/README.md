# Khidmat Backend

Backend API for Khidmat donation management system built with Go and PostgreSQL.

## Setup

### Prerequisites
- Go 1.21 or higher
- PostgreSQL 12 or higher

### Database Setup

1. Create PostgreSQL database:
```bash
createdb khidmat
# OR
psql -U postgres -c "CREATE DATABASE khidmat;"
```

2. Create `.env` file in the backend directory:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=khidmat
DB_SSLMODE=disable
PORT=8080
```

### Installation

1. Install dependencies:
```bash
go mod download
```

2. Run the server:
```bash
go run main.go
```

The API will be available at `http://localhost:8080`

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Signup

#### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create a new member
- `PUT /api/members/{id}/toggle-status` - Toggle member status

#### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create a new payment

#### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create a new donation

#### Reports
- `GET /api/reports/admin-payments` - Get admin payments report
- `GET /api/reports/monthly-collection` - Get monthly collection
- `GET /api/reports/monthly-donations` - Get monthly donations
- `GET /api/reports/pool-balance` - Get pool balance

### Database Migrations

The database tables are automatically created when the application starts. The migrations are defined in `internal/database/database.go`.

### Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_NAME` - Database name (default: khidmat)
- `DB_SSLMODE` - SSL mode (default: disable)
- `PORT` - Server port (default: 8080)

### Security Notes

- Change the JWT secret in `internal/middleware/auth.go` for production
- Use strong passwords for database access
- Enable SSL for database connections in production
- Use environment variables for sensitive configuration





