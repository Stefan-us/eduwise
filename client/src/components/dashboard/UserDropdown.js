import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/dashboard/Dashboard.css';

function UserDropdown({ onLogout }) {
  return (
    <div className="userDropdown">
      <ul>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/settings">Settings</Link></li>
        <li onClick={onLogout}>Logout</li>
      </ul>
    </div>
  );
}

export default UserDropdown;