const express = require('express');
const router = express.Router();
const { 
    obtenerIngredientes, 
    crearIngrediente, 
    actualizarIngrediente 
} = require('../controllers/ingredientesController');

// Ruta para VER (GET)
router.get('/', obtenerIngredientes);

// Ruta para CREAR (POST)
router.post('/', crearIngrediente);

// Ruta para ACTUALIZAR (PUT) - Requiere el ID del ingrediente en la URL
router.put('/:id', actualizarIngrediente);

module.exports = router;