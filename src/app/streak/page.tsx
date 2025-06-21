'use client';

import { useRouter } from 'next/navigation';

export default function StreakPage() {
  const router = useRouter();

  const handleBack = () => router.push('/search');

  return (
    <div className="streak-page">
      <button className="back-btn" onClick={handleBack}>←</button>
      <h1 className="page-title">Your Streak</h1>

      <div className="streak-container">
        <div className="streak-card">
          <div className="streak-number">7</div>
          <h3>Day Streak</h3>
          <p>Keep it up! You're doing great.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Practice</h4>
            <div className="stat-number">42</div>
            <p>sessions</p>
          </div>

          <div className="stat-card">
            <h4>Brands Learned</h4>
            <div className="stat-number">15</div>
            <p>brands</p>
          </div>

          <div className="stat-card">
            <h4>Accuracy</h4>
            <div className="stat-number">87%</div>
            <p>average</p>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleBack} className="practice-btn">
            Practice More
          </button>
        </div>
      </div>

      <style jsx>{`
        .streak-page {
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
          color: white;
        }

        .back-btn {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: none;
          color: white;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 600;
          margin-top: 2rem;
          letter-spacing: 0.5px;
        }

        .streak-container {
          margin-top: 3rem;
          width: 100%;
          max-width: 800px;
        }

        .streak-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .streak-number {
          font-size: 4rem;
          font-weight: 700;
          color: #ffcc00;
          margin-bottom: 1rem;
        }

        .streak-card h3 {
          margin-bottom: 1rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .streak-card p {
          color: rgba(255, 255, 255, 0.8);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .stat-card h4 {
          margin-bottom: 1rem;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.8);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #4ade80;
          margin-bottom: 0.5rem;
        }

        .stat-card p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .practice-btn {
          background: white;
          color: black;
          font-weight: 600;
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .practice-btn:hover {
          background: #f0f0f0;
          transform: scale(1.03);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .streak-card, .stat-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
} 