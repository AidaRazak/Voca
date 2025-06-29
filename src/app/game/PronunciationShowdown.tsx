'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { brandsData } from './gamedata';
import { updateUserStreak } from '../utils/streakUtils';

const brandNames = Object.keys(brandsData);

type GamePhase = 'ready' | 'recording' | 'processing' | 'result';

type ShowdownResult = {
  userScore: number;
  targetScore: number;
  isWin: boolean;
};

export default function PronunciationShowdown({ onScoreUpdate }: { onScoreUpdate: (newScore: number) => void }) {
  const { user } = useAuth();
  const [currentBrand, setCurrentBrand] = useState('');
  const [targetScore, setTargetScore] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('ready');
  const [showdownResult, setShowdownResult] = useState<ShowdownResult | null>(null);

  useEffect(() => {
    generateChallenge();
  }, []);

  const generateChallenge = () => {
    setGamePhase('ready');
    setShowdownResult(null);
    const randomBrandName = brandNames[Math.floor(Math.random() * brandNames.length)];
    const randomTargetScore = Math.floor(Math.random() * 21) + 70; // Target between 70-90
    setCurrentBrand(randomBrandName);
    setTargetScore(randomTargetScore);
  };

  const handleRecording = () => {
    const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    if (!lambdaUrl) {
      alert('Lambda function URL not configured.');
      return;
    }

    setGamePhase('recording');
    let mediaRecorder: MediaRecorder;
    let chunks: Blob[] = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        setGamePhase('processing');
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) return;

          try {
            const res = await fetch(lambdaUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64Audio, contentType: 'audio/webm', brand: currentBrand }),
            });
            const initialResult = await res.json();
            if (!initialResult.jobName) throw new Error('Failed to start analysis job.');
            
            pollForResult(lambdaUrl, initialResult.jobName);
          } catch (err) {
            alert('Error sending audio for analysis. Please try again.');
            setGamePhase('ready');
          }
        };
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 3000);
    }).catch(() => {
        alert('Microphone access denied.');
        setGamePhase('ready');
    });
  };

  const pollForResult = async (lambdaUrl: string, jobName: string) => {
    try {
      const pollRes = await fetch(`${lambdaUrl}?jobName=${jobName}`);
      const pollResult = await pollRes.json();
      
      if (pollResult.status === 'COMPLETED') {
        let userScore = pollResult.accuracy || 0;
        
        // Fallback: Calculate accuracy from phoneme data if not provided by backend
        if (typeof userScore !== 'number' && pollResult.userPhonemes && pollResult.correctPhonemes) {
          const numCorrect = pollResult.userPhonemes.filter((p: any) => p.correct).length;
          userScore = Math.round((numCorrect / pollResult.correctPhonemes.length) * 100);
        }
        
        const isWin = userScore >= targetScore;
        setShowdownResult({ userScore, targetScore, isWin });
        setGamePhase('result');

        if (isWin && user) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { gameScore: increment(5) }); // 5 points for a win
          const userDoc = await getDoc(userDocRef);
          if(userDoc.exists()) {
            onScoreUpdate(userDoc.data().gameScore || 0);
          }
        }

        // Update streak for game completion
        if (user) {
          await updateUserStreak(user.uid, {
            accuracy: userScore,
            brandName: currentBrand,
            sessionType: 'game'
          });
        }
      } else if (pollResult.status === 'FAILED') {
        throw new Error('Analysis failed.');
      } else {
        setTimeout(() => pollForResult(lambdaUrl, jobName), 3000);
      }
    } catch (err) {
      alert('Error fetching analysis result.');
      setGamePhase('ready');
    }
  };

  const renderContent = () => {
    if (gamePhase === 'result' && showdownResult) {
      return (
        <div className="result-card">
          <h2>{showdownResult.isWin ? 'You Won!' : 'Nice Try!'}</h2>
          <p>Your Score: <span className={showdownResult.isWin ? 'win' : 'loss'}>{showdownResult.userScore}%</span></p>
          <p>Target Score: {showdownResult.targetScore}%</p>
          {showdownResult.isWin && <p className="points-win">+5 Points!</p>}
          <button onClick={generateChallenge} className="option-btn">Play Again</button>
        </div>
      );
    }

    return (
      <div className="challenge-card">
        <p className="instruction">Pronounce the following brand and beat the target score:</p>
        <h2 className="brand-name">{currentBrand}</h2>
        <div className="target-score">Target: <strong>{targetScore}%</strong></div>
        <button
          onClick={handleRecording}
          disabled={gamePhase !== 'ready'}
          className="record-btn"
        >
          {gamePhase === 'ready' && 'Record Now'}
          {gamePhase === 'recording' && 'Recording...'}
          {gamePhase === 'processing' && 'Analyzing...'}
        </button>
      </div>
    );
  };

  return (
    <div className="game-container-inner">
      {renderContent()}
    </div>
  );
} 