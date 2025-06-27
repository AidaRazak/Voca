'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  // Check if user is authenticated as admin
  useEffect(() => {
    const checkAdminSession = () => {
      try {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession) {
          const session = JSON.parse(adminSession);
          const now = Date.now();
          const sessionAge = now - session.timestamp;
          
          // Check if session is less than 24 hours old
          if (sessionAge < 24 * 60 * 60 * 1000) {
            setIsAdmin(true);
            setAdminLoading(false);
          } else {
            // Session expired
            localStorage.removeItem('adminSession');
            router.push('/admin-dashboard/signin');
          }
        } else {
          // No admin session
          router.push('/admin-dashboard/signin');
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        router.push('/admin-dashboard/signin');
      }
    };

    checkAdminSession();
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

  const handleEdit = (userId: string) => {
    // TODO: Implement edit username modal
    alert('Edit user: ' + userId);
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

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin-dashboard/signin');
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
          <h2>Users Management</h2>
          {loading ? (
            <div className="loading-users">Loading users...</div>
          ) : (
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
                      <td>{user.streakCount ?? user.streak?.count ?? 0}</td>
                      <td>{user.gameScore ?? 0}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => handleEdit(user.id)}>Edit</button>
                        <button className="action-btn reset" onClick={() => handleResetPassword(user.email)}>Reset Password</button>
                        <button className="action-btn deactivate" onClick={() => handleDeactivate(user.id)}>{user.deactivated ? 'Activate' : 'Deactivate'}</button>
                        <button className="action-btn delete" onClick={() => handleDelete(user.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
      </div>
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
      `}</style>
    </div>
  );
} 