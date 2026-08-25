const express = require('express');
const router = express.Router();
const { registrarVenta } = require('../controllers/ventaController');

// Ruta para crear una nueva venta (Usamos POST porque enviamos datos)
router.post('/', registrarVenta);

module.exports = router;