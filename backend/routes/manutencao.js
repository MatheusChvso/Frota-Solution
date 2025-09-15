// backend/routes/manutencao.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

// --- GERENCIAMENTO DE TIPOS DE MANUTENÇÃO ---

// Listar todos os tipos de manutenção
router.get('/tipos', proteger, async (req, res) => {
  try {
    const [tipos] = await db.query('SELECT * FROM tipos_manutencao ORDER BY nome');
    res.json(tipos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tipos de manutenção: ' + error.message });
  }
});

// Criar um novo tipo de manutenção
router.post('/tipos', proteger, async (req, res) => {
  const { nome, intervalo_km_padrao, descricao } = req.body;
  if (!nome || !intervalo_km_padrao) {
    return res.status(400).json({ error: 'Nome e Intervalo de KM são obrigatórios.' });
  }
  try {
    const sql = 'INSERT INTO tipos_manutencao (nome, intervalo_km_padrao, descricao) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [nome, intervalo_km_padrao, descricao]);
    res.status(201).json({ message: 'Tipo de manutenção criado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar tipo de manutenção: ' + error.message });
  }
});

// Garanta que esta linha está no final!
module.exports = router;