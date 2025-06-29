'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function AdminSetup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Create admin document in Firestore
      await setDoc(doc(db, 'admins', user.uid), {
        email: formData.email,
        createdAt: new Date(),
        role: 'admin'
      });

      setSuccess(`Admin user created successfully! Email: ${formData.email}`);
      setFormData({ email: '', password: '', confirmPassword: '' });
      
    } catch (error: any) {
      console.error('Admin creation error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError('Failed to create admin account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-setup-page">
      <div className="admin-setup-container">
        <h1 className="admin-setup-title">Create Admin User</h1>
        <p className="admin-setup-subtitle">
          This page creates an admin user in both Firebase Authentication and Firestore.
          <br />
          <strong>⚠️ Delete this page after creating your admin user for security!</strong>
        </p>

        <form onSubmit={handleCreateAdmin} className="admin-setup-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@voca.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter admin password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm admin password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            className="admin-setup-button"
            disabled={loading}
          >
            {loading ? 'Creating Admin...' : 'Create Admin User'}
          </button>
        </form>

        <div className="admin-setup-info">
          <h3>After creating the admin user:</h3>
          <ol>
            <li>Go to <code>/admin-dashboard/signin</code> to test the login</li>
            <li>Use the email and password you just created</li>
            <li>Delete this setup page for security</li>
          </ol>
        </div>
      </div>

      <style jsx>{`
        .admin-setup-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', 'Fira Sans', 'Avenir', 'Helvetica Neue', Arial, sans-serif;
          padding: 2rem;
        }
        .admin-setup-container {
          background: rgba(255,255,255,0.97);
          border-radius: 24px;
          box-shadow: 0 12px 40px rgba(44,62,80,0.10);
          padding: 2.5rem 2rem 2rem 2rem;
          max-width: 500px;
          width: 100%;
          border: 1.5px solid #e0e7ff;
        }
        .admin-setup-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #232946;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        .admin-setup-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 2rem;
          text-align: center;
          line-height: 1.5;
        }
        .admin-setup-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          margin-bottom: 2rem;
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
        .success-message {
          background: #f0fff4;
          color: #38a169;
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          border: 1px solid #c6f6d5;
        }
        .admin-setup-button {
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
        .admin-setup-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .admin-setup-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .admin-setup-info {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e0e7ff;
        }
        .admin-setup-info h3 {
          color: #232946;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        .admin-setup-info ol {
          color: #6b7280;
          line-height: 1.6;
        }
        .admin-setup-info code {
          background: #e0e7ff;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
          color: #232946;
        }
      `}</style>
    </div>
  );
} 