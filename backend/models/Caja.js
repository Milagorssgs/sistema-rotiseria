const mongoose = require('mongoose');

// Esquema para los gastos sueltos del día
const GastoSchema = mongoose.Schema({
    motivo: String,
    monto: Number,
    metodoPago: { type: String, default: 'Efectivo' }
}, { timestamps: true });

// Esquema para el Cierre Z (Arqueo final)
const CierreZSchema = mongoose.Schema({
    ingresosBrutos: Number,
    efectivoEsperado: Number,
    efectivoReal: Number,
    diferencia: Number,
    gastosTotal: Number,
    fechaCierre: { type: Date, default: Date.now }
});

module.exports = {
    Gasto: mongoose.model('Gasto', GastoSchema),
    CierreZ: mongoose.model('CierreZ', CierreZSchema)
};