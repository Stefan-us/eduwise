import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBook, faEnvelope, faUser, faSignOutAlt, faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { Book } from 'lucide-react';
import '../../styles/dashboard/Dashboard.css';

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const NavItem = ({ to, icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <li onClick={() => navigate(to)} className={`mb-2 ${isActive ? 'bg-blue-100' : ''}`}>
        <div className="flex items-center p-2 text-gray-700 hover:bg-blue-100 rounded cursor-pointer">
          <FontAwesomeIcon icon={icon} className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
          <span className={`ml-2 ${isActive ? 'font-bold text-blue-600' : ''}`}>{children}</span>
        </div>
      </li>
    );
  };

  return (
    <nav className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600">EduWise</h1>
      </div>
      <ul className="mt-6">
        <NavItem to="/dashboard" icon={faHome}>Dashboard</NavItem>
        <NavItem to="/activities" icon={faBook}>Activities</NavItem>
        <NavItem to="/messages" icon={faEnvelope}>Messages</NavItem>
        <NavItem to="/profile" icon={faUser}>Profile</NavItem>
        <NavItem to="/learning" icon={faGraduationCap}>Learning</NavItem>
      </ul>
      <div className="absolute bottom-0 w-64 p-4">
        <button
          onClick={onLogout}
          className="flex items-center text-red-500 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;
