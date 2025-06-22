'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface StreakData {
  streakCount: number;
  lastPlayedDate: string;
  activeDays: string[];
  totalSessions: number;
  brandsLearned: number;
  averageAccuracy: number;
}

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StreakModal({ isOpen, onClose }: StreakModalProps) {
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
    if (isOpen && user) {
      fetchStreakData();
    }
  }, [isOpen, user]);

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
    return date.toISOString().split('T')[0];
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>🔥 Your Streak</h2>
        </div>

        <div className="modal-body">
          {/* Summary Stats Section */}
          <div className="summary-section">
            <div className="main-streak-card">
              <div className="streak-number">{streakData.streakCount}</div>
              <div className="streak-label">Day Streak</div>
              <div className="streak-subtext">Keep it up! You're doing great.</div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{streakData.totalSessions}</div>
                <div className="stat-label">Total Practice</div>
                <div className="stat-subtext">sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{streakData.brandsLearned}</div>
                <div className="stat-label">Brands Learned</div>
                <div className="stat-subtext">brands</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{streakData.averageAccuracy}%</div>
                <div className="stat-label">Accuracy</div>
                <div className="stat-subtext">average</div>
              </div>
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
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }

          .modal-content {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            z-index: 10;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .modal-header {
            padding: 2rem 2rem 1rem;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .modal-header h2 {
            margin: 0;
            font-size: 2rem;
            font-weight: 700;
            color: white;
          }

          .modal-body {
            padding: 2rem;
          }

          .summary-section {
            margin-bottom: 3rem;
          }

          .main-streak-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            margin-bottom: 2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .streak-number {
            font-size: 4rem;
            font-weight: 700;
            color: #ffcc00;
            margin-bottom: 0.5rem;
          }

          .streak-label {
            font-size: 1.5rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.5rem;
          }

          .streak-subtext {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .stat-card {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 15px;
            padding: 1.5rem;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #4ade80;
            margin-bottom: 0.5rem;
          }

          .stat-label {
            font-size: 0.9rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.25rem;
          }

          .stat-subtext {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .calendar-section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .calendar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
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
            color: rgba(255, 255, 255, 0.8);
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

          @media (max-width: 768px) {
            .modal-content {
              margin: 1rem;
              max-height: 95vh;
            }

            .modal-body {
              padding: 1rem;
            }

            .stats-grid {
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            }

            .streak-number {
              font-size: 3rem;
            }

            .calendar-day {
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
} 