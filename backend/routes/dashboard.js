// backend/routes/dashboard.js

console.log('>>> [OK] Arquivo de rotas /routes/dashboard.js foi carregado.');
const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

// Rota para buscar os dados do Mural da Vergonha
router.get('/mural-da-vergonha', proteger, async (req, res) => {
  try {
    const sql = `
      SELECT
          vend.nome,
          vend.caminho_foto,
          v.placa,
          v.modelo
      FROM alocacoes a
      JOIN vendedores vend ON a.id_vendedor = vend.id
      JOIN veiculos v ON a.id_veiculo = v.id
      LEFT JOIN leituras_km lk ON a.id = lk.id_alocacao AND lk.data_leitura = CURDATE()
      WHERE
          a.data_fim IS NULL
          AND lk.id IS NULL;
    `;

    const [pendentes] = await db.query(sql);
    console.log('--- Dados a serem enviados para o frontend:', pendentes, '---');
    res.json(pendentes);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do mural: ' + error.message });
  }
});

module.exports = router;