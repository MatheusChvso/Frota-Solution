const pool = require('../db'); 

exports.getConsumoFrota = async (req, res) => {
  try {
    const queryDaily = `
      WITH leituras_hoje AS (SELECT id_alocacao, MAX(km_atual) AS odometro_atual FROM leituras_km WHERE DATE(data_leitura) = CURRENT_DATE GROUP BY id_alocacao),
           leituras_anteriores AS (SELECT id_alocacao, MAX(km_atual) AS odometro_anterior FROM leituras_km WHERE DATE(data_leitura) < CURRENT_DATE GROUP BY id_alocacao)
      SELECT SUM(lh.odometro_atual - COALESCE(la.odometro_anterior, lh.odometro_atual)) AS consumo_total_hoje
      FROM leituras_hoje lh LEFT JOIN leituras_anteriores la ON lh.id_alocacao = la.id_alocacao;
    `;
    const queryMonthly = `
      WITH leituras_mes_atual AS (
        SELECT id_alocacao, MAX(km_atual) AS odometro_mes_atual FROM leituras_km 
        WHERE YEAR(data_leitura) = YEAR(CURRENT_DATE) AND MONTH(data_leitura) = MONTH(CURRENT_DATE)
        GROUP BY id_alocacao
      ),
      leituras_meses_anteriores AS (
        SELECT id_alocacao, MAX(km_atual) AS odometro_anterior FROM leituras_km 
        WHERE CONCAT(YEAR(data_leitura), '-', LPAD(MONTH(data_leitura), 2, '0')) < CONCAT(YEAR(CURRENT_DATE), '-', LPAD(MONTH(CURRENT_DATE), 2, '0'))
        GROUP BY id_alocacao
      )
      SELECT SUM(lma.odometro_mes_atual - COALESCE(lman.odometro_anterior, lma.odometro_mes_atual)) AS consumo_total_mes
      FROM leituras_mes_atual lma LEFT JOIN leituras_meses_anteriores lman ON lma.id_alocacao = lman.id_alocacao;
    `;
    const queryTotal = `
      SELECT SUM(km_rodados_na_alocacao) AS consumo_total_contrato
      FROM (SELECT MAX(km_atual) - MIN(km_atual) AS km_rodados_na_alocacao FROM leituras_km GROUP BY id_alocacao) AS progress_por_alocacao;
    `;

    // ==== QUERY DE METAS FINAL E CORRIGIDA ====
    const queryMetas = `
      SELECT
        SUM(limite_km_mensal) AS meta_mensal_total,
        SUM(limite_km_mensal * tempo_contrato_meses) AS meta_contrato_total
      FROM
        veiculos;
    `;
    // ===========================================

    const [
      [resultadoDiario],
      [resultadoMensal],
      [resultadoTotal],
      [resultadoMetas]
    ] = await Promise.all([
      pool.query(queryDaily),
      pool.query(queryMonthly),
      pool.query(queryTotal),
      pool.query(queryMetas)
    ]);

    const consumoHoje = resultadoDiario[0]?.consumo_total_hoje ?? 0;
    const consumoMes = resultadoMensal[0]?.consumo_total_mes ?? 0;
    const consumoTotal = resultadoTotal[0]?.consumo_total_contrato ?? 0;
    
    // ==== LÓGICA DE CÁLCULO DAS METAS CORRIGIDA ====
    const metasCalculadas = resultadoMetas[0] || { meta_mensal_total: 0, meta_contrato_total: 0 };
    const metaMensal = metasCalculadas.meta_mensal_total;
    const metaTotal = metasCalculadas.meta_contrato_total;
    const metaDiaria = metaMensal > 0 ? metaMensal / 30 : 0;
    // =================================================

    const responseData = {
      metas: { diaria: Math.round(metaDiaria), mensal: metaMensal, totalContrato: metaTotal },
      consumoReal: { hoje: consumoHoje, mesAtual: consumoMes, totalAcumulado: consumoTotal },
      graficoConsumoDiario: []
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};