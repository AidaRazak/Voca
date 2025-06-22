'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import PhonemeChallenge from './PhonemeChallenge';
import ListenGuess from './ListenGuess';

type GameMode = 'menu' | 'phoneme-challenge' | 'listen-guess';

export default function GamePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('menu');

  useEffect(() => {
    if (user) {
      const fetchScore = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setScore(userDoc.data().gameScore || 0);
        }
      };
      fetchScore();
    }
  }, [user]);

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };
  
  const renderGameMode = () => {
    switch(gameMode) {
      case 'phoneme-challenge':
        return <PhonemeChallenge onScoreUpdate={handleScoreUpdate} />;
      case 'listen-guess':
        return <ListenGuess onScoreUpdate={handleScoreUpdate} />;
      default:
        return (
           <div className="game-menu">
            <div className="game-card" onClick={() => setGameMode('phoneme-challenge')}>
              <h3>Phoneme Challenge</h3>
              <p>Match the brand to its phoneme sequence.</p>
            </div>
            <div className="game-card" onClick={() => setGameMode('listen-guess')}>
              <h3>Listen & Guess</h3>
              <p>Listen to the pronunciation and guess the brand.</p>
            </div>
             <div className="game-card disabled">
              <h3>AI Pronunciation Showdown</h3>
              <p>Coming soon! Challenge the AI with your voice.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="game-page">
      <button 
        className="back-btn" 
        onClick={() => gameMode === 'menu' ? router.push('/dashboard') : setGameMode('menu')}
      >
        {gameMode === 'menu' ? '← Dashboard' : '← Back to Menu'}
      </button>
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">Game Arcade</h1>
          <div className="score-display">Total Score: <strong>{score}</strong></div>
        </div>
        
        {renderGameMode()}

      </div>

      <style jsx>{`
        .game-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #485563 0%, #29323c 100%);
          color: white;
          font-family: 'Segoe UI', sans-serif;
        }
        .back-btn {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          z-index: 10;
        }
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .game-container {
          width: 100%;
          max-width: 700px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }
        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.2);
          padding-bottom: 1rem;
        }
        .game-title {
          font-size: 2rem;
          font-weight: 600;
        }
        .score-display {
          font-size: 1.2rem;
          background-color: #ffcc00;
          color: black;
          padding: 0.5rem 1rem;
          border-radius: 10px;
        }

        /* Game Menu Styles */
        .game-menu {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .game-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1.5rem;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .game-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.15);
        }
        .game-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .game-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
        }
        .game-card p {
          margin: 0;
          color: rgba(255,255,255,0.8);
        }

        /* Shared Game Styles */
        .game-container-inner {
           /* placeholder for consistency */
        }
        .question-card {
          text-align: center;
        }
        .instruction {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
        }
        .brand-name {
          font-size: 2.5rem;
          font-weight: bold;
          text-transform: capitalize;
          margin: 1rem 0 2rem 0;
          color: #ffcc00;
        }
        .options-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .option-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          font-size: 1rem;
          text-align: left;
        }
        .option-btn:not(:disabled):hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        .option-btn.correct {
          background-color: #28a745;
          border-color: #28a745;
          color: white;
        }
        .option-btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .feedback-text {
          margin-top: 1.5rem;
          font-size: 1.2rem;
          font-weight: bold;
        }
        .feedback-text.correct { color: #28a745; }
        .feedback-text.incorrect { color: #dc3545; }
        .play-sound-btn {
          background: #ffcc00;
          color: black;
          border: none;
          padding: 1rem;
          border-radius: 50%;
          width: 80px;
          height: 80px;
          font-size: 2rem;
          cursor: pointer;
          margin: 1rem auto 2rem auto;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 0.2s;
        }
        .play-sound-btn:hover {
          transform: scale(1.1);
        }
        .options-container.listen-game .option-btn {
          text-align: center;
          font-weight: 500;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
} 