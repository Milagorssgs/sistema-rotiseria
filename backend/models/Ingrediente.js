const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true,
        trim: true 
    },
    unidadMedida: { 
        type: String, 
        required: true,
        enum: ['gramos', 'unidades', 'litros', 'mililitros'] // Solo permite estas opciones
    },
    stockActual: { 
        type: Number, 
        default: 0 
    },
    stockMinimo: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

module.exports = mongoose.model('Ingrediente', ingredienteSchema);