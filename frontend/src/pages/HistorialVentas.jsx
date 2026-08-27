import React, { useState, useEffect } from 'react';
import api from '../services/api';

function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [pestañaActual, setPestañaActual] = useState('cierre');
  const [totales, setTotales] = useState({ hoy: 0, semana: 0, mes: 0, cantidadHoy: 0 });
  const [metodos, setMetodos] = useState({ Efectivo: 0, MercadoPago: 0, Tarjeta: 0, Mixto: 0 });
  
  const [gastosDelDia, setGastosDelDia] = useState([]);
  const [motivoGasto, setMotivoGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  
  const [fondoCaja, setFondoCaja] = useState(0); 
  const [efectivoReal, setEfectivoReal] = useState('');

  const traerDatos = async () => {
    try {
      const resVentas = await api.get('/ventas');
      setVentas(resVentas.data);
      calcularResumenVentas(resVentas.data);

      try {
        const resGastos = await api.get('/gastos');
        setGastosDelDia(resGastos.data);
      } catch (err) { console.log("Nota: Conectar endpoint de gastos en el backend"); }
      
    } catch (error) { console.error("Error al cargar datos"); }
  };

  useEffect(() => { traerDatos(); }, []);

  const calcularResumenVentas = (listaVentas) => {
    let tHoy = 0, tSemana = 0, tMes = 0, cHoy = 0;
    let mEf = 0, mMp = 0, mTar = 0, mMix = 0;
    const hoy = new Date().toDateString();

    listaVentas.forEach(venta => {
      const fechaVenta = new Date(venta.createdAt || venta._id ? parseInt(venta._id.substring(0,8), 16)*1000 : Date.now());
      const monto = venta.totalVenta;

      if (fechaVenta.toDateString() === hoy) {
        tHoy += monto; cHoy++;
        if (venta.metodoPago === 'Efectivo') mEf += monto;
        else if (venta.metodoPago === 'MercadoPago') mMp += monto;
        else if (venta.metodoPago === 'Tarjeta') mTar += monto;
        else if (venta.metodoPago === 'Mixto') mMix += monto;
      }
      if ((new Date() - fechaVenta) / (1000 * 60 * 60 * 24) <= 7) tSemana += monto;
      if (fechaVenta.getMonth() === new Date().getMonth()) tMes += monto;
    });

    setTotales({ hoy: tHoy, semana: tSemana, mes: tMes, cantidadHoy: cHoy });
    setMetodos({ Efectivo: mEf, MercadoPago: mMp, Tarjeta: mTar, Mixto: mMix });
  };

  const registrarGasto = async (e) => {
    e.preventDefault();
    const monto = Number(montoGasto);
    if (!motivoGasto || monto <= 0) return;

    const nuevoGasto = { _id: Date.now().toString(), motivo: motivoGasto, monto: monto };
    setGastosDelDia([...gastosDelDia, nuevoGasto]);
    
    try { await api.post('/gastos', { motivo: motivoGasto, monto }); } 
    catch (error) { console.log("Guardado en memoria. Requiere backend."); }
    
    setMotivoGasto(''); setMontoGasto('');
  };

  const borrarTicket = async (id) => {
    if(window.confirm('¿Anular venta y devolver stock?')) {
      try { await api.delete(`/ventas/${id}`); traerDatos(); } 
      catch (error) { alert('Error al anular el ticket.'); }
    }
  };

  // MATEMÁTICA DEL ARQUEO
  const totalEgresosHoy = gastosDelDia.reduce((acc, gasto) => acc + gasto.monto, 0);
  const efectivoEsperado = Number(fondoCaja) + metodos.Efectivo - totalEgresosHoy;
  const diferenciaCaja = Number(efectivoReal) - efectivoEsperado;

 const guardarCierreZ = async () => {
    if(efectivoReal === '') {
      return alert("Por favor, ingresá el Efectivo Real (los billetes que contaste) antes de hacer el cierre.");
    }
    
    if(window.confirm(`¿Estás seguro de registrar este Cierre Z?\nDiferencia: $${diferenciaCaja}\n\nSe guardará un reporte definitivo en la base de datos.`)) {
        
        const datosCierre = {
            ingresosBrutos: totales.hoy,
            efectivoEsperado: efectivoEsperado,
            efectivoReal: Number(efectivoReal),
            diferencia: diferenciaCaja,
            gastosTotal: totalEgresosHoy
        };

        try {
            // ¡EL CABLE CONECTADO A MONGODB!
            await api.post('/cierres', datosCierre);
            
            alert('✅ Cierre Z registrado y guardado con éxito.');
            
            setFondoCaja(0);
            setEfectivoReal('');
        } catch(error) {
            alert('❌ Error al registrar el Cierre Z.');
        }
    }
  };


  // Preparar datos para el gráfico
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const ultimos7Dias = Array(7).fill(0).map((_, i) => {
    const d = new Date(hoy); d.setDate(d.getDate() - (6 - i));
    return { fecha: d.getTime(), total: 0, label: d.toLocaleDateString('es-ES', { weekday: 'short' }) };
  });

  ventas.forEach(venta => {
    const fechaVenta = new Date(venta.createdAt || venta._id ? parseInt(venta._id.substring(0,8), 16)*1000 : Date.now());
    const fechaNormalizada = new Date(fechaVenta).setHours(0,0,0,0);
    const diffDias = Math.floor((hoy.getTime() - fechaNormalizada) / (1000 * 60 * 60 * 24));
    if (diffDias >= 0 && diffDias < 7) {
      ultimos7Dias[6 - diffDias].total += venta.totalVenta;
    }
  });

  const maxVentaGrafico = Math.max(...ultimos7Dias.map(d => d.total), 1);

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button onClick={() => setPestañaActual('cierre')} className={pestañaActual === 'cierre' ? 'btn-primary' : ''} style={{ background: pestañaActual === 'cierre' ? '' : 'transparent', color: pestañaActual === 'cierre' ? 'white' : 'var(--text-muted)', border: pestañaActual === 'cierre' ? 'none' : '1px solid var(--border)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Dashboard y Caja</button>
        <button onClick={() => setPestañaActual('auditoria')} className={pestañaActual === 'auditoria' ? 'btn-primary' : ''} style={{ background: pestañaActual === 'auditoria' ? '' : 'transparent', color: pestañaActual === 'auditoria' ? 'white' : 'var(--text-muted)', border: pestañaActual === 'auditoria' ? 'none' : '1px solid var(--border)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Auditoría de Tickets</button>
      </div>

      {pestañaActual === 'cierre' ? (
        <>
          <div className="kpi-grid">
            <div className="kpi-card"><div className="kpi-title">Ingresos Brutos</div><div className="kpi-value text-green">${totales.hoy}</div></div>
            <div className="kpi-card"><div className="kpi-title">Gastos / Retiros</div><div className="kpi-value" style={{ color: 'var(--brand-red)' }}>${totalEgresosHoy}</div></div>
            <div className="kpi-card"><div className="kpi-title">Ganancia Neta (UI)</div><div className="kpi-value text-green" style={{ opacity: 0.9 }}>${((totales.hoy * 0.45) - totalEgresosHoy).toFixed(0)}</div></div>
            <div className="kpi-card"><div className="kpi-title">Tickets Emitidos</div><div className="kpi-value">{totales.cantidadHoy}</div></div>
          </div>

          <div className="pos-layout" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Gráfico 7 Días */}
              <div className="card-pro" style={{ marginBottom: 0 }}>
                <h3 className="section-title">Ventas últimos 7 días</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '160px', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  {ultimos7Dias.map((dia, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>${dia.total}</span>
                      <div style={{ width: '100%', background: 'var(--brand-red)', borderRadius: '4px 4px 0 0', height: `${(dia.total / maxVentaGrafico) * 100}%`, minHeight: '4px', transition: 'height 0.5s ease' }}></div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{dia.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-pro" style={{ marginBottom: 0 }}>
                <h3 className="section-title">Desglose por Método de Pago</h3>
                <div className="table-responsive-container">
                  <table className="table-pro">
                    <thead><tr><th>Método</th><th>Monto Total</th><th>Estado</th></tr></thead>
                    <tbody>
                      <tr><td>Efectivo en Caja</td><td className="text-green font-bold">${metodos.Efectivo}</td><td><span style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>Esperado</span></td></tr>
                      <tr><td>Mercado Pago / Transf.</td><td className="text-green font-bold">${metodos.MercadoPago}</td><td><span style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>Virtual</span></td></tr>
                      <tr><td>Tarjetas</td><td className="text-green font-bold">${metodos.Tarjeta}</td><td><span style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>Acreditación diferida</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Últimas Ventas */}
                <div className="card-pro" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="section-title" style={{ margin: 0 }}>Últimas Ventas</h3>
                  <button onClick={() => setPestañaActual('auditoria')} style={{ background: 'transparent', border: 'none', color: 'var(--brand-red)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Ver todas</button>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {ventas.slice(0, 4).map(venta => (
                    <li key={venta._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>#{venta._id.slice(-5).toUpperCase()} - {venta.metodoPago}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{venta.productosVendidos.length} items</span>
                      </div>
                      <span className="text-green" style={{ fontWeight: '700' }}>${venta.totalVenta}</span>
                    </li>
                  ))}
                  {ventas.length === 0 && <li style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No hay ventas hoy.</li>}
                </ul>
              </div>

              <div className="card-pro" style={{ borderTop: '4px solid var(--brand-red)', marginBottom: 0 }}>
                <h3 className="section-title" style={{ color: 'var(--brand-red)' }}>Arqueo de Caja y Cierre</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>1. Apertura (Fondo en caja)</span>
                    <input type="number" value={fondoCaja} onChange={e => setFondoCaja(e.target.value)} style={{ width: '100px', padding: '6px', textAlign: 'right' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>2. Ventas Efectivo (+)</span>
                    <span className="text-green font-bold">${metodos.Efectivo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>3. Gastos y Retiros (-)</span>
                    <span style={{ color: 'var(--brand-red)', fontWeight: 'bold' }}>${totalEgresosHoy}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>TOTAL ESPERADO</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>${efectivoEsperado}</span>
                  </div>
                </div>

                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>EFECTIVO REAL (Billetes contados)</label>
                <input type="number" placeholder="Ingresá la plata física..." value={efectivoReal} onChange={(e) => setEfectivoReal(e.target.value)} style={{ width: '100%', fontSize: '16px', fontWeight: 'bold', margin: '8px 0 16px 0' }} />
                
                <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Diferencia de Caja</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: efectivoReal === '' ? 'var(--text-muted)' : diferenciaCaja === 0 ? 'var(--success)' : 'var(--brand-red)' }}>
                      {efectivoReal === '' ? '-' : diferenciaCaja > 0 ? `+ $${diferenciaCaja} (Sobrante)` : diferenciaCaja < 0 ? `- $${Math.abs(diferenciaCaja)} (Faltante)` : 'Exacto $0'}
                  </div>
                </div>

                {/* CONEXIÓN DEL BOTÓN A LA FUNCIÓN */}
                <button onClick={guardarCierreZ} className="btn-primary" style={{ width: '100%', padding: '14px' }}>GUARDAR CIERRE</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card-pro">
           <h3 className="section-title">Auditoría de Tickets Emitidos</h3>
           <div className="table-responsive-container">
             <table className="table-pro">
              <thead><tr><th>ID Ticket</th><th>Fecha/Hora</th><th>Detalle</th><th>Método</th><th>Total</th><th>Acción</th></tr></thead>
              <tbody>
                {ventas.map((venta) => {
                  const f = new Date(venta.createdAt || venta._id ? parseInt(venta._id.substring(0,8), 16)*1000 : Date.now());
                  return (
                  <tr key={venta._id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#{venta._id.slice(-6).toUpperCase()}</td>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>{f.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td style={{ fontSize: '13px' }}>{venta.productosVendidos.map((p, i) => <div key={i}>{p.cantidad}x {p.nombre}</div>)}</td>
                    <td><span style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{venta.metodoPago.toUpperCase()}</span></td>
                    <td className="text-green" style={{ fontWeight: '600' }}>${venta.totalVenta}</td>
                    <td><button onClick={() => borrarTicket(venta._id)} style={{ background: 'transparent', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Anular</button></td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialVentas;