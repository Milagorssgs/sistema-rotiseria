const Venta = require('../models/Venta');
const Receta = require('../models/Receta');
const Ingrediente = require('../models/Ingrediente');
const Producto = require('../models/Producto');

const registrarVenta = async (req, res) => {
    try {
        // 1. Recibimos los datos que nos mandará el frontend (la página web)
        const { productosVendidos, metodoPago } = req.body;

        if (!productosVendidos || productosVendidos.length === 0) {
            return res.status(400).json({ mensaje: 'No hay productos en la venta' });
        }

        let totalVenta = 0;

        // 2. Recorremos cada producto que se vendió
        for (const item of productosVendidos) {
            const productoId = item.producto;
            const cantidadVendida = item.cantidad;
            const precioUnitario = item.precioUnitario;

            // Sumamos al total de la venta
            totalVenta += (cantidadVendida * precioUnitario);

            // 3. LA MAGIA: Buscamos si este producto tiene una receta
            const receta = await Receta.findOne({ producto: productoId });

            // Si tiene receta (es de elaboración propia), descontamos los ingredientes
            if (receta) {
                for (const ing of receta.ingredientes) {
                    // Multiplicamos lo que lleva 1 producto por la cantidad que se vendió
                    const cantidadADescontar = ing.cantidadNecesaria * cantidadVendida;
                    
                    // Actualizamos el stock restándole la cantidad calculada
                    await Ingrediente.findByIdAndUpdate(ing.ingrediente, {
                        $inc: { stockActual: -cantidadADescontar } // $inc con negativo resta
                    });
                }
            }
            // (Nota: Si el producto "esReventa" y no tiene receta, el sistema simplemente lo ignora en el descuento y solo registra la venta y el dinero).
        }

        // 4. Guardamos el ticket de la venta en la base de datos
        const nuevaVenta = new Venta({
            productosVendidos,
            totalVenta,
            metodoPago
        });

        const ventaGuardada = await nuevaVenta.save();

        // 5. Respondemos con éxito
        res.status(201).json({
            mensaje: '✅ Venta registrada y stock descontado con éxito',
            venta: ventaGuardada
        });

    } catch (error) {
        console.error('❌ Error al registrar la venta:', error);
        res.status(500).json({ mensaje: 'Hubo un error al procesar la venta' });
    }
};
// Función para traer todas las ventas del historial
const obtenerVentas = async (req, res) => {
    try {
        // Trae todas las ventas ordenadas de la más nueva a la más vieja
        const ventas = await Venta.find().sort({ createdAt: -1 });
        res.status(200).json(ventas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar el historial de ventas' });
    }
};
module.exports = { registrarVenta, obtenerVentas };