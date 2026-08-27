const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Configuraciones básicas de seguridad y formato
app.use(cors());
app.use(express.json());

// Llamamos a la función que conecta con MongoDB
connectDB();

// Importamos y usamos las rutas de ventas
const ventasRoutes = require('./routes/ventasRoutes');
app.use('/api/ventas', ventasRoutes);

// ... tus rutas anteriores (ventas, productos, etc)

// --- RUTAS NUEVAS PARA CAJA Y GASTOS ---
const { Gasto, CierreZ } = require('./models/Caja');

// 1. Guardar un gasto nuevo
app.post('/api/gastos', async (req, res) => {
    try {
        const nuevoGasto = new Gasto(req.body);
        await nuevoGasto.save();
        res.json(nuevoGasto);
    } catch (error) { res.status(500).json({ error: 'Error al guardar gasto' }); }
});

// 2. Traer los gastos (Solo los de hoy para no mezclar)
app.get('/api/gastos', async (req, res) => {
    try {
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const gastosHoy = await Gasto.find({ createdAt: { $gte: hoy } });
        res.json(gastosHoy);
    } catch (error) { res.status(500).json({ error: 'Error al obtener gastos' }); }
});

// 3. Guardar el Cierre Z
app.post('/api/cierres', async (req, res) => {
    try {
        const nuevoCierre = new CierreZ(req.body);
        await nuevoCierre.save();
        res.json(nuevoCierre);
    } catch (error) { res.status(500).json({ error: 'Error al guardar Cierre Z' }); }
});

// 4. Ruta trampa ("Ping") para que Cron-Job mantenga despierto el servidor
app.get('/api/ping', (req, res) => {
    res.status(200).send('Servidor Despierto');
});

// Importamos y usamos las rutas de ingredientes
const ingredientesRoutes = require('./routes/ingredientesRoutes');
app.use('/api/ingredientes', ingredientesRoutes);

// Importamos y usamos las rutas de productos
const productosRoutes = require('./routes/productosRoutes');
app.use('/api/productos', productosRoutes);

// Importamos y usamos las rutas de recetas
const recetasRoutes = require('./routes/recetasRoutes');
app.use('/api/recetas', recetasRoutes);

// Una ruta de prueba para saber que funciona
app.get('/', (req, res) => {
    res.send('Servidor de la Rotisería funcionando perfectamente OK');
});

// Arrancamos el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de la rotisería corriendo en el puerto ${PORT}`);
});