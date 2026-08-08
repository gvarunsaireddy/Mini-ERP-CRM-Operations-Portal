import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { productApi } from '../services/productApi';
import { Product } from '../../../shared/types';
import toast from 'react-hot-toast';

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 10,
    warehouseLocation: ''
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const data = await productApi.getById(id!);
          setFormData(data);
        } catch (error) {
          toast.error('Failed to load product');
          navigate('/products');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode) {
        await productApi.update(id!, formData);
        toast.success('Product updated successfully');
        navigate(`/products/${id}`);
      } else {
        const newProduct = await productApi.create(formData);
        toast.success('Product created successfully');
        navigate(`/products/${newProduct.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to={isEditMode ? `/products/${id}` : '/products'} className="btn btn-ghost p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group mb-0 md:col-span-2">
              <label>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Premium Widget" />
            </div>
            
            <div className="form-group mb-0">
              <label>SKU (Stock Keeping Unit) *</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} required placeholder="WID-PRM-001" className="uppercase" />
            </div>
            
            <div className="form-group mb-0">
              <label>Category *</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="Electronics" />
            </div>

            <div className="form-group mb-0">
              <label>Unit Price (₹) *</label>
              <input type="number" name="unitPrice" value={formData.unitPrice || ''} onChange={handleChange} required min="0" step="0.01" />
            </div>
            
            <div className="form-group mb-0">
              <label>Warehouse Location</label>
              <input type="text" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} placeholder="Aisle 4, Shelf B" />
            </div>

            {!isEditMode && (
              <div className="form-group mb-0">
                <label>Initial Stock *</label>
                <input type="number" name="currentStock" value={formData.currentStock === 0 ? '' : formData.currentStock} onChange={handleChange} required min="0" />
              </div>
            )}
            
            <div className="form-group mb-0">
              <label>Low Stock Alert Level *</label>
              <input type="number" name="minStockAlert" value={formData.minStockAlert === 0 ? '' : formData.minStockAlert} onChange={handleChange} required min="0" />
              <p className="text-xs text-muted mt-1">Get notified when stock falls below this level.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-primary">
            <Link to={isEditMode ? `/products/${id}` : '/products'} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : <><Save size={18} /> Save Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormPage;
