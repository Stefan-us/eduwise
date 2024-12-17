import React from 'react';
import Login from '../components/auth/Login';

function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <Login onLogin={onLogin} />
    </div>
  );
}

export default LoginPage;