'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

// Helper icons
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>;
const CrossIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"></path></svg>;

interface Phoneme {
  symbol: string;
  label?: string;
  correct?: boolean;
  brandDescription?: string;
}

interface TranscriptionResult {
  transcript?: string;
  detectedBrand?: string;
  pronunciationFeedback?: string;
  correctPhonemes?: Phoneme[];
  userPhonemes?: Phoneme[];
  accuracy?: number;
  brandFound?: boolean;
  message?: string;
  waveform?: number[];
  correctPronunciation?: string;
}

const WaveformVisualizer = ({ waveformData }: { waveformData: number[] }) => {
  if (!waveformData || waveformData.length === 0) {
    return <div className="waveform-placeholder">No audio data to display</div>;
  }
  const maxVal = Math.max(...waveformData);
  return (
    <div className="waveform-container">
      {waveformData.map((val, i) => (
        <div 
          key={i} 
          className="waveform-bar"
          style={{ height: `${(val / maxVal) * 100}%` }}
        />
      ))}
    </div>
  );
};

const FeedbackDisplay = ({ result, onTryAgain }: { result: TranscriptionResult, onTryAgain: () => void }) => {
  if (!result) return null;

  const incorrectPhonemes = result.userPhonemes
    ?.map((userP, i) => ({ ...userP, correctSymbol: result.correctPhonemes?.[i]?.symbol }))
    .filter(p => !p.correct && p.correctSymbol) || [];

  const getAiSummary = () => {
    const accuracy = result.accuracy || 0;
    if (accuracy >= 95) return "Exceptional work! Your pronunciation is nearly perfect. A model for others to follow.";
    if (accuracy > 80) return `Great job! You have a strong grasp of the pronunciation. A little refinement on the highlighted sounds will make it perfect.`;
    if (accuracy > 60) return "A good attempt. You have the basics down, but some key sounds are off. Focus on the tips below to see a big improvement.";
    return "There's room for improvement. Let's break down the sounds and work on them one by one. You can do this!";
  }

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h2>Pronunciation Report</h2>
        {result.brandFound && <p>Results for "<strong>{result.detectedBrand}</strong>"</p>}
      </div>

      {!result.brandFound ? (
        <div className="grid-item centered-card">
          <h3>Brand Not Found</h3>
          <p>Your transcription: "<em>{result.transcript}</em>"</p>
          <p className="feedback">{result.message || 'We could not identify the car brand you mentioned.'}</p>
        </div>
      ) : (
        <div className="feedback-grid">
          <div className="grid-item score-card">
            <h3>Overall Score</h3>
            <div className="score-circle">
              <span className="score-number">{result.accuracy || 0}<span className="percent-sign">%</span></span>
            </div>
            <p className="ai-summary">
              <strong>AI Coach:</strong> "{getAiSummary()}"
            </p>
          </div>
          
          <div className="grid-item analysis-card">
            <h3>Phoneme Breakdown</h3>
            <p className="description">Comparing your sounds to the correct pronunciation.</p>
            <div className="phoneme-breakdown-table">
              <div className="breakdown-header">
                <span>Expected</span>
                <span></span>
                <span>You Said</span>
              </div>
              <div className="breakdown-body">
                {result.correctPhonemes?.map((correctP, i) => {
                  const userP = result.userPhonemes?.[i];
                  const isCorrect = userP?.correct ?? false;
                  return(
                    <div className="breakdown-row" key={i}>
                       <span className="phoneme-cell correct">
                        {correctP.symbol}
                       </span>
                       <span className={`phoneme-cell symbol ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? <CheckIcon/> : <CrossIcon/>}
                       </span>
                       <span className={`phoneme-cell user ${!isCorrect ? 'incorrect' : ''}`}>
                        {userP?.symbol || '?'}
                       </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="grid-item tips-card">
            <h3><LightbulbIcon/> Improvement Tips</h3>
            {incorrectPhonemes.length > 0 ? (
              <ul className="tips-list">
              {incorrectPhonemes.map((p, i) => (
                <li key={i}>
                  You said <span className="phoneme incorrect">{p.symbol}</span> instead of <strong>{p.correctSymbol}</strong>. Focus on the correct tongue and lip placement for this sound.
                </li>
              ))}
            </ul>
            ) : (
              <p className="perfect-score-message">
                ✨ Excellent work! Your pronunciation was perfect. Keep practicing!
              </p>
            )}
          </div>

          <div className="grid-item waveform-card">
            <h3>Your Voice Waveform</h3>
            <WaveformVisualizer waveformData={result.waveform || []} />
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button onClick={onTryAgain} className="try-again-btn">
          Try Another Brand
        </button>
      </div>
    </div>
  );
};

export default function SearchPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<TranscriptionResult | null>(null);

  const handleBack = () => router.push('/dashboard');

  const searchCar = async (brand: string) => {
    const trimmed = brand.trim().toLowerCase();
    if (!trimmed) return alert('Please enter a car brand name.');
    try {
      const docRef = doc(db, 'brands', trimmed);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        router.push(`/cardetails?brand=${encodeURIComponent(trimmed)}`);
      } else {
        alert('Brand not found in database.');
      }
    } catch (err) {
      console.error('Error fetching from Firestore:', err);
      alert('Something went wrong.');
    }
  };

  const activateMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition is not supported.');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    setIsListening(true);
    recognition.start();

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchValue(transcript.trim());
      setIsListening(false);
      searchCar(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Mic failed. Try again.');
    };
  };

  const recordAndSendToAI = () => {
    const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    if (!lambdaUrl) {
      alert('Lambda function URL not configured. Please set NEXT_PUBLIC_LAMBDA_FUNCTION_URL in your environment variables.');
      return;
    }

    let mediaRecorder: MediaRecorder;
    let chunks: Blob[] = [];

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) return alert('Audio conversion failed.');

          try {
            const res = await fetch(lambdaUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ audioData: base64Audio, contentType: 'audio/webm' }),
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const initialResult = await res.json();
            if (initialResult.error) throw new Error(initialResult.error);
            
            const { jobName } = initialResult;
            if (!jobName) throw new Error('Did not receive a jobName from the server.');

            setIsProcessing(true);

            const pollForResult = async () => {
              try {
                const pollRes = await fetch(`${lambdaUrl}?jobName=${jobName}`, {
                  method: 'GET',
                  headers: { Accept: 'application/json' },
                });

                if (!pollRes.ok) throw new Error(`Polling failed with status: ${pollRes.status}`);

                const pollResult = await pollRes.json();
                
                if (pollResult.status === 'COMPLETED') {
                  const correctPhonemes = pollResult.correctPronunciation
                    ?.split(/[-\s\/]/)
                    .map((p: string) => ({ symbol: p.trim() }))
                    .filter((p: Phoneme) => p.symbol) || [];

                  const processedResult: TranscriptionResult = {
                    ...pollResult,
                    correctPhonemes: correctPhonemes,
                    userPhonemes: pollResult.phonemes,
                  };
                  
                  setFeedbackResult(processedResult);
                  setIsProcessing(false);
                } else if (pollResult.status === 'FAILED') {
                  throw new Error(`Transcription failed: ${pollResult.error || 'Unknown reason'}`);
                } else {
                  setTimeout(pollForResult, 3000);
                }
              } catch (pollErr) {
                setIsProcessing(false);
                console.error('Polling error', pollErr);
                alert(`Error during processing: ${pollErr instanceof Error ? pollErr.message : 'Something went wrong.'}`);
              }
            };
            
            setTimeout(pollForResult, 3000);

          } catch (err) {
            setIsProcessing(false);
            console.error('Upload error', err);
            alert(`Error: ${err instanceof Error ? err.message : 'Something went wrong.'}`);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 3000);
    }).catch((err) => {
      console.error('Microphone access error:', err);
      alert('Microphone access denied. Please allow microphone access and try again.');
    });
  };

  const handleTryAgain = () => {
    setFeedbackResult(null);
  };

  return (
    <div className="search-page">
      <button className="back-btn" onClick={handleBack}>←</button>
      <button className="streak-btn" onClick={() => router.push('/streak')}>🔥</button>
      
      {feedbackResult ? (
        <FeedbackDisplay result={feedbackResult} onTryAgain={handleTryAgain} />
      ) : (
        <>
          <h1 className="page-title">Voca</h1>
          <div className="card-container">
            <div className="card">
              <h3>Say Brand</h3>
              <button onClick={activateMic} disabled={isListening}>
                {isListening ? 'Listening...' : 'Start Talking'}
              </button>
            </div>

            <div className="card highlight">
              <h3>Say Brand with AI Feedback</h3>
              <button onClick={recordAndSendToAI} disabled={isRecording || isProcessing}>
                {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : 'Record Now'}
              </button>
              <p className="note">Records 3 seconds of audio</p>
            </div>

            <div className="card">
              <h3>Type Brand</h3>
              <input
                type="text"
                placeholder="e.g. Tesla"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button onClick={() => searchCar(searchValue)}>Search</button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          font-family: 'Segoe UI', sans-serif;
          color: white;
          transition: all 0.5s ease;
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
          margin-bottom: 2rem;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .card-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
          max-width: 700px;
        }

        .card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .card h3 {
          margin-bottom: 1rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .card input {
          padding: 0.6rem 1rem;
          border-radius: 12px;
          border: none;
          margin-bottom: 1rem;
          width: 100%;
          max-width: 300px;
        }

        .card button {
          background: white;
          color: black;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .card button:hover:not(:disabled) {
          background: #f0f0f0;
          transform: scale(1.03);
        }

        .card button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .highlight {
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.12);
        }

        .note {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.5rem;
          text-align: center;
        }

        .streak-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.08);
          color: #ffcc00;
          font-weight: bold;
          font-size: 1.2rem;
          border: none;
          border-radius: 50%;
          padding: 0.6rem 0.8rem;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .streak-btn:hover {
          transform: scale(1.05);
          background: rgba(255, 255, 255, 0.15);
        }

        .feedback-container {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 950px;
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .feedback-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .feedback-header h2 {
          font-size: 2.2rem;
          font-weight: 700;
        }
        
        .feedback-header p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: capitalize;
        }

        .feedback-grid {
          display: grid;
          grid-template-columns: 2fr 3fr;
          grid-template-rows: auto auto;
          grid-template-areas:
            "score analysis"
            "tips waveform";
          gap: 1.5rem;
        }

        .score-card { grid-area: score; }
        .analysis-card { grid-area: analysis; }
        .tips-card { grid-area: tips; }
        .waveform-card { grid-area: waveform; }

        .grid-item {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(15px);
          padding: 1.5rem 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.18);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .grid-item h3 {
          margin-bottom: 1.5rem;
          font-weight: 600;
          font-size: 1.2rem;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .centered-card {
          text-align: center;
          grid-column: 1 / -1;
        }
        
        .score-circle {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          margin: 1rem auto;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.2) 100%);
          border: 4px solid white;
          box-shadow: 0 0 15px rgba(255,255,255,0.3);
        }
        
        .score-number {
          font-size: 4rem;
          font-weight: bold;
        }

        .percent-sign {
          font-size: 1.5rem;
          opacity: 0.7;
          margin-left: 4px;
        }

        .ai-summary {
          font-size: 0.95rem;
          margin-top: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          font-style: italic;
          background-color: rgba(0,0,0,0.1);
          padding: 1rem;
          border-radius: 10px;
        }

        .analysis-card .description {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
          margin-top: -1rem;
          margin-bottom: 1rem;
        }

        .phoneme-breakdown-table {
          margin-top: 1rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .breakdown-header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          font-weight: bold;
          padding: 0 1rem;
          margin-bottom: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
        }

        .breakdown-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
          max-height: 250px;
        }

        .breakdown-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 0.75rem 0.5rem;
          border-radius: 10px;
          transition: background-color 0.2s;
        }

        .breakdown-row:hover {
          background-color: rgba(0,0,0,0.3);
        }

        .phoneme-cell {
          font-family: monospace;
          font-size: 1.2rem;
        }

        .phoneme-cell.user.incorrect {
          color: #f87171;
          text-decoration: line-through;
        }
        
        .phoneme-cell.symbol { font-size: 1.2rem; }
        .phoneme-cell.symbol.correct { color: #4ade80; }
        .phoneme-cell.symbol.incorrect { color: #f87171; }
        
        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tips-list li {
          background-color: rgba(0,0,0,0.15);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border-left: 3px solid #facc15;
          font-size: 0.95rem;
        }
        
        .tips-list .phoneme.incorrect {
          padding: 0.1rem 0.4rem;
          display: inline-block;
          border-radius: 4px;
          font-family: monospace;
          text-decoration: none;
          background-color: #c62828;
          color: white;
        }
        
        .perfect-score-message {
          text-align: center;
          font-size: 1.1rem;
          color: #4ade80;
        }

        .waveform-container {
          flex-grow: 1;
          min-height: 100px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 2px;
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
          padding: 10px;
        }

        .waveform-bar {
          flex-grow: 1;
          background-color: #a78bfa;
          width: 3px;
          border-radius: 2px;
          animation: wave-anim 0.8s ease-in-out alternate;
          transform-origin: bottom;
        }
        
        .waveform-placeholder {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
          flex-grow: 1;
        }

        @keyframes wave-anim {
          from { transform: scaleY(0.1); }
          to { transform: scaleY(1); }
        }
        
        .action-buttons {
          margin-top: 1rem;
          text-align: center;
        }
        
        .try-again-btn {
          background: white;
          color: black;
          font-weight: 600;
          padding: 0.8rem 2.5rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          font-size: 1rem;
        }
        
        .try-again-btn:hover {
          background: #f0f0f0;
          transform: scale(1.03);
        }

        @media (max-width: 950px) {
          .feedback-grid {
            grid-template-columns: 1fr;
            grid-template-areas:
              "score"
              "analysis"
              "waveform"
              "tips";
          }
        }

        @media (max-width: 768px) {
          .card, .grid-item {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
} 