const Producto = require('../models/Producto');

// VER el menú completo
const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los productos' });
    }
};

// CREAR un producto nuevo (Ej: Empanada de Pollo)
const crearProducto = async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json({ mensaje: '✅ Producto creado', producto: productoGuardado });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear el producto' });
    }
};

// ACTUALIZAR (Ideal para cambiar precios por inflación)
const actualizarProducto = async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ mensaje: '✅ Producto actualizado', producto: productoActualizado });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar' });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto };