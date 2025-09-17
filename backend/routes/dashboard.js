const express = require('express');
const router = express.Router();

// Importa o controller que acabamos de criar
const dashboardController = require('../controllers/dashboardController');

// Importa o middleware de autenticação
const { proteger } = require('../middleware/authMiddleware');

// Define a nova rota GET /api/dashboard/consumo-frota
// Note que 'proteger' é executado antes da função do controller
router.get('/consumo-frota', proteger, dashboardController.getConsumoFrota);


// Se você tiver outras rotas de dashboard antigas, pode removê-las ou mantê-las aqui.

module.exports = router;