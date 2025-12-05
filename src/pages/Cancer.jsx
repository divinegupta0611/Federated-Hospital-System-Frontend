import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import '../styles/DiseaseCSS.css';

const Cancer = () => {
  const [formData, setFormData] = useState({
    meanRadius: '',
    meanTexture: '',
    meanPerimeter: '',
    meanArea: '',
    meanSmoothness: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const modelAccuracy = 0.8947368421052632;

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
    if (!formData.meanRadius || !formData.meanTexture || !formData.meanPerimeter || 
        !formData.meanArea || !formData.meanSmoothness) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      // Send data to Django backend
      const response = await fetch('http://localhost:8000/api/predict/cancer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mean_radius: parseFloat(formData.meanRadius),
          mean_texture: parseFloat(formData.meanTexture),
          mean_perimeter: parseFloat(formData.meanPerimeter),
          mean_area: parseFloat(formData.meanArea),
          mean_smoothness: parseFloat(formData.meanSmoothness)
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
      meanRadius: '',
      meanTexture: '',
      meanPerimeter: '',
      meanArea: '',
      meanSmoothness: ''
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
          <div className="disease-icon">🎗️</div>
          <h1 className="disease-title">Breast Cancer Detection</h1>
          <div className="accuracy-badge">
            <span className="accuracy-label">Model Accuracy:</span>
            <span className="accuracy-value">{(modelAccuracy * 100).toFixed(2)}%</span>
          </div>
          <p className="disease-description">
            Enter tumor characteristics below to predict the likelihood of breast cancer using our AI-powered model.
          </p>
        </div>

        {/* Form Section */}
        <div className="disease-content">
          <div className="prediction-form-wrapper">
            <h2 className="form-section-title">Tumor Characteristics</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="prediction-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mean Radius *</label>
                  <input
                    type="number"
                    name="meanRadius"
                    value={formData.meanRadius}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter mean radius"
                    step="0.001"
                    min="5"
                    max="30"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mean Texture *</label>
                  <input
                    type="number"
                    name="meanTexture"
                    value={formData.meanTexture}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter mean texture"
                    step="0.001"
                    min="5"
                    max="40"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mean Perimeter *</label>
                  <input
                    type="number"
                    name="meanPerimeter"
                    value={formData.meanPerimeter}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter mean perimeter"
                    step="0.001"
                    min="40"
                    max="200"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mean Area *</label>
                  <input
                    type="number"
                    name="meanArea"
                    value={formData.meanArea}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter mean area"
                    step="0.001"
                    min="100"
                    max="2500"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mean Smoothness *</label>
                  <input
                    type="number"
                    name="meanSmoothness"
                    value={formData.meanSmoothness}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter mean smoothness"
                    step="0.00001"
                    min="0.05"
                    max="0.2"
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
                    ? 'High Risk of Breast Cancer Detected' 
                    : 'Low Risk of Breast Cancer'}
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

export default Cancer;