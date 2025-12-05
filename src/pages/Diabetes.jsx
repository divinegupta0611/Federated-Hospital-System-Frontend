// Diabetes.jsx
import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import '../styles/DiseaseCSS.css';

const Diabetes = () => {
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    hypertension: '',
    heartDisease: '',
    smokingHistory: '',
    bmi: '',
    hba1cLevel: '',
    bloodGlucoseLevel: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const modelAccuracy = 0.84375;

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
    if (!formData.gender || !formData.age || !formData.hypertension || 
        !formData.heartDisease || !formData.smokingHistory || 
        !formData.bmi || !formData.hba1cLevel || !formData.bloodGlucoseLevel) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      // Send data to Django backend
      const response = await fetch('http://localhost:8000/api/predict/diabetes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gender: formData.gender,
          age: parseFloat(formData.age),
          hypertension: parseInt(formData.hypertension),
          heart_disease: parseInt(formData.heartDisease),
          smoking_history: formData.smokingHistory,
          bmi: parseFloat(formData.bmi),
          hba1c_level: parseFloat(formData.hba1cLevel),
          blood_glucose_level: parseFloat(formData.bloodGlucoseLevel)
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
      gender: '',
      age: '',
      hypertension: '',
      heartDisease: '',
      smokingHistory: '',
      bmi: '',
      hba1cLevel: '',
      bloodGlucoseLevel: ''
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
          <div className="disease-icon">🩺</div>
          <h1 className="disease-title">Diabetes Detection</h1>
          <div className="accuracy-badge">
            <span className="accuracy-label">Model Accuracy:</span>
            <span className="accuracy-value">{(modelAccuracy * 100).toFixed(2)}%</span>
          </div>
          <p className="disease-description">
            Enter your health parameters below to predict the likelihood of diabetes using our AI-powered model.
          </p>
        </div>

        {/* Form Section */}
        <div className="disease-content">
          <div className="prediction-form-wrapper">
            <h2 className="form-section-title">Patient Information</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="prediction-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter age"
                    min="0"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hypertension *</label>
                  <select
                    name="hypertension"
                    value={formData.hypertension}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="0">No (0)</option>
                    <option value="1">Yes (1)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Heart Disease *</label>
                  <select
                    name="heartDisease"
                    value={formData.heartDisease}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="0">No (0)</option>
                    <option value="1">Yes (1)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Smoking History *</label>
                  <select
                    name="smokingHistory"
                    value={formData.smokingHistory}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Smoking History</option>
                    <option value="never">Never</option>
                    <option value="current">Current</option>
                    <option value="former">Former</option>
                    <option value="No Info">No Info</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">BMI (Body Mass Index) *</label>
                  <input
                    type="number"
                    name="bmi"
                    value={formData.bmi}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter BMI"
                    step="0.01"
                    min="10"
                    max="60"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">HbA1c Level *</label>
                  <input
                    type="number"
                    name="hba1cLevel"
                    value={formData.hba1cLevel}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter HbA1c level"
                    step="0.1"
                    min="3"
                    max="15"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Glucose Level (mg/dL) *</label>
                  <input
                    type="number"
                    name="bloodGlucoseLevel"
                    value={formData.bloodGlucoseLevel}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter blood glucose level"
                    step="1"
                    min="50"
                    max="400"
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
                    ? 'High Risk of Diabetes Detected' 
                    : 'Low Risk of Diabetes'}
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

export default Diabetes;