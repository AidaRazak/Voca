'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [gameScore, setGameScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGameScore(data.gameScore || 0);
          setStreakCount(data.streak?.count || 0);
          setUsername(data.username || user.displayName || 'User');
        } else {
          setUsername(user.displayName || 'User');
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, <span className="username">{username}</span>! 👋</h1>
          <p className="welcome-subtitle">Ready to master some car brand pronunciations?</p>
        </div>
        <div className="header-right">
          <button 
            className="streak-badge" 
            onClick={() => router.push('/streak')}
          >
            🔥 {streakCount}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="card practice-card" onClick={() => router.push('/search')}>
          <div className="card-icon">🎤</div>
          <h2>Practice Pronunciation</h2>
          <p>Practice your car brand pronunciation and get instant AI feedback with detailed phoneme analysis.</p>
          <div className="card-action">Start Practicing →</div>
        </div>
        
        <div className="card game-card" onClick={() => router.push('/game')}>
          <div className="card-icon">🎮</div>
          <h2>Game Arcade</h2>
          <p>Test your knowledge in our fun educational games and challenge yourself!</p>
          <div className="score-display">
            High Score: <strong>{gameScore}</strong>
          </div>
          <div className="card-action">Play Games →</div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Segoe UI', sans-serif;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .welcome-section h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }
        
        .username {
          color: #4ade80;
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
        }
        
        .welcome-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .streak-badge {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
        
        .streak-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }
        
        .logout-btn {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          backdrop-filter: blur(10px);
        }
        
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }
        
        .logout-icon {
          font-size: 1.1rem;
        }
        
        .dashboard-main {
          padding: 3rem 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
        }
        
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .card:hover::before {
          opacity: 1;
        }
        
        .card-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
        }
        
        .card h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          position: relative;
          z-index: 1;
        }
        
        .card p {
          font-size: 1.1rem;
          line-height: 1.6;
          opacity: 0.9;
          margin: 0 0 1.5rem 0;
          position: relative;
          z-index: 1;
        }
        
        .score-display {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: inline-block;
          position: relative;
          z-index: 1;
        }
        
        .card-action {
          color: #4ade80;
          font-weight: 600;
          font-size: 1.1rem;
          position: relative;
          z-index: 1;
        }
        
        .practice-card:hover .card-action {
          transform: translateX(5px);
        }
        
        .game-card:hover .card-action {
          transform: translateX(5px);
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1.5rem;
            text-align: center;
          }
          
          .welcome-section h1 {
            font-size: 2rem;
          }
          
          .dashboard-main {
            padding: 2rem 1rem;
            grid-template-columns: 1fr;
          }
          
          .card {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}