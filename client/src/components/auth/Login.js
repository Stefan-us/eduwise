import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/auth/Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:50001/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      onLogin(response.data);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred during login');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign in</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input 
          className="auth-input" 
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          className="auth-input" 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">Sign in</button>
        <p className="auth-link"><Link to="/forgot-password">Forgot Password?</Link></p>
        {error && <p className="auth-error">{error}</p>}
      </form>
      <p className="auth-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
