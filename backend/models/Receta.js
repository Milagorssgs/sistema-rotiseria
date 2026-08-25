const mongoose = require('mongoose');

const recetaSchema = new mongoose.Schema({
    producto: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Producto', // Se enlaza con el ID del producto
        required: true,
        unique: true // Un producto solo puede tener una receta activa
    },
    ingredientes: [{
        ingrediente: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Ingrediente', // Se enlaza con el ID del ingrediente
            required: true 
        },
        cantidadNecesaria: { 
            type: Number, 
            required: true // Ej: 40 (si la unidad del ingrediente es "gramos")
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Receta', recetaSchema);