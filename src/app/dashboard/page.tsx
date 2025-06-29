'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGameScore(data.gameScore || 0);
          setStreakCount(data.streak?.count || 0);
          setUsername(data.username || user.displayName || 'User');
        } else {
          setUsername(user.displayName || 'User');
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Handle navigation when user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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
            background: linear-gradient(135deg,rgb(0, 0, 0) 0%, #764ba2 100%);
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

  // Don't render anything if user is not authenticated (will redirect via useEffect)
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Streak Button Centered in Header */}
      <div className="w-full flex justify-center mt-6 mb-4">
        <button
          onClick={() => router.push('/streak')}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold to-yellow-400 text-black font-bold text-lg shadow-lg hover:scale-105 transition border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="View streak"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow text-2xl">🔥</span>
          <span className="ml-2 text-xl font-bold">{streakCount}</span>
        </button>
      </div>
      <main>
        {/* Welcome Section */}
        <section>
          <h1 className="text-5xl md:text-6xl mb-6 gold text-center">Welcome back, {username}</h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl text-center mx-auto">Ready to master car brand pronunciations? Scroll down to begin your journey.</p>
        </section>

        {/* Practice Pronunciation Section */}
        <section>
          <h2 className="text-4xl mb-4">Practice Pronunciation</h2>
          <p className="text-lg text-gray-700 max-w-xl text-center mb-8">Practice your car brand pronunciation and get instant AI feedback with detailed phoneme analysis.</p>
          <button
            className="px-8 py-4 rounded-full bg-black text-white gold border-2 border-gold text-xl font-semibold transition-transform duration-300 hover:scale-105 shadow-lg"
            onClick={() => router.push('/search')}
          >
            Start Practicing
          </button>
        </section>

        {/* Game Arcade Section */}
        <section>
          <h2 className="text-4xl mb-4">Game Arcade</h2>
          <p className="text-lg text-gray-700 max-w-xl text-center mb-8">Test your knowledge in our fun educational games and challenge yourself!</p>
          <button
            className="px-8 py-4 rounded-full bg-black text-white gold border-2 border-gold text-xl font-semibold transition-transform duration-300 hover:scale-105 shadow-lg mb-8"
            onClick={() => router.push('/game')}
          >
            Play Games
          </button>
          <div className="text-2xl font-bold mt-8">High Score: <span className="gold">{gameScore}</span></div>
        </section>
      </main>

      {/* Fixed Footer with Logout Button (always bottom center) */}
      <footer className="fixed inset-x-0 bottom-0 flex justify-center py-6 bg-white/80 backdrop-blur-md z-20 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-full bg-black text-gold font-semibold text-lg shadow-lg hover:scale-105 transition border-2 border-gold"
        >
          Logout
        </button>
      </footer>
    </>
  );
}