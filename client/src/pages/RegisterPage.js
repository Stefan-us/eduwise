import React from 'react';
import Register from '../components/auth/Register';

function RegisterPage({ onRegister }) {
  return (
    <div className="register-page">
      <Register onRegister={onRegister} />
    </div>
  );
}

export default RegisterPage;
