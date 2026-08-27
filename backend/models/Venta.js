const mongoose = require('mongoose');

const VentaSchema = mongoose.Schema({
    productosVendidos: Array,
    totalVenta: Number,
    metodoPago: String,
    detallesMixto: {
        efectivo: { type: Number, default: 0 },
        mp: { type: Number, default: 0 },
        tarjeta: { type: Number, default: 0 }
    },
    empaque: { type: String, default: 'Ninguno' } // NUEVO: Para guardar Caja/Bolsita
}, { timestamps: true });

module.exports = mongoose.model('Venta', VentaSchema);