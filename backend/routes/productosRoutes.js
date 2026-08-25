const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto, actualizarProducto } = require('../controllers/productosController');

router.get('/', obtenerProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);

module.exports = router;