// backend/routes/dashboard.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { proteger } = require('../middleware/authMiddleware');

// ROTA PÚBLICA: para a visão geral da frota (sem login)
router.get('/consumo-frota/geral', dashboardController.getConsumoFrota);

// ROTA PROTEGIDA: para a visão de um veículo específico (precisa de login)
// :veiculoId é um parâmetro que pegaremos no controller
router.get('/consumo-frota/:veiculoId', proteger, dashboardController.getConsumoFrota);

module.exports = router;