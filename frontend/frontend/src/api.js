import axios from 'axios';

// Cria uma instância do axios com a URL base da sua API
const api = axios.create({
  baseURL: 'http://192.168.17.200:3001/api',
});

// "Interceptor": Antes de cada pedido, esta função é executada
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem('token');
    // Se o token existir, anexa-o ao cabeçalho de autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Retorna a configuração do pedido para que ele possa continuar
    return config;
  },
  (error) => {
    // Em caso de erro na configuração, rejeita a promessa
    return Promise.reject(error);
  }
);

export default api;
