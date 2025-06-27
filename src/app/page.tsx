'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGetStarted = () => {
    router.push('/signup');
  };

  const handleExploreMore = () => {
    router.push('/signup');
  };

  const steps = [
    {
      icon: '📝',
      title: 'Sign Up',
      desc: 'Create your account and start your pronunciation journey',
    },
    {
      icon: '🎤',
      title: 'Practice',
      desc: 'Record your pronunciation and get instant AI feedback',
    },
    {
      icon: '🎮',
      title: 'Play Games',
      desc: 'Test your knowledge in our fun educational games',
    },
    {
      icon: '📈',
      title: 'Track Progress',
      desc: 'Monitor your improvement with detailed analytics',
    },
  ];

  return (
    <div className="font-jakarta relative overflow-x-hidden">
      {/* Fun floating shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/30 rounded-full blur-3xl z-0 animate-pulse-slow" style={{ filter: 'blur(80px)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/20 rounded-full blur-2xl z-0 animate-pulse-slow" style={{ filter: 'blur(60px)' }} />

      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-8 py-6 bg-white/80 backdrop-blur-md shadow-md z-10 relative">
        <span className="text-2xl font-playfair font-bold text-black tracking-tight">Voca</span>
        <button onClick={handleGetStarted} className="px-2 py-2 rounded-full bg-gold/80 text-black font-semibold text-base shadow-lg hover:scale-105 transition backdrop-blur-md">Get Started</button>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex flex-col justify-center items-center bg-black/90 text-white px-4 relative z-10"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h1 className="text-6xl md:text-7xl font-playfair font-bold mb-8 text-gold text-center drop-shadow-lg">Master Car Brand Pronunciation</h1>
        <p className="text-2xl md:text-3xl font-jakarta mb-10 max-w-2xl text-center text-white/90">The modern, intuitive way to learn and perfect your pronunciation of car brands. Powered by AI, designed for everyone.</p>
        <button onClick={handleGetStarted} className="px-10 py-4 rounded-full bg-gold/90 text-black font-bold text-xl shadow-2xl hover:scale-105 transition mb-8 backdrop-blur-md">Start Practicing</button>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-24 bg-white/80 backdrop-blur-md text-black w-full relative z-10"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-12 text-center">Why Choose Voca?</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center px-6">
            <span className="text-4xl mb-4">🎯</span>
            <h3 className="text-2xl font-playfair font-semibold mb-2">AI-Powered Feedback</h3>
            <p className="text-lg text-gray-700">Get detailed phoneme-by-phoneme analysis with confidence scores and improvement tips.</p>
          </div>
          <div className="flex flex-col items-center text-center px-6">
            <span className="text-4xl mb-4">🎮</span>
            <h3 className="text-2xl font-playfair font-semibold mb-2">Gamified Learning</h3>
            <p className="text-lg text-gray-700">Three exciting game modes: Phoneme Challenge, Listen & Guess, and AI Pronunciation Showdown.</p>
          </div>
          <div className="flex flex-col items-center text-center px-6">
            <span className="text-4xl mb-4">📊</span>
            <h3 className="text-2xl font-playfair font-semibold mb-2">Progress Tracking</h3>
            <p className="text-lg text-gray-700">Track your daily streaks, accuracy improvements, and brands learned with detailed analytics.</p>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section - Glassmorphic, Fun, Modern */}
      <motion.section
        className="py-24 bg-offwhite/80 backdrop-blur-md text-black w-full relative z-10"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-16 text-center">How It Works</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {steps.map((step, i) => (
            <div
              key={i}
              className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-3xl shadow-2xl p-10 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-3xl relative overflow-hidden"
              style={{ minHeight: 240 }}
            >
              <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-3xl font-bold mb-4 shadow-lg animate-bounce-slow">{step.icon}</div>
              <h3 className="text-2xl font-playfair font-bold mb-2 text-black drop-shadow">{step.title}</h3>
              <p className="text-lg text-gray-700 text-center font-jakarta">{step.desc}</p>
              {/* Fun floating accent */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gold/20 rounded-full blur-2xl z-0" />
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-24 bg-gold/90 text-black w-full flex flex-col items-center justify-center relative z-10"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6 text-center">Ready to Master Car Brand Pronunciation?</h2>
        <p className="text-xl md:text-2xl font-jakarta mb-10 max-w-2xl text-center">Join thousands of users who are already improving their pronunciation skills</p>
        <button onClick={handleGetStarted} className="px-10 py-4 rounded-full bg-black/90 text-gold font-bold text-xl shadow-2xl hover:scale-105 transition backdrop-blur-md">Start Learning Now</button>
      </motion.section>
    </div>
  );
} 