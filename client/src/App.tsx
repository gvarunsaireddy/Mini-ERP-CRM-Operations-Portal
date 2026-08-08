import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import DashboardLayout from './shared/components/DashboardLayout';

// Placeholder imports for pages
import LoginPage from './features/auth/components/LoginPage';
import DashboardPage from './features/dashboard/components/DashboardPage';
import CustomerListPage from './features/customers/components/CustomerListPage';
import CustomerFormPage from './features/customers/components/CustomerFormPage';
import CustomerDetailPage from './features/customers/components/CustomerDetailPage';
import ProductListPage from './features/products/components/ProductListPage';
import ProductFormPage from './features/products/components/ProductFormPage';
import ProductDetailPage from './features/products/components/ProductDetailPage';
import ChallanListPage from './features/challans/components/ChallanListPage';
import ChallanCreatePage from './features/challans/components/ChallanCreatePage';
import ChallanDetailPage from './features/challans/components/ChallanDetailPage';
import UserListPage from './features/users/components/UserListPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(10px)',
            }
          }} 
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            
            <Route path="customers">
              <Route index element={<CustomerListPage />} />
              <Route path="new" element={<CustomerFormPage />} />
              <Route path=":id" element={<CustomerDetailPage />} />
              <Route path=":id/edit" element={<CustomerFormPage />} />
            </Route>

            <Route path="products">
              <Route index element={<ProductListPage />} />
              <Route path="new" element={<ProductFormPage />} />
              <Route path=":id" element={<ProductDetailPage />} />
              <Route path=":id/edit" element={<ProductFormPage />} />
            </Route>

            <Route path="challans">
              <Route index element={<ChallanListPage />} />
              <Route path="new" element={<ChallanCreatePage />} />
              <Route path=":id" element={<ChallanDetailPage />} />
            </Route>

            <Route path="users" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <UserListPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
