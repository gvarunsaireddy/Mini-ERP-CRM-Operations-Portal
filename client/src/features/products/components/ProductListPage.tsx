import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { productApi } from '../services/productApi';
import { Product } from '../../../shared/types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { DataTable } from '../../../shared/components/DataTable';
import Pagination from '../../../shared/components/Pagination';
import toast from 'react-hot-toast';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 500);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productApi.getAll(page, 10, debouncedSearch, categoryFilter);
      setProducts(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch, categoryFilter]);

  const columns = [
    { header: 'Product', accessor: 'name', render: (p: Product) => (
      <div>
        <div className="font-medium text-primary">{p.name}</div>
        <div className="text-xs text-muted">SKU: {p.sku}</div>
      </div>
    )},
    { header: 'Category', accessor: 'category' },
    { header: 'Price', accessor: 'unitPrice', render: (p: Product) => `₹${p.unitPrice.toLocaleString()}` },
    { header: 'Stock', accessor: 'currentStock', render: (p: Product) => (
      <div className={`flex items-center gap-2 ${p.currentStock <= p.minStockAlert ? 'text-warning font-bold' : ''}`}>
        {p.currentStock <= p.minStockAlert && <AlertTriangle size={14} />}
        {p.currentStock}
      </div>
    )},
    { header: 'Location', accessor: 'warehouseLocation' }
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products & Inventory</h1>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, SKU..." 
              className="pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-full md:w-48 relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input 
              type="text"
              placeholder="Filter Category"
              className="pl-10"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={products} 
          loading={loading} 
          onRowClick={(p) => navigate(`/products/${p.id}`)}
        />
        
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default ProductListPage;
