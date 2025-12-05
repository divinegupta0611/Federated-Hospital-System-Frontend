import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { validateHeartDiseaseData } from '../utils/dataValidationHeartDisease';
import { trainHeartDiseaseModel } from '../services/federatedTrainingHeartDisease';
import '../styles/ContributeDiabetesCSS.css';

const Contribute_Heart_Disease = () => {
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
    'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 
    'restecg', 'thalach', 'exang', 'oldpeak', 
    'slope', 'ca', 'thal', 'target'
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
      const validation = validateHeartDiseaseData(text, requiredColumns);
      
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

    console.log("🔥 Starting heart disease training...");
    setIsTraining(true);
    setTrainingProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;

      try {
        await trainHeartDiseaseModel(csvData, epochs, (p, logs) => {
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

        alert("Heart disease training completed!");
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
          <h1>Contribute to Heart Disease Detection Model</h1>
          <p className="subtitle">Help improve our AI model by contributing your hospital's cardiovascular data</p>
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
              <p>At least 100 records</p>
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
                    <th>age</th>
                    <th>sex</th>
                    <th>cp</th>
                    <th>trestbps</th>
                    <th>chol</th>
                    <th>fbs</th>
                    <th>restecg</th>
                    <th>thalach</th>
                    <th>exang</th>
                    <th>oldpeak</th>
                    <th>slope</th>
                    <th>ca</th>
                    <th>thal</th>
                    <th>target</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>52</td>
                    <td>1</td>
                    <td>0</td>
                    <td>125</td>
                    <td>212</td>
                    <td>0</td>
                    <td>1</td>
                    <td>168</td>
                    <td>0</td>
                    <td>1</td>
                    <td>2</td>
                    <td>2</td>
                    <td>3</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>58</td>
                    <td>0</td>
                    <td>0</td>
                    <td>100</td>
                    <td>248</td>
                    <td>0</td>
                    <td>0</td>
                    <td>122</td>
                    <td>0</td>
                    <td>1</td>
                    <td>1</td>
                    <td>0</td>
                    <td>2</td>
                    <td>1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Description */}
          <div className="privacy-box">
            <h3>📊 Feature Descriptions</h3>
            <ul>
              <li><strong>age:</strong> Age in years</li>
              <li><strong>sex:</strong> 1 = male; 0 = female</li>
              <li><strong>cp:</strong> Chest pain type (0-3)</li>
              <li><strong>trestbps:</strong> Resting blood pressure (mm Hg)</li>
              <li><strong>chol:</strong> Serum cholesterol (mg/dl)</li>
              <li><strong>fbs:</strong> Fasting blood sugar &gt; 120 mg/dl (1 = true; 0 = false)</li>
              <li><strong>restecg:</strong> Resting ECG results (0-2)</li>
              <li><strong>thalach:</strong> Maximum heart rate achieved</li>
              <li><strong>exang:</strong> Exercise induced angina (1 = yes; 0 = no)</li>
              <li><strong>oldpeak:</strong> ST depression induced by exercise</li>
              <li><strong>slope:</strong> Slope of peak exercise ST segment (0-2)</li>
              <li><strong>ca:</strong> Number of major vessels colored by fluoroscopy (0-4)</li>
              <li><strong>thal:</strong> Thalassemia (0-3)</li>
              <li><strong>target:</strong> Heart disease (1 = yes; 0 = no)</li>
            </ul>
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

export default Contribute_Heart_Disease;