const pool = require('../db'); 

exports.getConsumoFrota = async (req, res) => {
  try {
    // Query 1: Consumo Diário
    const queryDaily = `
      WITH leituras_hoje AS (SELECT id_alocacao, MAX(km_atual) AS odometro_atual FROM leituras_km WHERE DATE(data_leitura) = CURRENT_DATE GROUP BY id_alocacao),
           leituras_anteriores AS (SELECT id_alocacao, MAX(km_atual) AS odometro_anterior FROM leituras_km WHERE DATE(data_leitura) < CURRENT_DATE GROUP BY id_alocacao)
      SELECT SUM(lh.odometro_atual - COALESCE(la.odometro_anterior, lh.odometro_atual)) AS consumo_total_hoje
      FROM leituras_hoje lh LEFT JOIN leituras_anteriores la ON lh.id_alocacao = la.id_alocacao;
    `;
    
    // Query 2: Consumo Mensal (versão MySQL)
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

    // Query 3: Consumo Total do Contrato (CORRIGIDA)
    const queryTotal = `
      WITH leituras_recentes_por_veiculo AS (
        SELECT
          a.id_veiculo,
          MAX(lk.km_atual) AS km_recente
        FROM
          leituras_km lk
        JOIN
          alocacoes a ON lk.id_alocacao = a.id
        GROUP BY
          a.id_veiculo
      )
      SELECT
        SUM(
          COALESCE(lr.km_recente, v.km_atual) - v.km_inicial_contrato
        ) AS consumo_total_contrato
      FROM
        veiculos v
      LEFT JOIN
        leituras_recentes_por_veiculo lr ON v.id = lr.id_veiculo
      WHERE
        v.km_inicial_contrato IS NOT NULL;
    `;

    // Query 4: Metas da Frota
    const queryMetas = `
      SELECT
        SUM(limite_km_mensal) AS meta_mensal_total,
        SUM(limite_km_mensal * tempo_contrato_meses) AS meta_contrato_total
      FROM
        veiculos;
    `;

    // Query 5: Dados para o Gráfico
    const queryLeiturasGrafico = `
      SELECT id_alocacao, km_atual, data_leitura 
      FROM leituras_km 
      WHERE data_leitura >= CURDATE() - INTERVAL 30 DAY
      ORDER BY data_leitura ASC, id_alocacao ASC, km_atual ASC;
    `;

    const [
      [resultadoDiario],
      [resultadoMensal],
      [resultadoTotal],
      [resultadoMetas],
      [leiturasGrafico]
    ] = await Promise.all([
      pool.query(queryDaily),
      pool.query(queryMonthly),
      pool.query(queryTotal),
      pool.query(queryMetas),
      pool.query(queryLeiturasGrafico)
    ]);

    const consumoHoje = resultadoDiario[0]?.consumo_total_hoje ?? 0;
    const consumoMes = resultadoMensal[0]?.consumo_total_mes ?? 0;
    const consumoTotal = resultadoTotal[0]?.consumo_total_contrato ?? 0;
    
    const metasCalculadas = resultadoMetas[0] || { meta_mensal_total: 0, meta_contrato_total: 0 };
    const metaMensal = metasCalculadas.meta_mensal_total;
    const metaTotal = metasCalculadas.meta_contrato_total;
    const metaDiaria = metaMensal > 0 ? metaMensal / 30 : 0;
    
    const consumoPorDia = {};
    const ultimasLeituras = {};
    for (const leitura of leiturasGrafico) {
      const dia = new Date(leitura.data_leitura).toISOString().split('T')[0];
      if (!consumoPorDia[dia]) consumoPorDia[dia] = 0;
      if (ultimasLeituras[leitura.id_alocacao]) {
        const kmRodado = leitura.km_atual - ultimasLeituras[leitura.id_alocacao];
        if (kmRodado > 0) consumoPorDia[dia] += kmRodado;
      }
      ultimasLeituras[leitura.id_alocacao] = leitura.km_atual;
    }
    const graficoConsumoDiario = Object.keys(consumoPorDia).map(dia => ({
      dia: new Date(dia).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit'}),
      consumo: consumoPorDia[dia]
    }));
    
    const responseData = {
      metas: { diaria: Math.round(metaDiaria), mensal: metaMensal, totalContrato: metaTotal },
      consumoReal: { hoje: consumoHoje, mesAtual: consumoMes, totalAcumulado: consumoTotal },
      graficoConsumoDiario: graficoConsumoDiario
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};