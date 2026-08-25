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