'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { brandsData } from './gamedata';

const brandNames = Object.keys(brandsData);

type Question = {
  brand: string;
  options: string[];
  correctAnswer: string;
};

export default function PhonemeChallenge({ onScoreUpdate }: { onScoreUpdate: (newScore: number) => void }) {
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
    const correctAnswer = brandsData[randomBrandName].phonemes;

    const incorrectOptions = new Set<string>();
    while (incorrectOptions.size < 2) {
      const randomIncorrect = brandNames[Math.floor(Math.random() * brandNames.length)];
      if (randomIncorrect !== randomBrandName) {
        incorrectOptions.add(brandsData[randomIncorrect].phonemes);
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
          <p className="instruction">Which is the correct phoneme sequence for:</p>
          <h2 className="brand-name">{question.brand}</h2>
          <div className="options-container">
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