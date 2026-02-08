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
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
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
