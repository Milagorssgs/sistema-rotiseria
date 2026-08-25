import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ArmarRecetas() {
  // Estados para traer datos de la base
  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);

  // Estados para crear el Producto
  const [nombreProd, setNombreProd] = useState('');
  const [precioProd, setPrecioProd] = useState('');
  const [categoriaProd, setCategoriaProd] = useState('Empanadas');

  // Estados para crear la Receta
  const [productoId, setProductoId] = useState('');
  const [ingredienteId, setIngredienteId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [listaTemporal, setListaTemporal] = useState([]);

  // Carga inicial de datos
  const cargarDatos = async () => {
    try {
      const resProd = await api.get('/productos');
      setProductos(resProd.data);
      const resIng = await api.get('/ingredientes');
      setIngredientes(resIng.data);
    } catch (error) {
      console.error('Error al cargar datos');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función 1: Guardar el producto (El plato del menú)
  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      await api.post('/productos', { 
        nombre: nombreProd, 
        precio: Number(precioProd), 
        categoria: categoriaProd 
      });
      setNombreProd('');
      setPrecioProd('');
      cargarDatos(); // Actualiza la lista para que aparezca abajo
      alert('✅ Producto agregado al menú');
    } catch (error) {
      alert('Error al crear el producto');
    }
  };

  // Función 2: Ir agregando ingredientes a la lista de la receta
  const agregarALista = (e) => {
    e.preventDefault();
    if (!ingredienteId || !cantidad) return;
    
    // Buscamos el nombre y unidad del ingrediente para mostrarlo lindo
    const ingCompleto = ingredientes.find(i => i._id === ingredienteId);
    
    setListaTemporal([...listaTemporal, {
      ingredienteId: ingredienteId,
      nombre: ingCompleto.nombre,
      cantidad: Number(cantidad),
      unidad: ingCompleto.unidadMedida
    }]);
    
    setCantidad(''); // Limpiamos la cajita de cantidad
  };

  // Función 3: Guardar la receta definitiva en la base de datos
  const guardarRecetaFinal = async () => {
    if (!productoId || listaTemporal.length === 0) {
      return alert('Falta seleccionar un producto o agregar ingredientes a la lista');
    }
    
    try {
      // Le damos el formato exacto que pide el backend
      const ingredientesFormateados = listaTemporal.map(item => ({
        ingrediente: item.ingredienteId,
        cantidadNecesaria: item.cantidad
      }));

      await api.post('/recetas', {
        producto: productoId,
        ingredientes: ingredientesFormateados
      });

      alert('✅ ¡Receta armada y guardada con éxito!');
      setListaTemporal([]);
      setProductoId('');
    } catch (error) {
      alert('Error: Probablemente este producto ya tiene una receta armada.');
    }
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>🍳 Armar Menú y Recetas</h2>

      {/* --- TARJETA 1: CREAR PRODUCTO --- */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#ff5722' }}>Paso 1: Agregar un plato al menú</h4>
        <form onSubmit={crearProducto} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Ej: Empanada de Carne" 
            value={nombreProd}
            onChange={(e) => setNombreProd(e.target.value)}
            required
            style={{ padding: '8px', width: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input 
            type="number" 
            placeholder="Precio ($)" 
            value={precioProd}
            onChange={(e) => setPrecioProd(e.target.value)}
            required
            style={{ padding: '8px', width: '120px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select 
            value={categoriaProd} 
            onChange={(e) => setCategoriaProd(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Empanadas">Empanadas</option>
            <option value="Pizzas">Pizzas</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Otros">Otros</option>
          </select>
          <button type="submit" style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Guardar Plato
          </button>
        </form>
      </div>

      {/* --- TARJETA 2: ARMAR RECETA --- */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#ff5722' }}>Paso 2: Armar su receta matemática</h4>
        
        {/* Selector de Producto */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>¿A qué producto le vas a armar la receta?</label>
          <select 
            value={productoId} 
            onChange={(e) => setProductoId(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }}
          >
            <option value="">-- Seleccioná un producto --</option>
            {productos.map(prod => (
              <option key={prod._id} value={prod._id}>{prod.nombre}</option>
            ))}
          </select>
        </div>

        {/* Agregador de Ingredientes */}
        <form onSubmit={agregarALista} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', background: '#f5f6fa', padding: '15px', borderRadius: '8px' }}>
          <select 
            value={ingredienteId} 
            onChange={(e) => setIngredienteId(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          >
            <option value="">-- Elegir Ingrediente --</option>
            {ingredientes.map(ing => (
              <option key={ing._id} value={ing._id}>{ing.nombre} ({ing.unidadMedida})</option>
            ))}
          </select>
          
          <input 
            type="number" 
            placeholder="Cantidad" 
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            style={{ padding: '8px', width: '100px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          
          <button type="submit" style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Añadir a la mezcla
          </button>
        </form>

        {/* Lista visual de lo que se va agregando */}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {listaTemporal.map((item, index) => (
            <li key={index} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
              👉 {item.cantidad} {item.unidad} de <b>{item.nombre}</b>
            </li>
          ))}
        </ul>

        {/* Botón final para guardar todo */}
        {listaTemporal.length > 0 && (
          <button 
            onClick={guardarRecetaFinal}
            style={{ marginTop: '20px', width: '100%', background: '#ff5722', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            💾 Guardar Receta Definitiva
          </button>
        )}
      </div>

    </div>
  );
}

export default ArmarRecetas;