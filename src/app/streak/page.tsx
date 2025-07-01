'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import StreakModal from '../components/StreakModal';

interface StreakData {
  streakCount: number;
  lastPlayedDate: string;
  activeDays: string[];
  totalSessions: number;
  brandsLearned: number;
  averageAccuracy: number;
}

export default function StreakPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    streakCount: 0,
    lastPlayedDate: '',
    activeDays: [],
    totalSessions: 0,
    brandsLearned: 0,
    averageAccuracy: 0
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;
    
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      setStreakData({
        streakCount: data.streakCount || 0,
        lastPlayedDate: data.lastPlayedDate || '',
        activeDays: data.activeDays || [],
        totalSessions: data.totalSessions || 0,
        brandsLearned: data.brandsLearned || 0,
        averageAccuracy: data.averageAccuracy || 0
      });
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA');
  };

  const isActiveDay = (day: number) => {
    const dateStr = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    return streakData.activeDays.includes(dateStr);
  };

  const getPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handleBack = () => router.push('/dashboard');

  return (
    <div className="streak-page">
      <button className="back-btn" onClick={handleBack}>←</button>
      <h1 className="page-title">Your Streak</h1>

      <div className="streak-container">
        <div className="streak-card">
          <div className="streak-number">{streakData.streakCount}</div>
          <h3>Day Streak</h3>
          <p>Keep it up! You're doing great.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Practice</h4>
            <div className="stat-number">{streakData.totalSessions}</div>
            <p>sessions</p>
          </div>

          <div className="stat-card">
            <h4>Brands Learned</h4>
            <div className="stat-number">{streakData.brandsLearned}</div>
            <p>brands</p>
          </div>

          <div className="stat-card">
            <h4>Accuracy</h4>
            <div className="stat-number">{streakData.averageAccuracy}%</div>
            <p>average</p>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="calendar-section">
          <div className="calendar-header">
            <button className="nav-btn" onClick={getPreviousMonth}>‹</button>
            <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button className="nav-btn" onClick={getNextMonth}>›</button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {Array.from({ length: startingDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty"></div>
              ))}
              
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const isActive = isActiveDay(day);
                return (
                  <div 
                    key={day} 
                    className={`calendar-day ${isActive ? 'active' : ''}`}
                    title={isActive ? 'Practiced' : 'No activity'}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleBack} className="practice-btn">
            Back to Dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        .streak-page {
          min-height: 100vh;
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

        .calendar-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .calendar-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
        }

        .nav-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .calendar-grid {
          width: 100%;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .weekday {
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem;
        }

        .calendar-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .calendar-day.empty {
          background: transparent;
          cursor: default;
        }

        .calendar-day:not(.empty) {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
        }

        .calendar-day:not(.empty):hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .calendar-day.active {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
        }

        .calendar-day.active:hover {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          transform: scale(1.05);
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
          
          .streak-card, .stat-card, .calendar-section {
            padding: 1.5rem;
          }

          .calendar-day {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
} 