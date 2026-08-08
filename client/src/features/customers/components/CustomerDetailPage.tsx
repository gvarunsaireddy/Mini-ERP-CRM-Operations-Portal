import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Building, Calendar, Plus, FileText } from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { Customer, CustomerFollowUp } from '../../../shared/types';
import StatusBadge from '../../../shared/components/StatusBadge';
import toast from 'react-hot-toast';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<CustomerFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [custData, followUpData] = await Promise.all([
        customerApi.getById(id!),
        customerApi.getFollowUps(id!)
      ]);
      setCustomer(custData);
      setFollowUps(followUpData);
    } catch (error) {
      toast.error('Failed to load customer details');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !notes.trim()) return;
    
    try {
      setSubmitting(true);
      await customerApi.addFollowUp(id, { notes, nextFollowUpDate: nextDate || undefined });
      toast.success('Follow-up added');
      setShowFollowUpModal(false);
      setNotes('');
      setNextDate('');
      fetchCustomerData();
    } catch (error) {
      toast.error('Failed to add follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;
  if (!customer) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/customers" className="btn btn-ghost p-2 rounded-full"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold">Customer Details</h1>
        </div>
        <Link to={`/customers/${customer.id}/edit`} className="btn btn-secondary">
          <Edit size={16} /> Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1">{customer.name}</h2>
                <div className="text-secondary flex items-center gap-2">
                  <Building size={16} /> {customer.businessName}
                </div>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={customer.customerType} />
                <StatusBadge status={customer.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-primary">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-accent"><Phone size={18} /></div>
                <div>
                  <div className="text-sm text-muted">Phone Number</div>
                  <div className="font-medium">{customer.mobile}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-accent"><Mail size={18} /></div>
                <div>
                  <div className="text-sm text-muted">Email Address</div>
                  <div className="font-medium">{customer.email || '-'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-accent"><MapPin size={18} /></div>
                <div>
                  <div className="text-sm text-muted">Address</div>
                  <div className="font-medium">{customer.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-glass flex items-center justify-center text-accent"><FileText size={18} /></div>
                <div>
                  <div className="text-sm text-muted">GST Number</div>
                  <div className="font-medium uppercase">{customer.gstNumber || '-'}</div>
                </div>
              </div>
            </div>
            
            {customer.notes && (
              <div className="mt-6 pt-6 border-t border-primary">
                <h3 className="text-sm font-semibold text-secondary mb-2">Notes</h3>
                <p className="p-3 bg-glass rounded-lg text-sm">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Timeline</h3>
              <button onClick={() => setShowFollowUpModal(true)} className="btn btn-ghost text-accent btn-sm">
                <Plus size={16} /> Add Note
              </button>
            </div>
            
            <div className="relative pl-4 border-l-2 border-primary space-y-6">
              {followUps.map(fu => (
                <div key={fu.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 bg-accent-primary rounded-full border-2 border-bg-card"></div>
                  <div className="text-xs text-muted mb-1">{new Date(fu.createdAt).toLocaleString()}</div>
                  <div className="p-3 bg-glass rounded-lg text-sm">
                    {fu.notes}
                    {fu.nextFollowUpDate && (
                      <div className="mt-2 text-xs flex items-center gap-1 text-warning">
                        <Calendar size={12} /> Next: {new Date(fu.nextFollowUpDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {followUps.length === 0 && (
                <div className="text-sm text-muted">No timeline events yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFollowUpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-lg">Add Follow-up</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-muted hover:text-primary">&times;</button>
            </div>
            <form onSubmit={handleAddFollowUp}>
              <div className="form-group">
                <label>Notes / Conversation</label>
                <textarea 
                  rows={4} 
                  required
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Met with client..."
                ></textarea>
              </div>
              <div className="form-group">
                <label>Next Follow-up Date (Optional)</label>
                <input 
                  type="date" 
                  value={nextDate}
                  onChange={e => setNextDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowFollowUpModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
