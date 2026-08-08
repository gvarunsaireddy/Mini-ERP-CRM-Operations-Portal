import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { Customer } from '../../../shared/types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { useAuth } from '../../auth/context/AuthContext';
import { DataTable } from '../../../shared/components/DataTable';
import Pagination from '../../../shared/components/Pagination';
import StatusBadge from '../../../shared/components/StatusBadge';
import toast from 'react-hot-toast';

const CustomerListPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();

  const canManageCustomer = hasRole(['Admin', 'Sales']);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getAll(page, 10, debouncedSearch, '', statusFilter);
      setCustomers(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, debouncedSearch, statusFilter]);

  const columns = [
    { header: 'Name', accessor: 'name', render: (c: Customer) => (
      <div>
        <div className="font-medium text-primary">{c.name}</div>
        <div className="text-xs text-muted">{c.businessName}</div>
      </div>
    )},
    { header: 'Contact', accessor: 'mobile', render: (c: Customer) => (
      <div>
        <div>{c.mobile}</div>
        <div className="text-xs text-muted">{c.email}</div>
      </div>
    )},
    { header: 'Type', accessor: 'customerType', render: (c: Customer) => <StatusBadge status={c.customerType} /> },
    { header: 'Status', accessor: 'status', render: (c: Customer) => <StatusBadge status={c.status} /> },
    { header: 'Next Follow-up', accessor: 'followUpDate', render: (c: Customer) => c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : '-' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Customers</h1>
            {!canManageCustomer && (
              <span className="badge badge-inactive flex items-center gap-1">
                <Eye size={12} /> Read-Only
              </span>
            )}
          </div>
          <p className="text-xs text-secondary mt-0.5">Manage customer directory and sales leads</p>
        </div>

        {canManageCustomer && (
          <Link to="/customers/new" className="btn btn-primary">
            <Plus size={18} /> Add Customer
          </Link>
        )}
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, phone, email..." 
              className="pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <select 
              className="pl-10 appearance-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={customers} 
          loading={loading} 
          onRowClick={(c) => navigate(`/customers/${c.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default CustomerListPage;
