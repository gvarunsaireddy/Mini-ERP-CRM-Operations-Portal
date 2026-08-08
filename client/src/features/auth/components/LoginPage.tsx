import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Mail, Lock, Loader2, ShieldCheck, AlertCircle, User as UserIcon, UserPlus, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import './LoginPage.css';

const DEMO_USERS = [
  { role: 'Admin', email: 'admin@erp.com', pass: 'Admin@123', color: '#06b6d4' },
  { role: 'Sales', email: 'sales@erp.com', pass: 'Sales@123', color: '#10b981' },
  { role: 'Warehouse', email: 'warehouse@erp.com', pass: 'Warehouse@123', color: '#f59e0b' },
  { role: 'Accounts', email: 'accounts@erp.com', pass: 'Accounts@123', color: '#8b5cf6' },
];

const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Sales');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Quick Demo Account click: Fills form fields WITHOUT auto-submitting (user clicks Sign In manually)
  const handleSelectDemoUser = (demoEmail: string, demoPass: string, demoRole: string) => {
    setIsSignUp(false);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    toast.success(`${demoRole} credentials filled! Click "Sign In" below to log in.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        // Register new user
        const response = await authApi.register({ name, email, password, role });
        login(response.token, response.user);
        toast.success(`Account created! Welcome ${response.user.name}`);
        navigate('/');
      } else {
        // Login existing user
        const response = await authApi.login(email, password);
        login(response.token, response.user);
        toast.success(`Welcome back, ${response.user.name}!`);
        navigate('/');
      }
    } catch (error: any) {
      let rawMsg = error.response?.data?.message || error.message || 'Authentication failed. Please try again.';
      if (Array.isArray(rawMsg)) {
        rawMsg = rawMsg.join(', ');
      }
      const finalMsg = typeof rawMsg === 'string' ? rawMsg : 'Invalid credentials or registration error';

      setErrorMessage(finalMsg);
      toast.error(finalMsg);
    } finally {
      setLoading(false);
    }
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
          <p className="text-secondary text-xs">
            {isSignUp ? 'Create a new employee account' : 'Sign in to your enterprise account'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (Sign In / Sign Up) */}
        <div className="flex rounded-lg bg-glass p-1 mb-5 border border-primary">
          <button
            type="button"
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              !isSignUp ? 'bg-accent text-white shadow-sm' : 'text-secondary hover:text-primary'
            }`}
            onClick={() => {
              setIsSignUp(false);
              setErrorMessage(null);
            }}
          >
            <LogIn size={14} /> Sign In
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              isSignUp ? 'bg-accent text-white shadow-sm' : 'text-secondary hover:text-primary'
            }`}
            onClick={() => {
              setIsSignUp(true);
              setErrorMessage(null);
            }}
          >
            <UserPlus size={14} /> Register Account
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-lg bg-danger-bg border border-danger/30 text-danger text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">
              {errorMessage}
              {!isSignUp && errorMessage.toLowerCase().includes('invalid credentials') && (
                <div className="mt-1 font-normal text-[11px]">
                  Don't have an account yet? Click <strong>"Register Account"</strong> above to sign up!
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Full Name field (Only shown during Sign Up) */}
          {isSignUp && (
            <div className="form-group animate-fade-in">
              <label>Full Name</label>
              <div className="input-with-icon">
                <UserIcon size={18} className="input-icon" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Varun Sai Reddy"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSignUp ? "varunsai@gmail.com" : "admin@erp.com"}
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

          {/* Role Selection (Only shown during Sign Up) */}
          {isSignUp && (
            <div className="form-group animate-fade-in">
              <label>Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-input border border-primary text-sm text-primary"
              >
                <option value="Sales">Sales Rep</option>
                <option value="Warehouse">Warehouse Mgr</option>
                <option value="Accounts">Accounts Dept</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="spinner" />
            ) : isSignUp ? (
              'Create Account & Sign In'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Section (Fills in fields, requires user to click Sign In) */}
        {!isSignUp && (
          <div className="demo-section mt-6 pt-5 border-t border-primary">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary mb-3">
              <ShieldCheck size={14} className="text-accent" />
              <span>SELECT DEMO CREDENTIALS</span>
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
                  onClick={() => handleSelectDemoUser(demo.email, demo.pass, demo.role)}
                >
                  <div className="text-xs font-bold" style={{ color: demo.color }}>
                    {demo.role}
                  </div>
                  <div className="text-[11px] text-muted truncate">{demo.email}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
