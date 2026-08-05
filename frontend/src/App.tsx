import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Layout from './components/Layout';
import MatchResults from './pages/MatchResults';
import RoommateProfile from './pages/RoommateProfile';

// Protected Route Guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-brand-cyan">
        <span className="animate-pulse font-bold text-lg font-display">Loading User Context...</span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      
      {/* Public Auth Routes */}
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!token ? <Signup /> : <Navigate to="/dashboard" replace />} />

      {/* Protected Dashboard/API Pages */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/rooms" element={
        <ProtectedRoute>
          <RoomSearch />
        </ProtectedRoute>
      } />
      <Route path="/rooms/:id" element={
        <ProtectedRoute>
          <RoomDetails />
        </ProtectedRoute>
      } />
      <Route path="/rooms/:id/route" element={
        <ProtectedRoute>
          <RouteMap />
        </ProtectedRoute>
      } />
      <Route path="/roommates" element={
        <ProtectedRoute>
          <RoommateDiscovery />
        </ProtectedRoute>
      } />
      <Route path="/matches/results" element={
        <ProtectedRoute>
          <MatchResults />
        </ProtectedRoute>
      } />
      <Route path="/matches/:id" element={
        <ProtectedRoute>
          <RoommateProfile />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfileEdit />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/chat/:id" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/communities" element={
        <ProtectedRoute>
          <Communities />
        </ProtectedRoute>
      } />
      <Route path="/relocation" element={
        <ProtectedRoute>
          <RelocationDashboard />
        </ProtectedRoute>
      } />
      <Route path="/verify" element={
        <ProtectedRoute>
          <Verification />
        </ProtectedRoute>
      } />

      {/* Fallback to Root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
