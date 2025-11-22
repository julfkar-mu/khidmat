import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import MemberRegistration from './components/Members/MemberRegistration';
import MemberList from './components/Members/MemberList';
import PaymentEntry from './components/Payments/PaymentEntry';
import DonationEntry from './components/Donations/DonationEntry';
import Reports from './components/Reports/Reports';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/members/register"
            element={
              <PrivateRoute>
                <MemberRegistration />
              </PrivateRoute>
            }
          />
          <Route
            path="/members"
            element={
              <PrivateRoute>
                <MemberList />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <PaymentEntry />
              </PrivateRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <PrivateRoute>
                <DonationEntry />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;


