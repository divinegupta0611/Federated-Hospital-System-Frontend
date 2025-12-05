// Signup.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/AuthCSS.css';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeRole, setActiveRole] = useState(searchParams.get('role') || 'doctor');
  const [formData, setFormData] = useState({
    fullName: '',
    hospitalName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setFormData({
      fullName: '',
      hospitalName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }

    if (activeRole === 'doctor' && !formData.fullName.trim()) {
      setError('Please enter your full name!');
      return;
    }

    if (activeRole === 'hospital' && !formData.hospitalName.trim()) {
      setError('Please enter hospital name!');
      return;
    }

    if (activeRole === 'doctor' && !formData.phoneNumber.trim()) {
      setError('Please enter your phone number!');
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: activeRole,
            full_name: activeRole === 'doctor' ? formData.fullName : formData.hospitalName,
            phone_number: activeRole === 'doctor' ? formData.phoneNumber : null
          }
        }
      });

      if (signupError) throw signupError;

      // Store user data in localStorage
      const userData = {
        user: activeRole,
        email: formData.email,
        role: activeRole,
        ...(activeRole === 'doctor' 
          ? { fullName: formData.fullName, phoneNumber: formData.phoneNumber }
          : { hospitalName: formData.hospitalName }
        )
      };
      
      localStorage.setItem('fhs_user', JSON.stringify(userData));
      
      setSuccess('Signup successful!');
      
      // Clear form
      setFormData({
        fullName: '',
        hospitalName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 2000);

    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
                {activeRole === 'doctor' ? 'Doctor Registration' : 'Hospital Registration'}
              </h2>
              <p className="image-subtitle">
                {activeRole === 'doctor' 
                  ? 'Join our network of healthcare professionals' 
                  : 'Connect your hospital to our federated system'}
              </p>
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-title">Create Account</h2>
            <p className="form-subtitle">Join the Federated Hospital System</p>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="form">
              {activeRole === 'doctor' ? (
                <>
                  <div className="input-group">
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="doctor@example.com"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label className="input-label">Hospital Name *</label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter hospital name"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="hospital@example.com"
                      required
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label className="input-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Re-enter your password"
                  required
                />
              </div>

              <button 
                onClick={handleSubmit} 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="form-footer">
                Already have an account? <Link to={`/login?role=${activeRole}`} className="form-link">Login here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;