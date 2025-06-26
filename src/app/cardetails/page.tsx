'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function CarDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [brand, setBrand] = useState<string>('');
  const [brandData, setBrandData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      const brandName = decodeURIComponent(brandParam).toLowerCase();
      setBrand(brandName);
      setLoading(true);
      setError(null);
      setBrandData(null);
      const fetchBrand = async () => {
        try {
          const docRef = doc(db, 'brands', brandName);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setBrandData(docSnap.data());
            setError(null);
          } else {
            setBrandData(null);
            setError('Brand not found in database.');
          }
        } catch (err) {
          setBrandData(null);
          setError('Error fetching brand data.');
        } finally {
          setLoading(false);
        }
      };
      fetchBrand();
    }
  }, [searchParams]);

  const handleBack = () => router.push('/search');

  if (!brand) {
    return (
      <div className="car-details-page">
        <button className="back-btn" onClick={handleBack}>←</button>
        <div className="error-container">
          <h1>No Brand Selected</h1>
          <button onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="car-details-page">
      <button className="back-btn" onClick={handleBack}>←</button>
      <h1 className="page-title">{brand.charAt(0).toUpperCase() + brand.slice(1)}</h1>

      <div className="details-container">
        <div className="brand-card">
          <h3>Brand Information</h3>
          {loading && <div className="brand-loading">Loading brand data...</div>}
          {error && <div className="brand-error">{error}</div>}
          {!loading && !error && brandData && (
            <>
              <div className="info-grid">
                {brandData.phonetics && (
                  <div className="info-item">
                    <label>Phonetics:</label>
                    <span>{brandData.phonetics}</span>
                  </div>
                )}
                {brandData.phonemes && (
                  <div className="info-item">
                    <label>Phonemes:</label>
                    <span>{brandData.phonemes}</span>
                  </div>
                )}
                {brandData.founded && (
                  <div className="info-item">
                    <label>Founded:</label>
                    <span>{brandData.founded}</span>
                  </div>
                )}
                {brandData.country && (
                  <div className="info-item">
                    <label>Country:</label>
                    <span>{brandData.country}</span>
                  </div>
                )}
              </div>
              {brandData.description && (
                <p className="description">{brandData.description}</p>
              )}
            </>
          )}
        </div>

        <div className="action-buttons">
          <button onClick={handleBack} className="back-button">
            Back to Search
          </button>
        </div>
      </div>

      <style jsx>{`
        .car-details-page {
          height: 100vh;
          background: linear-gradient(135deg, rgb(224, 226, 235) 0%,rgb(250, 250, 250) 100%);
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
          text-transform: capitalize;
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }

        .details-container {
          margin-top: 3rem;
          width: 100%;
          max-width: 800px;
        }

        .brand-card {
          background: rgba(123, 128, 228, 0.95);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .brand-card h3 {
          margin-bottom: 1.5rem;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .brand-loading {
          color: #ffe066;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .brand-error {
          color: #ff6b6b;
          background: #fff0f3;
          border-radius: 8px;
          padding: 0.7rem 1rem;
          font-weight: 500;
          font-size: 1.05rem;
          margin-bottom: 1rem;
        }
        .brand-gameclue {
          margin-top: 1.2rem;
          font-size: 1.08rem;
          color: #ffe066;
          background: #2d3250;
          border-radius: 10px;
          padding: 0.7rem 1.1rem;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.5rem;
        }

        .info-item span {
          font-size: 1.1rem;
          font-weight: 500;
          color: #ffcc00;
        }

        .description {
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .back-button {
          background: white;
          color: black;
          font-weight: 600;
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: background 0.3s ease, transform 0.2s ease;
        }

        .back-button:hover {
          background: #f0f0f0;
          transform: scale(1.03);
        }

        @media (max-width: 768px) {
          .brand-card {
            padding: 1.5rem;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 