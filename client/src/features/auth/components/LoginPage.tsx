import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './LoginPage.css';

const DEMO_USERS = [
  { role: 'Admin', email: 'admin@erp.com', pass: 'Admin@123', color: '#06b6d4' },
  { role: 'Sales', email: 'sales@erp.com', pass: 'Sales@123', color: '#10b981' },
  { role: 'Warehouse', email: 'warehouse@erp.com', pass: 'Warehouse@123', color: '#f59e0b' },
  { role: 'Accounts', email: 'accounts@erp.com', pass: 'Accounts@123', color: '#8b5cf6' },
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setEmail(loginEmail);
    setPassword(loginPass);
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login(loginEmail, loginPass);
      if (response && response.token && response.user) {
        login(response.token, response.user);
        toast.success(`Logged in as ${response.user.name} (${response.user.role})`);
        navigate('/');
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error: any) {
      let rawMsg = error.response?.data?.message || error.message || 'Login failed. Please check backend connection.';
      if (Array.isArray(rawMsg)) {
        rawMsg = rawMsg.join(', ');
      }
      const finalMsg = typeof rawMsg === 'string' ? rawMsg : 'Invalid credentials or server error';
      
      setErrorMessage(finalMsg);
      toast.error(finalMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }
    handleLogin(email, password);
  };

  return (
    <div className="login-container flex items-center justify-center p-4">
      <div className="login-background"></div>
      <div className="card login-card">
        <div className="login-header flex flex-col items-center gap-3">
          <div className="logo-container">
            <Briefcase size={32} className="text-accent" />
          </div>
          <h1 className="login-title">ERP CRM Portal</h1>
          <p className="text-secondary text-xs">Sign in to your enterprise account</p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg bg-danger-bg border border-danger/30 text-danger text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@erp.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="spinner" /> : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Quick Fill Section */}
        <div className="demo-section mt-6 pt-5 border-t border-primary">
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary mb-3">
            <ShieldCheck size={14} className="text-accent" />
            <span>QUICK DEMO ACCOUNTS (1-CLICK LOGIN)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                className="demo-btn p-2.5 rounded-lg text-left transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--bg-glass)',
                  border: `1px solid ${demo.color}40`,
                }}
                onClick={() => handleLogin(demo.email, demo.pass)}
                disabled={loading}
              >
                <div className="text-xs font-bold" style={{ color: demo.color }}>
                  {demo.role}
                </div>
                <div className="text-[11px] text-muted truncate">{demo.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
