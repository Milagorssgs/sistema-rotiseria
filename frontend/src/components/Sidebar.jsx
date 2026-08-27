import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ isOpen, closeMenu }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`sidebar-pro ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">ROTISERÍA POS</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
        <Link to="/" onClick={closeMenu} className={`nav-item ${isActive('/')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          Punto de Venta
        </Link>
        
        <Link to="/historial" onClick={closeMenu} className={`nav-item ${isActive('/historial')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>
          Dashboard & Caja
        </Link>
        
        <Link to="/stock" onClick={closeMenu} className={`nav-item ${isActive('/stock')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          Inventario
        </Link>
        
        <Link to="/recetas" onClick={closeMenu} className={`nav-item ${isActive('/recetas')}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Catálogo & Recetas
        </Link>
        
        <Link to="/costeos" onClick={closeMenu} className={`nav-item ${isActive('/costeos')}`} style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Costeos (Márgenes)
        </Link>
      </div>
    </nav>
  );
}

export default Sidebar;