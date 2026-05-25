import React, { useState } from 'react';
import { Search, Shield, ShieldOff, Pencil, X, Check, ChevronUp, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';

interface User {
  id: number;
  name: string;
  email: string;
  isBlocked: boolean;
  joinedAt: string;
  role: 'user' | 'moderator';
}

interface EditModal {
  open: boolean;
  user: User | null;
}

const INITIAL_USERS: User[] = [
  { id: 1, name: 'Arjun Nair',     email: 'arjun@example.com',  isBlocked: false, joinedAt: '2024-01-12', role: 'user'      },
  { id: 2, name: 'Priya Menon',    email: 'priya@example.com',  isBlocked: true,  joinedAt: '2024-02-08', role: 'user'      },
  { id: 3, name: 'Rahul Sharma',   email: 'rahul@example.com',  isBlocked: false, joinedAt: '2024-03-21', role: 'moderator' },
  { id: 4, name: 'Sneha Pillai',   email: 'sneha@example.com',  isBlocked: false, joinedAt: '2024-04-05', role: 'user'      },
  { id: 5, name: 'Vikram Das',     email: 'vikram@example.com', isBlocked: true,  joinedAt: '2024-05-17', role: 'user'      },
  { id: 6, name: 'Kavya Krishnan', email: 'kavya@example.com',  isBlocked: false, joinedAt: '2024-06-30', role: 'user'      },
  { id: 7, name: 'Aditya Varma',   email: 'aditya@example.com', isBlocked: false, joinedAt: '2024-07-14', role: 'moderator' },
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof User>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterBlocked, setFilterBlocked] = useState<'all' | 'active' | 'blocked'>('all');
  const [editModal, setEditModal] = useState<EditModal>({ open: false, user: null });
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchStatus = filterBlocked === 'all' ? true : filterBlocked === 'blocked' ? u.isBlocked : !u.isBlocked;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

  const toggleBlock = (id: number) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));

  const openEdit = (user: User) => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditModal({ open: true, user });
  };

  const saveEdit = () => {
    if (!editModal.user) return;
    setUsers(prev =>
      prev.map(u =>
        u.id === editModal.user!.id
          ? { ...u, name: editName.trim() || u.name, email: editEmail.trim() || u.email }
          : u
      )
    );
    setEditModal({ open: false, user: null });
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) setSortAsc(p => !p);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: keyof User }) =>
    sortField === field
      ? (sortAsc ? <ChevronUp size={12} className="text-violet-400" /> : <ChevronDown size={12} className="text-violet-400" />)
      : <ChevronUp size={12} className="text-zinc-700" />;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar />

      <main className="flex-1 overflow-auto pt-14 md:pt-0 px-4 sm:px-8 py-6 sm:py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white">User Management</h1>
          <p className="text-zinc-500 text-sm mt-1">View, edit, block or unblock registered users.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total',   value: users.length,                          color: 'text-violet-400' },
            { label: 'Active',  value: users.filter(u => !u.isBlocked).length, color: 'text-emerald-400' },
            { label: 'Blocked', value: users.filter(u => u.isBlocked).length,  color: 'text-red-400'    },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[160px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {(['all', 'active', 'blocked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterBlocked(f)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium capitalize transition-colors ${
                  filterBlocked === f ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Desktop table ── */}
        <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-widest">
                {[
                  { label: '#',      field: 'id'        as keyof User },
                  { label: 'Name',   field: 'name'      as keyof User },
                  { label: 'Email',  field: 'email'     as keyof User },
                  { label: 'Role',   field: 'role'      as keyof User },
                  { label: 'Joined', field: 'joinedAt'  as keyof User },
                  { label: 'Status', field: 'isBlocked' as keyof User },
                ].map(col => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className="px-5 py-4 text-left cursor-pointer select-none hover:text-zinc-300 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label} <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
                <th className="px-5 py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-16 text-zinc-600">No users found.</td></tr>
              )}
              {filtered.map((user, idx) => (
                <tr
                  key={user.id}
                  className={`border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors ${user.isBlocked ? 'opacity-60' : ''}`}
                >
                  <td className="px-5 py-4 text-zinc-600 font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-5 py-4 font-medium text-white">{user.name}</td>
                  <td className="px-5 py-4 text-zinc-400">{user.email}</td>
                  <td className="px-5 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-4 text-zinc-500 font-mono text-xs">{user.joinedAt}</td>
                  <td className="px-5 py-4">
                    <StatusBadge isBlocked={user.isBlocked} />
                  </td>
                  <td className="px-5 py-4">
                    <ActionButtons user={user} onEdit={openEdit} onToggle={toggleBlock} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile cards ── */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 && (
            <p className="text-center py-16 text-zinc-600 text-sm">No users found.</p>
          )}
          {filtered.map((user) => (
            <div
              key={user.id}
              className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 transition-opacity ${user.isBlocked ? 'opacity-60' : ''}`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm leading-snug">{user.name}</p>
                  <p className="text-zinc-400 text-xs mt-0.5 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge isBlocked={user.isBlocked} />
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <RoleBadge role={user.role} />
                <span className="text-zinc-500 font-mono text-[10px]">{user.joinedAt}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-zinc-800 pt-3">
                <button
                  onClick={() => openEdit(user)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-800 hover:bg-violet-600/20 hover:text-violet-400 text-zinc-400 text-xs font-medium transition-colors"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => toggleBlock(user.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    user.isBlocked
                      ? 'bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-400'
                      : 'bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400'
                  }`}
                >
                  {user.isBlocked ? <><ShieldOff size={13} /> Unblock</> : <><Shield size={13} /> Block</>}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-zinc-600 text-xs mt-4">
          Showing {filtered.length} of {users.length} users
        </p>
      </main>

      {/* Edit Modal */}
      {editModal.open && editModal.user && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-700 sm:rounded-2xl rounded-t-2xl p-6 w-full sm:max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Edit User</h2>
              <button
                onClick={() => setEditModal({ open: false, user: null })}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Email</label>
                <input
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal({ open: false, user: null })}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Check size={15} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Shared sub-components
const RoleBadge = ({ role }: { role: 'user' | 'moderator' }) => (
  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
    role === 'moderator' ? 'bg-violet-500/15 text-violet-400' : 'bg-zinc-800 text-zinc-400'
  }`}>
    {role}
  </span>
);

const StatusBadge = ({ isBlocked }: { isBlocked: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
    isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
    {isBlocked ? 'Blocked' : 'Active'}
  </span>
);

const ActionButtons = ({
  user, onEdit, onToggle,
}: {
  user: User;
  onEdit: (u: User) => void;
  onToggle: (id: number) => void;
}) => (
  <div className="flex items-center gap-2">
    <button onClick={() => onEdit(user)} title="Edit user" className="p-2 rounded-lg bg-zinc-800 hover:bg-violet-600/20 hover:text-violet-400 text-zinc-400 transition-colors">
      <Pencil size={13} />
    </button>
    <button
      onClick={() => onToggle(user.id)}
      title={user.isBlocked ? 'Unblock user' : 'Block user'}
      className={`p-2 rounded-lg transition-colors ${
        user.isBlocked
          ? 'bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-400'
          : 'bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400'
      }`}
    >
      {user.isBlocked ? <ShieldOff size={13} /> : <Shield size={13} />}
    </button>
  </div>
);

export default UserManagement;