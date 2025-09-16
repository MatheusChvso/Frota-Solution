// backend/routes/dashboard.js (VERSÃO FINAL E CORRETA)
const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

router.get('/visao-geral', proteger, async (req, res) => {
  try {
    const sql = `
      SELECT 
        v.id, v.modelo, v.placa, v.km_atual, v.limite_km_mensal, v.tempo_contrato_meses, v.km_inicial_contrato
      FROM veiculos v
      WHERE v.tempo_contrato_meses IS NOT NULL AND v.km_inicial_contrato IS NOT NULL AND v.tempo_contrato_meses > 0
    `;
    const [veiculos] = await db.query(sql);

    const relatorioContrato = veiculos.map(v => {
      const limiteContrato = (v.limite_km_mensal || 0) * v.tempo_contrato_meses;
      const kmTotalRodado = v.km_atual - v.km_inicial_contrato;
      const percentualUso = limiteContrato > 0 ? Math.round((kmTotalRodado / limiteContrato) * 100) : 0;
      return {
        id: v.id, modelo: v.modelo, placa: v.placa,
        limiteContrato: limiteContrato,
        kmTotalRodado: kmTotalRodado,
        percentualUso: percentualUso
      };
    });
    res.json(relatorioContrato);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard: ' + error.message });
  }
});

// Rota do Mural da Vergonha
router.get('/mural-da-vergonha', proteger, async (req, res) => {
  try {
    const sql = `
      SELECT vend.nome, vend.caminho_foto, v.placa, v.modelo
      FROM alocacoes a
      JOIN vendedores vend ON a.id_vendedor = vend.id
      JOIN veiculos v ON a.id_veiculo = v.id
      LEFT JOIN leituras_km lk ON a.id = lk.id_alocacao AND lk.data_leitura = CURDATE()
      WHERE a.data_fim IS NULL AND lk.id IS NULL;
    `;
    const [pendentes] = await db.query(sql);
    res.json(pendentes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados do mural: ' + error.message });
  }
});

module.exports = router;