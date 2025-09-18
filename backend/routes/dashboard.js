// backend/routes/dashboard.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { proteger } = require('../middleware/authMiddleware');

// Rota para o novo dashboard de Saldos de Veículos (pública)
router.get('/saldos-veiculos', dashboardController.getSaldosVeiculos);

// Rota para o Mural da Vergonha (protegida)
router.get('/mural-da-vergonha', proteger, dashboardController.getMuralDaVergonha);

module.exports = router;