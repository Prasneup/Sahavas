import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

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
// Loading Spinner Overlay Component
// ===============================

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="animate-spin text-marigold" size={32} />
      <span className="text-xs font-bold text-ink-soft uppercase tracking-wider">Loading Nivaro...</span>
    </div>
  </div>
);


// ===============================
// Protected Route
// ===============================

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
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
    return <LoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role !== 'owner') {
    return <Navigate to="/" replace />;
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
    return <LoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'owner') {
    return <Navigate to="/landlord" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


// ===============================
// Student Route
// ===============================

const StudentRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'owner') {
    return <Navigate to="/landlord" replace />;
  }

  return <>{children}</>;
};



// ===============================
// Application Routes
// ===============================

function AppRoutes() {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
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
          <StudentRoute>
            <Dashboard />
          </StudentRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <StudentRoute>
            <RoomSearch />
          </StudentRoute>
        }
      />

      <Route
        path="/rooms/:id"
        element={
          <StudentRoute>
            <RoomDetails />
          </StudentRoute>
        }
      />

      <Route
        path="/rooms/:id/route"
        element={
          <StudentRoute>
            <RouteMap />
          </StudentRoute>
        }
      />

      <Route
        path="/roommates"
        element={
          <StudentRoute>
            <RoommateDiscovery />
          </StudentRoute>
        }
      />

      <Route
        path="/matches/results"
        element={
          <StudentRoute>
            <MatchResults />
          </StudentRoute>
        }
      />

      <Route
        path="/matches/:id"
        element={
          <StudentRoute>
            <RoommateProfile />
          </StudentRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <StudentRoute>
            <ProfileEdit />
          </StudentRoute>
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
          <StudentRoute>
            <Communities />
          </StudentRoute>
        }
      />

      <Route
        path="/relocation"
        element={
          <StudentRoute>
            <RelocationDashboard />
          </StudentRoute>
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