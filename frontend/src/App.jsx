import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CargarVentas from './pages/CargarVentas';
import ControlStock from './pages/ControlStock';
import ArmarRecetas from './pages/ArmarRecetas';
import HistorialVentas from './pages/HistorialVentas';
import Costeos from './pages/Costeos';

function App() {
  const [modoOscuro, setModoOscuro] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false); // Estado del menú móvil

  useEffect(() => {
    if (modoOscuro) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.setAttribute('data-theme', 'light');
  }, [modoOscuro]);

  return (
    <BrowserRouter>
      <div className="app-layout">
        
        {/* Fondo oscuro al abrir el menú en el celular */}
        <div className={`menu-overlay ${menuAbierto ? 'open' : ''}`} onClick={() => setMenuAbierto(false)}></div>
        
        <Sidebar isOpen={menuAbierto} closeMenu={() => setMenuAbierto(false)} />
        
        <div className="main-content">
          <header className="top-header">
            {/* Botón Hamburguesa */}
            <button className="hamburger-btn" onClick={() => setMenuAbierto(true)}>☰</button>
            
            <button onClick={() => setModoOscuro(!modoOscuro)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
              {modoOscuro ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </header>

          <div className="page-container">
            <Routes>
              <Route path="/" element={<CargarVentas />} />
              <Route path="/historial" element={<HistorialVentas />} />
              <Route path="/stock" element={<ControlStock />} />
              <Route path="/recetas" element={<ArmarRecetas />} />
              <Route path="/costeos" element={<Costeos />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;