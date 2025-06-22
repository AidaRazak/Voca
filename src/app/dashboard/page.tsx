'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [gameScore, setGameScore] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchScore = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setGameScore(docSnap.data().gameScore || 0);
        }
      };
      fetchScore();
    }
  }, [user]);

  const handleLogout = async () => {
    // Implement your logout logic here
    console.log('Logging out...');
    router.push('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user.displayName || user.email}</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <main className="dashboard-main">
        <div className="card" onClick={() => router.push('/search')}>
          <h2>Practice Pronunciation</h2>
          <p>Practice your car brand pronunciation and get AI feedback.</p>
        </div>
        <div className="card" onClick={() => router.push('/game')}>
          <h2>Phoneme Challenge</h2>
          <p>Test your knowledge in our phoneme guessing game!</p>
          <div className="score-display">
            Your Score: <strong>{gameScore}</strong>
          </div>
        </div>
        <div className="card" onClick={() => router.push('/streak')}>
          <h2>View My Streak</h2>
          <p>Check your practice streak and stay motivated.</p>
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
          padding: 1.5rem 2rem;
          background: rgba(0,0,0,0.1);
        }
        .logout-btn {
          background: white;
          color: #764ba2;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .dashboard-main {
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
        }
        .card h2 {
          margin-bottom: 0.5rem;
        }
        .score-display {
          margin-top: 1rem;
          font-size: 1.1rem;
          font-weight: 500;
          background-color: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}