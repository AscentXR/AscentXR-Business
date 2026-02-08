import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
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
                <Route path="/" element={<CommandCenter />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/products" element={<Products />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/taxes" element={<Taxes />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/team" element={<Team />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/customer-success" element={<CustomerSuccess />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
