import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div style={{ 
      width: '200px', 
      background: '#2c3e50', 
      color: 'white', 
      minHeight: '100vh', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px' 
    }}>
      <h3 style={{ color: '#ff5722', margin: '0 0 20px 0' }}>🥟 Rotisería</h3>
      
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '18px' }}>💰 Ventas</Link>
      <Link to="/stock" style={{ color: 'white', textDecoration: 'none', fontSize: '18px' }}>📦 Stock</Link>
      <Link to="/recetas" style={{ color: 'white', textDecoration: 'none', fontSize: '18px' }}>🍳 Recetas</Link>
    </div>
  );
}

export default Sidebar;