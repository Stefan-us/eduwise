import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/dashboard/Dashboard.css';

function Navigation({ onLogout }) {
  return (
    <nav className="navigation"> 
      <h1>EduWise Navigation</h1>
      <ul className="nav-links">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/activities">Activities</Link>
        </li>
        <li>
          <Link to="/learning">Learning</Link>
        </li>
        <li>
          <Link to="/study-planner">Study Planner</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
      <button onClick={onLogout}>Logout</button>
    </nav>
  );
}

export default Navigation;

