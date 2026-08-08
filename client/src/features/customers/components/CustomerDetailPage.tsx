import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Building, Calendar, Plus, FileText } from 'lucide-react';
import { customerApi } from '../services/customerApi';
import { Customer, CustomerFollowUp } from '../../../shared/types';
import StatusBadge from '../../../shared/components/StatusBadge';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/context/AuthContext';

const CustomerDetailPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<CustomerFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManageCustomer = hasRole(['Admin', 'Sales']);

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const custData = await customerApi.getById(id!);
      setCustomer(custData);

      try {
        const followUpData = await customerApi.getFollowUps(id!);
        setFollowUps(Array.isArray(followUpData) ? followUpData : []);
      } catch (err) {
        console.warn('Failed to load follow-ups for customer', err);
        setFollowUps([]);
      }
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
      toast.success('Follow-up recorded successfully');
      setShowFollowUpModal(false);
      setNotes('');
      setNextDate('');
      fetchCustomerData();
    } catch (error) {
      toast.error('Failed to record follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="spinner"></div></div>;
  if (!customer) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/customers" className="btn btn-ghost p-2 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <StatusBadge status={customer.status} />
              <StatusBadge status={customer.customerType} />
            </div>
            <p className="text-secondary text-sm">{customer.businessName}</p>
          </div>
        </div>
        
        {canManageCustomer && (
          <Link to={`/customers/${id}/edit`} className="btn btn-secondary">
            <Edit size={16} /> Edit Profile
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details Card */}
        <div className="card lg:col-span-1 flex flex-col gap-5">
          <h2 className="text-base font-bold text-primary pb-3 border-b border-primary">Contact & Account Details</h2>
          
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-glass flex items-center justify-center text-accent shrink-0">
                <Building size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Business Name</div>
                <div className="font-semibold text-primary">{customer.businessName}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-glass flex items-center justify-center text-accent shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Mobile Number</div>
                <div className="font-semibold text-primary">{customer.mobile}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-glass flex items-center justify-center text-accent shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Email Address</div>
                <div className="font-semibold text-primary truncate">{customer.email || '-'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-glass flex items-center justify-center text-accent shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">GST Number</div>
                <div className="font-mono font-semibold uppercase text-primary">{customer.gstNumber || '-'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-glass flex items-center justify-center text-accent shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs text-muted">Address</div>
                <div className="font-medium text-primary">{customer.address}</div>
              </div>
            </div>
          </div>
          
          {customer.notes && (
            <div className="mt-2 pt-4 border-t border-primary">
              <h3 className="text-xs font-bold uppercase text-muted mb-1">Account Notes</h3>
              <p className="text-sm text-secondary bg-glass p-3 rounded-lg">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Follow-up Timeline */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-primary">
            <div>
              <h2 className="text-base font-bold text-primary">CRM Follow-up Notes Timeline</h2>
              <p className="text-xs text-muted">Track sales interactions, call logs and next follow-up dates</p>
            </div>
            {canManageCustomer && (
              <button onClick={() => setShowFollowUpModal(true)} className="btn btn-primary text-xs">
                <Plus size={16} /> Record Follow-up
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {followUps.map((fu) => (
              <div key={fu.id} className="p-4 bg-glass border border-subtle rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-accent">
                    {new Date(fu.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {fu.nextFollowUpDate && (
                    <span className="badge badge-lead">
                      <Calendar size={12} /> Next Target: {new Date(fu.nextFollowUpDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-primary">{fu.notes}</p>
              </div>
            ))}

            {followUps.length === 0 && (
              <div className="empty-state">
                <Calendar size={32} className="mb-2 text-muted" />
                <div className="text-sm font-semibold">No follow-ups recorded yet</div>
                <p className="text-xs text-muted mt-1">Record sales calls, emails, or meetings with this customer.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Follow-up Modal */}
      {showFollowUpModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-lg font-bold">Record Customer Follow-up</h2>
              <button onClick={() => setShowFollowUpModal(false)} className="text-muted hover:text-primary">&times;</button>
            </div>
            <form onSubmit={handleAddFollowUp} className="flex flex-col gap-4">
              <div className="form-group mb-0">
                <label>Meeting / Call Notes *</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                  rows={4}
                  placeholder="Details of discussion, customer response, next steps..."
                ></textarea>
              </div>

              <div className="form-group mb-0">
                <label>Next Target Follow-up Date (Optional)</label>
                <input 
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-primary">
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
