'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { brandsData } from './gamedata';
import { updateUserStreak } from '../utils/streakUtils';

const brandNames = Object.keys(brandsData);

// Helper to get a brand name for the audio, handling multi-word brands
const getSpokenBrand = (brandId: string) => {
  return brandId.replace('-', ' ');
};

type Question = {
  brand: string;
  options: string[];
  correctAnswer: string;
  audioUrl?: string;
};

export default function ListenGuess({ onScoreUpdate }: { onScoreUpdate: (newScore: number) => void }) {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [answered, setAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchScore = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const newScore = userDoc.data().gameScore || 0;
          setScore(newScore);
          onScoreUpdate(newScore);
        }
      };
      fetchScore();
    }
    generateQuestion();
  }, [user]);

  const generateQuestion = () => {
    setAnswered(false);
    setFeedback('');
    setIsPlaying(false);

    const randomBrandName = brandNames[Math.floor(Math.random() * brandNames.length)];
    
    const incorrectOptions = new Set<string>();
    while (incorrectOptions.size < 2) {
      const randomIncorrect = brandNames[Math.floor(Math.random() * brandNames.length)];
      if (randomIncorrect !== randomBrandName) {
        incorrectOptions.add(randomIncorrect);
      }
    }

    const options = Array.from(incorrectOptions);
    options.push(randomBrandName);
    options.sort(() => Math.random() - 0.5);

    setQuestion({
      brand: randomBrandName,
      options,
      correctAnswer: randomBrandName,
    });
  };

  const playAudio = () => {
    if (!question) return;
    
    setIsPlaying(true);
    
    // Use browser's speech synthesis to pronounce the brand
    const utterance = new SpeechSynthesisUtterance(question.brand);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  };

  const handleAnswer = async (selectedOption: string) => {
    if (answered) return;
    setAnswered(true);

    const isCorrect = selectedOption === question?.correctAnswer;
    
    if (isCorrect) {
      setFeedback('correct');
      const newScore = score + 1;
      setScore(newScore);
      onScoreUpdate(newScore);

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { gameScore: increment(1) });
      }
    } else {
      setFeedback('incorrect');
    }

    // Update streak for game completion
    if (user && question) {
      await updateUserStreak(user.uid, {
        accuracy: isCorrect ? 100 : 0,
        brandName: question.brand,
        sessionType: 'game'
      });
    }

    setTimeout(() => {
      generateQuestion();
    }, 1500);
  };

  return (
    <div className="game-container-inner">
      {question ? (
        <div className="question-card">
          <p className="instruction">Listen to the pronunciation and guess the brand:</p>
          
          <button 
            onClick={playAudio} 
            disabled={isPlaying}
            className="play-sound-btn"
          >
            {isPlaying ? '🔊' : '🔊'}
          </button>
          
          <div className="options-container listen-game">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={`option-btn 
                  ${answered && option === question.correctAnswer ? 'correct' : ''}
                  ${answered && feedback === 'incorrect' && option !== question.correctAnswer ? 'disabled' : ''}
                `}
              >
                {option}
              </button>
            ))}
          </div>
          {feedback === 'correct' && <p className="feedback-text correct">Correct! +1 Point</p>}
          {feedback === 'incorrect' && <p className="feedback-text incorrect">Nice try!</p>}
        </div>
      ) : (
        <p>Loading game...</p>
      )}
    </div>
  );
} 