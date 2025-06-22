'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { brandsData } from './gamedata';

const brandNames = Object.keys(brandsData);

// Helper to get a brand name for the audio, handling multi-word brands
const getSpokenBrand = (brandId: string) => {
  return brandId.replace('-', ' ');
};

type Question = {
  brand: string;
  options: string[];
  correctAnswer: string;
};

export default function ListenGuess({ onScoreUpdate }: { onScoreUpdate: (newScore: number) => void }) {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const [answered, setAnswered] = useState(false);

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

    const randomBrandName = brandNames[Math.floor(Math.random() * brandNames.length)];
    const correctAnswer = randomBrandName;

    const incorrectOptions = new Set<string>();
    while (incorrectOptions.size < 2) {
      const randomIncorrect = brandNames[Math.floor(Math.random() * brandNames.length)];
      if (randomIncorrect !== randomBrandName) {
        incorrectOptions.add(randomIncorrect);
      }
    }

    const options = Array.from(incorrectOptions);
    options.push(correctAnswer);
    options.sort(() => Math.random() - 0.5);

    setQuestion({
      brand: randomBrandName,
      options,
      correctAnswer,
    });
  };

  const playSound = () => {
    if (question) {
      const utterance = new SpeechSynthesisUtterance(getSpokenBrand(question.brand));
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Ensure sound plays only once when a new question is generated
    if (question && !answered) {
      // A small delay can help ensure the browser is ready
      setTimeout(playSound, 100);
    }
  }, [question]);

  const handleAnswer = async (selectedOption: string) => {
    if (answered) return;
    setAnswered(true);

    if (selectedOption === question?.correctAnswer) {
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

    setTimeout(() => {
      generateQuestion();
    }, 1500);
  };

  return (
    <div className="game-container-inner">
      {question ? (
        <div className="question-card">
          <p className="instruction">Listen to the pronunciation and guess the brand:</p>
          <button onClick={playSound} className="play-sound-btn">
            🔊 Play Sound
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
          {feedback === 'incorrect' && <p className="feedback-text incorrect">The correct answer was {question.correctAnswer}</p>}
        </div>
      ) : (
        <p>Loading game...</p>
      )}
    </div>
  );
} 