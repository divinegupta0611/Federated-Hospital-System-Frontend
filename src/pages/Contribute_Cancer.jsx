import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { validateCancerData } from '../utils/dataValidationCancer';
import { trainCancerModel } from '../services/federatedTrainingCancer';
import '../styles/ContributeDiabetesCSS.css';

const Contribute_Cancer = () => {
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
    'mean_radius', 'mean_texture', 'mean_perimeter', 
    'mean_area', 'mean_smoothness', 'diagnosis'
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
      const validation = validateCancerData(text, requiredColumns);
      
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

    console.log("🔥 Starting cancer detection training...");
    setIsTraining(true);
    setTrainingProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;

      try {
        await trainCancerModel(csvData, epochs, (p, logs) => {
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

        alert("Cancer detection training completed!");
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
          <h1>Contribute to Breast Cancer Detection Model</h1>
          <p className="subtitle">Help improve our AI model by contributing tumor cell nucleus measurements</p>
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
                    <th>mean_radius</th>
                    <th>mean_texture</th>
                    <th>mean_perimeter</th>
                    <th>mean_area</th>
                    <th>mean_smoothness</th>
                    <th>diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>17.99</td>
                    <td>10.38</td>
                    <td>122.8</td>
                    <td>1001</td>
                    <td>0.1184</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>20.57</td>
                    <td>17.77</td>
                    <td>132.9</td>
                    <td>1326</td>
                    <td>0.08474</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>19.69</td>
                    <td>21.25</td>
                    <td>130</td>
                    <td>1203</td>
                    <td>0.1096</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Description */}
          <div className="privacy-box">
            <h3>📊 Cell Nucleus Feature Descriptions</h3>
            <ul>
              <li><strong>mean_radius:</strong> Mean of distances from center to points on the perimeter</li>
              <li><strong>mean_texture:</strong> Standard deviation of gray-scale values</li>
              <li><strong>mean_perimeter:</strong> Mean size of the cell nucleus perimeter</li>
              <li><strong>mean_area:</strong> Mean area of the cell nucleus</li>
              <li><strong>mean_smoothness:</strong> Mean of local variation in radius lengths</li>
              <li><strong>diagnosis:</strong> Cancer diagnosis (0 = Benign, 1 = Malignant)</li>
            </ul>
            <div style={{marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107'}}>
              <p style={{margin: 0, fontSize: '0.9rem', color: '#856404'}}>
                <strong>ℹ️ Note:</strong> These measurements are computed from digitized images of fine needle aspirate (FNA) of breast masses. All features represent mean values of cell nucleus characteristics.
              </p>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="privacy-box">
            <h3>🔒 Privacy Guarantee</h3>
            <ul>
              <li>✅ Your patient data NEVER leaves your computer</li>
              <li>✅ Training happens locally in your browser</li>
              <li>✅ Only encrypted model weights are sent to server</li>
              <li>✅ We cannot reconstruct individual cell measurements</li>
              <li>✅ Full HIPAA compliance through local processing</li>
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
                  🔒 Training locally in your browser... Your patient data is safe!
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

export default Contribute_Cancer;
