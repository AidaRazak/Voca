'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import ProtectedRoute from '../components/ProtectedRoute';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="dashboard-page">
        <div className="header">
          <h1 className="page-title">Welcome, {user?.email}</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="card-container">
          <div className="card" onClick={() => router.push('/search')}>
            <h3>🔍 Search Brands</h3>
            <p>Find and learn car brand pronunciations</p>
          </div>

          <div className="card" onClick={() => router.push('/streak')}>
            <h3>🔥 Your Streak</h3>
            <p>Track your learning progress</p>
          </div>

          <div className="card" onClick={() => router.push('/feedback')}>
            <h3>📊 AI Feedback</h3>
            <p>Get pronunciation feedback</p>
          </div>
        </div>

        <style jsx>{`
          .dashboard-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            font-family: 'Segoe UI', sans-serif;
            color: white;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
          }

          .page-title {
            font-size: 2rem;
            font-weight: 600;
            margin: 0;
          }

          .logout-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .logout-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .card-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          .card {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            backdrop-filter: blur(14px);
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            border-color: rgba(255, 255, 255, 0.3);
          }

          .card h3 {
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .card p {
            margin: 0;
            opacity: 0.8;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .header {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }

            .card-container {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
} 