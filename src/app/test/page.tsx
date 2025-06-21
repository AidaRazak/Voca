'use client';

import { useRouter } from 'next/navigation';

export default function TestPage() {
  const router = useRouter();

  const testSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    alert('Speech recognition is supported!');
  };

  const testMicrophone = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => alert('Microphone access granted!'))
      .catch(() => alert('Microphone access denied.'));
  };

  const testEnvironmentVariables = () => {
    const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    if (!lambdaUrl || lambdaUrl === 'YOUR_LAMBDA_FUNCTION_URL_HERE') {
      alert('Lambda URL not configured. Please set NEXT_PUBLIC_LAMBDA_FUNCTION_URL in your .env file.');
    } else {
      alert(`Lambda URL is configured: ${lambdaUrl.substring(0, 50)}...`);
    }
  };

  return (
    <div className="test-page">
      <button className="back-btn" onClick={() => router.push('/search')}>←</button>
      <h1 className="page-title">Test Page</h1>

      <div className="test-container">
        <div className="test-card">
          <h3>Browser Tests</h3>
          <button onClick={testSpeechRecognition}>Test Speech Recognition</button>
          <button onClick={testMicrophone}>Test Microphone</button>
          <button onClick={testEnvironmentVariables}>Test Environment Variables</button>
        </div>

        <div className="test-card">
          <h3>Navigation Tests</h3>
          <button onClick={() => router.push('/search')}>Go to Search</button>
          <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
          <button onClick={() => router.push('/streak')}>Go to Streak</button>
        </div>

        <div className="test-card">
          <h3>Environment Info</h3>
          <p>Node Environment: {process.env.NODE_ENV}</p>
          <p>Lambda URL Set: {process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL ? 'Yes' : 'No'}</p>
          <p>Firebase Project: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
        </div>
      </div>

      <style jsx>{`
        .test-page {
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

        .test-container {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
          max-width: 600px;
        }

        .test-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .test-card h3 {
          margin-bottom: 1rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .test-card button {
          background: white;
          color: black;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
          width: 100%;
          max-width: 300px;
        }

        .test-card button:hover {
          background: #f0f0f0;
          transform: scale(1.03);
        }

        .test-card p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
} 