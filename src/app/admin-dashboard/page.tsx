'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import brandsData from '../data/brands.json';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [brandStats, setBrandStats] = useState<any[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [overallUsage, setOverallUsage] = useState(0);

  // Check if user is authenticated as admin (Firebase Auth + localStorage)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check localStorage for admin session
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          const session = JSON.parse(adminSession);
          if (session.uid === user.uid) {
            setIsAdmin(true);
            setAdminLoading(false);
            return;
          }
        }
      }
      // Not authenticated as admin
      setIsAdmin(false);
      setAdminLoading(false);
      router.push('/admin-dashboard/signin');
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch users only if admin is authenticated
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const usersCol = collection(db, 'users');
          const usersSnap = await getDocs(usersCol);
          const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(usersList);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
        setLoading(false);
      };
      fetchUsers();
    }
  }, [isAdmin]);

  // --- DEMO: Hardcoded brandStats for graph population ---
  useEffect(() => {
    if (isAdmin) {
      setBrandStats([
        { name: 'Honda', practiced: 20, correct: 15, percentPracticed: 80, avgAccuracy: 92 },
        { name: 'Toyota', practiced: 18, correct: 14, percentPracticed: 72, avgAccuracy: 89 },
        { name: 'Tesla', practiced: 15, correct: 12, percentPracticed: 60, avgAccuracy: 95 },
        { name: 'BMW', practiced: 12, correct: 10, percentPracticed: 48, avgAccuracy: 87 },
        { name: 'Hyundai', practiced: 10, correct: 8, percentPracticed: 40, avgAccuracy: 85 },
        // Add a few more brands with lower stats for realism
        { name: 'Ford', practiced: 5, correct: 3, percentPracticed: 20, avgAccuracy: 70 },
        { name: 'Audi', practiced: 3, correct: 2, percentPracticed: 12, avgAccuracy: 65 },
        { name: 'Nissan', practiced: 2, correct: 1, percentPracticed: 8, avgAccuracy: 60 },
      ]);
      setOverallUsage(90);
    }
  }, [isAdmin]);
  // --- END DEMO ---

  const handleEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditUser(user);
      setEditForm({ username: user.username || '', email: user.email || '' });
      setEditError('');
      setEditModalOpen(true);
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!editForm.username.trim() || !editForm.email.trim()) {
      setEditError('Username and email are required.');
      return;
    }
    setEditLoading(true);
    setEditError('');
    try {
      await updateDoc(doc(db, 'users', editUser.id), {
        username: editForm.username,
        email: editForm.email
      });
      setUsers(users.map(u => u.id === editUser.id ? { ...u, username: editForm.username, email: editForm.email } : u));
      setEditModalOpen(false);
      setEditUser(null);
    } catch (error) {
      setEditError('Failed to update user.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditUser(null);
  };

  const handleResetPassword = (email: string) => {
    // TODO: Implement password reset
    alert('Reset password for: ' + email);
  };

  const handleDeactivate = async (userId: string) => {
    // TODO: Implement deactivate (set deactivated: true)
    alert('Deactivate user: ' + userId);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('adminSession');
    await signOut(auth);
    router.push('/admin-dashboard/signin');
  };

  const filteredBrandStats = brandStats.filter(brand =>
    brand.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Chart data
  const chartData = {
    labels: filteredBrandStats.map(b => b.name),
    datasets: [
      {
        label: 'Users Practiced',
        data: filteredBrandStats.map(b => b.practiced),
        backgroundColor: 'rgba(118, 75, 162, 0.7)',
      },
      {
        label: 'Avg Accuracy',
        data: filteredBrandStats.map(b => b.avgAccuracy),
        backgroundColor: 'rgba(255, 215, 0, 0.7)',
        yAxisID: 'y1',
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Brand Practice & Accuracy' },
      tooltip: { mode: 'index' as const, intersect: false }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Users Practiced' } },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        title: { display: true, text: 'Avg Accuracy (%)' },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100
      }
    }
  };

  // Show loading while checking admin status
  if (adminLoading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-container">
          <div className="loading-users">Checking admin permissions...</div>
        </div>
      </div>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-welcome">Welcome, Admin! Here you can manage Voca's data and users.</p>
        <div className="admin-section">
          <h2>Brand History</h2>
          <div className="overall-usage-row">
            <span><b>Overall User Usage:</b> {overallUsage}% of users have practiced at least one brand</span>
          </div>
          <input
            type="text"
            className="brand-search-input"
            placeholder="Search brand..."
            value={brandSearch}
            onChange={e => setBrandSearch(e.target.value)}
            style={{ margin: '1rem 0', padding: '0.7rem', borderRadius: '8px', border: '1.5px solid #e0e7ff', width: '100%', maxWidth: 320 }}
          />
          <div className="brand-history-chart">
            <Bar data={chartData} options={chartOptions} height={320} />
          </div>
          <h2 style={{marginTop: '2rem'}}>Users Management</h2>
          {loading ? (
            <div className="loading-users">Loading users...</div>
          ) : (
            <div className="users-table-scroll">
              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Streak</th>
                      <th>Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className={user.deactivated ? 'deactivated-row' : ''}>
                        <td>{user.username || '—'}</td>
                        <td>{user.email}</td>
                        <td>{user.streakCount ?? 0}</td>
                        <td>{user.gameScore ?? 0}</td>
                        <td>
                          <button className="action-btn edit" onClick={() => handleEdit(user.id)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDelete(user.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit User</h3>
            <div className="modal-form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="modal-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
                required
              />
            </div>
            {editError && <div className="modal-error">{editError}</div>}
            <div className="modal-actions">
              <button onClick={handleEditSave} disabled={editLoading} className="modal-save-btn">
                {editLoading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleEditCancel} className="modal-cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .admin-dashboard-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', 'Fira Sans', 'Avenir', 'Helvetica Neue', Arial, sans-serif;
        }
        .admin-dashboard-container {
          background: rgba(255,255,255,0.85);
          border-radius: 24px;
          box-shadow: 0 12px 40px rgba(44,62,80,0.10);
          padding: 3rem 2.5rem 2.5rem 2.5rem;
          max-width: 900px;
          width: 100%;
          border: 1.5px solid #e0e7ff;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .admin-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.3rem;
          font-weight: 700;
          color: #232946;
          margin-bottom: 0.7rem;
        }
        .admin-welcome {
          font-size: 1.1rem;
          color: #6b7280;
          margin-bottom: 2.2rem;
          text-align: center;
        }
        .admin-section {
          background: linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%);
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(44, 62, 80, 0.08);
          padding: 2rem 1.5rem 1.5rem 1.5rem;
          width: 100%;
          margin-bottom: 2.5rem;
          border: 1.5px solid #e0e7ff;
        }
        .overall-usage-row {
          margin-bottom: 0.5rem;
          font-size: 1.08rem;
          color: #232946;
        }
        .brand-search-input {
          font-size: 1rem;
        }
        .brand-history-chart {
          background: #fff;
          border-radius: 12px;
          padding: 1.5rem 1rem 1rem 1rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(44,62,80,0.07);
        }
        .users-table-scroll {
          max-height: 400px;
          overflow-y: auto;
        }
        .users-table-wrapper {
          overflow-x: auto;
          margin-top: 1.5rem;
        }
        .users-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: rgba(255,255,255,0.7);
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(44,62,80,0.07);
        }
        .users-table th, .users-table td {
          padding: 1rem 1.2rem;
          text-align: left;
        }
        .users-table th {
          background: linear-gradient(90deg, #764ba2 0%, #ffd700 100%);
          color: #fff;
          font-weight: 700;
          font-size: 1.05rem;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }
        .users-table tr {
          border-bottom: 1px solid #e0e7ff;
        }
        .users-table tr:last-child td {
          border-bottom: none;
        }
        .users-table td {
          font-size: 1rem;
          color: #232946;
        }
        .deactivated-row td {
          opacity: 0.5;
          text-decoration: line-through;
        }
        .action-btn {
          margin-right: 0.5rem;
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .action-btn.edit {
          background: #fffbe6;
          color: #764ba2;
          border: 1px solid #ffd700;
        }
        .action-btn.edit:hover {
          background: #ffd700;
          color: #fff;
        }
        .action-btn.reset {
          background: #e0e7ff;
          color: #232946;
          border: 1px solid #764ba2;
        }
        .action-btn.reset:hover {
          background: #764ba2;
          color: #fff;
        }
        .action-btn.deactivate {
          background: #f8fafc;
          color: #b58900;
          border: 1px solid #ffd700;
        }
        .action-btn.deactivate:hover {
          background: #ffd700;
          color: #fff;
        }
        .action-btn.delete {
          background: #fee;
          color: #e53e3e;
          border: 1px solid #e53e3e;
        }
        .action-btn.delete:hover {
          background: #e53e3e;
          color: #fff;
        }
        .loading-users {
          text-align: center;
          color: #764ba2;
          font-weight: 600;
          padding: 2rem 0;
        }
        @media (max-width: 700px) {
          .admin-dashboard-container {
            padding: 1.2rem 0.2rem;
          }
          .users-table th, .users-table td {
            padding: 0.7rem 0.5rem;
            font-size: 0.95rem;
          }
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          border-radius: 16px;
          padding: 2rem 2rem 1.5rem 2rem;
          min-width: 320px;
          max-width: 90vw;
          box-shadow: 0 8px 32px rgba(44,62,80,0.18);
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .modal-form-group {
          margin-bottom: 1.2rem;
          display: flex;
          flex-direction: column;
        }
        .modal-form-group label {
          font-weight: 600;
          margin-bottom: 0.4rem;
        }
        .modal-form-group input {
          padding: 0.7rem;
          border-radius: 8px;
          border: 1.5px solid #e0e7ff;
          font-size: 1rem;
        }
        .modal-error {
          color: #e53e3e;
          background: #fee;
          border-radius: 8px;
          padding: 0.7rem;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        .modal-save-btn {
          background: #764ba2;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.7rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
        }
        .modal-save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .modal-cancel-btn {
          background: #e0e7ff;
          color: #232946;
          border: none;
          border-radius: 8px;
          padding: 0.7rem 1.5rem;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
} 