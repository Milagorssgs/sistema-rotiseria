import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ControlStock() {
  const [ingredientes, setIngredientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('gramos');
  const [stockInicial, setStockInicial] = useState(''); // <-- NUEVO: Para el stock de arranque

  const cargarIngredientes = async () => {
    try {
      const respuesta = await api.get('/ingredientes');
      setIngredientes(respuesta.data);
    } catch (error) {
      console.error('Error al cargar ingredientes:', error);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, []);

  // 1. Guardar Ingrediente Nuevo
  const guardarIngrediente = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ingredientes', {
        nombre: nombre,
        unidadMedida: unidad,
        stockActual: Number(stockInicial) || 0, // <-- Toma lo que escribas, o 0 si lo dejás vacío
        stockMinimo: 0
      });
      setNombre('');
      setStockInicial('');
      cargarIngredientes();
    } catch (error) {
      alert('Hubo un error al guardar el ingrediente.');
    }
  };

  // 2. NUEVO: Función para sumarle mercadería a algo que ya existe
  const sumarStock = async (id, stockViejo) => {
    const cantidadNueva = window.prompt('📦 ¿Cuánta cantidad nueva trajo el proveedor? (Escribí solo el número)');
    
    // Si cancela o no escribe un número, no hacemos nada
    if (!cantidadNueva || isNaN(cantidadNueva)) return;

    const nuevoStock = stockViejo + Number(cantidadNueva);

    try {
      await api.put(`/ingredientes/${id}`, { stockActual: nuevoStock });
      cargarIngredientes(); // Refrescamos la tabla
    } catch (error) {
      alert('Error al actualizar el stock');
    }
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>📦 Control de Stock</h2>
      
      {/* Formulario para agregar */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#ff5722' }}>Agregar Nuevo Ingrediente</h4>
        
        <form onSubmit={guardarIngrediente} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Ej: Harina 0000" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={{ padding: '8px', width: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          
          <input 
            type="number" 
            placeholder="Stock inicial" 
            value={stockInicial}
            onChange={(e) => setStockInicial(e.target.value)}
            style={{ padding: '8px', width: '120px', borderRadius: '4px', border: '1px solid #ccc' }}
          />

          <select 
            value={unidad} 
            onChange={(e) => setUnidad(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="gramos">Gramos</option>
            <option value="unidades">Unidades</option>
            <option value="litros">Litros</option>
            <option value="mililitros">Mililitros</option>
          </select>

          <button type="submit" style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Guardar
          </button>
        </form>
      </div>

      {/* Tabla del inventario */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#ff5722' }}>Inventario Actual</h4>
        
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px' }}>Nombre</th>
              <th style={{ padding: '10px' }}>Stock Actual</th>
              <th style={{ padding: '10px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((ing) => (
              <tr key={ing._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{ing.nombre}</td>
                <td style={{ padding: '10px', fontSize: '16px', fontWeight: 'bold', color: ing.stockActual <= 0 ? 'red' : 'green' }}>
                  {ing.stockActual} {ing.unidadMedida}
                </td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => sumarStock(ing._id, ing.stockActual)}
                    style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    + Sumar Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ControlStock;