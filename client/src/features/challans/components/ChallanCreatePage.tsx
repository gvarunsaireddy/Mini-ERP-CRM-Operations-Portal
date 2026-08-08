import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { challanApi } from '../services/challanApi';
import { customerApi } from '../../customers/services/customerApi';
import { productApi } from '../../products/services/productApi';
import { Customer, Product } from '../../../shared/types';
import toast from 'react-hot-toast';

const ChallanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Step 1: Customer Selection
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Step 2: Items Selection
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<{product: Product, quantity: number}[]>([]);

  useEffect(() => {
    if (step === 1) {
      customerApi.getAll(1, 10, customerSearch).then(res => setCustomers(res.data));
    }
  }, [customerSearch, step]);

  useEffect(() => {
    if (step === 2) {
      productApi.getAll(1, 10, productSearch).then(res => setProducts(res.data));
    }
  }, [productSearch, step]);

  const handleAddItem = (product: Product) => {
    if (selectedItems.find(i => i.product.id === product.id)) return;
    setSelectedItems([...selectedItems, { product, quantity: 1 }]);
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(i => i.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(selectedItems.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => acc + (item.product.unitPrice * item.quantity), 0);
  };

  const calculateTotalQty = () => {
    return selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || selectedItems.length === 0) return;
    
    setSubmitting(true);
    try {
      const challanData = {
        customer: selectedCustomer.id,
        items: selectedItems.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          lineTotal: i.quantity * i.product.unitPrice
        }))
      };
      
      const newChallan = await challanApi.create(challanData);
      toast.success('Challan created successfully');
      navigate(`/challans/${newChallan.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create challan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/challans" className="btn btn-ghost p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Create Sales Challan</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between card py-4 px-8">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-accent' : 'text-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-accent-primary text-white' : 'bg-glass'}`}>1</div>
          <span className="text-sm font-medium">Select Customer</span>
        </div>
        <div className={`h-1 flex-1 mx-4 ${step >= 2 ? 'bg-accent-primary' : 'bg-glass'}`}></div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-accent' : 'text-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-accent-primary text-white' : 'bg-glass'}`}>2</div>
          <span className="text-sm font-medium">Add Products</span>
        </div>
        <div className={`h-1 flex-1 mx-4 ${step >= 3 ? 'bg-accent-primary' : 'bg-glass'}`}></div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-accent' : 'text-muted'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-accent-primary text-white' : 'bg-glass'}`}>3</div>
          <span className="text-sm font-medium">Review & Submit</span>
        </div>
      </div>

      {step === 1 && (
        <div className="card animate-fade-in">
          <h2 className="text-lg font-bold mb-4">Select Customer</h2>
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="pl-10"
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
            {customers.map(c => (
              <div 
                key={c.id} 
                className={`p-4 border rounded-xl cursor-pointer transition-colors ${selectedCustomer?.id === c.id ? 'border-accent-primary bg-accent-primary-glow' : 'border-primary bg-glass hover:border-muted'}`}
                onClick={() => setSelectedCustomer(c)}
              >
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-secondary">{c.businessName}</div>
                <div className="text-xs text-muted mt-2">{c.mobile} | {c.customerType}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-primary">
            <button 
              className="btn btn-primary" 
              disabled={!selectedCustomer}
              onClick={() => setStep(2)}
            >
              Continue to Products
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <div className="card h-[600px] flex flex-col">
            <h2 className="text-lg font-bold mb-4">Available Products</h2>
            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              {products.map(p => {
                const isAdded = selectedItems.some(i => i.product.id === p.id);
                return (
                  <div key={p.id} className="p-3 border border-primary bg-glass rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-muted">SKU: {p.sku} | Stock: {p.currentStock}</div>
                      <div className="text-sm font-medium text-success mt-1">₹{p.unitPrice.toLocaleString()}</div>
                    </div>
                    <button 
                      className={`btn btn-sm ${isAdded ? 'btn-secondary text-success' : 'btn-primary'}`}
                      onClick={() => handleAddItem(p)}
                      disabled={isAdded || p.currentStock <= 0}
                    >
                      {isAdded ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                      {isAdded ? 'Added' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Selected Items</h2>
              <span className="badge badge-active">{selectedItems.length} items</span>
            </div>
            
            {selectedItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted">
                <Search size={48} className="mb-4 opacity-50" />
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                {selectedItems.map(item => (
                  <div key={item.product.id} className="p-3 border border-primary bg-glass rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between">
                      <div className="font-bold">{item.product.name}</div>
                      <button onClick={() => handleRemoveItem(item.product.id)} className="text-danger hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Qty:</span>
                        <input 
                          type="number" 
                          min="1"
                          className="w-20 py-1 px-2 h-8"
                          value={item.quantity}
                          onChange={e => handleUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="font-bold">
                        ₹{(item.quantity * item.product.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-primary">
              <div className="flex justify-between mb-2">
                <span className="text-secondary">Total Quantity:</span>
                <span className="font-bold">{calculateTotalQty()}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-secondary">Total Amount:</span>
                <span className="text-xl font-bold text-success">₹{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn btn-primary" 
                  disabled={selectedItems.length === 0}
                  onClick={() => setStep(3)}
                >
                  Review Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card animate-fade-in max-w-3xl mx-auto w-full">
          <h2 className="text-xl font-bold mb-6 border-b border-primary pb-4">Review Challan</h2>
          
          <div className="mb-6">
            <h3 className="text-sm text-secondary font-semibold uppercase tracking-wider mb-2">Customer Details</h3>
            <div className="p-4 bg-glass border border-primary rounded-xl">
              <div className="font-bold text-lg">{selectedCustomer?.name}</div>
              <div>{selectedCustomer?.businessName}</div>
              <div className="text-sm text-muted mt-2">{selectedCustomer?.address}</div>
              <div className="text-sm text-muted">Phone: {selectedCustomer?.mobile}</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm text-secondary font-semibold uppercase tracking-wider mb-2">Order Items</h3>
            <div className="border border-primary rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-glass">
                  <tr>
                    <th className="p-3 text-left border-b border-primary">Product</th>
                    <th className="p-3 text-right border-b border-primary">Price</th>
                    <th className="p-3 text-right border-b border-primary">Qty</th>
                    <th className="p-3 text-right border-b border-primary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map(i => (
                    <tr key={i.product.id} className="border-b border-primary last:border-0">
                      <td className="p-3">
                        <div className="font-medium">{i.product.name}</div>
                        <div className="text-xs text-muted">{i.product.sku}</div>
                      </td>
                      <td className="p-3 text-right">₹{i.product.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-right">{i.quantity}</td>
                      <td className="p-3 text-right font-medium">₹{(i.product.unitPrice * i.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 mb-8 bg-glass p-4 rounded-xl border border-primary">
            <div className="text-secondary">Total Quantity: <span className="text-primary font-bold ml-2">{calculateTotalQty()}</span></div>
            <div className="text-xl">Grand Total: <span className="text-success font-bold ml-2">₹{calculateTotal().toLocaleString()}</span></div>
          </div>

          <div className="flex justify-between pt-4 border-t border-primary">
            <button className="btn btn-secondary" onClick={() => setStep(2)}>Back to Edit</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallanCreatePage;
