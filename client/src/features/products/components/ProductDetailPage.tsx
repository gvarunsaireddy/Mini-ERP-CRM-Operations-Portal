import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, AlertTriangle, Box, Tag, MapPin, DollarSign } from 'lucide-react';
import { productApi } from '../services/productApi';
import { Product, StockMovement } from '../../../shared/types';
import StatusBadge from '../../../shared/components/StatusBadge';
import { DataTable } from '../../../shared/components/DataTable';
import Pagination from '../../../shared/components/Pagination';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState<{ quantity: number; movementType: 'IN' | 'OUT'; reason: string }>({ quantity: 0, movementType: 'IN', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMovements();
    }
  }, [id, page]);

  const fetchProductData = async () => {
    try {
      const data = await productApi.getById(id!);
      setProduct(data);
    } catch (error) {
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const data = await productApi.getStockMovements(id!, page, 5);
      setMovements(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || stockForm.quantity <= 0) return;
    
    try {
      setSubmitting(true);
      await productApi.addStockMovement(id, stockForm);
      toast.success('Stock updated successfully');
      setShowStockModal(false);
      setStockForm({ quantity: 0, movementType: 'IN', reason: '' });
      fetchProductData();
      fetchMovements();
    } catch (error) {
      toast.error('Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;
  if (!product) return null;

  const isLowStock = product.currentStock <= product.minStockAlert;

  const movementColumns = [
    { header: 'Date', accessor: 'createdAt', render: (m: StockMovement) => new Date(m.createdAt).toLocaleString() },
    { header: 'Type', accessor: 'movementType', render: (m: StockMovement) => <StatusBadge status={m.movementType} /> },
    { header: 'Quantity', accessor: 'quantity', render: (m: StockMovement) => (
      <span className={m.movementType === 'IN' ? 'text-success' : 'text-danger font-medium'}>
        {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
      </span>
    )},
    { header: 'Reason', accessor: 'reason' },
    { header: 'By', accessor: 'createdBy', render: (m: any) => m.createdBy?.name || 'System' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/products" className="btn btn-ghost p-2 rounded-full"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold">Product Details</h1>
        </div>
        <Link to={`/products/${product.id}/edit`} className="btn btn-secondary">
          <Edit size={16} /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-1">{product.name}</h2>
              <div className="text-secondary flex items-center gap-2">
                <Box size={16} /> SKU: {product.sku}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-primary">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-accent"><Tag size={18} /></div>
              <div>
                <div className="text-sm text-muted">Category</div>
                <div className="font-medium">{product.category}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-success"><DollarSign size={18} /></div>
              <div>
                <div className="text-sm text-muted">Unit Price</div>
                <div className="font-medium text-lg text-success">₹{product.unitPrice.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-accent"><MapPin size={18} /></div>
              <div>
                <div className="text-sm text-muted">Warehouse Location</div>
                <div className="font-medium">{product.warehouseLocation || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Inventory Status</h3>
            <button onClick={() => setShowStockModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Adjust Stock
            </button>
          </div>
          
          <div className={`p-6 rounded-xl flex flex-col items-center justify-center border ${isLowStock ? 'bg-warning-bg border-warning' : 'bg-glass border-primary'}`}>
            <div className="text-sm text-secondary mb-1">Current Stock</div>
            <div className={`text-5xl font-bold mb-2 ${isLowStock ? 'text-warning' : 'text-primary'}`}>
              {product.currentStock}
            </div>
            {isLowStock && (
              <div className="flex items-center gap-1 text-warning text-sm font-medium">
                <AlertTriangle size={14} /> Low Stock Alert
              </div>
            )}
            <div className="text-xs text-muted mt-2">
              Minimum alert level: {product.minStockAlert}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-lg mb-4">Stock Movement History</h3>
        <DataTable columns={movementColumns} data={movements} emptyMessage="No stock movements recorded" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showStockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-lg">Adjust Stock</h3>
              <button onClick={() => setShowStockModal(false)} className="text-muted hover:text-primary">&times;</button>
            </div>
            <form onSubmit={handleAddStock}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    value={stockForm.movementType}
                    onChange={e => setStockForm({...stockForm, movementType: e.target.value as 'IN' | 'OUT'})}
                  >
                    <option value="IN">Stock IN (+)</option>
                    <option value="OUT">Stock OUT (-)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    value={stockForm.quantity || ''}
                    onChange={e => setStockForm({...stockForm, quantity: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason / Reference</label>
                <input 
                  type="text" 
                  value={stockForm.reason}
                  onChange={e => setStockForm({...stockForm, reason: e.target.value})}
                  placeholder="e.g., Restock, Damaged, Sample"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowStockModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
