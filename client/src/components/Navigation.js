import React from 'react';
import '../../styles/dashboard/Dashboard.css';

function Navigation({ onLogout }) {
  return (
    <nav> 
      <h1>EduWise Navigation</h1>
      <button onClick={onLogout}>Logout</button>
    </nav>
  );
}

export default Navigation;

