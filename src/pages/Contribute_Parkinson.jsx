import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { validateParkinsonData } from '../utils/dataValidationParkinson';
import { trainParkinsonModel } from '../services/federatedTrainingParkinson';
import '../styles/ContributeDiabetesCSS.css';

const Contribute_Parkinson = () => {
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

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const requiredColumns = [
    'MDVP:Fo(Hz)', 'MDVP:Fhi(Hz)', 'MDVP:Flo(Hz)', 'MDVP:Jitter(%)', 
    'MDVP:Jitter(Abs)', 'MDVP:RAP', 'MDVP:PPQ', 'Jitter:DDP', 
    'MDVP:Shimmer', 'MDVP:Shimmer(dB)', 'Shimmer:APQ3', 'Shimmer:APQ5', 
    'MDVP:APQ', 'Shimmer:DDA', 'NHR', 'HNR', 'status', 'RPDE', 
    'DFA', 'spread1', 'spread2', 'D2', 'PPE'
  ];

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    
    if (!uploadedFile) return;

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
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const validation = validateParkinsonData(text, requiredColumns);
      
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

    console.log("🔥 Starting Parkinson's disease training...");
    setIsTraining(true);
    setTrainingProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;

      try {
        await trainParkinsonModel(csvData, epochs, (p, logs) => {
          console.log("📊 Progress:", p + "%");
          setTrainingProgress(p);
          
          if (logs) {
            setTrainingMetrics({
              loss: logs.loss,
              acc: logs.acc,
              val_loss: logs.val_loss,
              val_acc: logs.val_acc
            });
          }
        });

        alert("Parkinson's disease training completed!");
      } catch (err) {
        console.error("❌ Training error:", err);
        alert(`Training failed: ${err.message}`);
        setTrainingProgress(0);
        setTrainingMetrics(null);
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
          <h1>Contribute to Parkinson's Disease Detection Model</h1>
          <p className="subtitle">Help improve our AI model by contributing voice measurement data</p>
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
              <p>At least 50 records</p>
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
            <h3>Required Columns (23 voice measurements + status):</h3>
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
                    <th>MDVP:Fo(Hz)</th>
                    <th>MDVP:Fhi(Hz)</th>
                    <th>MDVP:Flo(Hz)</th>
                    <th>MDVP:Jitter(%)</th>
                    <th>NHR</th>
                    <th>HNR</th>
                    <th>RPDE</th>
                    <th>DFA</th>
                    <th>status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>119.992</td>
                    <td>157.302</td>
                    <td>74.997</td>
                    <td>0.00784</td>
                    <td>0.02211</td>
                    <td>21.033</td>
                    <td>0.414783</td>
                    <td>0.815285</td>
                    <td>1</td>
                  </tr>
                  <tr>
                    <td>122.4</td>
                    <td>148.65</td>
                    <td>113.819</td>
                    <td>0.00968</td>
                    <td>0.01929</td>
                    <td>19.085</td>
                    <td>0.458359</td>
                    <td>0.819521</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{fontSize: '0.85rem', color: '#666', marginTop: '10px'}}>
              * Table shows 9 of 23 columns. Full dataset requires all voice measurements.
            </p>
          </div>

          {/* Feature Description */}
          <div className="privacy-box">
            <h3>📊 Voice Feature Categories (23 measurements)</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px'}}>
              <div>
                <strong>🎵 Frequency Measures:</strong>
                <ul style={{fontSize: '0.85rem'}}>
                  <li><strong>MDVP:Fo(Hz):</strong> Average vocal fundamental frequency</li>
                  <li><strong>MDVP:Fhi(Hz):</strong> Maximum vocal fundamental frequency</li>
                  <li><strong>MDVP:Flo(Hz):</strong> Minimum vocal fundamental frequency</li>
                </ul>
              </div>
              <div>
                <strong>📊 Jitter Measures:</strong>
                <ul style={{fontSize: '0.85rem'}}>
                  <li><strong>MDVP:Jitter(%):</strong> Frequency variation percentage</li>
                  <li><strong>MDVP:Jitter(Abs):</strong> Absolute jitter</li>
                  <li><strong>MDVP:RAP:</strong> Relative amplitude perturbation</li>
                  <li><strong>MDVP:PPQ:</strong> Five-point period perturbation quotient</li>
                  <li><strong>Jitter:DDP:</strong> Average absolute difference</li>
                </ul>
              </div>
              <div>
                <strong>🔊 Shimmer Measures:</strong>
                <ul style={{fontSize: '0.85rem'}}>
                  <li><strong>MDVP:Shimmer:</strong> Amplitude variation</li>
                  <li><strong>MDVP:Shimmer(dB):</strong> Shimmer in dB</li>
                  <li><strong>Shimmer:APQ3:</strong> 3-point amplitude perturbation</li>
                  <li><strong>Shimmer:APQ5:</strong> 5-point amplitude perturbation</li>
                  <li><strong>MDVP:APQ:</strong> 11-point amplitude perturbation</li>
                  <li><strong>Shimmer:DDA:</strong> Average absolute difference</li>
                </ul>
              </div>
              <div>
                <strong>🎙️ Harmonic & Noise Measures:</strong>
                <ul style={{fontSize: '0.85rem'}}>
                  <li><strong>NHR:</strong> Noise-to-harmonics ratio</li>
                  <li><strong>HNR:</strong> Harmonics-to-noise ratio</li>
                </ul>
              </div>
              <div>
                <strong>🔬 Nonlinear Measures:</strong>
                <ul style={{fontSize: '0.85rem'}}>
                  <li><strong>RPDE:</strong> Recurrence period density entropy</li>
                  <li><strong>DFA:</strong> Detrended fluctuation analysis</li>
                  <li><strong>spread1:</strong> Nonlinear fundamental frequency</li>
                  <li><strong>spread2:</strong> Nonlinear fundamental frequency</li>
                  <li><strong>D2:</strong> Correlation dimension</li>
                  <li><strong>PPE:</strong> Pitch period entropy</li>
                </ul>
              </div>
              <div>
                <strong>🎯 Target Variable:</strong>
                <ul style={{fontSize: '0.85rem'}}>
                  <li><strong>status:</strong> Health status (1 = Parkinson's, 0 = Healthy)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="privacy-box">
            <h3>🔒 Privacy Guarantee</h3>
            <ul>
              <li>✅ Your voice measurement data NEVER leaves your computer</li>
              <li>✅ Training happens locally in your browser</li>
              <li>✅ Only encrypted model weights are sent to server</li>
              <li>✅ We cannot reconstruct patient voice patterns</li>
              <li>✅ All 23 acoustic features are processed securely</li>
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
              <h3>Preview (First 5 rows, showing key features):</h3>
              <div className="preview-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>MDVP:Fo(Hz)</th>
                      <th>MDVP:Jitter(%)</th>
                      <th>MDVP:Shimmer</th>
                      <th>NHR</th>
                      <th>HNR</th>
                      <th>RPDE</th>
                      <th>DFA</th>
                      <th>status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row['MDVP:Fo(Hz)']}</td>
                        <td>{row['MDVP:Jitter(%)']}</td>
                        <td>{row['MDVP:Shimmer']}</td>
                        <td>{row['NHR']}</td>
                        <td>{row['HNR']}</td>
                        <td>{row['RPDE']}</td>
                        <td>{row['DFA']}</td>
                        <td>{row['status']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{fontSize: '0.85rem', color: '#666', marginTop: '10px'}}>
                * Preview shows 8 of 23 columns for readability
              </p>
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
                
                {trainingMetrics && (
                  <div className="metrics-display">
                    <p>Loss: {trainingMetrics.loss?.toFixed(4) || 'N/A'}</p>
                    <p>Accuracy: {trainingMetrics.acc?.toFixed(4) || 'N/A'}</p>
                    {trainingMetrics.val_loss && <p>Val Loss: {trainingMetrics.val_loss.toFixed(4)}</p>}
                    {trainingMetrics.val_acc && <p>Val Accuracy: {trainingMetrics.val_acc.toFixed(4)}</p>}
                  </div>
                )}
                
                <p className="training-info">
                  🔒 Training locally in your browser... Your voice data is safe!
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

export default Contribute_Parkinson;