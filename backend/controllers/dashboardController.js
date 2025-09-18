// backend/controllers/dashboardController.js

const pool = require('../db'); 

// NOVA FUNÇÃO PARA O DASHBOARD DE SALDOS
exports.getSaldosVeiculos = async (req, res) => {
  try {
    const query = `
      WITH leituras_recentes AS (
        SELECT
          a.id_veiculo,
          MAX(lk.km_atual) AS km_final
        FROM leituras_km lk
        JOIN alocacoes a ON lk.id_alocacao = a.id
        GROUP BY a.id_veiculo
      )
      SELECT
        v.id,
        v.placa,
        v.modelo,
        vend.nome AS responsavel,
        (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1) AS meses_passados,
        v.limite_km_mensal,
        (v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1)) AS meta_cumulativa,
        (COALESCE(lr.km_final, v.km_atual) - v.km_inicial_contrato) AS consumo_real_total,
        (v.limite_km_mensal * (TIMESTAMPDIFF(MONTH, v.data_inicio_contrato, CURDATE()) + 1)) - (COALESCE(lr.km_final, v.km_atual) - v.km_inicial_contrato) AS saldo_km
      FROM
        veiculos v
      LEFT JOIN
        alocacoes a ON v.id = a.id_veiculo AND a.data_fim IS NULL
      LEFT JOIN
        vendedores vend ON a.id_vendedor = vend.id
      LEFT JOIN
        leituras_recentes lr ON v.id = lr.id_veiculo
      WHERE
        v.status = 'em_uso' AND v.data_inicio_contrato IS NOT NULL
      ORDER BY saldo_km ASC;
    `;
    
    const [saldos] = await pool.query(query);
    res.status(200).json(saldos);

  } catch (error) {
    console.error("Erro ao buscar saldos dos veículos:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};


// FUNÇÃO DO MURAL DA VERGONHA (MANTIDA)
exports.getMuralDaVergonha = async (req, res) => {
  try {
    const query = `
      SELECT
        vend.nome,
        vend.caminho_foto,
        v.modelo,
        v.placa
      FROM alocacoes a
      JOIN vendedores vend ON a.id_vendedor = vend.id
      JOIN veiculos v ON a.id_veiculo = v.id
      WHERE
        a.data_fim IS NULL AND v.status = 'em_uso'
        AND a.id NOT IN (
          SELECT DISTINCT id_alocacao 
          FROM leituras_km 
          WHERE DATE(data_leitura) = CURRENT_DATE
        );
    `;

    const [pendentes] = await pool.query(query);
    res.status(200).json(pendentes);

  } catch (error) {
    console.error("Erro ao buscar dados do Mural da Vergonha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};