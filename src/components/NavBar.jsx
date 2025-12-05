import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import '../styles/NavBarCSS.css';
const NavBar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('fhs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

  }, []);

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
    localStorage.clear();
    window.location.href = '/';
  };

  const getInitial = () => {
    if (!user) return '';
    const name = user.role === 'doctor' ? user.fullName : user.hospitalName;
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h1 className="logo">FHS</h1>
        </div>
        
        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="/" className="nav-link" onClick={closeMenu}>Home</a>
          <a href="/about" className="nav-link" onClick={closeMenu}>About</a>
          <a href="/contact" className="nav-link" onClick={closeMenu}>Contact</a>
          
          {user ? (
            <div className="nav-auth">
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
              <div className="user-avatar" title={user.role === 'doctor' ? user.fullName : user.hospitalName}>
                {getInitial()}
              </div>
            </div>
          ) : (
            <a href="/signup" className="btn-signup" onClick={closeMenu}>Sign Up</a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;