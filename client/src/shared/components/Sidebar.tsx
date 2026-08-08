import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { LayoutDashboard, Users, Package, FileText, UserCog, LogOut, Briefcase } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/customers', icon: <Users size={18} />, label: 'Customer CRM' },
    { to: '/products', icon: <Package size={18} />, label: 'Inventory & Stock' },
    { to: '/challans', icon: <FileText size={18} />, label: 'Sales Challans' },
  ];

  if (hasRole(['Admin'])) {
    navItems.push({ to: '/users', icon: <UserCog size={18} />, label: 'User Management' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <Briefcase className="text-accent" size={22} />
        </div>
        <div className="nav-text">
          <div className="font-bold text-base tracking-tight text-gradient">ERP PORTAL</div>
          <div className="text-[10px] text-muted tracking-widest uppercase font-semibold">Enterprise Hub</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.to === '/'}
          >
            {item.icon}
            <span className="nav-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card nav-text">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate text-primary">{user?.name}</div>
            <div className="text-[11px] text-accent font-semibold">{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-ghost w-full justify-start text-danger hover:bg-danger-bg">
          <LogOut size={18} />
          <span className="nav-text text-xs font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
