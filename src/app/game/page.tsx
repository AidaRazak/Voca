'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import PhonemeChallenge from './PhonemeChallenge';
import ListenGuess from './ListenGuess';
import PronunciationShowdown from './PronunciationShowdown';
import Link from 'next/link';

type GameMode = 'menu' | 'phoneme-challenge' | 'listen-guess' | 'pronunciation-showdown';

export default function GamePage() {
  const { user } = useAuth();
  const [userScore, setUserScore] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('menu');

  useEffect(() => {
    if (user) {
      const fetchScore = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserScore(userDoc.data().gameScore || 0);
        } else {
          // If the user has no doc, create one
          await setDoc(userDocRef, { gameScore: 0 });
          setUserScore(0);
        }
      };

      fetchScore();
    }
  }, [user]);

  const handleScoreUpdate = (newScore: number) => {
    setUserScore(newScore);
  };
  
  const renderGameMode = () => {
    switch (gameMode) {
      case 'phoneme-challenge':
        return <PhonemeChallenge onScoreUpdate={handleScoreUpdate} />;
      case 'listen-guess':
        return <ListenGuess onScoreUpdate={handleScoreUpdate} />;
      case 'pronunciation-showdown':
        return <PronunciationShowdown onScoreUpdate={handleScoreUpdate} />;
      default:
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Game Arcade</h1>
            <p className="mb-8 text-lg text-gray-400">Select a game to play</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button onClick={() => setGameMode('phoneme-challenge')} className="game-card">
                <h3 className="text-2xl font-semibold">Phoneme Challenge</h3>
                <p>Match the brand to its phonemes.</p>
              </button>
              <button onClick={() => setGameMode('listen-guess')} className="game-card">
                <h3 className="text-2xl font-semibold">Listen & Guess</h3>
                <p>Guess the brand from an AI voice.</p>
              </button>
              <button onClick={() => setGameMode('pronunciation-showdown')} className="game-card">
                <h3 className="text-2xl font-semibold">AI Pronunciation Showdown</h3>
                <p>Beat the AI's target score.</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="game-container min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setGameMode('menu')}
            className={`text-lg transition-colors ${gameMode !== 'menu' ? 'hover:text-blue-400' : 'text-gray-500 cursor-default'}`}
            disabled={gameMode === 'menu'}
          >
            &larr; Back to Arcade
          </button>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-400">Total Score: {userScore}</h2>
            <Link href="/dashboard" className="text-sm hover:underline">Back to Dashboard</Link>
          </div>
        </div>
        {renderGameMode()}
      </div>
    </div>
  );
} 