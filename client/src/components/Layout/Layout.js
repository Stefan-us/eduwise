import React from 'react';
import Sidebar from '../dashboard/Sidebar';

function Layout({ children, user, onLogout }) {
  return (
    <div className="page">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main">
        <div className="view">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
