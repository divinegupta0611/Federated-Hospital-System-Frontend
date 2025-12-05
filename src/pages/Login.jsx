// Login.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/AuthCSS.css';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeRole, setActiveRole] = useState(searchParams.get('role') || 'doctor');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setFormData({
      email: '',
      password: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);

    try {
      // Login with Supabase
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (loginError) throw loginError;

      // Check if role matches
      const userRole = data.user.user_metadata.role;
      
      if (userRole !== activeRole) {
        await supabase.auth.signOut();
        throw new Error(`This account is registered as a ${userRole}. Please select the correct role.`);
      }

      // Store user data in localStorage
      const userData = {
        user: userRole,
        email: data.user.email,
        role: userRole,
        ...(userRole === 'doctor' 
          ? { 
              fullName: data.user.user_metadata.full_name,
              phoneNumber: data.user.user_metadata.phone_number
            }
          : { hospitalName: data.user.user_metadata.full_name }
        )
      };
      
      localStorage.setItem('fhs_user', JSON.stringify(userData));
      
      // Redirect to home page
      navigate('/');
      window.location.reload();

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="role-selector">
          <button
            className={`role-btn ${activeRole === 'doctor' ? 'active' : ''}`}
            onClick={() => handleRoleChange('doctor')}
          >
            Doctors
          </button>
          <button
            className={`role-btn ${activeRole === 'hospital' ? 'active' : ''}`}
            onClick={() => handleRoleChange('hospital')}
          >
            Hospitals
          </button>
        </div>

        <div className={`auth-card ${activeRole === 'hospital' ? 'reverse' : ''}`}>
          <div className="image-section">
            <div className="image-content">
              <div className="icon-circle">
                {activeRole === 'doctor' ? '👨‍⚕️' : '🏥'}
              </div>
              <h2 className="image-title">
                {activeRole === 'doctor' ? 'Doctor Login' : 'Hospital Login'}
              </h2>
              <p className="image-subtitle">
                {activeRole === 'doctor' 
                  ? 'Access your healthcare professional dashboard' 
                  : 'Access your hospital management system'}
              </p>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Login to your account</p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form">
              <div className="input-group">
                <label className="input-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                onClick={handleSubmit} 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="form-footer">
                Don't have an account? <Link to={`/signup?role=${activeRole}`} className="form-link">Sign up here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;