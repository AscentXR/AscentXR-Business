import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Login from './pages/Login';
import CommandCenter from './pages/CommandCenter';
import Sales from './pages/Sales';
import Marketing from './pages/Marketing';
import Products from './pages/Products';
import Finance from './pages/Finance';
import Taxes from './pages/Taxes';
import Brand from './pages/Brand';
import Agents from './pages/Agents';
import Goals from './pages/Goals';
import Team from './pages/Team';
import Legal from './pages/Legal';
import Documents from './pages/Documents';
import CustomerSuccess from './pages/CustomerSuccess';
import Partnerships from './pages/Partnerships';
import SalesDashboard from './pages/SalesDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1d45] via-[#0f2a5e] to-[#1a1045]">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-[#2563EB] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<ErrorBoundary><CommandCenter /></ErrorBoundary>} />
                <Route path="/sales" element={<ErrorBoundary><Sales /></ErrorBoundary>} />
                <Route path="/marketing" element={<ErrorBoundary><Marketing /></ErrorBoundary>} />
                <Route path="/sales-dashboard" element={<ErrorBoundary><SalesDashboard /></ErrorBoundary>} />
                <Route path="/marketing-dashboard" element={<ErrorBoundary><MarketingDashboard /></ErrorBoundary>} />
                <Route path="/products" element={<ErrorBoundary><Products /></ErrorBoundary>} />
                <Route path="/finance" element={<ErrorBoundary><Finance /></ErrorBoundary>} />
                <Route path="/taxes" element={<ErrorBoundary><Taxes /></ErrorBoundary>} />
                <Route path="/brand" element={<ErrorBoundary><Brand /></ErrorBoundary>} />
                <Route path="/agents" element={<ErrorBoundary><Agents /></ErrorBoundary>} />
                <Route path="/goals" element={<ErrorBoundary><Goals /></ErrorBoundary>} />
                <Route path="/team" element={<ErrorBoundary><Team /></ErrorBoundary>} />
                <Route path="/legal" element={<ErrorBoundary><Legal /></ErrorBoundary>} />
                <Route path="/documents" element={<ErrorBoundary><Documents /></ErrorBoundary>} />
                <Route path="/customer-success" element={<ErrorBoundary><CustomerSuccess /></ErrorBoundary>} />
                <Route path="/partnerships" element={<ErrorBoundary><Partnerships /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
