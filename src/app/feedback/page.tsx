'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Phoneme {
  symbol: string;
  label: string;
  correct?: boolean;
}

interface TranscriptionResult {
  jobName: string;
  s3Key: string;
  transcript?: string;
  confidence?: number;
  detectedBrand?: string;
  pronunciationFeedback?: string;
  correctPhonemes?: Phoneme[];
  userPhonemes?: Phoneme[];
}

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (!dataParam) {
      setError('No data provided');
      setLoading(false);
      return;
    }

    try {
      const parsedData = JSON.parse(decodeURIComponent(dataParam));
      setResult(parsedData);
      
      // Simulate processing the transcription
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Invalid data format');
      setLoading(false);
    }
  }, [searchParams]);

  const handleBack = () => router.push('/search');
  const handleTryAgain = () => router.push('/search');

  if (loading) {
    return (
      <div className="feedback-page">
        <button className="back-btn" onClick={handleBack}>←</button>
        <div className="loading-container">
          <h1>Processing Your Speech...</h1>
          <div className="loading-spinner"></div>
          <p>Analyzing pronunciation and detecting car brand...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-page">
        <button className="back-btn" onClick={handleBack}>←</button>
        <div className="error-container">
          <h1>Error</h1>
          <p>{error}</p>
          <button onClick={handleTryAgain}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <button className="back-btn" onClick={handleBack}>←</button>
      <h1 className="page-title">Pronunciation Feedback</h1>

      <div className="feedback-container">
        <div className="result-card">
          <h3>Transcription</h3>
          <p className="transcript">{result?.transcript || "Processing..."}</p>
          {result?.confidence && (
            <p className="confidence">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
          )}
        </div>

        {result?.detectedBrand && (
          <div className="result-card">
            <h3>Detected Brand</h3>
            <p className="brand">{result.detectedBrand}</p>
          </div>
        )}

        {result?.pronunciationFeedback && (
          <div className="result-card">
            <h3>Pronunciation Tips</h3>
            <p className="feedback">{result.pronunciationFeedback}</p>
          </div>
        )}

        {result?.correctPhonemes && result?.userPhonemes && (
          <div className="result-card">
            <h3>Pronunciation Analysis</h3>
            <div className="phoneme-row">
              <div>
                <strong>Correct:</strong>
                <span className="phoneme-seq">
                  {result.correctPhonemes.map((p, i) => (
                    <span key={i} className="phoneme">{p.symbol}</span>
                  ))}
                </span>
              </div>
              <div>
                <strong>Your Pronunciation:</strong>
                <span className="phoneme-seq">
                  {result.userPhonemes.map((p, i) => (
                    <span
                      key={i}
                      className={`phoneme ${p.correct === false ? 'incorrect' : 'correct'}`}
                      title={p.label}
                    >
                      {p.symbol}
                    </span>
                  ))}
                </span>
              </div>
            </div>
            
            {/* Pronunciation Comparison Graph */}
            <div className="pronunciation-graph">
              <h4>Phoneme-by-Phoneme Comparison</h4>
              <div className="graph-container">
                {result.correctPhonemes.map((correctP, i) => {
                  const userP = result.userPhonemes?.[i];
                  const isCorrect = userP && userP.symbol === correctP.symbol;
                  const confidence = isCorrect ? 0.95 : 0.3; // Mock confidence scores
                  
                  return (
                    <div key={i} className="phoneme-comparison">
                      <div className="phoneme-labels">
                        <span className="correct-phoneme">{correctP.symbol}</span>
                        <span className="vs">vs</span>
                        <span className={`user-phoneme ${isCorrect ? 'correct' : 'incorrect'}`}>
                          {userP?.symbol || '?'}
                        </span>
                      </div>
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ 
                            width: `${confidence * 100}%`,
                            backgroundColor: isCorrect ? '#4ade80' : '#f87171'
                          }}
                        ></div>
                      </div>
                      <div className="confidence-score">
                        {Math.round(confidence * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall Score */}
            <div className="overall-score">
              <h4>Overall Pronunciation Score</h4>
              <div className="score-circle">
                <span className="score-number">
                  {Math.round(
                    (result.userPhonemes?.filter(p => p.correct !== false).length || 0) / 
                    (result.correctPhonemes?.length || 1) * 100
                  )}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button onClick={handleTryAgain} className="try-again-btn">
            Try Another Brand
          </button>
        </div>
      </div>

      <style jsx>{`
        .feedback-page {
          height: 100vh;
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

        .loading-container, .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .feedback-container {
          margin-top: 3rem;
          width: 100%;
          max-width: 800px;
        }

        .result-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .result-card h3 {
          margin-bottom: 1rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .transcript {
          font-size: 1.2rem;
          font-weight: 500;
          color: #ffcc00;
        }

        .confidence {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.5rem;
        }

        .brand {
          font-size: 1.5rem;
          font-weight: 600;
          color: #4ade80;
        }

        .feedback {
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .try-again-btn {
          background: white;
          color: black;
          font-weight: 600;
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .try-again-btn:hover {
          background: #f0f0f0;
          transform: scale(1.03);
        }

        @media (max-width: 768px) {
          .result-card {
            padding: 1.5rem;
          }
        }

        .phoneme-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .phoneme-seq {
          margin-left: 0.5rem;
        }
        .phoneme {
          display: inline-block;
          font-size: 1.3rem;
          font-weight: bold;
          margin: 0 0.3rem;
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.12);
        }
        .phoneme.correct {
          background: #4ade80;
          color: #222;
        }
        .phoneme.incorrect {
          background: #f87171;
          color: #fff;
        }
        .pronunciation-graph {
          margin-top: 1.5rem;
        }
        .graph-container {
          display: flex;
          gap: 1rem;
        }
        .phoneme-comparison {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .phoneme-labels {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .correct-phoneme {
          font-size: 1.2rem;
          font-weight: 500;
          margin-right: 0.5rem;
        }
        .vs {
          margin: 0 0.5rem;
        }
        .user-phoneme {
          font-size: 1.2rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }
        .confidence-bar {
          width: 100%;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          overflow: hidden;
        }
        .confidence-fill {
          height: 100%;
          background-color: #f87171;
        }
        .confidence-score {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .overall-score {
          margin-top: 1.5rem;
          text-align: center;
        }
        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .score-number {
          font-size: 1.5rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
} 