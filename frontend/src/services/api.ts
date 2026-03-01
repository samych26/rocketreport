import axios from 'axios';

// Create an Axios instance with base URL and default configurations
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Backend Symfony API URL
    withCredentials: true, // Crucial for sending/receiving HttpOnly cookies (JWT/Session)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default api;
