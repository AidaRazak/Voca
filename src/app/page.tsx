'use client';

import { useAuth } from './auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
        <style jsx>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: 'Segoe UI', sans-serif;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="main-title">Voca</h1>
        <p className="subtitle">Master Car Brand Pronunciation with AI</p>
        <p className="description">
          Learn to pronounce car brand names correctly with our AI-powered feedback system.
          Practice, get instant feedback, and track your progress.
        </p>
      </div>

      <div className="auth-buttons">
        <button 
          className="auth-btn login-btn" 
          onClick={() => router.push('/login')}
        >
          Login
        </button>
        <button 
          className="auth-btn register-btn" 
          onClick={() => router.push('/register')}
        >
          Get Started
        </button>
      </div>

      <div className="features">
        <div className="feature">
          <h3>🎤 Voice Recognition</h3>
          <p>Speak car brand names and get instant feedback</p>
        </div>
        <div className="feature">
          <h3>🤖 AI Analysis</h3>
          <p>Advanced pronunciation analysis with phoneme breakdown</p>
        </div>
        <div className="feature">
          <h3>📊 Progress Tracking</h3>
          <p>Track your learning streak and improvement over time</p>
        </div>
      </div>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
          color: white;
          text-align: center;
        }

        .hero-section {
          margin-bottom: 3rem;
        }

        .main-title {
          font-size: 4rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          letter-spacing: 2px;
        }

        .subtitle {
          font-size: 1.5rem;
          margin: 0 0 1rem 0;
          opacity: 0.9;
        }

        .description {
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
          opacity: 0.8;
          line-height: 1.6;
        }

        .auth-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 4rem;
        }

        .auth-btn {
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .login-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .register-btn {
          background: white;
          color: #667eea;
        }

        .register-btn:hover {
          background: #f8f9fa;
          transform: translateY(-2px);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 800px;
          width: 100%;
        }

        .feature {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feature h3 {
          margin: 0 0 1rem 0;
          font-size: 1.3rem;
        }

        .feature p {
          margin: 0;
          opacity: 0.8;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 3rem;
          }

          .auth-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
          }

          .features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 