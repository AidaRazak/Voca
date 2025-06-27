'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminSignIn() {
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const router = useRouter();

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    setAdminError('');
    setDebugInfo('');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.email.trim() || !adminForm.password.trim()) {
      setAdminError('Please fill in all fields');
      return;
    }
    setAdminLoading(true);
    setAdminError('');
    setDebugInfo('');
    try {
      setDebugInfo('Signing in with Firebase Auth...');
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, adminForm.email, adminForm.password);
      const user = userCredential.user;
      setDebugInfo('Firebase Auth successful, checking admin status...');
      // 2. Check if user is in admins collection
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', adminForm.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setDebugInfo('Admin status confirmed, redirecting...');
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          email: adminForm.email,
          timestamp: Date.now(),
          uid: user.uid
        }));
        router.push('/admin-dashboard');
      } else {
        setDebugInfo('Not an admin, signing out...');
        setAdminError('Access denied. You are not authorized as an admin.');
        await signOut(auth);
      }
    } catch (error: any) {
      setDebugInfo('Firebase Auth failed');
      if (error.code === 'auth/user-not-found') {
        setAdminError('No admin account found with this email address');
      } else if (error.code === 'auth/wrong-password') {
        setAdminError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setAdminError('Please enter a valid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setAdminError('Too many failed attempts. Please try again later');
      } else {
        setAdminError('Failed to sign in. Please check your credentials and try again.');
      }
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="admin-signin-page">
      <div className="admin-signin-container">
        <h1 className="admin-signin-title">Admin Sign In</h1>
        <form onSubmit={handleAdminLogin} className="admin-signin-form">
          <div className="form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              type="email"
              id="admin-email"
              name="email"
              value={adminForm.email}
              onChange={handleAdminInputChange}
              placeholder="admin@voca.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Admin Password</label>
            <input
              type="password"
              id="admin-password"
              name="password"
              value={adminForm.password}
              onChange={handleAdminInputChange}
              placeholder="Enter admin password"
              required
            />
          </div>
          {adminError && <div className="error-message">{adminError}</div>}
          {debugInfo && <div className="debug-message">{debugInfo}</div>}
          <button
            type="submit"
            className="admin-signin-button"
            disabled={adminLoading}
          >
            {adminLoading ? 'Signing In...' : 'Sign In as Admin'}
          </button>
        </form>
        <button className="back-button" onClick={() => router.push('/login')}>Back to Login</button>
      </div>
      <style jsx>{`
        .admin-signin-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', 'Fira Sans', 'Avenir', 'Helvetica Neue', Arial, sans-serif;
        }
        .admin-signin-container {
          background: rgba(255,255,255,0.97);
          border-radius: 24px;
          box-shadow: 0 12px 40px rgba(44,62,80,0.10);
          padding: 2.5rem 2rem 2rem 2rem;
          max-width: 400px;
          width: 100%;
          border: 1.5px solid #e0e7ff;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .admin-signin-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #232946;
          margin-bottom: 1.5rem;
        }
        .admin-signin-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          color: #333;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .form-group input {
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .form-group input::placeholder {
          color: #999;
        }
        .error-message {
          background: #fee;
          color: #e53e3e;
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          border: 1px solid #fed7d7;
        }
        .debug-message {
          background: #e0e7ff;
          color: #232946;
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          border: 1px solid #c7d2fe;
          font-family: monospace;
        }
        .admin-signin-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.9rem;
          border: none;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.7rem;
        }
        .admin-signin-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .admin-signin-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .back-button {
          margin-top: 1.5rem;
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          font-size: 1rem;
        }
        .back-button:hover {
          color: #764ba2;
        }
      `}</style>
    </div>
  );
} 