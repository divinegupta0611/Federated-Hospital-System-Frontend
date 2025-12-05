import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import '../styles/AboutCSS.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Model Metrics Data
  const modelMetrics = {
    diabetes: {
      name: "Diabetes Detection",
      accuracy: 84.38,
      precision: 34.90,
      recall: 96.88,
      f1_score: 51.32,
      roc_auc: 97.75,
      threshold: 0.1,
      samples: 100000
    },
    kidney: {
      name: "Kidney Disease Detection",
      accuracy: 97.50,
      precision: 100.00,
      recall: 93.33,
      f1_score: 96.55,
      roc_auc: null,
      samples: 20000
    },
    parkinson: {
      name: "Parkinson's Disease Detection",
      accuracy: 92.31,
      precision: 93.33,
      recall: 96.55,
      f1_score: 94.92,
      roc_auc: 97.59,
      samples: 7500
    },
    heart: {
      name: "Heart Disease Detection",
      accuracy: 96.59,
      precision: 93.75,
      recall: 100.00,
      f1_score: 96.77,
      roc_auc: 100.00,
      threshold: 0.1,
      samples: 11224
    },
    cancer: {
      name: "Breast Cancer Detection",
      accuracy: 89.47,
      precision: 95.45,
      recall: 87.50,
      f1_score: 91.30,
      roc_auc: 96.51,
      samples: 1346
    }
  };

  // Prepare data for charts
  const accuracyData = Object.keys(modelMetrics).map(key => ({
    name: modelMetrics[key].name.split(' ')[0],
    accuracy: modelMetrics[key].accuracy,
    precision: modelMetrics[key].precision,
    recall: modelMetrics[key].recall,
    f1_score: modelMetrics[key].f1_score
  }));

  const radarData = Object.keys(modelMetrics).map(key => ({
    subject: modelMetrics[key].name.split(' ')[0],
    Accuracy: modelMetrics[key].accuracy,
    Precision: modelMetrics[key].precision,
    Recall: modelMetrics[key].recall,
    F1: modelMetrics[key].f1_score,
  }));

  const rocData = Object.keys(modelMetrics)
    .filter(key => modelMetrics[key].roc_auc !== null)
    .map(key => ({
      name: modelMetrics[key].name.split(' ')[0],
      rocAuc: modelMetrics[key].roc_auc
    }));

  return (
    <div className="about-page">
      <NavBar />
      
      <div className="about-container">
        {/* Hero Section */}
        <div className="about-hero">
          <h1>About Federated Healthcare System</h1>
          <p className="hero-subtitle">
            Privacy-Preserving AI for Collaborative Medical Diagnosis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            📈 Model Metrics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'federated' ? 'active' : ''}`}
            onClick={() => setActiveTab('federated')}
          >
            🔐 Federated Learning
          </button>
          <button 
            className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setActiveTab('benefits')}
          >
            ✨ Benefits
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="overview-section">
              <h2>🎯 Project Mission</h2>
              <p>
                The Federated Healthcare System (FHS) is a revolutionary platform that enables hospitals and medical institutions 
                to collaboratively train AI models for disease detection without sharing sensitive patient data. By leveraging 
                federated learning technology, we ensure that patient privacy is maintained while building powerful diagnostic tools.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>5</h3>
                  <p>Disease Models</p>
                </div>
                <div className="stat-card">
                  <h3>92.69%</h3>
                  <p>Average Accuracy</p>
                </div>
                <div className="stat-card">
                  <h3>100%</h3>
                  <p>Data Privacy</p>
                </div>
                <div className="stat-card">
                  <h3>140,071</h3>
                  <p>Total Samples</p>
                </div>
              </div>

              <h2>🏥 Supported Diseases</h2>
              <div className="disease-cards">
                <div className="disease-card diabetes">
                  <div className="disease-icon">🩺</div>
                  <h3>Diabetes</h3>
                  <p>Early detection using patient health metrics</p>
                  <span className="accuracy-badge">{modelMetrics.diabetes.accuracy}% Accuracy</span>
                </div>
                <div className="disease-card heart">
                  <div className="disease-icon">❤️</div>
                  <h3>Heart Disease</h3>
                  <p>Cardiovascular risk assessment</p>
                  <span className="accuracy-badge">{modelMetrics.heart.accuracy}% Accuracy</span>
                </div>
                <div className="disease-card kidney">
                  <div className="disease-icon">🫘</div>
                  <h3>Kidney Disease</h3>
                  <p>Chronic kidney disease detection</p>
                  <span className="accuracy-badge">{modelMetrics.kidney.accuracy}% Accuracy</span>
                </div>
                <div className="disease-card parkinson">
                  <div className="disease-icon">🧠</div>
                  <h3>Parkinson's</h3>
                  <p>Voice-based detection system</p>
                  <span className="accuracy-badge">{modelMetrics.parkinson.accuracy}% Accuracy</span>
                </div>
                <div className="disease-card cancer">
                  <div className="disease-icon">🎗️</div>
                  <h3>Breast Cancer</h3>
                  <p>Cell nucleus analysis</p>
                  <span className="accuracy-badge">{modelMetrics.cancer.accuracy}% Accuracy</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="tab-content">
            <div className="metrics-section">
              <h2>📊 Model Performance Metrics</h2>
              
              {/* Metrics Table */}
              <div className="metrics-table-container">
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Accuracy (%)</th>
                      <th>Precision (%)</th>
                      <th>Recall (%)</th>
                      <th>F1-Score (%)</th>
                      <th>ROC-AUC (%)</th>
                      <th>Samples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(modelMetrics).map(key => (
                      <tr key={key}>
                        <td className="model-name">{modelMetrics[key].name}</td>
                        <td>{modelMetrics[key].accuracy.toFixed(2)}</td>
                        <td>{modelMetrics[key].precision.toFixed(2)}</td>
                        <td>{modelMetrics[key].recall.toFixed(2)}</td>
                        <td>{modelMetrics[key].f1_score.toFixed(2)}</td>
                        <td>{modelMetrics[key].roc_auc ? modelMetrics[key].roc_auc.toFixed(2) : 'N/A'}</td>
                        <td>{modelMetrics[key].samples.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Performance Comparison Chart */}
              <div className="chart-section">
                <h3>Performance Metrics Comparison</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#1b4332" name="Accuracy" />
                    <Bar dataKey="precision" fill="#2d6a4f" name="Precision" />
                    <Bar dataKey="recall" fill="#40916c" name="Recall" />
                    <Bar dataKey="f1_score" fill="#52b788" name="F1-Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart */}
              <div className="chart-section">
                <h3>Model Performance Radar</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Performance" dataKey="Accuracy" stroke="#1b4332" fill="#1b4332" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* ROC-AUC Chart */}
              <div className="chart-section">
                <h3>ROC-AUC Scores</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={rocData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rocAuc" stroke="#1b4332" strokeWidth={3} name="ROC-AUC Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Explanation */}
              <div className="metrics-explanation">
                <h3>📚 Understanding the Metrics</h3>
                <div className="metric-cards">
                  <div className="metric-card">
                    <h4>Accuracy</h4>
                    <p>Percentage of correct predictions out of all predictions. Best for balanced datasets.</p>
                  </div>
                  <div className="metric-card">
                    <h4>Precision</h4>
                    <p>Percentage of true positive predictions among all positive predictions. Important to minimize false alarms.</p>
                  </div>
                  <div className="metric-card">
                    <h4>Recall (Sensitivity)</h4>
                    <p>Percentage of actual positive cases correctly identified. Critical in medical diagnosis to avoid missing diseases.</p>
                  </div>
                  <div className="metric-card">
                    <h4>F1-Score</h4>
                    <p>Harmonic mean of precision and recall. Balances both metrics for overall performance.</p>
                  </div>
                  <div className="metric-card">
                    <h4>ROC-AUC</h4>
                    <p>Measures model's ability to distinguish between classes. Score of 1.0 is perfect classification.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Federated Learning Tab */}
        {activeTab === 'federated' && (
          <div className="tab-content">
            <div className="federated-section">
              <h2>🔐 What is Federated Learning?</h2>
              
              <div className="fl-explanation">
                <p>
                  Federated Learning is a machine learning technique that trains AI models across multiple decentralized 
                  devices or servers holding local data samples, without exchanging the raw data itself. This approach 
                  ensures privacy and security while enabling collaborative learning.
                </p>
              </div>

              <div className="fl-process">
                <h3>How It Works</h3>
                <div className="process-steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <h4>Local Training</h4>
                    <p>Each hospital trains the model on their local patient data in their browser. Data never leaves the device.</p>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <h4>Weight Upload</h4>
                    <p>Only the encrypted model weights (learned patterns) are sent to the central server, not the actual patient data.</p>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <h4>Aggregation</h4>
                    <p>The central server combines weights from multiple hospitals using Federated Averaging (FedAvg) algorithm.</p>
                  </div>
                  <div className="step-arrow">→</div>
                  <div className="step">
                    <div className="step-number">4</div>
                    <h4>Global Model</h4>
                    <p>The improved global model is distributed back to all participants, benefiting everyone.</p>
                  </div>
                </div>
              </div>

              <div className="fl-comparison">
                <h3>Traditional ML vs Federated Learning</h3>
                <div className="comparison-grid">
                  <div className="comparison-card traditional">
                    <h4>❌ Traditional Machine Learning</h4>
                    <ul>
                      <li>Centralized data collection required</li>
                      <li>Privacy risks from data sharing</li>
                      <li>Regulatory compliance challenges (HIPAA)</li>
                      <li>Single point of failure</li>
                      <li>Data silos prevent collaboration</li>
                    </ul>
                  </div>
                  <div className="comparison-card federated">
                    <h4>✅ Federated Learning</h4>
                    <ul>
                      <li>Data stays at source (hospital)</li>
                      <li>Privacy-preserving by design</li>
                      <li>HIPAA compliant approach</li>
                      <li>Distributed and resilient</li>
                      <li>Enables collaboration without data sharing</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="technical-details">
                <h3>🛠️ Technical Architecture</h3>
                <div className="tech-cards">
                  <div className="tech-card">
                    <h4>Client-Side Training</h4>
                    <p><strong>Technology:</strong> TensorFlow.js</p>
                    <p>Models train directly in the browser using WebGL acceleration. All computation happens locally.</p>
                  </div>
                  <div className="tech-card">
                    <h4>Secure Storage</h4>
                    <p><strong>Technology:</strong> IndexedDB + Supabase</p>
                    <p>Models saved locally first, then encrypted weights uploaded to cloud storage.</p>
                  </div>
                  <div className="tech-card">
                    <h4>Model Aggregation</h4>
                    <p><strong>Algorithm:</strong> Federated Averaging</p>
                    <p>Weights from multiple contributors are averaged to create improved global model.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="tab-content">
            <div className="benefits-section">
              <h2>✨ Why Federated Healthcare System?</h2>

              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">🔒</div>
                  <h3>Privacy Protection</h3>
                  <p>
                    Patient data never leaves the hospital. Only model weights are shared, making it impossible 
                    to reconstruct individual patient information. Full HIPAA compliance.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">🌍</div>
                  <h3>Global Collaboration</h3>
                  <p>
                    Hospitals worldwide can contribute to model improvement without sharing sensitive data. 
                    Creates more robust models trained on diverse patient populations.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">📈</div>
                  <h3>Improved Accuracy</h3>
                  <p>
                    Models learn from millions of patient records across institutions, leading to better 
                    generalization and higher diagnostic accuracy than single-hospital models.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">⚡</div>
                  <h3>Real-Time Updates</h3>
                  <p>
                    Models continuously improve as more hospitals contribute. New medical insights and 
                    patterns are incorporated without manual retraining.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">💰</div>
                  <h3>Cost Effective</h3>
                  <p>
                    No need for expensive centralized data infrastructure. Hospitals use their existing 
                    hardware, reducing costs while maintaining data sovereignty.
                  </p>
                </div>

                <div className="benefit-card">
                  <div className="benefit-icon">⚖️</div>
                  <h3>Regulatory Compliance</h3>
                  <p>
                    Meets GDPR, HIPAA, and other healthcare data regulations by design. Legal teams can 
                    verify that patient data never leaves the institution.
                  </p>
                </div>
              </div>

              <div className="use-cases">
                <h3>🎯 Real-World Applications</h3>
                <div className="use-case-cards">
                  <div className="use-case">
                    <h4>🏥 Hospital Networks</h4>
                    <p>Multi-site hospital systems can train unified models while keeping patient data at each location.</p>
                  </div>
                  <div className="use-case">
                    <h4>🔬 Clinical Research</h4>
                    <p>Researchers can study rare diseases by pooling insights from multiple institutions without data sharing.</p>
                  </div>
                  <div className="use-case">
                    <h4>🌐 Global Health</h4>
                    <p>Develop models for emerging diseases by learning from cases worldwide in real-time.</p>
                  </div>
                  <div className="use-case">
                    <h4>👨‍⚕️ Clinical Decision Support</h4>
                    <p>Provide doctors with AI-powered diagnostic assistance backed by global medical knowledge.</p>
                  </div>
                </div>
              </div>

              <div className="impact-stats">
                <h3>📊 Potential Impact</h3>
                <div className="impact-grid">
                  <div className="impact-item">
                    <h4>Early Detection</h4>
                    <p>AI models can detect diseases years earlier than traditional methods, potentially saving millions of lives.</p>
                  </div>
                  <div className="impact-item">
                    <h4>Reduced Costs</h4>
                    <p>Early diagnosis and prevention can reduce healthcare costs by up to 50% for chronic diseases.</p>
                  </div>
                  <div className="impact-item">
                    <h4>Global Access</h4>
                    <p>Even small hospitals can benefit from world-class AI models without expensive infrastructure.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="about-footer">
          <p>
            <strong>Federated Healthcare System</strong> - Empowering hospitals to collaborate without compromising privacy
          </p>
          <p className="footer-note">
            Built with TensorFlow.js, React, and Supabase | All patient data remains private and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;