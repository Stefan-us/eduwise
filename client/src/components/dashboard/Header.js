import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header>
      <h1>Welcome, {user?.username || 'User'}</h1>
      <button onClick={onLogout}>Logout</button>
    </header>
  );
};

export default Header;
