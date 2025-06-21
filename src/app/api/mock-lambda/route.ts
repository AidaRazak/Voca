import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioData, contentType } = body;

    if (!audioData) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock phoneme data for Tesla
    const correctPhonemes = [
      { symbol: 't', label: 'T' },
      { symbol: 'ɛ', label: 'EH' },
      { symbol: 'z', label: 'Z' },
      { symbol: 'l', label: 'L' },
      { symbol: 'ə', label: 'UH' }
    ];
    // Simulate user phonemes (some correct, some not)
    const userPhonemes = [
      { symbol: 't', label: 'T', correct: true },
      { symbol: 'ɛ', label: 'EH', correct: true },
      { symbol: 's', label: 'S', correct: false }, // should be Z
      { symbol: 'l', label: 'L', correct: true },
      { symbol: 'ə', label: 'UH', correct: true }
    ];

    // Mock response that mimics your Lambda function
    const mockResponse = {
      jobName: `transcription-${Date.now()}`,
      s3Key: `audio/unknown/transcription-${Date.now()}.webm`,
      transcript: "This is a mock transcription result",
      confidence: 0.85,
      detectedBrand: "Tesla",
      pronunciationFeedback: "Great pronunciation! 'Tesla' is pronounced as 'TEZ-luh'. You got it right!",
      correctPhonemes,
      userPhonemes
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Mock Lambda error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 