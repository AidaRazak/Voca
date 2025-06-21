'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';

export default function SearchPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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
            // Use the mock Lambda API route for testing
            const res = await fetch('/api/mock-lambda', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({ audioData: base64Audio, contentType: 'audio/webm' }),
            });

            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Response is not JSON');
            }

            const result = await res.json();
            if (result.error) throw new Error(result.error);
            if (result.jobName && result.s3Key) {
              router.push(`/feedback?data=${encodeURIComponent(JSON.stringify(result))}`);
            } else {
              alert('Invalid server response');
            }
          } catch (err) {
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

  return (
    <div className="search-page">
      <button className="back-btn" onClick={handleBack}>←</button>
      <button className="streak-btn" onClick={() => router.push('/streak')}>🔥</button>
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
          <button onClick={recordAndSendToAI} disabled={isRecording}>
            {isRecording ? 'Recording...' : 'Record Now'}
          </button>
          <p className="note">Records 3 seconds of audio (Mock API)</p>
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

      <style jsx>{`
        .search-page {
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
          margin-top: 4rem;
          letter-spacing: 0.5px;
        }

        .card-container {
          margin-top: 3rem;
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

        @media (max-width: 768px) {
          .card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
} 