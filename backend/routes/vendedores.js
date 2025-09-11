// backend/routes/vendedores.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos
router.get('/', async (req, res) => {
    try {
        const [vendedores] = await db.query('SELECT id, nome, email, matricula FROM vendedores');
        res.json(vendedores);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Criar um novo
router.post('/', async (req, res) => {
    const { nome, email, matricula, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }
    // ATENÇÃO: Armazenando senha como texto puro temporariamente.
    try {
        const sql = 'INSERT INTO vendedores (nome, email, matricula, senha) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [nome, email, matricula, senha]);
        res.status(201).json({ message: 'Vendedor criado!', id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Atualizar um
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, matricula } = req.body;
   if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }
  try {
    // Nota: Não estamos atualizando a senha aqui por simplicidade.
    const sql = 'UPDATE vendedores SET nome = ?, email = ?, matricula = ? WHERE id = ?';
    const [result] = await db.query(sql, [nome, email, matricula, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.json({ message: 'Vendedor atualizado!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Deletar um
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM vendedores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.json({ message: 'Vendedor deletado!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


module.exports = router;