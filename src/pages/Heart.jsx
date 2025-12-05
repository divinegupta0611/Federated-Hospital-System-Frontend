import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import '../styles/DiseaseCSS.css';

const HeartDisease = () => {
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    cp: '',
    trestbps: '',
    chol: '',
    fbs: '',
    restecg: '',
    thalach: '',
    exang: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const modelAccuracy = 0.9658536585365853;

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
    if (!formData.age || !formData.sex || !formData.cp || 
        !formData.trestbps || !formData.chol || !formData.fbs || 
        !formData.restecg || !formData.thalach || !formData.exang || 
        !formData.oldpeak || !formData.slope || !formData.ca || !formData.thal) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      // Send data to Django backend
      const response = await fetch('http://localhost:8000/api/predict/heart-disease/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseFloat(formData.age),
          sex: parseInt(formData.sex),
          cp: parseInt(formData.cp),
          trestbps: parseFloat(formData.trestbps),
          chol: parseFloat(formData.chol),
          fbs: parseInt(formData.fbs),
          restecg: parseInt(formData.restecg),
          thalach: parseFloat(formData.thalach),
          exang: parseInt(formData.exang),
          oldpeak: parseFloat(formData.oldpeak),
          slope: parseInt(formData.slope),
          ca: parseInt(formData.ca),
          thal: parseInt(formData.thal)
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
      age: '',
      sex: '',
      cp: '',
      trestbps: '',
      chol: '',
      fbs: '',
      restecg: '',
      thalach: '',
      exang: '',
      oldpeak: '',
      slope: '',
      ca: '',
      thal: ''
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
          <div className="disease-icon">❤️</div>
          <h1 className="disease-title">Heart Disease Detection</h1>
          <div className="accuracy-badge">
            <span className="accuracy-label">Model Accuracy:</span>
            <span className="accuracy-value">{(modelAccuracy * 100).toFixed(2)}%</span>
          </div>
          <p className="disease-description">
            Enter your health parameters below to predict the likelihood of heart disease using our AI-powered model.
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

                <div className="form-group">
                  <label className="form-label">Sex *</label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="0">Female (0)</option>
                    <option value="1">Male (1)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Chest Pain Type (CP) *</label>
                  <select
                    name="cp"
                    value={formData.cp}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Chest Pain Type</option>
                    <option value="0">Typical Angina (0)</option>
                    <option value="1">Atypical Angina (1)</option>
                    <option value="2">Non-anginal Pain (2)</option>
                    <option value="3">Asymptomatic (3)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resting Blood Pressure (mm Hg) *</label>
                  <input
                    type="number"
                    name="trestbps"
                    value={formData.trestbps}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter blood pressure"
                    min="50"
                    max="250"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cholesterol Level (mg/dl) *</label>
                  <input
                    type="number"
                    name="chol"
                    value={formData.chol}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter cholesterol level"
                    min="100"
                    max="600"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fasting Blood Sugar - 120 mg/dl *</label>
                  <select
                    name="fbs"
                    value={formData.fbs}
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
                  <label className="form-label">Resting ECG Results *</label>
                  <select
                    name="restecg"
                    value={formData.restecg}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select ECG Result</option>
                    <option value="0">Normal (0)</option>
                    <option value="1">ST-T Wave Abnormality (1)</option>
                    <option value="2">Left Ventricular Hypertrophy (2)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Heart Rate Achieved *</label>
                  <input
                    type="number"
                    name="thalach"
                    value={formData.thalach}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter max heart rate"
                    min="60"
                    max="220"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Exercise Induced Angina *</label>
                  <select
                    name="exang"
                    value={formData.exang}
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
                  <label className="form-label">ST Depression (Oldpeak) *</label>
                  <input
                    type="number"
                    name="oldpeak"
                    value={formData.oldpeak}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter ST depression"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Slope of Peak Exercise ST Segment *</label>
                  <select
                    name="slope"
                    value={formData.slope}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Slope</option>
                    <option value="0">Upsloping (0)</option>
                    <option value="1">Flat (1)</option>
                    <option value="2">Downsloping (2)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Major Vessels (CA) *</label>
                  <select
                    name="ca"
                    value={formData.ca}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Number</option>
                    <option value="0">0 Vessels (0)</option>
                    <option value="1">1 Vessel (1)</option>
                    <option value="2">2 Vessels (2)</option>
                    <option value="3">3 Vessels (3)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Thalassemia Test *</label>
                  <select
                    name="thal"
                    value={formData.thal}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Thalassemia Result</option>
                    <option value="0">Null (0)</option>
                    <option value="1">Fixed Defect (1)</option>
                    <option value="2">Normal (2)</option>
                    <option value="3">Reversible Defect (3)</option>
                  </select>
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
                    ? 'High Risk of Heart Disease Detected' 
                    : 'Low Risk of Heart Disease'}
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

export default HeartDisease;