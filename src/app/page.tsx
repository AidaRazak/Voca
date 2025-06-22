'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { useEffect } from 'react';

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

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Master Car Brand Pronunciation with AI
          </h1>
          <p className="hero-subtitle">
            Learn to pronounce car brands correctly with our advanced AI-powered pronunciation trainer. 
            Get instant feedback, track your progress, and compete with friends in our gamified learning experience.
          </p>
          <div className="hero-buttons">
            <button onClick={handleGetStarted} className="cta-button primary">
              Get Started
            </button>
            <button onClick={handleExploreMore} className="cta-button secondary">
              Explore More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-icon">🎤</div>
            <h3>AI Voice Analysis</h3>
            <p>Get instant pronunciation feedback</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Voca?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>AI-Powered Feedback</h3>
            <p>Get detailed phoneme-by-phoneme analysis with confidence scores and improvement tips.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Gamified Learning</h3>
            <p>Three exciting game modes: Phoneme Challenge, Listen & Guess, and AI Pronunciation Showdown.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Track your daily streaks, accuracy improvements, and brands learned with detailed analytics.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Streak System</h3>
            <p>Build momentum with our streak tracking system and stay motivated with daily practice.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful UI</h3>
            <p>Enjoy a modern, intuitive interface designed for the best learning experience.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Practice anywhere with our mobile-friendly design that works on all devices.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your account and start your pronunciation journey</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Practice</h3>
            <p>Record your pronunciation and get instant AI feedback</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Play Games</h3>
            <p>Test your knowledge in our fun educational games</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track Progress</h3>
            <p>Monitor your improvement with detailed analytics</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Master Car Brand Pronunciation?</h2>
          <p>Join thousands of users who are already improving their pronunciation skills</p>
          <button onClick={handleGetStarted} className="cta-button primary large">
            Start Learning Now
          </button>
        </div>
      </section>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Segoe UI', sans-serif;
        }

        .hero-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 80vh;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cta-button {
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .cta-button.primary {
          background: white;
          color: #764ba2;
        }

        .cta-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .cta-button.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .cta-button.large {
          padding: 1.25rem 3rem;
          font-size: 1.25rem;
        }

        .hero-visual {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .floating-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .floating-card h3 {
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }

        .floating-card p {
          opacity: 0.8;
        }

        .features-section {
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.05);
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .feature-card p {
          opacity: 0.8;
          line-height: 1.6;
        }

        .how-it-works-section {
          padding: 4rem 2rem;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .step {
          text-align: center;
          padding: 2rem;
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 1rem;
        }

        .step h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .step p {
          opacity: 0.8;
          line-height: 1.6;
        }

        .cta-section {
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .cta-content p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .hero-section {
            flex-direction: column;
            text-align: center;
            padding: 2rem 1rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-buttons {
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .steps-container {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
} 