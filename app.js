import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ServiceList from './components/customer/ServiceList';
import BookingForm from './components/customer/BookingForm';
import BookingHistory from './components/customer/BookingHistory';
import BookingDetails from './components/customer/BookingDetails';
import Dashboard from './components/admin/Dashboard';
import ServiceManagement from './components/admin/ServiceManagement';
import BookingManagement from './components/admin/BookingManagement';
import UserManagement from './components/admin/UserManagement';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container py-4 min-vh-100">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<ServiceList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Customer routes */}
          <Route 
            path="/booking/:serviceId" 
            element={
              <ProtectedRoute requiredRole="customer">
                <BookingForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute requiredRole="customer">
                <BookingHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookings/:bookingId" 
            element={
              <ProtectedRoute requiredRole="customer">
                <BookingDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/services" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ServiceManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/bookings" 
            element={
              <ProtectedRoute requiredRole="admin">
                <BookingManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;