// backend/routes/vendedores.js (VERSÃO CORRIGIDA E REFINADA)

const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { proteger, protegerAdmin } = require('../middleware/authMiddleware'); // Importamos a proteção de admin

// Rota de Login (COM A CORREÇÃO DO PERFIL)
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // A query `SELECT *` já inclui a nova coluna 'perfil'
    const [vendedores] = await db.query('SELECT * FROM vendedores WHERE email = ?', [email]);
    if (vendedores.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const vendedor = vendedores[0];

    const senhaCorreta = await bcrypt.compare(senha, vendedor.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // --- CORREÇÃO APLICADA AQUI ---
    // Adicionamos o 'perfil' ao payload do token e ao objeto de utilizador
    const payload = { id: vendedor.id, nome: vendedor.nome, perfil: vendedor.perfil };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    // Retornamos o objeto de utilizador completo, incluindo o perfil
    res.json({ message: 'Login bem-sucedido!', token: token, user: payload });

  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor durante o login: ' + error.message });
  }
});

// --- ROTAS PROTEGIDAS (Apenas para administradores) ---

// Listar todos os vendedores
router.get('/', protegerAdmin, async (req, res) => {
    try {
        const [vendedores] = await db.query('SELECT id, nome, email, matricula, perfil FROM vendedores ORDER BY nome');
        res.json(vendedores);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Criar um novo vendedor
router.post('/', protegerAdmin, async (req, res) => {
  const { nome, email, matricula, senha, perfil } = req.body; // Adicionado 'perfil'
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    // Incluímos o 'perfil' no INSERT (com um valor padrão 'vendedor' se não for fornecido)
    const sql = 'INSERT INTO vendedores (nome, email, matricula, senha, perfil) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [nome, email, matricula, senhaHash, perfil || 'vendedor']);
    res.status(201).json({ message: 'Vendedor criado com sucesso!', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Este email ou matrícula já está em uso.' });
    }
    res.status(500).json({ error: 'Erro ao criar vendedor: ' + error.message });
  }
});

// Atualizar um vendedor
router.put('/:id', protegerAdmin, async (req, res) => {
  const { id } = req.params;
  const { nome, email, matricula, perfil } = req.body; // Adicionado 'perfil'
   if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }
  try {
    const sql = 'UPDATE vendedores SET nome = ?, email = ?, matricula = ?, perfil = ? WHERE id = ?';
    const [result] = await db.query(sql, [nome, email, matricula, perfil || 'vendedor', id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.json({ message: 'Vendedor atualizado!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Deletar um vendedor
router.delete('/:id', protegerAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [alocacoes] = await db.query('SELECT 1 FROM alocacoes WHERE id_vendedor = ? LIMIT 1', [id]);
    if (alocacoes.length > 0) {
        return res.status(400).json({ error: 'Não é possível excluir. Este vendedor possui veículos alocados em seu histórico.' });
    }

    const [result] = await db.query('DELETE FROM vendedores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.json({ message: 'Vendedor deletado!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


module.exports = router;