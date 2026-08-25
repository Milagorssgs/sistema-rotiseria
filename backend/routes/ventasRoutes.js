const express = require('express');
const router = express.Router();
const { registrarVenta, obtenerVentas } = require('../controllers/ventasController');

router.post('/', registrarVenta); // Guardar venta
router.get('/', obtenerVentas);   // Leer historial

module.exports = router;