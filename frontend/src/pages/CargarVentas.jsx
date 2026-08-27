import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CargarVentas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [mixto, setMixto] = useState({ efectivo: '', mp: '', tarjeta: '' });
  
  // NUEVO: Estado para el tipo de empaque (packaging)
  const [tipoEmpaque, setTipoEmpaque] = useState('Ninguno');
  
  // Estado para egresos actualizado (incluye método de pago del egreso)
  const [egreso, setEgreso] = useState({ motivo: '', monto: '', metodoPagoEgreso: 'Efectivo' });
  
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cargarMenu = async () => {
      try {
        const respuesta = await api.get('/productos');
        setProductos(respuesta.data);
      } catch (error) { }
    };
    cargarMenu();
  }, []);

  const agregarAlCarrito = (prod) => {
    const existe = carrito.find(item => item.producto === prod._id);
    if (existe) setCarrito(carrito.map(item => item.producto === prod._id ? { ...item, cantidad: item.cantidad + 1 } : item));
    else setCarrito([...carrito, { producto: prod._id, nombre: prod.nombre, precioUnitario: prod.precio, cantidad: 1 }]);
  };

  const calcularTotal = () => carrito.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);

  const cobrar = async () => {
    if (carrito.length === 0) return alert('El ticket está vacío.');
    
    // Pregunta rápida de confirmación de empaque (opcional, pero buena práctica)
    if(tipoEmpaque === 'Ninguno' && window.confirm('¿Seguro que no lleva caja ni bolsita? Cancelá si querés agregar empaque.')){
        // Continuar si confirma
    } else if (tipoEmpaque === 'Ninguno') {
        return; // Detener si quiere agregar empaque
    }

    const totalVenta = calcularTotal();

    if (metodoPago === 'Mixto') {
      const sumaMixta = Number(mixto.efectivo) + Number(mixto.mp) + Number(mixto.tarjeta);
      if (sumaMixta !== totalVenta) return alert(`Error: La suma del pago mixto ($${sumaMixta}) no coincide con el total ($${totalVenta}).`);
    }

    try {
      // Nota: Aquí se envía el 'tipoEmpaque' a la API. El backend deberá estar preparado para guardarlo.
      await api.post('/ventas', { 
          productosVendidos: carrito, 
          metodoPago: metodoPago, 
          detallesMixto: metodoPago === 'Mixto' ? mixto : undefined,
          empaque: tipoEmpaque 
      });
      alert('Venta registrada con éxito.');
      setCarrito([]); 
      setMetodoPago('Efectivo'); 
      setMixto({ efectivo: '', mp: '', tarjeta: '' });
      setTipoEmpaque('Ninguno'); // Reiniciar empaque
    } catch (error) { alert('Error al registrar venta.'); }
  };

  const registrarEgreso = async (e) => {
    e.preventDefault();
    if (!egreso.motivo || !egreso.monto) return;
    
    try {
      // Ahora sí viaja a tu MongoDB con el método de pago
      await api.post('/gastos', { 
          motivo: egreso.motivo, 
          monto: Number(egreso.monto), 
          metodoPago: egreso.metodoPagoEgreso 
      });
      alert(`✅ Gasto de $${egreso.monto} registrado exitosamente.`);
      setEgreso({ motivo: '', monto: '', metodoPagoEgreso: 'Efectivo' });
    } catch (error) {
      alert('❌ Error al guardar el gasto en la base de datos.');
    }
  };

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase())));

  return (
    <div className="pos-layout">
      {/* Columna Izquierda: Catálogo y Gastos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Catálogo de Productos</h2>
            <input 
              type="text" 
              placeholder="🔍 Buscar producto o categoría..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              style={{ width: '250px', background: 'var(--bg-surface)' }}
            />
          </div>
          
          <div className="products-grid">
            {productosFiltrados.map(prod => (
              <button key={prod._id} onClick={() => agregarAlCarrito(prod)} className="pos-btn">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{prod.categoria || 'Menú'}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px', marginBottom: 'auto' }}>{prod.nombre}</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--success)', marginTop: '12px' }}>${prod.precio}</span>
              </button>
            ))}
            {productosFiltrados.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No se encontraron productos.</div>}
          </div>
        </div>

        <div className="card-pro">
          <h3 className="section-title" style={{ color: 'var(--text-muted)' }}>Registrar Egreso / Retiro</h3>
          <form onSubmit={registrarEgreso} className="responsive-flex">
            <input type="text" placeholder="Motivo (Ej: Proveedor)" value={egreso.motivo} onChange={e => setEgreso({...egreso, motivo: e.target.value})} style={{ flex: 2 }} required/>
            <input type="number" placeholder="Monto ($)" value={egreso.monto} onChange={e => setEgreso({...egreso, monto: e.target.value})} style={{ flex: 1 }} required/>
            
            {/* NUEVO: Selección de método de pago para el egreso */}
            <select value={egreso.metodoPagoEgreso} onChange={e => setEgreso({...egreso, metodoPagoEgreso: e.target.value})} style={{ flex: 1 }}>
                <option value="Efectivo">Efectivo</option>
                <option value="MercadoPago">Mercado Pago / Transf.</option>
                <option value="Tarjeta">Tarjeta</option>
            </select>
            
            <button type="submit" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Extraer</button>
          </form>
        </div>

      </div>

      {/* Columna Derecha: Ticket de Caja */}
      <div className="card-pro" style={{ position: 'sticky', top: '24px' }}>
        <h2 className="section-title">Ticket Actual</h2>
        <div style={{ minHeight: '200px', maxHeight: '35vh', overflowY: 'auto', marginBottom: '20px', borderBottom: '1px dashed var(--border)' }}>
          {carrito.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>No hay productos en el ticket</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {carrito.map((item, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--bg-base)' }}>
                  <div><span style={{ color: 'var(--brand-red)', fontWeight: '700', marginRight: '8px' }}>{item.cantidad}x</span><span style={{ color: 'var(--text-main)', fontSize: '14px' }}>{item.nombre}</span></div>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>${item.precioUnitario * item.cantidad}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>TOTAL A COBRAR</span>
          <span className="text-green" style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px' }}>${calcularTotal()}</span>
        </div>

        {/* NUEVO: Selección de Empaque */}
        <div style={{ marginBottom: '16px', background: 'var(--bg-base)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>TIPO DE EMPAQUE</label>
          <select value={tipoEmpaque} onChange={(e) => setTipoEmpaque(e.target.value)} style={{ width: '100%' }}>
            <option value="Ninguno">Ninguno</option>
            <option value="Caja Pizza">Caja de Pizza</option>
            <option value="Caja Empanadas">Caja de Empanadas</option>
            <option value="Bolsita Papel">Bolsita de Papel</option>
            <option value="Bolsa Plástico">Bolsa de Plástico</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>MÉTODO DE PAGO</label>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: '100%' }}>
            <option value="Efectivo">Efectivo</option>
            <option value="MercadoPago">Mercado Pago / Transf.</option>
            <option value="Tarjeta">Tarjeta (Débito/Crédito)</option>
            <option value="Mixto">Pago Mixto</option>
          </select>
        </div>
        
        {metodoPago === 'Mixto' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="number" placeholder="$ Efec" value={mixto.efectivo} onChange={e => setMixto({...mixto, efectivo: e.target.value})} style={{ width: '33%', fontSize: '13px' }} />
            <input type="number" placeholder="$ MP" value={mixto.mp} onChange={e => setMixto({...mixto, mp: e.target.value})} style={{ width: '33%', fontSize: '13px' }} />
            <input type="number" placeholder="$ Tarj" value={mixto.tarjeta} onChange={e => setMixto({...mixto, tarjeta: e.target.value})} style={{ width: '33%', fontSize: '13px' }} />
          </div>
        )}
        
        <button onClick={cobrar} className="btn-success">REGISTRAR VENTA</button>
      </div>
    </div>
  );
}

export default CargarVentas;