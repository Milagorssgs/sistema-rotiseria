import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ArmarRecetas() {
  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [recetasGrabadas, setRecetasGrabadas] = useState([]);
  const [busquedaReceta, setBusquedaReceta] = useState('');
  
  const [nombreProd, setNombreProd] = useState('');
  const [precioProd, setPrecioProd] = useState('');
  const [categoriaProd, setCategoriaProd] = useState('Empanadas');
  
  const [productoId, setProductoId] = useState('');
  const [ingredienteId, setIngredienteId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [listaTemporal, setListaTemporal] = useState([]);
  
  // NUEVO: Estado para editar recetas
  const [editandoRecetaId, setEditandoRecetaId] = useState(null);

  const cargarDatos = async () => {
    try {
      const resProd = await api.get('/productos'); setProductos(resProd.data);
      const resIng = await api.get('/ingredientes'); setIngredientes(resIng.data);
      const resRecetas = await api.get('/recetas'); setRecetasGrabadas(resRecetas.data);
    } catch (error) { }
  };

  useEffect(() => { cargarDatos(); }, []);

  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      await api.post('/productos', { nombre: nombreProd, precio: Number(precioProd), categoria: categoriaProd });
      setNombreProd(''); setPrecioProd(''); cargarDatos(); alert('Producto agregado al menú');
    } catch (error) { alert('Error al crear producto'); }
  };

  const agregarALista = (e) => {
    e.preventDefault();
    if (!ingredienteId || !cantidad) return;
    const ingCompleto = ingredientes.find(i => i._id === ingredienteId);
    setListaTemporal([...listaTemporal, { ingredienteId: ingredienteId, nombre: ingCompleto.nombre, cantidad: Number(cantidad), unidad: ingCompleto.unidadMedida }]);
    setCantidad('');
  };

  const quitarDeLista = (index) => {
    setListaTemporal(listaTemporal.filter((_, i) => i !== index));
  };

  const guardarRecetaFinal = async () => {
    if (!productoId || listaTemporal.length === 0) return alert('Faltan datos');
    try {
      const ingredientesFormateados = listaTemporal.map(item => ({ ingrediente: item.ingredienteId, cantidadNecesaria: item.cantidad }));
      
      if (editandoRecetaId) {
        await api.put(`/recetas/${editandoRecetaId}`, { producto: productoId, ingredientes: ingredientesFormateados });
        alert('Receta ACTUALIZADA con éxito.');
      } else {
        await api.post('/recetas', { producto: productoId, ingredientes: ingredientesFormateados });
        alert('Receta CREADA con éxito.');
      }
      
      setListaTemporal([]); setProductoId(''); setEditandoRecetaId(null); cargarDatos();
    } catch (error) { alert('Error al guardar la receta.'); }
  };

  const cargarParaEditar = (receta) => {
    setProductoId(typeof receta.producto === 'object' ? receta.producto._id : receta.producto);
    const lista = receta.ingredientes.map(ing => {
        const infoIng = ingredientes.find(i => i._id === (typeof ing.ingrediente === 'object' ? ing.ingrediente._id : ing.ingrediente));
        return {
            ingredienteId: infoIng ? infoIng._id : ing.ingrediente,
            nombre: infoIng ? infoIng.nombre : 'Desconocido',
            cantidad: ing.cantidadNecesaria,
            unidad: infoIng ? infoIng.unidadMedida : ''
        };
    });
    setListaTemporal(lista);
    setEditandoRecetaId(receta._id);
    window.scrollTo(0,0);
  };

  const borrarReceta = async (id) => {
    if(window.confirm('¿Seguro que querés borrar esta receta?')) {
        try { await api.delete(`/recetas/${id}`); cargarDatos(); } 
        catch (error) { alert("Error al borrar receta"); }
    }
  };

  const obtenerNombreProducto = (prodId) => {
      if (typeof prodId === 'object') return prodId.nombre;
      const p = productos.find(x => x._id === prodId); return p ? p.nombre : 'Desconocido';
  };

  const recetasFiltradas = recetasGrabadas.filter(r => obtenerNombreProducto(r.producto).toLowerCase().includes(busquedaReceta.toLowerCase()));

  return (
    <div className="pos-layout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card-pro" style={{ marginBottom: 0 }}>
            <h3 className="section-title">Paso 1: Agregar Plato al Menú</h3>
            <form onSubmit={crearProducto} className="responsive-form">
              <input type="text" placeholder="Ej: Empanada de Carne" value={nombreProd} onChange={(e) => setNombreProd(e.target.value)} required style={{ flex: 2 }} />
              <input type="number" placeholder="Precio ($)" value={precioProd} onChange={(e) => setPrecioProd(e.target.value)} required style={{ flex: 1 }} />
              <select value={categoriaProd} onChange={(e) => setCategoriaProd(e.target.value)} style={{ flex: 1 }}>
                <option value="Empanadas">Empanadas</option><option value="Pizzas">Pizzas</option><option value="Bebidas">Bebidas</option><option value="Otros">Otros</option>
              </select>
              <button type="submit" className="btn-primary">Guardar</button>
            </form>
          </div>

          <div className="card-pro" style={{ marginBottom: 0, border: editandoRecetaId ? '1px solid var(--brand-red)' : '' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="section-title" style={{ color: editandoRecetaId ? 'var(--brand-red)' : '' }}>
                    {editandoRecetaId ? '✏️ Editando Receta Matemática' : 'Paso 2: Armar Receta Matemática'}
                </h3>
                {editandoRecetaId && <button onClick={() => {setEditandoRecetaId(null); setListaTemporal([]); setProductoId('');}} style={{ background:'transparent', color:'var(--text-muted)', border:'none', cursor:'pointer' }}>Cancelar</button>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px' }}>PLATO</label>
              <select value={productoId} onChange={(e) => setProductoId(e.target.value)} disabled={editandoRecetaId !== null}>
                <option value="">-- Seleccioná un producto --</option>
                {productos.map(prod => <option key={prod._id} value={prod._id}>{prod.nombre}</option>)}
              </select>
            </div>
            
            <form onSubmit={agregarALista} className="responsive-flex" style={{ background: 'var(--bg-base)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
              <select value={ingredienteId} onChange={(e) => setIngredienteId(e.target.value)} style={{ flex: 2 }}>
                <option value="">-- Ingrediente --</option>
                {ingredientes.map(ing => <option key={ing._id} value={ing._id}>{ing.nombre} ({ing.unidadMedida})</option>)}
              </select>
              <input type="number" placeholder="Cant." value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ flex: 1 }} step="any" />
              <button type="submit" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', padding: '10px 16px', fontWeight: '600' }}>Añadir</button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
              {listaTemporal.map((item, index) => (
                <li key={index} style={{ display:'flex', justifyContent:'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                  <div><span style={{ color: 'var(--brand-red)', fontWeight: '700', marginRight: '8px' }}>{item.cantidad} {item.unidad}</span> <span style={{ color: 'var(--text-main)' }}>de {item.nombre}</span></div>
                  <button onClick={() => quitarDeLista(index)} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>X</button>
                </li>
              ))}
            </ul>
            {listaTemporal.length > 0 && <button onClick={guardarRecetaFinal} className="btn-success">{editandoRecetaId ? 'ACTUALIZAR RECETA' : 'GUARDAR RECETA DEFINITIVA'}</button>}
          </div>
      </div>

      <div className="card-pro" style={{ position: 'sticky', top: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Recetas Guardadas</h2>
            <input type="text" placeholder="🔍 Buscar..." value={busquedaReceta} onChange={(e) => setBusquedaReceta(e.target.value)} style={{ width: '130px', padding: '6px', fontSize: '12px' }}/>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
            {recetasFiltradas.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>No hay recetas creadas.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {recetasFiltradas.map((receta) => (
                        <div key={receta._id} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{obtenerNombreProducto(receta.producto)}</span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => cargarParaEditar(receta)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Editar</button>
                                    <button onClick={() => borrarReceta(receta._id)} style={{ background: 'transparent', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Borrar</button>
                                </div>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {receta.ingredientes.map((ing, idx) => {
                                    const infoIng = ingredientes.find(i => i._id === (typeof ing.ingrediente === 'object' ? ing.ingrediente._id : ing.ingrediente));
                                    return (
                                        <li key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px 0' }}>
                                            • <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{ing.cantidadNecesaria}</span> {infoIng ? infoIng.unidadMedida : ''} de {infoIng ? infoIng.nombre : 'Borrado'}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default ArmarRecetas;