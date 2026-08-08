import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { Customer } from '../../../shared/types';
import toast from 'react-hot-toast';

const CustomerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Retail',
    address: '',
    status: 'Lead',
    notes: ''
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          const data = await customerApi.getById(id!);
          setFormData(data);
        } catch (error) {
          toast.error('Failed to load customer');
          navigate('/customers');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode) {
        await customerApi.update(id!, formData);
        toast.success('Customer updated successfully');
        navigate(`/customers/${id}`);
      } else {
        const newCustomer = await customerApi.create(formData);
        toast.success('Customer created successfully');
        navigate(`/customers/${newCustomer.id}`);
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
        <Link to={isEditMode ? `/customers/${id}` : '/customers'} className="btn btn-ghost p-2 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group mb-0">
              <label>Contact Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div className="form-group mb-0">
              <label>Business Name *</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="Acme Corp" />
            </div>
            
            <div className="form-group mb-0">
              <label>Mobile Number *</label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="9876543210" />
            </div>
            <div className="form-group mb-0">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@acme.com" />
            </div>

            <div className="form-group mb-0">
              <label>Customer Type *</label>
              <select name="customerType" value={formData.customerType} onChange={handleChange} required>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <div className="form-group mb-0">
              <label>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label>GST Number</label>
              <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="uppercase" />
            </div>
          </div>

          <div className="form-group mb-0">
            <label>Complete Address *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required rows={3} placeholder="Street, City, State, Zip"></textarea>
          </div>

          <div className="form-group mb-0">
            <label>Internal Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Any additional information..."></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-primary">
            <Link to={isEditMode ? `/customers/${id}` : '/customers'} className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : <><Save size={18} /> Save Customer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormPage;
