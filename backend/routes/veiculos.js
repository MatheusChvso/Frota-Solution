const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

// ROTA GET: Listar todos os veículos (agora protegida)
router.get('/', proteger, async (req, res) => {
  try {
    const [veiculos] = await db.query('SELECT * FROM veiculos ORDER BY id DESC');
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar veículos: ' + error.message });
  }
});

// ========================================================================
// NOVA ROTA PARA O DASHBOARD - Listar veículos alocados para o seletor
// ========================================================================
router.get('/alocados', async (req, res) => {
  try {
    const [veiculos] = await db.query(
      "SELECT id, modelo, placa FROM veiculos WHERE status = 'em_uso' ORDER BY modelo"
    );
    res.status(200).json(veiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos alocados:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});
// ========================================================================

// ROTA POST: Criar um novo veículo (protegida)
router.post('/', proteger, async (req, res) => {
  const { placa, marca, modelo, ano, km_atual, limite_km_mensal, data_inicio_contrato, tempo_contrato_meses, km_inicial_contrato } = req.body;
  if (!placa || !marca || !modelo || !ano) {
    return res.status(400).json({ error: 'Placa, marca, modelo e ano são obrigatórios.' });
  }
  try {
    const sql = `
      INSERT INTO veiculos 
      (placa, marca, modelo, ano, km_atual, limite_km_mensal, data_inicio_contrato, tempo_contrato_meses, km_inicial_contrato) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [placa, marca, modelo, ano, km_atual, limite_km_mensal, data_inicio_contrato, tempo_contrato_meses, km_inicial_contrato];
    const [result] = await db.query(sql, params);
    res.status(201).json({ message: 'Veículo criado com sucesso!', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Esta placa já está cadastrada.' });
    }
    res.status(500).json({ error: 'Erro ao criar veículo: ' + error.message });
  }
});

// ROTA PUT: Atualizar um veículo (protegida)
router.put('/:id', proteger, async (req, res) => {
  const { id } = req.params;
  const { placa, marca, modelo, ano, km_atual, limite_km_mensal, data_inicio_contrato, tempo_contrato_meses, km_inicial_contrato, status } = req.body;
  if (!placa || !marca || !modelo || !ano || !status) {
    return res.status(400).json({ error: 'Campos principais são obrigatórios.' });
  }
  try {
    const sql = `
      UPDATE veiculos 
      SET placa = ?, marca = ?, modelo = ?, ano = ?, km_atual = ?, limite_km_mensal = ?, 
          data_inicio_contrato = ?, tempo_contrato_meses = ?, km_inicial_contrato = ?, status = ?
      WHERE id = ?
    `;
    const params = [placa, marca, modelo, ano, km_atual, limite_km_mensal, data_inicio_contrato, tempo_contrato_meses, km_inicial_contrato, status, id];
    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }
    res.json({ message: 'Veículo atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar veículo: ' + error.message });
  }
});

// ROTA DELETE: Deletar um veículo (protegida)
router.delete('/:id', proteger, async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'DELETE FROM veiculos WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }
    res.json({ message: 'Veículo deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar veículo: ' + error.message });
  }
});

module.exports = router;