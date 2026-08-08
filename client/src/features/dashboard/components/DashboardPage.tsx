import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, AlertTriangle, FileText, Plus, TrendingUp, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { dashboardApi } from '../services/dashboardApi';
import { DashboardStats } from '../../../shared/types';
import StatsCard from '../../../shared/components/StatsCard';
import { DataTable } from '../../../shared/components/DataTable';
import StatusBadge from '../../../shared/components/StatusBadge';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const challanColumns = [
    { 
      header: 'Challan #', 
      accessor: 'challanNumber', 
      render: (c: any) => (
        <Link to={`/challans/${c.id}`} className="font-semibold text-accent hover:underline flex items-center gap-1">
          {c.challanNumber}
          <ArrowUpRight size={14} />
        </Link>
      )
    },
    { 
      header: 'Customer', 
      accessor: 'customer', 
      render: (c: any) => (
        <div>
          <div className="font-semibold text-primary">{c.customer?.name || 'Unknown Customer'}</div>
          <div className="text-xs text-muted">{c.customer?.businessName || '-'}</div>
        </div>
      )
    },
    { 
      header: 'Line Items', 
      accessor: 'totalQuantity', 
      render: (c: any) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-glass border border-subtle">
          {c.totalQuantity} items
        </span>
      )
    },
    { 
      header: 'Total Amount', 
      accessor: 'totalAmount', 
      render: (c: any) => (
        <span className="font-bold text-primary font-mono">
          ₹{Number(c.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { header: 'Status', accessor: 'status', render: (c: any) => <StatusBadge status={c.status} /> },
    { 
      header: 'Issued Date', 
      accessor: 'createdAt', 
      render: (c: any) => (
        <span className="text-xs text-muted font-mono">
          {new Date(c.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ) 
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <div className="spinner"></div>
        <div className="text-xs text-muted font-mono">Loading operations dashboard...</div>
      </div>
    );
  }

  const totalStatusCustomers = Object.values(stats?.customersByStatus || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border-cyan-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Active Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-secondary text-sm mt-1">
              Distribution & Wholesale Operations Portal. Active role: <strong className="text-primary">{user?.role}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/customers/new" className="btn btn-secondary text-xs">
              <Plus size={15} /> Add Customer
            </Link>
            <Link to="/products/new" className="btn btn-secondary text-xs">
              <Plus size={15} /> Add Product
            </Link>
            <Link to="/challans/new" className="btn btn-primary text-xs">
              <Plus size={15} /> Generate Challan
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard 
          title="Total Customers" 
          value={stats?.totalCustomers || 0} 
          icon={<Users size={20} />} 
          color="info"
          trend="12% this month"
          trendUp={true}
        />
        <StatsCard 
          title="Product Inventory" 
          value={stats?.totalProducts || 0} 
          icon={<Package size={20} />} 
          color="primary"
          trend="In Stock"
          trendUp={true}
        />
        <StatsCard 
          title="Low Stock Warnings" 
          value={stats?.lowStockCount || 0} 
          icon={<AlertTriangle size={20} />} 
          color={stats?.lowStockCount ? 'warning' : 'success'}
          trend={stats?.lowStockCount ? 'Needs restock' : 'Optimal level'}
          trendUp={!stats?.lowStockCount}
        />
        <StatsCard 
          title="Sales Challans" 
          value={stats?.totalChallans || 0} 
          icon={<FileText size={20} />} 
          color="success"
          trend="Active Orders"
          trendUp={true}
        />
      </div>

      {/* Analytics & Tables Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Challans List */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-primary">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-accent" />
              <h2 className="text-base font-bold text-primary">Recent Sales Challans</h2>
            </div>
            <Link to="/challans" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              View All Registry <ArrowUpRight size={14} />
            </Link>
          </div>
          <DataTable 
            columns={challanColumns} 
            data={stats?.recentChallans || []} 
            emptyMessage="No recent challans generated yet"
          />
        </div>
        
        {/* Customer Pipeline Breakdown */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary">
              <TrendingUp size={18} className="text-accent" />
              <h2 className="text-base font-bold text-primary">Customer Lifecycle Pipeline</h2>
            </div>

            <div className="flex flex-col gap-4">
              {Object.entries(stats?.customersByStatus || {}).map(([status, count]) => {
                const percentage = Math.round(((count as number) / totalStatusCustomers) * 100);
                return (
                  <div key={status} className="p-3.5 bg-glass rounded-xl border border-subtle flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={status} />
                      <div className="text-xs font-mono font-bold text-primary">
                        {count as number} <span className="text-muted font-normal">({percentage}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: status === 'Active' ? '#10b981' : (status === 'Lead' ? '#3b82f6' : '#64748b')
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              {(!stats?.customersByStatus || Object.keys(stats.customersByStatus).length === 0) && (
                <div className="text-center text-muted text-xs py-8">No customer stage analytics recorded</div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-primary text-center">
            <Link to="/customers" className="btn btn-secondary w-full text-xs">
              Manage Customer Accounts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
