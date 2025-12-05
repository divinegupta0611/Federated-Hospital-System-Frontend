import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import '../styles/ContactCSS.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    subject: '',
    message: '',
    contactMethod: 'email'
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Simulate form submission
      console.log('Form submitted:', formData);
      
      setFormStatus({
        submitted: true,
        error: false,
        message: 'Thank you for contacting us! We will get back to you within 24-48 hours.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        organization: '',
        role: '',
        subject: '',
        message: '',
        contactMethod: 'email'
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormStatus({
          submitted: false,
          error: false,
          message: ''
        });
      }, 5000);
    } else {
      setFormStatus({
        submitted: false,
        error: true,
        message: 'Please fix the errors above and try again.'
      });
    }
  };

  return (
    <div className="contact-page">
      <NavBar />
      
      <div className="contact-container">
        {/* Hero Section */}
        <div className="contact-hero">
          <h1>Get in Touch</h1>
          <p className="hero-subtitle">
            Have questions about our Federated Healthcare System? We'd love to hear from you.
          </p>
        </div>

        <div className="contact-content">
          {/* Contact Information Cards */}
          <div className="contact-info-section">
            <div className="info-card">
              <div className="info-icon">📧</div>
              <h3>Email Us</h3>
              <p>support@federatedhealth.ai</p>
              <p className="info-detail">Response within 24 hours</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>Call Us</h3>
              <p>+1 (555) 123-4567</p>
              <p className="info-detail">Mon-Fri, 9AM-6PM EST</p>
            </div>

            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Visit Us</h3>
              <p>123 Healthcare Blvd</p>
              <p className="info-detail">San Francisco, CA 94102</p>
            </div>

            <div className="info-card">
              <div className="info-icon">💬</div>
              <h3>Live Chat</h3>
              <p>Available on our platform</p>
              <p className="info-detail">Instant support</p>
            </div>
          </div>

          {/* Main Contact Form */}
          <div className="contact-form-section">
            <div className="form-header">
              <h2>Send us a Message</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>

            {/* Form Status Messages */}
            {formStatus.submitted && (
              <div className="status-message success">
                <span className="status-icon">✅</span>
                <p>{formStatus.message}</p>
              </div>
            )}

            {formStatus.error && (
              <div className="status-message error">
                <span className="status-icon">❌</span>
                <p>{formStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              {/* Name and Email Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@hospital.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              {/* Organization and Role Row */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="organization">Organization/Hospital *</label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="General Hospital"
                    className={errors.organization ? 'error' : ''}
                  />
                  {errors.organization && <span className="error-message">{errors.organization}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="role">Your Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={errors.role ? 'error' : ''}
                  >
                    <option value="">Select your role</option>
                    <option value="doctor">Doctor/Physician</option>
                    <option value="nurse">Nurse</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Hospital Administrator</option>
                    <option value="it">IT Professional</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.role && <span className="error-message">{errors.role}</span>}
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What would you like to discuss?"
                  className={errors.subject ? 'error' : ''}
                />
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry... (minimum 20 characters)"
                  rows="6"
                  className={errors.message ? 'error' : ''}
                ></textarea>
                <div className="character-count">
                  {formData.message.length} characters
                </div>
                {errors.message && <span className="error-message">{errors.message}</span>}
              </div>

              {/* Preferred Contact Method */}
              <div className="form-group">
                <label>Preferred Contact Method *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="email"
                      checked={formData.contactMethod === 'email'}
                      onChange={handleChange}
                    />
                    <span>Email</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="phone"
                      checked={formData.contactMethod === 'phone'}
                      onChange={handleChange}
                    />
                    <span>Phone</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="contactMethod"
                      value="either"
                      checked={formData.contactMethod === 'either'}
                      onChange={handleChange}
                    />
                    <span>Either</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn">
                <span>Send Message</span>
                <span className="btn-icon">📤</span>
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-card">
              <h3>🤔 How does federated learning protect my data?</h3>
              <p>
                Your patient data never leaves your hospital. Only encrypted model weights are shared, 
                making it impossible to reconstruct individual patient records. This ensures full HIPAA compliance.
              </p>
            </div>

            <div className="faq-card">
              <h3>⏱️ How long does model training take?</h3>
              <p>
                Training time depends on your dataset size and computing power. Typically, training takes 
                5-30 minutes for 10-50 epochs on standard hospital computers.
              </p>
            </div>

            <div className="faq-card">
              <h3>💰 Is there a cost to use the platform?</h3>
              <p>
                The basic federated learning platform is free for research and educational purposes. 
                Enterprise hospitals may require a subscription for advanced features and support.
              </p>
            </div>

            <div className="faq-card">
              <h3>🔧 What technical requirements are needed?</h3>
              <p>
                You need a modern web browser (Chrome, Firefox, Edge) with JavaScript enabled. 
                No special hardware required - training happens in your browser using TensorFlow.js.
              </p>
            </div>

            <div className="faq-card">
              <h3>📊 How accurate are the AI models?</h3>
              <p>
                Our models achieve 85-97% accuracy across different diseases. Performance improves as 
                more hospitals contribute data, benefiting the entire network.
              </p>
            </div>

            <div className="faq-card">
              <h3>🌍 Can hospitals from different countries participate?</h3>
              <p>
                Yes! Federated learning is ideal for global collaboration. Since data stays local, 
                international data transfer regulations (GDPR, HIPAA) are automatically satisfied.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="resources-section">
          <h2>Additional Resources</h2>
          <div className="resource-cards">
            <div className="resource-card">
              <div className="resource-icon">📚</div>
              <h3>Documentation</h3>
              <p>Comprehensive guides and API documentation</p>
              <a href="#" className="resource-link">View Docs →</a>
            </div>

            <div className="resource-card">
              <div className="resource-icon">🎓</div>
              <h3>Tutorials</h3>
              <p>Step-by-step tutorials for getting started</p>
              <a href="#" className="resource-link">Learn More →</a>
            </div>

            <div className="resource-card">
              <div className="resource-icon">💡</div>
              <h3>Research Papers</h3>
              <p>Academic publications and case studies</p>
              <a href="#" className="resource-link">Read Papers →</a>
            </div>

            <div className="resource-card">
              <div className="resource-icon">👥</div>
              <h3>Community</h3>
              <p>Join our community of healthcare professionals</p>
              <a href="#" className="resource-link">Join Now →</a>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join hospitals worldwide in building better AI models while protecting patient privacy.</p>
          <div className="cta-buttons">
            <button className="cta-btn primary">Start Contributing</button>
            <button className="cta-btn secondary">Schedule a Demo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;