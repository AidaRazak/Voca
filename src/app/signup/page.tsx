'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Redirect if already logged in
  if (user) {
    router.push('/dashboard');
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

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update profile with username
      await updateProfile(user, {
        displayName: formData.username
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        email: formData.email,
        createdAt: new Date(),
        streak: {
          count: 0,
          lastPlayed: null,
          activeDays: [],
          totalSessions: 0,
          brandsLearned: 0,
          averageAccuracy: 0
        },
        games: {
          phonemeChallenge: { highScore: 0, gamesPlayed: 0 },
          listenGuess: { highScore: 0, gamesPlayed: 0 },
          pronunciationShowdown: { highScore: 0, gamesPlayed: 0 }
        }
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Join Voca and start mastering car brand pronunciation</p>
        </div>

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-link">
          <p>
            Already have an account?{' '}
            <button onClick={handleLoginClick} className="link-button">
              Sign In
            </button>
          </p>
        </div>

        <div className="back-to-home">
          <button onClick={() => router.push('/')} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>

      <style jsx>{`
        .signup-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
        }

        .signup-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .signup-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signup-header h1 {
          color: #333;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .signup-header p {
          color: #666;
          font-size: 1rem;
        }

        .signup-form {
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

        .signup-button {
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

        .signup-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .signup-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-link {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e1e5e9;
        }

        .login-link p {
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
          .signup-container {
            padding: 2rem;
            margin: 1rem;
          }

          .signup-header h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
} 