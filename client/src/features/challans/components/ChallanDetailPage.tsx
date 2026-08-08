import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, XCircle, FileText } from 'lucide-react';
import { challanApi } from '../services/challanApi';
import { SalesChallan } from '../../../shared/types';
import StatusBadge from '../../../shared/components/StatusBadge';
import toast from 'react-hot-toast';

import { useAuth } from '../../auth/context/AuthContext';

const ChallanDetailPage: React.FC = () => {
  const { hasRole } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const canConfirmChallan = hasRole(['Admin', 'Sales']);

  useEffect(() => {
    if (id) fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    try {
      setLoading(true);
      const data = await challanApi.getById(id!);
      setChallan(data);
    } catch (error) {
      toast.error('Failed to load challan');
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      await challanApi.confirm(id!);
      toast.success('Challan confirmed successfully. Stock has been deducted.');
      setShowConfirmDialog(false);
      fetchChallan();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm challan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this challan?')) return;
    try {
      setActionLoading(true);
      await challanApi.cancel(id!);
      toast.success('Challan cancelled');
      fetchChallan();
    } catch (error: any) {
      toast.error('Failed to cancel challan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="spinner"></div></div>;
  if (!challan) return null;

  const customer = challan.customer as any; // Type workaround for populated doc

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/challans" className="btn btn-ghost p-2 rounded-full"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-bold">Challan Details</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div className="card printable-area">
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-primary">
          <div>
            <div className="text-3xl font-bold text-accent mb-2 flex items-center gap-3">
              <FileText size={28} /> {challan.challanNumber}
            </div>
            <div className="text-secondary">Date: {new Date(challan.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <StatusBadge status={challan.status} />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Bill To:</h3>
          <div className="p-5 bg-glass rounded-xl border border-primary">
            <h4 className="text-xl font-bold mb-1">{customer?.name}</h4>
            <div className="text-secondary font-medium mb-3">{customer?.businessName}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted block">Address</span>
                <span>{customer?.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted block">Contact</span>
                <span>{customer?.mobile} <br/> {customer?.email}</span>
              </div>
              {customer?.gstNumber && (
                <div>
                  <span className="text-muted block">GST Number</span>
                  <span className="uppercase">{customer.gstNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">Order Items</h3>
          <div className="border border-primary rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-glass">
                <tr>
                  <th className="p-4 text-left border-b border-primary text-sm">Item & Description</th>
                  <th className="p-4 text-right border-b border-primary text-sm">Price</th>
                  <th className="p-4 text-right border-b border-primary text-sm">Qty</th>
                  <th className="p-4 text-right border-b border-primary text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {challan.items.map((item: any, idx) => (
                  <tr key={idx} className="border-b border-primary last:border-0">
                    <td className="p-4">
                      <div className="font-medium">{item.productNameSnapshot || 'Unknown Product'}</div>
                      <div className="text-xs text-muted">{item.productSkuSnapshot}</div>
                    </td>
                    <td className="p-4 text-right">₹{(item.productPriceSnapshot || 0).toLocaleString()}</td>
                    <td className="p-4 text-right">{item.quantity}</td>
                    <td className="p-4 text-right font-bold">₹{item.lineTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-secondary">
              <span>Total Quantity:</span>
              <span className="font-bold text-primary">{challan.totalQuantity}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-primary">
              <span>Grand Total:</span>
              <span className="text-success">₹{challan.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons for Draft Status */}
        {challan.status === 'Draft' && canConfirmChallan && (
          <div className="flex gap-3 justify-end pt-6 border-t border-primary hide-on-print">
            <button 
              className="btn btn-secondary text-danger hover:bg-danger-bg" 
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <XCircle size={18} /> Cancel Challan
            </button>
            <button 
              className="btn btn-primary bg-success hover:bg-emerald-600" 
              onClick={() => setShowConfirmDialog(true)}
              disabled={actionLoading}
            >
              <CheckCircle size={18} /> Confirm & Deduct Stock
            </button>
          </div>
        )}
      </div>

      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-lg">Confirm Challan</h3>
              <button onClick={() => setShowConfirmDialog(false)} className="text-muted hover:text-primary">&times;</button>
            </div>
            <div className="py-4">
              <p className="mb-4">Are you sure you want to confirm this challan? This action will:</p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                <li>Change status to Confirmed</li>
                <li>Permanently deduct items from inventory stock</li>
                <li>Record stock OUT movements</li>
              </ul>
              <p className="mt-4 text-warning font-semibold text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button className="btn btn-secondary" onClick={() => setShowConfirmDialog(false)}>Cancel</button>
              <button className="btn btn-primary bg-success" onClick={handleConfirm} disabled={actionLoading}>
                {actionLoading ? 'Confirming...' : 'Yes, Confirm Challan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallanDetailPage;
