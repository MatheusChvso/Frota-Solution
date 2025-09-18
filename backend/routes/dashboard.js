const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { proteger } = require('../middleware/authMiddleware');

// Rota pública para a visão GERAL da frota
router.get('/geral', dashboardController.getDashboardData);

// Rota protegida para a visão de um VEÍCULO ESPECÍFICO
router.get('/veiculo/:veiculoId', proteger, dashboardController.getDashboardData);

// Não se esqueça de manter a rota do Mural
router.get('/mural-da-vergonha', proteger, dashboardController.getMuralDaVergonha);

module.exports = router;