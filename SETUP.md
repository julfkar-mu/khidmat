# Khidmat Setup Guide

This guide will help you set up and run the Khidmat application.

## Prerequisites

1. **Go** (version 1.21 or higher)
   - Download from: https://golang.org/dl/
   - Verify installation: `go version`

2. **PostgreSQL** (version 12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify installation: `psql --version`

3. **Node.js** (version 16 or higher) and **npm**
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

## Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create PostgreSQL database:**
```bash
createdb khidmat
# OR using psql:
psql -U postgres -c "CREATE DATABASE khidmat;"
```

3. **Create `.env` file:**
```bash
cp .env.example .env
# Edit .env file with your database credentials
```

4. **Install Go dependencies:**
```bash
go mod download
```

5. **Run the backend server:**
```bash
go run main.go
```

The backend API will be running at `http://localhost:8080`

## Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
```

4. **Start the development server:**
```bash
npm start
```

The frontend will be running at `http://localhost:3000`

## First Time Setup

1. **Start the backend server** (from `backend` directory):
```bash
go run main.go
```

2. **Start the frontend server** (from `frontend` directory in a new terminal):
```bash
npm start
```

3. **Access the application:**
   - Open browser and go to `http://localhost:3000`
   - Click on "Sign up" to create an account
   - Choose either "Master Admin" or "Account Admin" as user type
   - Login with your credentials

## Creating Your First Admin

1. Go to the signup page
2. Fill in the form:
   - Username: your preferred username
   - Email: your email address
   - Password: your password
   - User Type: Select "Master Admin" or "Account Admin"
3. Click "Sign Up"
4. You will be automatically logged in

## Features Overview

1. **Member Registration**: Register new members with their details
2. **Member List**: View all members with search and sort functionality
3. **Payment Entry**: Record monthly payments from members (₹200)
4. **Donation Entry**: Record donations made to beneficiaries
5. **Reports**: View comprehensive reports including:
   - Account admin wise payment reports
   - Monthly collection reports
   - Monthly donation reports
   - Pool balance

## Troubleshooting

### Backend Issues

1. **Database connection error:**
   - Check if PostgreSQL is running: `sudo systemctl status postgresql`
   - Verify database credentials in `.env` file
   - Ensure database `khidmat` exists

2. **Port already in use:**
   - Change the port in `.env` file
   - Or kill the process using port 8080

### Frontend Issues

1. **Cannot connect to API:**
   - Verify backend is running
   - Check `REACT_APP_API_URL` in frontend `.env` file
   - Check CORS settings in backend

2. **Module not found errors:**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

## Production Deployment

1. **Backend:**
   - Build the binary: `go build -o khidmat-backend main.go`
   - Set proper environment variables
   - Use a process manager like systemd or PM2
   - Enable SSL/TLS
   - Change JWT secret

2. **Frontend:**
   - Build for production: `npm run build`
   - Serve the `build` directory using a web server like nginx
   - Configure proper CORS settings

## Support

For issues or questions, please check the documentation or create an issue in the repository.





