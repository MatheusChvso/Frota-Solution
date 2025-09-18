// backend/controllers/dashboardController.js

const pool = require('../db'); 

exports.getConsumoFrota = async (req, res) => {
  const { veiculoId } = req.params;

  const params = veiculoId ? [veiculoId] : [];
  const andAlocacaoVeiculo = veiculoId ? `AND a.id_veiculo = ?` : '';
  const whereVeiculo = veiculoId ? `WHERE v.id = ?` : '';
  
  try {
    const queryDaily = `
      SELECT SUM(lh.odometro_atual - COALESCE(la.odometro_anterior, v.km_inicial_contrato)) AS consumo_total_hoje
      FROM veiculos v
      JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_atual FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE lk.data_leitura >= CURRENT_DATE AND lk.data_leitura < CURRENT_DATE + INTERVAL 1 DAY ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS lh ON v.id = lh.id_veiculo
      LEFT JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_anterior FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE lk.data_leitura < CURRENT_DATE ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS la ON v.id = la.id_veiculo
      ${whereVeiculo} ${veiculoId ? 'AND' : 'WHERE'} v.km_inicial_contrato IS NOT NULL;
    `;
    const queryMonthly = `
      SELECT SUM(lma.odometro_mes_atual - COALESCE(lman.odometro_anterior, v.km_inicial_contrato)) AS consumo_total_mes
      FROM veiculos v
      JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_mes_atual FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE YEAR(lk.data_leitura) = YEAR(CURRENT_DATE) AND MONTH(lk.data_leitura) = MONTH(CURRENT_DATE) ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS lma ON v.id = lma.id_veiculo
      LEFT JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS odometro_anterior FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id WHERE CONCAT(YEAR(lk.data_leitura), '-', LPAD(MONTH(lk.data_leitura), 2, '0')) < CONCAT(YEAR(CURRENT_DATE), '-', LPAD(MONTH(CURRENT_DATE), 2, '0')) ${andAlocacaoVeiculo} GROUP BY a.id_veiculo) AS lman ON v.id = lman.id_veiculo
      ${whereVeiculo} ${veiculoId ? 'AND' : 'WHERE'} v.km_inicial_contrato IS NOT NULL;
    `;
    const queryTotal = `
      SELECT SUM(COALESCE(lr.km_recente, v.km_atual) - v.km_inicial_contrato) AS consumo_total_contrato
      FROM veiculos v 
      LEFT JOIN (SELECT a.id_veiculo, MAX(lk.km_atual) AS km_recente FROM leituras_km lk JOIN alocacoes a ON lk.id_alocacao = a.id ${veiculoId ? 'WHERE a.id_veiculo = ?' : ''} GROUP BY a.id_veiculo) AS lr ON v.id = lr.id_veiculo
      ${whereVeiculo} ${veiculoId ? 'AND' : 'WHERE'} v.km_inicial_contrato IS NOT NULL;
    `;
    const queryMetas = `SELECT SUM(limite_km_mensal) AS meta_mensal_total, SUM(limite_km_mensal * tempo_contrato_meses) AS meta_contrato_total FROM veiculos v ${whereVeiculo};`;
    const queryLeiturasGrafico = `
      SELECT
        a.id_veiculo,
        lk.data_leitura,
        lk.km_atual,
        COALESCE(
          LAG(lk.km_atual, 1) OVER (PARTITION BY a.id_veiculo ORDER BY lk.data_leitura),
          v.km_inicial_contrato
        ) AS km_anterior
      FROM leituras_km lk
      JOIN alocacoes a ON lk.id_alocacao = a.id
      JOIN veiculos v ON a.id_veiculo = v.id
      WHERE lk.data_leitura >= CURDATE() - INTERVAL 30 DAY ${andAlocacaoVeiculo}
      ORDER BY lk.data_leitura ASC;
    `;
    const queryInfoVeiculo = veiculoId 
      ? `SELECT v.modelo, v.placa, vend.nome AS nomeVendedor FROM veiculos v JOIN alocacoes a ON v.id = a.id_veiculo JOIN vendedores vend ON a.id_vendedor = vend.id WHERE a.id_veiculo = ? AND a.data_fim IS NULL LIMIT 1;` 
      : `SELECT 1;`;

    const paramsDaily = veiculoId ? [veiculoId, veiculoId, veiculoId] : [];
    const paramsMonthly = veiculoId ? [veiculoId, veiculoId, veiculoId] : [];
    const paramsTotal = veiculoId ? [veiculoId, veiculoId] : [];
    
    const [
      [[resultadoDiario]], [[resultadoMensal]], [[resultadoTotal]], [[resultadoMetas]], [leiturasGrafico], [[infoVeiculo]]
    ] = await Promise.all([
      pool.query(queryDaily, paramsDaily),
      pool.query(queryMonthly, paramsMonthly),
      pool.query(queryTotal, paramsTotal),
      pool.query(queryMetas, params),
      pool.query(queryLeiturasGrafico, params),
      pool.query(queryInfoVeiculo, params)
    ]);
    
    const consumoHoje = Number(resultadoDiario?.consumo_total_hoje ?? 0);
    const consumoMes = Number(resultadoMensal?.consumo_total_mes ?? 0);
    const consumoTotal = Number(resultadoTotal?.consumo_total_contrato ?? 0);
    const metasCalculadas = resultadoMetas || { meta_mensal_total: 0, meta_contrato_total: 0 };
    const metaMensal = Number(metasCalculadas.meta_mensal_total) || 0;
    const metaTotal = Number(metasCalculadas.meta_contrato_total) || 0;
    const metaDiaria = metaMensal > 0 ? metaMensal / 30 : 0;
    
    const consumoPorDia = {};
    for (const leitura of leiturasGrafico) {
      const dia = new Date(leitura.data_leitura).toISOString().split('T')[0];
      if (!consumoPorDia[dia]) consumoPorDia[dia] = 0;
      
      const kmRodado = leitura.km_atual - leitura.km_anterior;
      if (kmRodado > 0) {
        consumoPorDia[dia] += kmRodado;
      }
    }
    const graficoConsumoDiario = Object.keys(consumoPorDia).map(dia => ({
      dia: new Date(dia).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit'}),
      consumo: consumoPorDia[dia]
    }));
    
    const responseData = {
      metas: { diaria: Math.round(metaDiaria), mensal: metaMensal, totalContrato: metaTotal },
      consumoReal: { hoje: consumoHoje, mesAtual: consumoMes, totalAcumulado: consumoTotal },
      graficoConsumoDiario: graficoConsumoDiario,
      infoVeiculo: veiculoId ? infoVeiculo : null
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};


exports.getMuralDaVergonha = async (req, res) => {
  try {
    // Esta query encontra todos os vendedores com alocações ativas
    // que NÃO fizeram um registro de KM na data de hoje.
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

  } catch (error)
   {
    console.error("Erro ao buscar dados do Mural da Vergonha:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};