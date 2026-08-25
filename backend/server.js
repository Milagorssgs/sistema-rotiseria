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

// Una ruta de prueba para saber que funciona
app.get('/', (req, res) => {
    res.send('Servidor de la Rotisería funcionando perfectamente OK');
});

// Arrancamos el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de la rotisería corriendo en el puerto ${PORT}`);
});