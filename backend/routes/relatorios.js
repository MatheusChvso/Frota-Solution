// backend/routes/relatorios.js (VERSÃO FINAL E LIMPA)
const express = require('express');
const router = express.Router();
const db = require('../db');
const { proteger } = require('../middleware/authMiddleware');

router.get('/consumo-mensal', proteger, async (req, res) => {
  try {
    const sql = `
      SELECT v.id, v.placa, v.modelo, v.limite_km_mensal, v.km_atual AS km_final_periodo,
        (SELECT MAX(lk.km_atual) FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE a.id_veiculo = v.id AND lk.data_leitura < DATE_FORMAT(CURDATE(), '%Y-%m-01')) AS km_inicio_periodo,
        (SELECT MIN(lk.km_atual) FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE a.id_veiculo = v.id AND MONTH(lk.data_leitura) = MONTH(CURDATE()) AND YEAR(lk.data_leitura) = YEAR(CURDATE())) AS km_primeira_leitura_mes
      FROM veiculos v
    `;
    const [veiculos] = await db.query(sql);

    const relatorio = veiculos.map(v => {
      let kmInicial = v.km_inicio_periodo || v.km_primeira_leitura_mes || v.km_final_periodo;
      const kmRodados = v.km_final_periodo > kmInicial ? v.km_final_periodo - kmInicial : 0;
      const percentualUsado = v.limite_km_mensal > 0 ? Math.round((kmRodados / v.limite_km_mensal) * 100) : 0;
      
      // --- LOGS DE DEPURAÇÃO DETALHADOS ---
      if (v.placa === 'CCC-000') { 
          console.log(`\n--- [BACKEND] Depurando Veículo ${v.placa} ---`);
          console.log(`KM Rodados: ${kmRodados}`);
          console.log(`Limite Mensal: ${v.limite_km_mensal}`);
          console.log(`Cálculo: Math.round((${kmRodados} / ${v.limite_km_mensal}) * 100)`);
          console.log(`Percentual Calculado: ${percentualUsado}%`);
          console.log('--------------------------------------------------\n');
      }
      
      return {
        id: v.id, placa: v.placa, modelo: v.modelo,
        limite_km_mensal: v.limite_km_mensal,
        km_rodados_mes: kmRodados,
        percentual_usado: percentualUsado
      };
    });
    res.json(relatorio);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório: ' + error.message });
  }
});

module.exports = router;