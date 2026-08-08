import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { challanApi } from '../services/challanApi';
import { SalesChallan } from '../../../shared/types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { DataTable } from '../../../shared/components/DataTable';
import Pagination from '../../../shared/components/Pagination';
import StatusBadge from '../../../shared/components/StatusBadge';
import toast from 'react-hot-toast';

const ChallanListPage: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const data = await challanApi.getAll(page, 10, debouncedSearch, statusFilter);
      setChallans(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, debouncedSearch, statusFilter]);

  const columns = [
    { header: 'Challan #', accessor: 'challanNumber', render: (c: SalesChallan) => <span className="font-medium text-accent">{c.challanNumber}</span> },
    { header: 'Customer', accessor: 'customer', render: (c: any) => c.customer?.name || 'Unknown' },
    { header: 'Items', accessor: 'items', render: (c: SalesChallan) => c.items?.length || 0 },
    { header: 'Total Qty', accessor: 'totalQuantity' },
    { header: 'Amount', accessor: 'totalAmount', render: (c: SalesChallan) => `₹${c.totalAmount.toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: (c: SalesChallan) => <StatusBadge status={c.status} /> },
    { header: 'Date', accessor: 'createdAt', render: (c: SalesChallan) => new Date(c.createdAt).toLocaleDateString() }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Challans</h1>
        <Link to="/challans/new" className="btn btn-primary">
          <Plus size={18} /> Create Challan
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search by challan number..." 
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
              <option value="Draft">Draft</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={challans} 
          loading={loading} 
          onRowClick={(c) => navigate(`/challans/${c.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default ChallanListPage;
