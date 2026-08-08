import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { userApi } from '../services/userApi';
import { User } from '../../../shared/types';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { DataTable } from '../../../shared/components/DataTable';
import Pagination from '../../../shared/components/Pagination';
import StatusBadge from '../../../shared/components/StatusBadge';
import toast from 'react-hot-toast';

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: User['role'] }>({ name: '', email: '', password: '', role: 'Sales' });
  
  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll(page, 10, debouncedSearch);
      setUsers(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userApi.create(newUser);
      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Sales' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', render: (u: User) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center font-bold text-accent text-xs">
          {u.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-primary">{u.name}</span>
      </div>
    )},
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', render: (u: User) => (
      <span className={`badge ${u.role === 'Admin' ? 'bg-purple-900/30 text-purple-400' : 'bg-glass text-secondary'}`}>
        {u.role}
      </span>
    )},
    { header: 'Status', accessor: 'isActive', render: (u: User) => (
      <StatusBadge status={u.isActive ? 'Active' : 'Inactive'} />
    )}
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add User
        </button>
      </div>

      <div className="card p-4">
        <div className="flex mb-4">
          <div className="w-full max-w-md relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <DataTable columns={columns} data={users} loading={loading} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="font-bold text-lg">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-primary">&times;</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as User['role']})}
                  required
                >
                  <option value="Sales">Sales</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
