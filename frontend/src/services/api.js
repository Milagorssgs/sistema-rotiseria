import axios from 'axios';

// Configuramos la URL de tu servidor en Render como base para todas las peticiones
const api = axios.create({
    baseURL: 'https://sistema-rotiseria.onrender.com/api'
});

export default api;