const express = require('express');
const router = express.Router();
const { obtenerRecetas, crearReceta } = require('../controllers/recetasController');

router.get('/', obtenerRecetas);
router.post('/', crearReceta);

module.exports = router;