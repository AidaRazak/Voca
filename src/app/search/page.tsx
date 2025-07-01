'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useAuth } from '../auth-context';
import { updateUserStreak } from '../utils/streakUtils';
import levenshtein from 'fast-levenshtein';
import brandsData from '../data/brands.json';

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
  referenceWaveform?: number[];
  suggestions?: string[];
  brandDescription?: string;
  brandLogo?: string;
  brandCountry?: string;
  brandFounded?: string;
  brandImages?: string[];
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

// Helper: Normalize brand name for matching
function normalizeBrand(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Helper: Fuzzy match to suggest closest brand(s)
function getClosestBrands(input: string, allBrands: string[], maxDistance = 3): string[] {
  const normInput = normalizeBrand(input);
  let best: string[] = [];
  let minDist = Infinity;
  for (const brand of allBrands) {
    const dist = levenshtein.get(normInput, normalizeBrand(brand));
    if (dist < minDist) {
      minDist = dist;
      best = [brand];
    } else if (dist === minDist) {
      best.push(brand);
    }
  }
  return minDist <= maxDistance ? best : [];
}

const FeedbackDisplay = ({ result, onTryAgain, audioUrl }: { result: TranscriptionResult, onTryAgain: () => void, audioUrl?: string }) => {
  if (!result) return null;

  const incorrectPhonemes = result.userPhonemes
    ?.map((userP, i) => ({ ...userP, correctSymbol: result.correctPhonemes?.[i]?.symbol }))
    .filter(p => !p.correct && p.correctSymbol) || [];

  const hasPhonemeData = Array.isArray(result.userPhonemes) && result.userPhonemes.length > 0;
  const hasWaveformData = Array.isArray(result.waveform) && result.waveform.length > 0;
  const accuracy = typeof result.accuracy === 'number' ? result.accuracy : 0;

  const getAiSummary = () => {
    if (!hasPhonemeData || accuracy === 0) return "We couldn't analyze your pronunciation. Please try again with a clearer recording.";
    if (accuracy >= 95) return "Exceptional work! Your pronunciation is nearly perfect. A model for others to follow.";
    if (accuracy > 80) return `Great job! You have a strong grasp of the pronunciation. A little refinement on the highlighted sounds will make it perfect.`;
    if (accuracy > 60) return "A good attempt. You have the basics down, but some key sounds are off. Focus on the tips below to see a big improvement.";
    return "There's room for improvement. Let's break down the sounds and work on them one by one. You can do this!";
  };

  // Mock: For demo, create a fake reference waveform if not present
  const referenceWaveform = result.referenceWaveform || (result.waveform && result.waveform.map((v, i) => (i % 2 === 0 ? v : Math.max(1, v - 10))));

  const suggestions = result.suggestions || [];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-2 tracking-tight">Pronunciation Report</h2>
        {result.brandFound && <p className="text-lg text-navy-700">Results for <span className="font-semibold">{result.detectedBrand}</span></p>}
        {result.transcript && (
          <div className="transcript-box" style={{ margin: '1rem 0', background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
            <strong>Transcript:</strong> <span style={{ fontStyle: 'italic' }}>{result.transcript}</span>
          </div>
        )}
        {typeof audioUrl === 'string' && (
          <div style={{ margin: '1rem 0' }}>
            <audio controls src={audioUrl} />
            <div style={{ fontSize: '0.9rem', color: '#555' }}>Your recording</div>
          </div>
        )}
      </div>

      {/* Brand Not Found */}
      {!result.brandFound ? (
        <div className="bg-white/90 rounded-2xl shadow-lg p-8 space-y-4">
          <h3 className="text-xl font-bold text-red-600">Brand Not Found</h3>
          <p className="text-gray-700">Your transcription: <span className="italic">{result.transcript}</span></p>
          <p className="text-red-500 font-semibold">{result.message || 'We could not identify the car brand you mentioned.'}</p>
          {suggestions.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 shadow-inner">
              <p className="font-semibold text-yellow-800 mb-2">Did you mean:</p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => <li key={i} className="bg-yellow-200 rounded px-2 py-1 font-bold text-yellow-900">{s}</li>)}
              </ul>
            </div>
          )}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Your Pronunciation Waveform</h3>
            <div className="bg-slate-100 rounded-xl p-4">
              <WaveformVisualizer waveformData={result.waveform || []} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white/90 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-navy-900 mb-6 text-center">Overall Score</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-blue-300 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-extrabold text-white drop-shadow-lg">{accuracy}<span className="text-xl align-super">%</span></span>
                </div>
              </div>
              <div className="text-center max-w-2xl">
                <div className="text-base italic text-navy-700 bg-blue-50 rounded-lg px-4 py-3 shadow-inner">
                  <span className="font-bold text-blue-700">AI Coach:</span> {getAiSummary()}
                </div>
              </div>
            </div>
          </div>

          {/* Phoneme Breakdown Card */}
          <div className="bg-white/90 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-navy-900 mb-4">Phoneme Breakdown</h3>
            <p className="text-gray-600 mb-6">Comparing your sounds to the correct pronunciation.</p>
            {!hasPhonemeData ? (
              <div className="text-red-500 font-semibold">No phoneme data available.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-4 py-3 text-left text-navy-800 text-base font-semibold rounded-l-xl">Expected</th>
                      <th className="px-4 py-3 text-center text-navy-800 text-base font-semibold">   </th>
                      <th className="px-4 py-3 text-right text-navy-800 text-base font-semibold rounded-r-xl">You Said</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.correctPhonemes?.map((correctP, i) => {
                      const userP = result.userPhonemes?.[i];
                      const isCorrect = userP?.correct ?? false;
                      return (
                        <tr key={i} className="bg-white/70 hover:bg-blue-50 transition-all">
                          <td className="px-4 py-3 font-mono text-lg text-blue-900 font-bold rounded-l-xl">{correctP.symbol}</td>
                          <td className="px-4 py-3 text-center">
                            {isCorrect ? <span className="text-green-500 text-2xl">✅</span> : <span className="text-red-500 text-2xl">❌</span>}
                          </td>
                          <td className={`px-4 py-3 font-mono text-lg font-bold rounded-r-xl ${!isCorrect ? 'text-red-600 line-through' : 'text-blue-900'}`}>{userP?.symbol || '?'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Improvement Tips Card */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <LightbulbIcon />
              <h3 className="text-2xl font-bold text-yellow-700">Improvement Tips</h3>
            </div>
            {(!hasPhonemeData || accuracy === 0) ? (
              <p className="text-red-500 font-semibold">No feedback available. Please try again with a clearer recording.</p>
            ) : incorrectPhonemes.length > 0 ? (
              <ul className="space-y-3">
                {incorrectPhonemes.map((p, i) => (
                  <li key={i} className="bg-yellow-100 rounded-lg px-4 py-3 text-yellow-900 shadow-sm">
                    You said <span className="font-mono font-bold text-red-600">{p.symbol}</span> instead of <span className="font-bold text-blue-700">{p.correctSymbol}</span>. Focus on the correct tongue and lip placement for this sound.
                  </li>
                ))}
              </ul>
            ) : (
              accuracy >= 95 ? (
                <p className="text-green-600 font-semibold text-lg">✨ Excellent work! Your pronunciation was perfect. Keep practicing!</p>
              ) : null
            )}
          </div>

          {/* Waveform Comparison Card */}
          <div className="bg-slate-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Waveform Comparison</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="font-semibold text-slate-200 mb-3">Reference Pronunciation</div>
                <div className="bg-slate-700 rounded-xl p-4">
                  <WaveformVisualizer waveformData={referenceWaveform || []} />
                </div>
              </div>
              <div>
                <div className="font-semibold text-slate-200 mb-3">Your Pronunciation</div>
                <div className="bg-slate-700 rounded-xl p-4">
                  <WaveformVisualizer waveformData={result.waveform || []} />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button Card */}
          <div className="bg-white/90 rounded-2xl shadow-lg p-8 text-center">
            <button
              onClick={onTryAgain}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-xl hover:scale-105 hover:from-blue-700 hover:to-blue-500 transition-all duration-300 border-2 border-blue-200"
            >
              Try Another Brand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<TranscriptionResult | null>(null);
  const [brandData, setBrandData] = useState<any>(null);
  const [brandError, setBrandError] = useState<string | null>(null);
  // Dropdown state
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(3);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Fetch all brand names on mount
  useEffect(() => {
    const fetchBrands = async () => {
      if (!db) return;
      try {
        const brandsCol = collection(db, 'brands');
        const brandsSnap = await getDocs(brandsCol);
        const names = brandsSnap.docs.map(doc => doc.id);
        setAllBrands(names);
      } catch (err) {
        // ignore for now
      }
    };
    fetchBrands();
  }, [db]);

  // Filter brands as user types
  useEffect(() => {
    if (searchValue.trim()) {
      const val = searchValue.trim().toLowerCase();
      setFilteredBrands(
        allBrands.filter(b => b.toLowerCase().includes(val)).slice(0, 8)
      );
      setDropdownVisible(true);
    } else {
      setFilteredBrands([]);
      setDropdownVisible(false);
    }
  }, [searchValue, allBrands]);

  const handleBack = () => router.push('/dashboard');

  const searchCar = async (brand: string) => {
    if (!db) return;
    const trimmed = brand.trim().toLowerCase();
    setBrandData(null);
    setBrandError(null);
    if (!trimmed) return alert('Please enter a car brand name.');
    try {
      const docRef = doc(db, 'brands', trimmed);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBrandData(docSnap.data());
        setBrandError(null);
      } else {
        setBrandData(null);
        setBrandError('Brand not found in database.');
      }
    } catch (err) {
      console.error('Error fetching from Firestore:', err);
      setBrandData(null);
      setBrandError('Something went wrong.');
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
        const localAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localAudioUrl);
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
                  processAIResult(pollResult);
                } else if (pollResult.status === 'FAILED') {
                  throw new Error(`Transcription failed: ${pollResult.error || 'Unknown reason'}`);
                } else {
                  setTimeout(pollForResult, 1000);
                }
              } catch (pollErr) {
                setIsProcessing(false);
                console.error('Polling error', pollErr);
                alert(`Error during processing: ${pollErr instanceof Error ? pollErr.message : 'Something went wrong.'}`);
              }
            };
            
            setTimeout(pollForResult, 1000);

          } catch (err) {
            setIsProcessing(false);
            console.error('Upload error', err);
            alert(`Error: ${err instanceof Error ? err.message : 'Something went wrong.'}`);
          }
        };
      };

      setCountdown(3);
      setIsRecording(true);
      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            mediaRecorder.stop();
            setIsRecording(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      mediaRecorder.start();
    }).catch((err) => {
      console.error('Microphone access error:', err);
      alert('Microphone access denied. Please allow microphone access and try again.');
    });
  };

  const handleTryAgain = () => {
    setFeedbackResult(null);
  };

  const allBrandNames = brandsData.map((b: any) => b.name);

  function processAIResult(pollResult: any) {
    const detected = pollResult.transcript || '';
    const normDetected = normalizeBrand(detected);
    let foundBrand = allBrandNames.find((b: string) => normalizeBrand(b) === normDetected);
    let suggestions: string[] = [];
    let brandDetails = null;
    if (!foundBrand) {
      // Use fuzzy matching if exact match fails
      const fuzzyMatches = getClosestBrands(detected, allBrandNames, 3);
      if (fuzzyMatches.length > 0) {
        foundBrand = fuzzyMatches[0];
        suggestions = fuzzyMatches;
      }
    }
    if (foundBrand) {
      brandDetails = brandsData.find((b: any) => b.name.toLowerCase() === foundBrand.toLowerCase());
    }
    
    const correctPhonemes = brandDetails?.phonemes
      ? brandDetails.phonemes.split(/[-\s\/]/).map((p: string) => ({ symbol: p.trim() })).filter((p: { symbol: string }) => p.symbol)
      : pollResult.correctPronunciation?.split(/[-\s\/]/).map((p: string) => ({ symbol: p.trim() })).filter((p: { symbol: string }) => p.symbol) || [];
    
    const userPhonemes = pollResult.phonemes || [];
    
    // Calculate accuracy if not provided by backend
    let accuracy = pollResult.accuracy;
    if (typeof accuracy !== 'number' && userPhonemes.length > 0 && correctPhonemes.length > 0) {
      const numCorrect = userPhonemes.filter((p: any) => p.correct).length;
      accuracy = Math.round((numCorrect / correctPhonemes.length) * 100);
    }
    
    // --- ADDED: Update user streak for admin brand history ---
    if (user && foundBrand && typeof accuracy === 'number') {
      updateUserStreak(user.uid, {
        accuracy,
        brandName: foundBrand,
        sessionType: 'practice'
      });
    }
    // --------------------------------------------------------
    
    const processedResult: TranscriptionResult = {
      ...pollResult,
      brandFound: !!foundBrand,
      detectedBrand: foundBrand || detected,
      suggestions,
      correctPhonemes,
      userPhonemes,
      accuracy,
      brandDescription: brandDetails?.description || pollResult.brandDescription,
      brandLogo: brandDetails?.logoUrl,
      brandCountry: brandDetails?.country,
      brandFounded: brandDetails?.founded,
      brandImages: brandDetails?.imageUrls,
    };
    setFeedbackResult(processedResult);
    setIsProcessing(false);
  }

  return (
    <div className="search-page">
      <button className="back-btn" onClick={handleBack}>←</button>
      <button className="streak-btn" onClick={() => router.push('/streak')}>🔥</button>
      
      {feedbackResult ? (
        <FeedbackDisplay result={feedbackResult} onTryAgain={handleTryAgain} {...(typeof audioUrl === 'string' ? { audioUrl } : {})} />
      ) : (
        <>
          {!brandData && <h1 className="page-title">Voca</h1>}
          <div className="card-container">
            {/* Combined Search Brand Card */}
            <div className="card highlight">
              <h3>Search Brand</h3>
              <button onClick={activateMic} disabled={isListening} style={{ marginBottom: '1rem' }}>
                {isListening ? 'Listening...' : 'Start Talking'}
              </button>
              <div className={`input-dropdown-wrapper${dropdownVisible && filteredBrands.length > 0 ? ' dropdown-open' : ''}`}> 
                <input
                  type="text"
                  placeholder="e.g. Tesla"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setBrandData(null);
                    setBrandError(null);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchCar(searchValue); }}
                  onFocus={() => { if (searchValue.trim()) setDropdownVisible(true); }}
                  onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
                />
                {/* Dropdown for matching brands */}
                {dropdownVisible && filteredBrands.length > 0 && (
                  <ul className="brand-dropdown">
                    {filteredBrands.map((b) => (
                      <li
                        key={b}
                        onMouseDown={async () => {
                          setSearchValue(b);
                          setDropdownVisible(false);
                          await searchCar(b);
                        }}
                      >
                        {b.charAt(0).toUpperCase() + b.slice(1)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => searchCar(searchValue)} style={{ marginTop: '1rem' }}>Search</button>
              {brandError && (
                <div className="brand-error">{brandError}</div>
              )}
              {brandData && (
                <div className="brand-details-card">
                  <div className="brand-header">
                    <h2 className="brand-title">{brandData.name || searchValue}</h2>
                  </div>
                  <div className="brand-info-row">
                    <span className="brand-label">Phonemes:</span>
                    <span className="brand-value">{brandData.phonemes || '-'}</span>
                  </div>
                  <div className="brand-info-row">
                    <span className="brand-label">Country:</span>
                    <span className="brand-value">{brandData.country || '-'}</span>
                  </div>
                  <div className="brand-info-row">
                    <button className="more-details-btn" onClick={() => router.push(`/cardetails?brand=${encodeURIComponent(brandData.name || searchValue)}`)}>
                      Click for more
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Feedback/Recording Card remains as a separate option */}
            <div className="card">
              <h3>Say Brand with AI Feedback</h3>
              <button onClick={recordAndSendToAI} disabled={isRecording || isProcessing}>
                {isRecording ? `Recording... ${countdown}` : isProcessing ? 'Processing...' : 'Record Now'}
              </button>
              <p className="note">Records 3 seconds of audio</p>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          font-family: 'Inter', 'Fira Sans', 'Avenir', 'Helvetica Neue', Arial, sans-serif;
          color: #232946;
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

        .brand-details-card {
          margin-top: 1.5rem;
          background: linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%);
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(44, 62, 80, 0.08);
          padding: 2rem 2.5rem 1.5rem 2.5rem;
          max-width: 420px;
          width: 100%;
          border: 1.5px solid #e0e7ff;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          font-family: 'Fira Sans', 'Avenir', Arial, sans-serif;
        }
        .brand-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 0.7rem;
        }
        .brand-title {
          font-size: 2.1rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          color: #232946;
          text-shadow: 0 2px 8px rgba(44,62,80,0.04);
        }
        .brand-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0;
          border-bottom: 1px dashed #d1d5db;
        }
        .brand-label {
          font-size: 1rem;
          color: #6b7280;
          font-weight: 500;
        }
        .brand-value {
          font-size: 1.08rem;
          color: #232946;
          font-weight: 600;
        }
        .brand-description {
          margin-top: 1.1rem;
          font-size: 1.08rem;
          color: #3b3b3b;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 0.9rem 1.1rem;
          font-style: italic;
        }
        .brand-error {
          margin-top: 1.2rem;
          color: #e63946;
          background: #fff0f3;
          border-radius: 8px;
          padding: 0.7rem 1rem;
          font-weight: 500;
          font-size: 1.05rem;
        }
        @media (max-width: 600px) {
          .brand-details-card {
            padding: 1.2rem 0.7rem 1.2rem 0.7rem;
          }
          .brand-title {
            font-size: 1.3rem;
          }
        }
        .input-dropdown-wrapper {
          position: relative;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .input-dropdown-wrapper input[type="text"] {
          border-radius: 12px;
          transition: border-radius 0.15s;
        }
        .input-dropdown-wrapper.dropdown-open input[type="text"] {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        .brand-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          z-index: 10;
          background: #fff;
          color: #232946;
          width: 100%;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 8px 24px rgba(44, 62, 80, 0.13);
          list-style: none;
          padding: 0.3rem 0;
          border: 1px solid #e0e7ff;
          font-family: 'Fira Sans', 'Avenir', Arial, sans-serif;
          max-height: 220px;
          overflow-y: auto;
          margin-top: 0;
          border-top: none;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
        .brand-dropdown li {
          padding: 0.7rem 1.2rem;
          cursor: pointer;
          transition: background 0.18s;
        }
        .brand-dropdown li:hover {
          background: #e0e7ff;
        }
        .card {
          position: relative;
        }
        .more-details-btn {
          margin-top: 1.2rem;
          background: #232946;
          color: #fff;
          font-weight: 600;
          padding: 0.7rem 1.7rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s, transform 0.2s;
        }
        .more-details-btn:hover {
          background: #3b3b3b;
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
} 