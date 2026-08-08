import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Clock, Shield, Sparkles, Palette, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';

const THEMES = [
  { id: 'midnight', name: 'Midnight Cyber', color: '#06b6d4' },
  { id: 'violet', name: 'Obsidian Violet', color: '#a855f7' },
  { id: 'emerald', name: 'Emerald Matrix', color: '#10b981' },
  { id: 'amber', name: 'Sunset Amber', color: '#f59e0b' },
  { id: 'light', name: 'Clean Light', color: '#0284c7' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('erp_theme') || 'midnight';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('erp_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Operations Dashboard', subtitle: 'Real-time ERP & CRM metrics overview' };
    if (path.startsWith('/customers/new')) return { title: 'Add New Customer', subtitle: 'Register a new customer account' };
    if (path.startsWith('/customers')) return { title: 'Customer CRM Database', subtitle: 'Manage leads, active accounts & follow-ups' };
    if (path.startsWith('/products/new')) return { title: 'Add New Product', subtitle: 'Register inventory item and SKU' };
    if (path.startsWith('/products')) return { title: 'Product & Stock Catalog', subtitle: 'Inventory movements and stock alerts' };
    if (path.startsWith('/challans/new')) return { title: 'Create Sales Challan', subtitle: 'Multi-item order generation & stock deduction' };
    if (path.startsWith('/challans')) return { title: 'Sales Challans Registry', subtitle: 'Drafts, confirmed orders & audit history' };
    if (path.startsWith('/users')) return { title: 'User Management', subtitle: 'System users and role-based permissions' };
    return { title: 'Portal Overview', subtitle: '' };
  };

  const breadcrumb = getBreadcrumb();
  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="text-lg font-bold text-gradient flex items-center gap-2">
          {breadcrumb.title}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-glass border border-primary text-accent">
            <Sparkles size={10} /> Enterprise
          </span>
        </div>
        <div className="text-xs text-muted hidden md:block">{breadcrumb.subtitle}</div>
      </div>
      
      <div className="navbar-actions">
        {/* Live Clock Indicator */}
        <div className="navbar-clock">
          <Clock size={13} className="text-accent" />
          <span>{time}</span>
        </div>

        {/* Global Search Bar */}
        <div className="navbar-search-wrapper">
          <Search size={15} className="navbar-search-icon" />
          <input 
            type="text" 
            placeholder="Search records... (Ctrl+K)" 
            className="navbar-search-input"
          />
          <kbd className="navbar-kbd">⌘K</kbd>
        </div>

        {/* Theme Switcher Menu */}
        <div className="theme-selector-dropdown" ref={themeRef}>
          <button 
            onClick={() => setThemeMenuOpen(!themeMenuOpen)} 
            className="theme-btn"
            title="Change Interface Theme"
          >
            <Palette size={15} className="text-accent" />
            <span className="hidden lg:inline">{activeThemeObj.name}</span>
            <ChevronDown size={12} className="text-muted" />
          </button>

          {themeMenuOpen && (
            <div className="theme-menu">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 py-1">
                Select Theme Palette
              </div>
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentTheme(theme.id);
                    setThemeMenuOpen(false);
                  }}
                >
                  <span className="theme-dot" style={{ backgroundColor: theme.color }}></span>
                  <span className="flex-1">{theme.name}</span>
                  {currentTheme === theme.id && <Check size={14} className="text-accent" />}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Notification Bell */}
        <button className="relative p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-glass">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-primary rounded-full animate-pulse"></span>
        </button>
        
        {/* User Profile Chip */}
        <div className="navbar-user-chip">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-primary">{user?.name}</div>
            <div className="text-[10px] font-semibold text-accent flex items-center gap-1 justify-end">
              <Shield size={10} /> {user?.role}
            </div>
          </div>
          <div className="navbar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
