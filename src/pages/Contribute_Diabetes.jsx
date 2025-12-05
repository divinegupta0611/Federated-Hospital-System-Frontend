import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { validateDiabetesData } from '../utils/dataValidation';
import { trainDiabetesModel } from '../services/federatedTraining';
import '../styles/ContributeDiabetesCSS.css';

const Contribute_Diabetes = () => {
  const [file, setFile] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [dataPreview, setDataPreview] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [epochs, setEpochs] = useState(10);
  const [uploadStatus, setUploadStatus] = useState('');
  const [trainingMetrics, setTrainingMetrics] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);

  // Capture console logs
    const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { message, type, timestamp }]);
    };

    // Clear logs
    const clearLogs = () => {
    setConsoleLogs([]);
    };

    React.useEffect(() => {
  // Capture console.log
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    originalLog(...args);
    addLog(args.join(' '), 'info');
  };

  console.error = (...args) => {
    originalError(...args);
    addLog(args.join(' '), 'error');
  };

  console.warn = (...args) => {
    originalWarn(...args);
    addLog(args.join(' '), 'warning');
  };

  // Cleanup on unmount
  return () => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  };
}, []);
  const requiredColumns = [
    'gender', 'age', 'hypertension', 'heart_disease', 
    'smoking_history', 'bmi', 'HbA1c_level', 
    'blood_glucose_level', 'diabetes'
  ];

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    
    if (!uploadedFile) return;

    // Check file type
    if (!uploadedFile.name.endsWith('.csv')) {
      setUploadStatus('error');
      setValidationStatus({
        isValid: false,
        message: 'Please upload a CSV file only'
      });
      return;
    }

    setFile(uploadedFile);
    setUploadStatus('processing');
    
    // Read and validate file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const validation = validateDiabetesData(text, requiredColumns);
      
      setValidationStatus(validation);
      if (validation.isValid) {
        setDataPreview(validation.preview);
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleStartTraining = async () => {
  if (!validationStatus?.isValid) return;

  console.log("🔥 Starting training...");
  setIsTraining(true);
  setTrainingProgress(0);

  const reader = new FileReader();
  reader.onload = async (e) => {
    const csvData = e.target.result;

    try {
  await trainDiabetesModel(csvData, epochs, (p, logs) => {  // ← ADD logs HERE
    console.log("📊 Progress:", p + "%");
    setTrainingProgress(p);
    
    // Store training metrics
    if (logs) {
      setTrainingMetrics({
        loss: logs.loss,
        acc: logs.acc,
        val_loss: logs.val_loss,
        val_acc: logs.val_acc
      });
    }
  });

      alert("Training completed!");
    } catch (err) {
      console.error("❌ Training error:", err);
      alert(`Training failed: ${err.message}`); // More informative
        setTrainingProgress(0); // Reset progress
        setTrainingMetrics(null); // Clear metrics
            }

    setIsTraining(false);
  };

  reader.readAsText(file);
};


  return (
    <div className="contribute-page">
      <NavBar />
      {/* Console Toggle Button */}
<div className="console-toggle">
  <button 
    onClick={() => setShowConsole(!showConsole)}
    className="toggle-console-btn"
  >
    {showConsole ? '📕 Hide Console' : '📗 Show Console Logs'}
  </button>
  {consoleLogs.length > 0 && (
    <button onClick={clearLogs} className="clear-console-btn">
      🗑️ Clear Logs
    </button>
  )}
</div>
      <div className="contribute-container">
        {/* Header Section */}
        <div className="contribute-header">
          <h1>Contribute to Diabetes Detection Model</h1>
          <p className="subtitle">Help improve our AI model by contributing your hospital's data</p>
        </div>

        {/* Guidelines Section */}
        <div className="guidelines-section">
          <h2>📋 Dataset Requirements</h2>
          <div className="guidelines-grid">
            <div className="guideline-card">
              <span className="guideline-icon">📄</span>
              <h3>File Format</h3>
              <p>CSV file only</p>
            </div>
            
            <div className="guideline-card">
              <span className="guideline-icon">📊</span>
              <h3>Minimum Rows</h3>
              <p>At least 200 records</p>
            </div>
            
            <div className="guideline-card">
              <span className="guideline-icon">🔒</span>
              <h3>Privacy</h3>
              <p>Data stays in your browser</p>
            </div>
            
            <div className="guideline-card">
              <span className="guideline-icon">⚡</span>
              <h3>Training</h3>
              <p>Minimum 10 epochs</p>
            </div>
          </div>

          {/* Required Columns */}
          <div className="required-columns">
            <h3>Required Columns (in exact order):</h3>
            <div className="columns-list">
              {requiredColumns.map((col, index) => (
                <span key={index} className="column-badge">{col}</span>
              ))}
            </div>
          </div>

          {/* Sample Format */}
          <div className="sample-format">
            <h3>📝 Sample Data Format:</h3>
            <div className="sample-table">
              <table>
                <thead>
                  <tr>
                    <th>gender</th>
                    <th>age</th>
                    <th>hypertension</th>
                    <th>heart_disease</th>
                    <th>smoking_history</th>
                    <th>bmi</th>
                    <th>HbA1c_level</th>
                    <th>blood_glucose_level</th>
                    <th>diabetes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Female</td>
                    <td>80</td>
                    <td>0</td>
                    <td>1</td>
                    <td>never</td>
                    <td>25.19</td>
                    <td>6.6</td>
                    <td>140</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>Male</td>
                    <td>28</td>
                    <td>0</td>
                    <td>0</td>
                    <td>never</td>
                    <td>27.32</td>
                    <td>5.7</td>
                    <td>158</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="privacy-box">
            <h3>🔒 Privacy Guarantee</h3>
            <ul>
              <li>✅ Your data NEVER leaves your computer</li>
              <li>✅ Training happens locally in your browser</li>
              <li>✅ Only encrypted model weights are sent to server</li>
              <li>✅ We cannot reconstruct your patient data</li>
            </ul>
          </div>
        </div>

        {/* Upload Section */}
        <div className="upload-section">
          <h2>📤 Upload Your Dataset</h2>
          
          <div className="upload-box">
            <input 
              type="file" 
              id="file-upload" 
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isTraining}
            />
            <label htmlFor="file-upload" className="upload-label">
              <span className="upload-icon">📁</span>
              <span>{file ? file.name : 'Choose CSV File'}</span>
            </label>
          </div>

          {/* Validation Status */}
          {validationStatus && (
            <div className={`validation-status ${uploadStatus}`}>
              <span className="status-icon">
                {uploadStatus === 'success' ? '✅' : '❌'}
              </span>
              <div className="status-content">
                <h4>{validationStatus.isValid ? 'Validation Passed!' : 'Validation Failed'}</h4>
                <p>{validationStatus.message}</p>
                {validationStatus.details && (
                  <ul className="validation-details">
                    <li>Rows: {validationStatus.details.rowCount}</li>
                    <li>Columns: {validationStatus.details.columnCount}</li>
                    {validationStatus.details.missingColumns?.length > 0 && (
                      <li className="error-text">
                        Missing columns: {validationStatus.details.missingColumns.join(', ')}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Data Preview */}
          {dataPreview.length > 0 && (
            <div className="data-preview">
              <h3>Preview (First 5 rows):</h3>
              <div className="preview-table-container">
                <table>
                  <thead>
                    <tr>
                      {requiredColumns.map(col => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, idx) => (
                      <tr key={idx}>
                        {requiredColumns.map(col => (
                          <td key={col}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Training Configuration */}
        {validationStatus?.isValid && (
          <div className="training-section">
            <h2>⚙️ Training Configuration</h2>
            
            <div className="config-box">
              <label htmlFor="epochs">Number of Epochs (minimum 10):</label>
              <input 
                type="number" 
                id="epochs"
                min="10"
                max="100"
                value={epochs}
                onChange={(e) => setEpochs(Math.max(10, parseInt(e.target.value) || 10))}
                disabled={isTraining}
              />
              <span className="epoch-info">Current: {epochs} epochs</span>
            </div>

            <button 
              className="start-training-btn"
              onClick={handleStartTraining}
              disabled={!validationStatus?.isValid || isTraining}
            >
              {isTraining ? 'Training in Progress...' : 'Start Local Training'}
            </button>

            {/* Training Progress */}
            {isTraining && (
            <div className="training-progress">
                <h3>Training Progress</h3>
                <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{width: `${trainingProgress}%`}}
                ></div>
                </div>
                <p className="progress-text">{trainingProgress}% Complete</p>
                
                {/* Add this section */}
                {trainingMetrics && (
                <div className="metrics-display">
                    <p>Loss: {trainingMetrics.loss?.toFixed(4) || 'N/A'}</p>
                    <p>Accuracy: {trainingMetrics.acc?.toFixed(4) || 'N/A'}</p>
                    {trainingMetrics.val_loss && <p>Val Loss: {trainingMetrics.val_loss.toFixed(4)}</p>}
                    {trainingMetrics.val_acc && <p>Val Accuracy: {trainingMetrics.val_acc.toFixed(4)}</p>}
                </div>
                )}
                
                <p className="training-info">
                🔒 Training locally in your browser... Your data is safe!
                </p>
            </div>
            )}
          </div>
        )}
      </div>
            
        {/* Live Console Display */}
{showConsole && (
  <div className="console-display">
    <div className="console-header">
      <h3>🖥️ Training Console Logs</h3>
      <span className="log-count">{consoleLogs.length} logs</span>
    </div>
    <div className="console-body">
      {consoleLogs.length === 0 ? (
        <p className="no-logs">No logs yet. Start training to see logs.</p>
      ) : (
        consoleLogs.map((log, idx) => (
          <div key={idx} className={`console-line ${log.type}`}>
            <span className="timestamp">[{log.timestamp}]</span>
            <span className="log-message">{log.message}</span>
          </div>
        ))
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default Contribute_Diabetes;