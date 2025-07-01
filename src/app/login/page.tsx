"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth-context";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Don't render the form if the user is already logged in
  if (user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    if (!auth) {
      setError('Authentication service not available.');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as any).code;
        if (code === 'auth/user-not-found') {
          setError('No account found with this email address');
        } else if (code === 'auth/wrong-password') {
          setError('Incorrect password');
        } else if (code === 'auth/invalid-email') {
          setError('Please enter a valid email address');
        } else if (code === 'auth/too-many-requests') {
          setError('Too many failed attempts. Please try again later');
        } else {
          setError('Failed to sign in. Please check your credentials and try again.');
        }
      } else {
        setError('Failed to sign in. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    setAdminError('');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.email.trim() || !adminForm.password.trim()) {
      setAdminError('Please fill in all fields');
      return;
    }
    setAdminLoading(true);
    setAdminError('');
    if (!db) {
      setAdminError('Database not available.');
      setAdminLoading(false);
      return;
    }
    try {
      // Query Firestore for admin credentials
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', adminForm.email), where('password', '==', adminForm.password));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        router.push('/admin-dashboard');
      } else {
        setAdminError('Invalid admin credentials');
      }
    } catch (err) {
      setAdminError('Error checking admin credentials');
    }
    setAdminLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your pronunciation journey</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="signup-link">
          <p>
            Don't have an account?{' '}
            <button onClick={handleSignupClick} className="link-button">
              Create Account
            </button>
          </p>
        </div>

        <div className="admin-login-toggle" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="link-button"
            style={{ color: '#764ba2', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 1.2rem' }}
            onClick={() => router.push('/admin-dashboard/signin')}
          >
            Sign In as Admin
          </button>
        </div>

        <div className="back-to-home">
          <button onClick={() => router.push('/')} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
        }

        .login-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          color: #333;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: #666;
          font-size: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .signup-link {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e1e5e9;
        }

        .signup-link p {
          color: #666;
          margin: 0;
        }

        .link-button {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          font-size: 1rem;
        }

        .link-button:hover {
          color: #764ba2;
        }

        .back-to-home {
          text-align: center;
          margin-top: 1.5rem;
        }

        .back-button {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: underline;
        }

        .back-button:hover {
          color: #333;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 2rem;
            margin: 1rem;
          }

          .login-header h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
} 