import React, { useState } from 'react';

function Costeos() {
  const [producto, setProducto] = useState('');
  const [inversion, setInversion] = useState('');
  const [unidades, setUnidades] = useState('');
  const [margen, setMargen] = useState(50);
  const [precioFinal, setPrecioFinal] = useState('');
  const [historial, setHistorial] = useState([]);

  const costoUnitario = (inversion && unidades) ? (inversion / unidades) : 0;
  const precioSugerido = costoUnitario + (costoUnitario * (margen / 100));

  const guardarCosteo = () => {
    if (!producto || !inversion || !unidades || !precioFinal) return;
    setHistorial([{ id: Date.now(), producto, costo: costoUnitario.toFixed(2), margen, precio: precioFinal }, ...historial]);
    setProducto(''); setInversion(''); setUnidades(''); setPrecioFinal('');
  };

  return (
    <div className="pos-layout">
      <div className="card-pro">
        <h2 className="section-title">Calculadora de Márgenes</h2>
        
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>LOTE O MERCADERÍA COMPRADA</label>
        <input type="text" placeholder="Ej: Cajón de Pollo" value={producto} onChange={(e) => setProducto(e.target.value)} style={{ width: '100%', margin: '8px 0 16px 0' }} />
        
        <div className="responsive-flex" style={{ marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>INVERSIÓN TOTAL ($)</label>
            <input type="number" value={inversion} onChange={(e) => setInversion(e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>UNIDADES / KILOS</label>
            <input type="number" value={unidades} onChange={(e) => setUnidades(e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0', marginBottom: '24px' }}>
          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>Costo Real Unitario:</span>
          <span style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '18px' }}>${costoUnitario.toFixed(2)}</span>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>MARGEN DESEADO ({margen}%)</label>
        <div className="responsive-flex" style={{ margin: '8px 0 24px 0' }}>
          <input type="range" min="0" max="200" value={margen} onChange={(e) => setMargen(e.target.value)} style={{ width: '100%', accentColor: 'var(--brand-red)' }} />
          <div style={{ background: 'var(--bg-base)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border)', textAlign: 'right', minWidth: '120px' }}>
             <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SUGERIDO</div>
             <div className="text-green" style={{ fontWeight: '700', fontSize: '18px' }}>${precioSugerido.toFixed(2)}</div>
          </div>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>PRECIO FINAL DE VENTA ($)</label>
        <input type="number" value={precioFinal} onChange={(e) => setPrecioFinal(e.target.value)} style={{ width: '100%', margin: '8px 0 24px 0', fontSize: '18px', fontWeight: '700' }} />
        
        <button onClick={guardarCosteo} className="btn-primary" style={{ width: '100%' }}>Guardar en Historial</button>
      </div>

      <div className="card-pro">
        <h3 className="section-title">Historial de Inversiones</h3>
        <div className="table-responsive-container">
          <table className="table-pro">
            <tbody>
              {historial.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.producto}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Costo: ${item.costo} | Margen: {item.margen}%</div>
                  </td>
                  <td className="text-green" style={{ fontWeight: '700', textAlign: 'right' }}>${item.precio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Costeos;