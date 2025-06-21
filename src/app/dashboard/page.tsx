'use client';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleSearch = () => router.push('/search');
  const handleStreak = () => router.push('/streak');

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Voca Dashboard</h1>
      
      <div className="card-container">
        <div className="card" onClick={handleSearch}>
          <h3>Start Learning</h3>
          <p>Practice car brand pronunciation</p>
        </div>

        <div className="card" onClick={handleStreak}>
          <h3>Your Streak</h3>
          <p>Track your progress</p>
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
          color: white;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 600;
          margin-top: 4rem;
          letter-spacing: 0.5px;
        }

        .card-container {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
          max-width: 600px;
        }

        .card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .card h3 {
          margin-bottom: 1rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .card p {
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
} 