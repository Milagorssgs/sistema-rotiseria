const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    productosVendidos: [{
        producto: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Producto',
            required: true
        },
        cantidad: { 
            type: Number, 
            required: true 
        },
        precioUnitario: { 
            type: Number, 
            required: true // Guardamos el precio al momento de la venta por si luego aumenta
        }
    }],
    totalVenta: { 
        type: Number, 
        required: true 
    },
    metodoPago: {
        type: String,
        enum: ['Efectivo', 'Mercado Pago', 'Tarjeta', 'Otro'],
        default: 'Efectivo'
    },
    fecha: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Venta', ventaSchema);