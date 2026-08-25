import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CargarVentas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('Efectivo');

  // Traemos los productos del menú para mostrarlos como botones
  useEffect(() => {
    const cargarMenú = async () => {
      try {
        const respuesta = await api.get('/productos');
        setProductos(respuesta.data);
      } catch (error) {
        console.error('Error al cargar el menú:', error);
      }
    };
    cargarMenú();
  }, []);

  // Función para agregar un producto al ticket/carrito
  const agregarAlCarrito = (prod) => {
    // Nos fijamos si ya agregamos este producto antes
    const productoExistente = carrito.find(item => item.producto === prod._id);
    
    if (productoExistente) {
      // Si ya estaba, le sumamos 1 a la cantidad
      setCarrito(carrito.map(item => 
        item.producto === prod._id 
        ? { ...item, cantidad: item.cantidad + 1 } 
        : item
      ));
    } else {
      // Si no estaba, lo agregamos por primera vez
      setCarrito([...carrito, { 
        producto: prod._id, 
        nombre: prod.nombre, 
        precioUnitario: prod.precio, 
        cantidad: 1 
      }]);
    }
  };

  // Función matemática para sumar el total del ticket
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);
  };

  // Función que viaja a la base de datos a cobrar y descontar stock
  const cobrar = async () => {
    if (carrito.length === 0) {
      return alert('⚠️ El ticket está vacío. Agregá productos primero.');
    }
    
    try {
      await api.post('/ventas', {
        productosVendidos: carrito,
        metodoPago: metodoPago
      });
      
      alert('✅ ¡Venta cobrada! El stock de los ingredientes se descontó automáticamente.');
      setCarrito([]); // Vaciamos el ticket para el siguiente cliente
      setMetodoPago('Efectivo');
    } catch (error) {
      alert('❌ Hubo un error al registrar la venta.');
    }
  };

  return (
    <div>
      <h2 style={{ color: '#2c3e50', marginTop: 0 }}>💰 Caja Registradora</h2>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* COLUMNA IZQUIERDA: Botonera del Menú */}
        <div style={{ flex: 2, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#ff5722' }}>Menú Rápido</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {productos.map(prod => (
              <button 
                key={prod._id}
                onClick={() => agregarAlCarrito(prod)}
                style={{ 
                  background: '#2c3e50', color: 'white', border: 'none', 
                  padding: '15px 20px', borderRadius: '8px', cursor: 'pointer', 
                  fontSize: '16px', fontWeight: 'bold', width: '150px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}
              >
                {prod.nombre} <br/> 
                <span style={{ color: '#4CAF50', fontSize: '14px' }}>${prod.precio}</span>
              </button>
            ))}
            {productos.length === 0 && <p>No hay productos en el menú. Creá uno en la pestaña Recetas.</p>}
          </div>
        </div>

        {/* COLUMNA DERECHA: El Ticket de la Venta */}
        <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#ff5722' }}>Ticket de Venta</h4>
          
          <ul style={{ listStyle: 'none', padding: 0, minHeight: '150px' }}>
            {carrito.map((item, index) => (
              <li key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <span><b>{item.cantidad}x</b> {item.nombre}</span>
                <span>${item.precioUnitario * item.cantidad}</span>
              </li>
            ))}
          </ul>

          <div style={{ borderTop: '2px dashed #ccc', paddingTop: '15px', marginBottom: '15px' }}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', margin: 0 }}>
              <span>Total:</span>
              <span style={{ color: '#4CAF50' }}>${calcularTotal()}</span>
            </h3>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Método de Pago:</label>
            <select 
              value={metodoPago} 
              onChange={(e) => setMetodoPago(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Efectivo">💵 Efectivo</option>
              <option value="MercadoPago">📱 MercadoPago</option>
              <option value="Tarjeta">💳 Tarjeta de Débito/Crédito</option>
            </select>
          </div>

          <button 
            onClick={cobrar}
            style={{ width: '100%', background: '#4CAF50', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
          >
            ✅ COBRAR PEDIDO
          </button>
        </div>

      </div>
    </div>
  );
}

export default CargarVentas;