import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import '../styles/DiseaseCSS.css';

const Parkinsson = () => {
  const [formData, setFormData] = useState({
    mdvpFo: '',
    mdvpFhi: '',
    mdvpFlo: '',
    mdvpJitterPercent: '',
    mdvpJitterAbs: '',
    mdvpRAP: '',
    mdvpPPQ: '',
    jitterDDP: '',
    mdvpShimmer: '',
    mdvpShimmerDb: '',
    shimmerAPQ3: '',
    shimmerAPQ5: '',
    mdvpAPQ: '',
    shimmerDDA: '',
    nhr: '',
    hnr: '',
    rpde: '',
    dfa: '',
    spread1: '',
    spread2: '',
    d2: '',
    ppe: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const modelAccuracy = 0.9230769230769231;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validation
    const allFieldsFilled = Object.values(formData).every(value => value !== '');
    if (!allFieldsFilled) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      // Send data to Django backend
      const response = await fetch('http://localhost:8000/api/predict/parkinson/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mdvp_fo: parseFloat(formData.mdvpFo),
          mdvp_fhi: parseFloat(formData.mdvpFhi),
          mdvp_flo: parseFloat(formData.mdvpFlo),
          mdvp_jitter_percent: parseFloat(formData.mdvpJitterPercent),
          mdvp_jitter_abs: parseFloat(formData.mdvpJitterAbs),
          mdvp_rap: parseFloat(formData.mdvpRAP),
          mdvp_ppq: parseFloat(formData.mdvpPPQ),
          jitter_ddp: parseFloat(formData.jitterDDP),
          mdvp_shimmer: parseFloat(formData.mdvpShimmer),
          mdvp_shimmer_db: parseFloat(formData.mdvpShimmerDb),
          shimmer_apq3: parseFloat(formData.shimmerAPQ3),
          shimmer_apq5: parseFloat(formData.shimmerAPQ5),
          mdvp_apq: parseFloat(formData.mdvpAPQ),
          shimmer_dda: parseFloat(formData.shimmerDDA),
          nhr: parseFloat(formData.nhr),
          hnr: parseFloat(formData.hnr),
          rpde: parseFloat(formData.rpde),
          dfa: parseFloat(formData.dfa),
          spread1: parseFloat(formData.spread1),
          spread2: parseFloat(formData.spread2),
          d2: parseFloat(formData.d2),
          ppe: parseFloat(formData.ppe)
        })
      });

      if (!response.ok) {
        throw new Error('Prediction failed. Please try again.');
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      mdvpFo: '',
      mdvpFhi: '',
      mdvpFlo: '',
      mdvpJitterPercent: '',
      mdvpJitterAbs: '',
      mdvpRAP: '',
      mdvpPPQ: '',
      jitterDDP: '',
      mdvpShimmer: '',
      mdvpShimmerDb: '',
      shimmerAPQ3: '',
      shimmerAPQ5: '',
      mdvpAPQ: '',
      shimmerDDA: '',
      nhr: '',
      hnr: '',
      rpde: '',
      dfa: '',
      spread1: '',
      spread2: '',
      d2: '',
      ppe: ''
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="disease-page">
      <NavBar />
      
      <div className="disease-container">
        {/* Header Section */}
        <div className="disease-header">
          <div className="disease-icon">🧠</div>
          <h1 className="disease-title">Parkinson Disease Detection</h1>
          <div className="accuracy-badge">
            <span className="accuracy-label">Model Accuracy:</span>
            <span className="accuracy-value">{(modelAccuracy * 100).toFixed(2)}%</span>
          </div>
          <p className="disease-description">
            Enter vocal measurement parameters below to predict the likelihood of Parkinson's disease using our AI-powered model.
          </p>
        </div>

        {/* Form Section */}
        <div className="disease-content">
          <div className="prediction-form-wrapper">
            <h2 className="form-section-title">Vocal Measurement Parameters</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="prediction-form">
              {/* Fundamental Frequency Measures */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">MDVP:Fo(Hz) - Average Vocal Frequency *</label>
                  <input
                    type="number"
                    name="mdvpFo"
                    value={formData.mdvpFo}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 119.992"
                    step="0.001"
                    min="80"
                    max="300"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MDVP:Fhi(Hz) - Maximum Vocal Frequency *</label>
                  <input
                    type="number"
                    name="mdvpFhi"
                    value={formData.mdvpFhi}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 157.302"
                    step="0.001"
                    min="100"
                    max="600"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">MDVP:Flo(Hz) - Minimum Vocal Frequency *</label>
                  <input
                    type="number"
                    name="mdvpFlo"
                    value={formData.mdvpFlo}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 74.997"
                    step="0.001"
                    min="60"
                    max="250"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MDVP:Jitter(%) - Pitch Variation *</label>
                  <input
                    type="number"
                    name="mdvpJitterPercent"
                    value={formData.mdvpJitterPercent}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.00784"
                    step="0.00001"
                    min="0"
                    max="1"
                    required
                  />
                </div>
              </div>

              {/* Jitter Measures */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">MDVP:Jitter(Abs) - Absolute Jitter *</label>
                  <input
                    type="number"
                    name="mdvpJitterAbs"
                    value={formData.mdvpJitterAbs}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.00007"
                    step="0.0000001"
                    min="0"
                    max="0.001"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MDVP:RAP - Relative Average Perturbation *</label>
                  <input
                    type="number"
                    name="mdvpRAP"
                    value={formData.mdvpRAP}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.00370"
                    step="0.00001"
                    min="0"
                    max="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">MDVP:PPQ - Pitch Period Perturbation *</label>
                  <input
                    type="number"
                    name="mdvpPPQ"
                    value={formData.mdvpPPQ}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.00554"
                    step="0.00001"
                    min="0"
                    max="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jitter:DDP - Average Absolute Jitter *</label>
                  <input
                    type="number"
                    name="jitterDDP"
                    value={formData.jitterDDP}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.01109"
                    step="0.00001"
                    min="0"
                    max="0.5"
                    required
                  />
                </div>
              </div>

              {/* Shimmer Measures */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">MDVP:Shimmer - Amplitude Variation *</label>
                  <input
                    type="number"
                    name="mdvpShimmer"
                    value={formData.mdvpShimmer}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.04374"
                    step="0.00001"
                    min="0"
                    max="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MDVP:Shimmer(dB) - Shimmer in Decibels *</label>
                  <input
                    type="number"
                    name="mdvpShimmerDb"
                    value={formData.mdvpShimmerDb}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.426"
                    step="0.001"
                    min="0"
                    max="5"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Shimmer:APQ3 - 3-point APQ *</label>
                  <input
                    type="number"
                    name="shimmerAPQ3"
                    value={formData.shimmerAPQ3}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.02182"
                    step="0.00001"
                    min="0"
                    max="0.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Shimmer:APQ5 - 5-point APQ *</label>
                  <input
                    type="number"
                    name="shimmerAPQ5"
                    value={formData.shimmerAPQ5}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.03130"
                    step="0.00001"
                    min="0"
                    max="0.5"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">MDVP:APQ - Amplitude Perturbation Quotient *</label>
                  <input
                    type="number"
                    name="mdvpAPQ"
                    value={formData.mdvpAPQ}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.02971"
                    step="0.00001"
                    min="0"
                    max="0.5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Shimmer:DDA - Average Absolute Shimmer *</label>
                  <input
                    type="number"
                    name="shimmerDDA"
                    value={formData.shimmerDDA}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.06545"
                    step="0.00001"
                    min="0"
                    max="1"
                    required
                  />
                </div>
              </div>

              {/* Harmonic/Noise Ratios */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">NHR - Noise to Tonal Ratio *</label>
                  <input
                    type="number"
                    name="nhr"
                    value={formData.nhr}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.02211"
                    step="0.00001"
                    min="0"
                    max="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HNR - Harmonic to Noise Ratio *</label>
                  <input
                    type="number"
                    name="hnr"
                    value={formData.hnr}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 21.033"
                    step="0.001"
                    min="0"
                    max="40"
                    required
                  />
                </div>
              </div>

              {/* Nonlinear Measures */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">RPDE - Recurrence Period Density Entropy *</label>
                  <input
                    type="number"
                    name="rpde"
                    value={formData.rpde}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.414783"
                    step="0.000001"
                    min="0"
                    max="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">DFA - Signal Fractal Scaling Exponent *</label>
                  <input
                    type="number"
                    name="dfa"
                    value={formData.dfa}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.815285"
                    step="0.000001"
                    min="0"
                    max="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">spread1 - Nonlinear Frequency Measure 1 *</label>
                  <input
                    type="number"
                    name="spread1"
                    value={formData.spread1}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., -4.813031"
                    step="0.000001"
                    min="-10"
                    max="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">spread2 - Nonlinear Frequency Measure 2 *</label>
                  <input
                    type="number"
                    name="spread2"
                    value={formData.spread2}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.266482"
                    step="0.000001"
                    min="0"
                    max="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">D2 - Correlation Dimension *</label>
                  <input
                    type="number"
                    name="d2"
                    value={formData.d2}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 2.301442"
                    step="0.000001"
                    min="0"
                    max="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PPE - Pitch Period Entropy *</label>
                  <input
                    type="number"
                    name="ppe"
                    value={formData.ppe}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 0.284654"
                    step="0.000001"
                    min="0"
                    max="1"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={handleSubmit}
                  className="btn btn-predict"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Predicting...
                    </>
                  ) : (
                    <>
                      🔍 Predict
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-reset"
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="result-section">
              <div className={`result-card ${result.prediction === 1 ? 'positive' : 'negative'}`}>
                <div className="result-icon">
                  {result.prediction === 1 ? '⚠️' : '✅'}
                </div>
                <h3 className="result-title">Prediction Result</h3>
                <p className="result-text">
                  {result.prediction === 1 
                    ? "High Risk of Parkinson's Disease Detected" 
                    : "Low Risk of Parkinson's Disease"}
                </p>
                {result.probability && (
                  <p className="result-probability">
                    Confidence: {(result.probability * 100).toFixed(2)}%
                  </p>
                )}
                <p className="result-disclaimer">
                  ⚕️ This is an AI prediction. Please consult a healthcare professional for proper diagnosis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Parkinsson;