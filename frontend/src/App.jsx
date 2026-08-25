import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importamos TU nuevo menú lateral
import Sidebar from './components/Sidebar';
import CargarVentas from './pages/CargarVentas';
import ControlStock from './pages/ControlStock';
import ArmarRecetas from './pages/ArmarRecetas';

function App() {
  return (
    <BrowserRouter>
      {/* Usamos display: flex para poner el menú al lado de las páginas */}
      <div style={{ display: 'flex', margin: 0, fontFamily: 'sans-serif' }}>
        
        <Sidebar />
        
        {/* Esta caja ocupará el resto de la pantalla derecha */}
        <div style={{ flex: 1, padding: '20px', background: '#f5f6fa', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<CargarVentas />} />
            <Route path="/stock" element={<ControlStock />} />
            <Route path="/recetas" element={<ArmarRecetas />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;