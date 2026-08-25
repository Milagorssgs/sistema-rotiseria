const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Base de datos conectada con éxito a MongoDB Atlas');
    } catch (error) {
        console.error('❌ Error al conectar la base de datos:', error);
        process.exit(1);
    }
};

module.exports = connectDB;