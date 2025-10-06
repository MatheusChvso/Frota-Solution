// backend/routes/vendedores.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { proteger, protegerAdmin } = require('../middleware/authMiddleware');

// Rota de Login (sem alterações)
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }
  try {
    const [vendedores] = await db.query('SELECT * FROM vendedores WHERE email = ?', [email]);
    if (vendedores.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const vendedor = vendedores[0];
    const senhaCorreta = await bcrypt.compare(senha, vendedor.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    const payload = { id: vendedor.id, nome: vendedor.nome, perfil: vendedor.perfil };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Login bem-sucedido!', token, user: payload });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor durante o login: ' + error.message });
  }
});

// Listar todos os vendedores (sem alterações)
router.get('/', protegerAdmin, async (req, res) => {
    try {
        const [vendedores] = await db.query('SELECT id, nome, email, matricula, perfil FROM vendedores ORDER BY nome');
        res.json(vendedores);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Criar um novo vendedor (sem alterações)
router.post('/', protegerAdmin, async (req, res) => {
  const { nome, email, matricula, senha, perfil } = req.body;
  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({ error: 'Nome, email, senha e perfil são obrigatórios.' });
  }
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const sql = 'INSERT INTO vendedores (nome, email, matricula, senha, perfil) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [nome, email, matricula, senhaHash, perfil]);
    res.status(201).json({ message: 'Vendedor criado com sucesso!', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Este email ou matrícula já está em uso.' });
    }
    res.status(500).json({ error: 'Erro ao criar vendedor: ' + error.message });
  }
});

// Atualizar um vendedor (sem alterações)
router.put('/:id', protegerAdmin, async (req, res) => {
  const { id } = req.params;
  const { nome, email, matricula, perfil } = req.body;
   if (!nome || !email || !perfil) {
        return res.status(400).json({ error: 'Nome, email e perfil são obrigatórios.' });
    }
  try {
    const sql = 'UPDATE vendedores SET nome = ?, email = ?, matricula = ?, perfil = ? WHERE id = ?';
    const [result] = await db.query(sql, [nome, email, matricula, perfil, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.json({ message: 'Vendedor atualizado!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ROTA DE DELETAR (COM VALIDAÇÃO DE SEGURANÇA) ---
router.delete('/:id', protegerAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Verificação de segurança: verifica se o vendedor tem CUALQUER alocação (ativa ou passada)
    const [alocacoes] = await db.query('SELECT 1 FROM alocacoes WHERE id_vendedor = ? LIMIT 1', [id]);
    if (alocacoes.length > 0) {
        return res.status(400).json({ error: 'Não é possível excluir. Este vendedor possui um histórico de alocações e não pode ser removido para manter a integridade dos dados.' });
    }

    const [result] = await db.query('DELETE FROM vendedores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vendedor não encontrado' });
    res.json({ message: 'Vendedor deletado!' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;

