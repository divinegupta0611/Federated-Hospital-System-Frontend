// Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/HomeCSS.css';

// Import images from assets folder
import diabetesIcon from '../assets/diabetes-logo.png';
import heartIcon from '../assets/heart-logo.png';
import kidneyIcon from '../assets/kidney-logo.png';
import parkinsonIcon from '../assets/parkinson-logo.png';
import cancerIcon from '../assets/breast-cancer-logo.png';

const Home = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('fhs_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const getUserName = () => {
    if (!user) return 'Guest';
    return user.role === 'doctor' ? user.fullName : user.hospitalName;
  };

  const diseaseCards = [
    {
      id: 1,
      name: 'Diabetes Detection',
      image: diabetesIcon,
      path: '/diabetes-detection',
      contributePath: '/contribute-diabetes',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      name: 'Heart Disease Detection',
      image: heartIcon,
      path: '/heart-disease-detection',
      contributePath: '/contribute-heart-disease',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 3,
      name: 'Kidney Disease Detection',
      image: kidneyIcon,
      path: '/kidney-disease-detection',
      contributePath: '/contribute-kidney-disease',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 4,
      name: 'Parkinson Detection',
      image: parkinsonIcon,
      path: '/parkinsson-detection',
      contributePath: '/contribute-parkinson',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      id: 5,
      name: 'Breast Cancer Detection',
      image: cancerIcon,
      path: '/cancer-detection',
      contributePath: '/contribute-cancer',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  const handleCardClick = (card) => {
    if (!isAuthenticated) {
      return; // Do nothing if not authenticated
    }
    const targetPath = user?.role === 'hospital' ? card.contributePath : card.path;
    navigate(targetPath);
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div className="home-page">
      <NavBar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="welcome-title">Welcome {getUserName()}!</h1>
            <p className="welcome-subtitle">
              Your health is our priority. Use our AI-powered disease detection system.
            </p>
          </div>
        </div>
      </section>

      {/* Disease Detection Cards */}
      <section className="detection-section">
        <div className="section-container">
          <h2 className="section-title">Disease Detection Services</h2>
          <p className="section-subtitle">
            {isAuthenticated 
              ? 'Choose a service to get started with AI-powered diagnosis'
              : 'Please sign up to access our AI-powered diagnosis services'}
          </p>
          
          {!isAuthenticated ? (
            <div className="auth-required-box">
              <div className="auth-icon">🔒</div>
              <h3 className="auth-title">Authentication Required</h3>
              <p className="auth-message">
                Please sign up or log in to access our disease detection services and contribute to advancing healthcare technology.
              </p>
              <button className="auth-signup-btn" onClick={handleSignUpClick}>
                Sign Up / Log In
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {diseaseCards.map((card) => (
                <div 
                  key={card.id} 
                  className="disease-card"
                  onClick={() => handleCardClick(card)}
                >
                  <div className="card-icon" style={{background: card.gradient}}>
                    <img src={card.image} alt={card.name} />
                  </div>
                  <h3 className="card-title">{card.name}</h3>
                  <button className="card-btn">
                    {user?.role === 'hospital' ? 'Contribute →' : 'Get Started →'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="why-us-section">
        <div className="section-container">
          <h2 className="section-title">Why Choose Us?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Accurate Predictions</h3>
              <p className="feature-desc">
                Our AI models are trained on vast medical datasets to provide highly accurate disease predictions.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Fast Results</h3>
              <p className="feature-desc">
                Get instant results within seconds. No waiting, no delays - just quick and reliable diagnostics.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-desc">
                Your health data is encrypted and protected. We prioritize your privacy and data security.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3 className="feature-title">Expert Support</h3>
              <p className="feature-desc">
                Access to healthcare professionals for consultation and guidance on your health journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Make Our Model Better Section */}
      <section className="feedback-section">
        <div className="section-container">
          <div className="feedback-box">
            <h2 className="feedback-title">Help Us Improve</h2>
            <p className="feedback-text">
              Your feedback helps us make our AI models better and more accurate. Share your experience and contribute to advancing healthcare technology.
            </p>
            <button className="feedback-btn">Submit Feedback</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3 className="footer-title">FHS</h3>
            <p className="footer-desc">
              Federated Hospital System - Bringing AI-powered healthcare solutions to everyone.
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li>📧 info@fhs.com</li>
              <li>📞 +1 234 567 8900</li>
              <li>📍 123 Healthcare Ave, Medical City</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Follow Us</h4>
            <div className="social-links">
              <a href="#facebook" className="social-icon">📘</a>
              <a href="#twitter" className="social-icon">🐦</a>
              <a href="#linkedin" className="social-icon">💼</a>
              <a href="#instagram" className="social-icon">📷</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Federated Hospital System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;