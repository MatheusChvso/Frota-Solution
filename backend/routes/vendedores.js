// backend/routes/vendedores.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Já devemos ter, mas para garantir
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

  try {
    // Gera o "hash" da senha. O número 10 é o "custo", quão complexa será a criptografia.
    const senhaHash = await bcrypt.hash(senha, 10);

    const sql = 'INSERT INTO vendedores (nome, email, matricula, senha) VALUES (?, ?, ?, ?)';
    // Salva o HASH da senha, e não a senha original
    const [result] = await db.query(sql, [nome, email, matricula, senhaHash]);

    res.status(201).json({ message: 'Vendedor criado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar vendedor: ' + error.message });
  }
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

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // 1. Encontrar o vendedor pelo email
    const [vendedores] = await db.query('SELECT * FROM vendedores WHERE email = ?', [email]);
    if (vendedores.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas.' }); // Email não encontrado
    }
    const vendedor = vendedores[0];

    // 2. Comparar a senha enviada com o hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, vendedor.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas.' }); // Senha incorreta
    }

    // 3. Se tudo estiver correto, gerar um Token JWT
    const payload = { id: vendedor.id, nome: vendedor.nome };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'seu_segredo_super_secreto', // Crie uma JWT_SECRET no seu .env!
      { expiresIn: '8h' } // Token expira em 8 horas
    );

    res.json({ message: 'Login bem-sucedido!', token: token, user: payload });

  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor durante o login: ' + error.message });
  }
});



module.exports = router;