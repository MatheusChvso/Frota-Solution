// backend/routes/veiculos.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Importa a conexão do banco

// ROTA GET: Listar todos os veículos
router.get('/', async (req, res) => {
  try {
    const [veiculos] = await db.query('SELECT * FROM veiculos ORDER BY id DESC');
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar veículos: ' + error.message });
  }
});

// ROTA POST: Criar um novo veículo
router.post('/', async (req, res) => {
  // Pega os dados do corpo da requisição
  const { placa, marca, modelo, ano, km_atual, limite_km_mensal, status = 'disponivel' } = req.body;

  if (!placa || !marca || !modelo || !ano) {
    return res.status(400).json({ error: 'Placa, marca, modelo e ano são obrigatórios.' });
  }

  try {
    const sql = 'INSERT INTO veiculos (placa, marca, modelo, ano, km_atual, limite_km_mensal, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [placa, marca, modelo, ano, km_atual, limite_km_mensal, status]);
    res.status(201).json({ message: 'Veículo criado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar veículo: ' + error.message });
  }
});

// ** (No futuro, adicionaremos aqui as rotas de GET por ID, PUT e DELETE) **

module.exports = router;