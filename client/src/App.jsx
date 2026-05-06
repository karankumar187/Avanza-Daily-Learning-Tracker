import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// ── Eagerly loaded (needed immediately for auth flow) ──────
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import Layout from './components/Layout';

// ── Lazily loaded (only fetched when first visited) ────────
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const Objectives   = lazy(() => import('./pages/Objectives'));
const Schedule     = lazy(() => import('./pages/Schedule'));
const Analytics    = lazy(() => import('./pages/Analytics'));
const AIAssistant  = lazy(() => import('./pages/AIAssistant'));
const Notes        = lazy(() => import('./pages/Notes'));

// ── Skeleton fallbacks ─────────────────────────────────────
import {
  DashboardSkeleton,
  ObjectivesSkeleton,
  ScheduleSkeleton,
  AnalyticsSkeleton,
  NotesSkeleton,
  AIAssistantSkeleton,
} from './components/Skeleton';

// ── Auth loading spinner (themed) ─────────────────────────
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-green-700 border-t-transparent animate-spin" />
      <p className="text-sm text-gray-400 font-medium tracking-wide">Loading Avanza…</p>
    </div>
  </div>
);

// ── Route guards ───────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// ── App ────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public */}
          <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"       element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/oauth-callback" element={<PublicRoute><OAuthCallback /></PublicRoute>} />

          {/* Protected — each route has its own Suspense + skeleton */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />

            <Route path="dashboard" element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Dashboard />
              </Suspense>
            } />

            <Route path="objectives" element={
              <Suspense fallback={<ObjectivesSkeleton />}>
                <Objectives />
              </Suspense>
            } />

            <Route path="schedule" element={
              <Suspense fallback={<ScheduleSkeleton />}>
                <Schedule />
              </Suspense>
            } />

            <Route path="analytics" element={
              <Suspense fallback={<AnalyticsSkeleton />}>
                <Analytics />
              </Suspense>
            } />

            <Route path="ai-assistant" element={
              <Suspense fallback={<AIAssistantSkeleton />}>
                <AIAssistant />
              </Suspense>
            } />

            <Route path="notes" element={
              <Suspense fallback={<NotesSkeleton />}>
                <Notes />
              </Suspense>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
