import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ControlStock() {
  const [ingredientes, setIngredientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [unidad, setUnidad] = useState('kilogramos');
  const [stockInicial, setStockInicial] = useState('');
  const [ingresosRapidos, setIngresosRapidos] = useState({});
  const [busqueda, setBusqueda] = useState('');
  
  // NUEVO: Estado para saber si estamos editando
  const [editandoId, setEditandoId] = useState(null);

  const cargarIngredientes = async () => {
    try {
      const respuesta = await api.get('/ingredientes');
      setIngredientes(respuesta.data);
    } catch (error) { }
  };

  useEffect(() => { cargarIngredientes(); }, []);

  const guardarIngrediente = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        // ACTUALIZAR EXISTENTE
        await api.put(`/ingredientes/${editandoId}`, { nombre, unidadMedida: unidad, stockActual: Number(stockInicial) });
        alert('Artículo actualizado correctamente');
      } else {
        // CREAR NUEVO
        await api.post('/ingredientes', { nombre, unidadMedida: unidad, stockActual: Number(stockInicial) || 0, stockMinimo: 0 });
      }
      cancelarEdicion();
      cargarIngredientes();
    } catch (error) { alert('Error al guardar.'); }
  };

  const editarIngrediente = (ing) => {
    setEditandoId(ing._id);
    setNombre(ing.nombre);
    setUnidad(ing.unidadMedida);
    setStockInicial(ing.stockActual);
    window.scrollTo(0,0);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setStockInicial('');
    setUnidad('kilogramos');
  };

  const confirmarIngreso = async (id, stockViejo) => {
    const cantidadASumar = Number(ingresosRapidos[id]);
    if (!cantidadASumar || cantidadASumar <= 0) return;
    try {
      await api.put(`/ingredientes/${id}`, { stockActual: stockViejo + cantidadASumar });
      setIngresosRapidos({ ...ingresosRapidos, [id]: '' }); cargarIngredientes();
    } catch (error) { alert('Error al actualizar el stock'); }
  };

  const ingredientesFiltrados = ingredientes.filter(ing => ing.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div>
      <div className="card-pro" style={editandoId ? { border: '1px solid var(--brand-red)' } : {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="section-title" style={{ margin: 0, color: editandoId ? 'var(--brand-red)' : 'var(--text-main)' }}>
            {editandoId ? '✏️ Editando Artículo' : 'Registrar Nuevo Artículo'}
          </h3>
          {editandoId && <button onClick={cancelarEdicion} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar X</button>}
        </div>
        
        <form onSubmit={guardarIngrediente} className="responsive-form">
          <input type="text" placeholder="Nombre (Ej: Carne Molida)" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ flex: 2 }} />
          <input type="number" placeholder="Stock actual" value={stockInicial} onChange={(e) => setStockInicial(e.target.value)} style={{ flex: 1 }} step="any" />
          <select value={unidad} onChange={(e) => setUnidad(e.target.value)} style={{ flex: 1 }}>
            <option value="kilogramos">Kilogramos</option>
            <option value="gramos">Gramos</option>
            <option value="unidades">Unidades</option>
            <option value="litros">Litros</option>
          </select>
          <button type="submit" className="btn-primary">{editandoId ? 'Actualizar' : 'Guardar'}</button>
        </form>
      </div>

      <div className="card-pro">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Inventario y Carga Rápida</h3>
            <input type="text" placeholder="🔍 Buscar artículo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: '250px' }}/>
        </div>
        
        <div className="table-responsive-container">
          <table className="table-pro">
            <thead>
              <tr><th>Artículo</th><th>Stock Disponible</th><th>Carga Rápida</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {ingredientesFiltrados.map((ing) => {
                const esBajo = (ing.stockActual <= 1000 && ing.unidadMedida === 'gramos') || (ing.stockActual <= 1.5 && ing.unidadMedida === 'kilogramos') || (ing.stockActual <= 5 && ing.unidadMedida === 'unidades');
                return (
                <tr key={ing._id}>
                  <td style={{ fontWeight: '500' }}>{ing.nombre}</td>
                  <td style={{ fontWeight: '700', color: esBajo ? 'var(--brand-red)' : 'var(--success)' }}>{ing.stockActual} {ing.unidadMedida}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="number" placeholder="+ Cant" value={ingresosRapidos[ing._id] || ''} onChange={(e) => setIngresosRapidos({ ...ingresosRapidos, [ing._id]: e.target.value })} style={{ width: '80px', padding: '6px' }} step="any" />
                      <button onClick={() => confirmarIngreso(ing._id, ing.stockActual)} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', padding: '0 12px', fontWeight: '600' }}>Sumar</button>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => editarIngrediente(ing)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ControlStock;