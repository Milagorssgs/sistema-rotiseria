const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true,
        trim: true
    },
    precio: { 
        type: Number, 
        required: true 
    },
    categoria: { 
        type: String, // Ej: Pizzas, Empanadas, Bebidas
        required: true 
    },
    esReventa: { 
        type: Boolean, 
        default: false // Si es false, el sistema sabrá que tiene que buscar una receta
    }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);