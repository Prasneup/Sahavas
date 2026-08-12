import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RoomSearch from './pages/RoomSearch';
import RoommateDiscovery from './pages/RoommateDiscovery';
import ProfileEdit from './pages/ProfileEdit';
import Chat from './pages/Chat';
import Communities from './pages/Communities';
import RoomDetails from './pages/RoomDetails';
import RouteMap from './pages/RouteMap';
import RelocationDashboard from './pages/RelocationDashboard';
import Verification from './pages/Verification';
import MatchResults from './pages/MatchResults';
import RoommateProfile from './pages/RoommateProfile';
import AdminPortal from './pages/AdminPortal';
import LandlordDashboard from './pages/LandlordDashboard';


// ===============================
// Protected Route
// ===============================

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div>Loading User Context...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


// ===============================
// Landlord Route
// ===============================

const LandlordRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div>Loading Landlord Context...</div>;
  }

  if (!token || user?.role !== 'owner') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


// ===============================
// Admin Route
// ===============================

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div>Loading Admin Context...</div>;
  }

  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


// ===============================
// Application Routes
// ===============================

function AppRoutes() {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div>Loading Sahavas...</div>;
  }

  const getRootTarget = () => {
    if (!token || !user) {
      return '/login';
    }

    if (user.role === 'admin') {
      return '/admin';
    }

    if (user.role === 'owner') {
      return '/landlord';
    }

    return '/dashboard';
  };

  return (
    <Routes>

      {/* Root */}
      <Route
        path="/"
        element={<Navigate to={getRootTarget()} replace />}
      />

      {/* ================= PUBLIC AUTH ================= */}

      <Route
        path="/login"
        element={
          !token ? (
            <Login />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/signup"
        element={
          !token ? (
            <Signup />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />


      {/* ================= USER ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <RoomSearch />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms/:id"
        element={
          <ProtectedRoute>
            <RoomDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms/:id/route"
        element={
          <ProtectedRoute>
            <RouteMap />
          </ProtectedRoute>
        }
      />

      <Route
        path="/roommates"
        element={
          <ProtectedRoute>
            <RoommateDiscovery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches/results"
        element={
          <ProtectedRoute>
            <MatchResults />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches/:id"
        element={
          <ProtectedRoute>
            <RoommateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:id"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/communities"
        element={
          <ProtectedRoute>
            <Communities />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relocation"
        element={
          <ProtectedRoute>
            <RelocationDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/verify"
        element={
          <ProtectedRoute>
            <Verification />
          </ProtectedRoute>
        }
      />


      {/* ================= LANDLORD ================= */}

      <Route
        path="/landlord"
        element={
          <LandlordRoute>
            <LandlordDashboard />
          </LandlordRoute>
        }
      />


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPortal />
          </AdminRoute>
        }
      />


      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


// ===============================
// Main App
// ===============================

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;