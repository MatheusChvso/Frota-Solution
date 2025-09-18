const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { proteger } = require('../middleware/authMiddleware');

// ROTA PÚBLICA
router.get('/geral', dashboardController.getDashboardData);

// ROTA TAMBÉM PÚBLICA (sem 'proteger')
router.get('/veiculo/:veiculoId', dashboardController.getDashboardData);

// Rota do mural continua protegida
router.get('/mural-da-vergonha', proteger, dashboardController.getMuralDaVergonha);

module.exports = router;