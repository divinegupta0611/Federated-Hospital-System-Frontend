import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import '../styles/DiseaseCSS.css';

const Kidney = () => {
  const [formData, setFormData] = useState({
    age: '',
    bp: '',
    sg: '',
    al: '',
    su: '',
    rbc: '',
    pc: '',
    pcc: '',
    ba: '',
    bgr: '',
    bu: '',
    sc: '',
    sod: '',
    pot: '',
    hemo: '',
    pcv: '',
    wc: '',
    rc: '',
    htn: '',
    dm: '',
    cad: '',
    appet: '',
    pe: '',
    ane: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const modelAccuracy = 0.98; // Update with your actual model accuracy

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
    if (!formData.age || !formData.bp || !formData.sg || !formData.al || !formData.su || 
        !formData.rbc || !formData.pc || !formData.pcc || !formData.ba || 
        !formData.bgr || !formData.bu || !formData.sc || !formData.sod || 
        !formData.pot || !formData.hemo || !formData.pcv || !formData.wc || 
        !formData.rc || !formData.htn || !formData.dm || !formData.cad || 
        !formData.appet || !formData.pe || !formData.ane) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      // Send data to Django backend
      const response = await fetch('http://localhost:8000/api/predict/kidney-disease/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseFloat(formData.age),
          bp: parseFloat(formData.bp),
          sg: parseFloat(formData.sg),
          al: parseInt(formData.al),
          su: parseInt(formData.su),
          rbc: formData.rbc,
          pc: formData.pc,
          pcc: formData.pcc,
          ba: formData.ba,
          bgr: parseFloat(formData.bgr),
          bu: parseFloat(formData.bu),
          sc: parseFloat(formData.sc),
          sod: parseFloat(formData.sod),
          pot: parseFloat(formData.pot),
          hemo: parseFloat(formData.hemo),
          pcv: parseFloat(formData.pcv),
          wc: parseFloat(formData.wc),
          rc: parseFloat(formData.rc),
          htn: formData.htn,
          dm: formData.dm,
          cad: formData.cad,
          appet: formData.appet,
          pe: formData.pe,
          ane: formData.ane
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
      bp: '',
      sg: '',
      al: '',
      su: '',
      rbc: '',
      pc: '',
      pcc: '',
      ba: '',
      bgr: '',
      bu: '',
      sc: '',
      sod: '',
      pot: '',
      hemo: '',
      pcv: '',
      wc: '',
      rc: '',
      htn: '',
      dm: '',
      cad: '',
      appet: '',
      pe: '',
      ane: ''
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
          <div className="disease-icon">🫘</div>
          <h1 className="disease-title">Kidney Disease Detection</h1>
          <div className="accuracy-badge">
            <span className="accuracy-label">Model Accuracy:</span>
            <span className="accuracy-value">{(modelAccuracy * 100).toFixed(2)}%</span>
          </div>
          <p className="disease-description">
            Enter your health parameters below to predict the likelihood of kidney disease using our AI-powered model.
          </p>
        </div>

        {/* Form Section */}
        <div className="disease-content">
          <div className="prediction-form-wrapper">
            <h2 className="form-section-title">Patient Information</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <div className="prediction-form">
              {/* Age & Blood Pressure */}
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
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Pressure (BP) *</label>
                  <input
                    type="number"
                    name="bp"
                    value={formData.bp}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter blood pressure"
                    min="40"
                    max="200"
                    required
                  />
                </div>
              </div>

              {/* Specific Gravity & Albumin */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Specific Gravity (SG) *</label>
                  <input
                    type="number"
                    name="sg"
                    value={formData.sg}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 1.020"
                    step="0.005"
                    min="1.005"
                    max="1.025"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Albumin (AL) *</label>
                  <select
                    name="al"
                    value={formData.al}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Albumin Level</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>

              {/* Sugar & Red Blood Cells */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sugar (SU) *</label>
                  <select
                    name="su"
                    value={formData.su}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Sugar Level</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Red Blood Cells (RBC) *</label>
                  <select
                    name="rbc"
                    value={formData.rbc}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select RBC</option>
                    <option value="abnormal">Abnormal</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>

              {/* Pus Cells & Pus Cell Clumps */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pus Cells (PC) *</label>
                  <select
                    name="pc"
                    value={formData.pc}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Pus Cells</option>
                    <option value="abnormal">Abnormal</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pus Cell Clumps (PCC) *</label>
                  <select
                    name="pcc"
                    value={formData.pcc}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select PCC</option>
                    <option value="notpresent">Not Present</option>
                    <option value="present">Present</option>
                  </select>
                </div>
              </div>

              {/* Bacteria & Blood Glucose Random */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bacteria (BA) *</label>
                  <select
                    name="ba"
                    value={formData.ba}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Bacteria</option>
                    <option value="notpresent">Not Present</option>
                    <option value="present">Present</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Glucose Random (BGR) *</label>
                  <input
                    type="number"
                    name="bgr"
                    value={formData.bgr}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter blood glucose"
                    min="50"
                    max="500"
                    required
                  />
                </div>
              </div>

              {/* Blood Urea & Serum Creatinine */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Urea (BU) *</label>
                  <input
                    type="number"
                    name="bu"
                    value={formData.bu}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter blood urea"
                    min="10"
                    max="200"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Serum Creatinine (SC) *</label>
                  <input
                    type="number"
                    name="sc"
                    value={formData.sc}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter serum creatinine"
                    min="0.5"
                    max="15"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* Sodium & Potassium */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sodium (SOD) *</label>
                  <input
                    type="number"
                    name="sod"
                    value={formData.sod}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter sodium level"
                    min="100"
                    max="170"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Potassium (POT) *</label>
                  <input
                    type="number"
                    name="pot"
                    value={formData.pot}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter potassium level"
                    min="2"
                    max="10"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* Hemoglobin & Packed Cell Volume */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hemoglobin (HEMO) *</label>
                  <input
                    type="number"
                    name="hemo"
                    value={formData.hemo}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter hemoglobin"
                    min="3"
                    max="20"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Packed Cell Volume (PCV) *</label>
                  <input
                    type="number"
                    name="pcv"
                    value={formData.pcv}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter PCV"
                    min="10"
                    max="60"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* White Blood Cell Count & Red Blood Cell Count */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">White Blood Cell Count (WC) *</label>
                  <input
                    type="number"
                    name="wc"
                    value={formData.wc}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter WBC count"
                    min="2000"
                    max="30000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Red Blood Cell Count (RC) *</label>
                  <input
                    type="number"
                    name="rc"
                    value={formData.rc}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter RBC count"
                    min="2"
                    max="8"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              {/* Hypertension & Diabetes Mellitus */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hypertension (HTN) *</label>
                  <select
                    name="htn"
                    value={formData.htn}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Diabetes Mellitus (DM) *</label>
                  <select
                    name="dm"
                    value={formData.dm}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Coronary Artery Disease & Appetite */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Coronary Artery Disease (CAD) *</label>
                  <select
                    name="cad"
                    value={formData.cad}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Appetite (APPET) *</label>
                  <select
                    name="appet"
                    value={formData.appet}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Appetite</option>
                    <option value="good">Good</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              {/* Pedal Edema & Anemia */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pedal Edema (PE) *</label>
                  <select
                    name="pe"
                    value={formData.pe}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Anemia (ANE) *</label>
                  <select
                    name="ane"
                    value={formData.ane}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Option</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
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
                    ? 'High Risk of Kidney Disease Detected' 
                    : 'Low Risk of Kidney Disease'}
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

export default Kidney;