const Receta = require('../models/Receta');

// VER todas las recetas armadas
const obtenerRecetas = async (req, res) => {
    try {
        // populate nos trae los nombres en vez de solo los IDs
        const recetas = await Receta.find()
            .populate('producto', 'nombre precio')
            .populate('ingredientes.ingrediente', 'nombre unidadMedida');
        res.status(200).json(recetas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener recetas' });
    }
};

// CREAR una receta y vincularla a un producto
const crearReceta = async (req, res) => {
    try {
        const nuevaReceta = new Receta(req.body);
        const recetaGuardada = await nuevaReceta.save();
        res.status(201).json({ mensaje: '✅ Receta creada con éxito', receta: recetaGuardada });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear la receta (quizás el producto ya tiene una)' });
    }
};

module.exports = { obtenerRecetas, crearReceta };