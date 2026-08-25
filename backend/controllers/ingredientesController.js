const Ingrediente = require('../models/Ingrediente');

// 1. VER TODO: Trae la lista completa de ingredientes del depósito
const obtenerIngredientes = async (req, res) => {
    try {
        const ingredientes = await Ingrediente.find();
        res.status(200).json(ingredientes);
    } catch (error) {
        console.error('❌ Error al obtener ingredientes:', error);
        res.status(500).json({ mensaje: 'Hubo un error al buscar los ingredientes' });
    }
};

// 2. CREAR: Agrega un ingrediente nuevo a la base de datos
const crearIngrediente = async (req, res) => {
    try {
        const nuevoIngrediente = new Ingrediente(req.body);
        const ingredienteGuardado = await nuevoIngrediente.save();
        
        res.status(201).json({ 
            mensaje: '✅ Ingrediente creado con éxito', 
            ingrediente: ingredienteGuardado 
        });
    } catch (error) {
        console.error('❌ Error al crear ingrediente:', error);
        res.status(400).json({ mensaje: 'Error al crear el ingrediente. Verifica los datos.' });
    }
};

// 3. ACTUALIZAR: Modifica el stock o los datos de un ingrediente que ya existe
const actualizarIngrediente = async (req, res) => {
    try {
        // Busca por ID y actualiza con los datos nuevos que enviamos
        const ingredienteActualizado = await Ingrediente.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Esto hace que nos devuelva el ingrediente ya modificado
        );

        if (!ingredienteActualizado) {
            return res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
        }

        res.status(200).json({ 
            mensaje: '✅ Ingrediente actualizado', 
            ingrediente: ingredienteActualizado 
        });
    } catch (error) {
        console.error('❌ Error al actualizar ingrediente:', error);
        res.status(400).json({ mensaje: 'Error al actualizar el ingrediente' });
    }
};

module.exports = { 
    obtenerIngredientes, 
    crearIngrediente, 
    actualizarIngrediente 
};