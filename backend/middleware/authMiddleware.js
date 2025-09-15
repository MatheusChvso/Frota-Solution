// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const proteger = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Pega o token do header (ex: "Bearer eyJhbGci...")
      token = req.headers.authorization.split(' ')[1];
      console.log('--- Verificando token com o segredo:', process.env.JWT_SECRET, '---');
      // Verifica se o token é válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Anexa o usuário decodificado (contém id e nome) ao objeto da requisição
      req.vendedor = decoded;

      next(); // Passa para a próxima etapa da requisição
    } catch (error) {
      console.error('--- ERRO na verificação do JWT:', error.message, '---');  
      res.status(401).json({ error: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Não autorizado, sem token.' });
  }
};

module.exports = { proteger };