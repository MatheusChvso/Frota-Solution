import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Importa o novo componente
import SaldoVeiculo from '../components/SaldoVeiculo'; 
import './DashboardConsumo.css';

const DashboardConsumo = () => {
  const [saldos, setSaldos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaldos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dashboard/saldos-veiculos');
        // Renomeando a coluna para maior clareza, caso necessário
        const dadosFormatados = response.data.map(d => ({ ...d, consumo_real_total: d.consumo_real_total || d.consumo_real }));
        setSaldos(dadosFormatados);
      } catch (error) {
        console.error('Erro ao buscar saldos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSaldos();
  }, []);

  if (isLoading) {
    return <div className="dashboard-container"><p>Calculando saldos da frota...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Análise de Saldo de KM da Frota</h1>
      <table className="tabela-saldos">
        <thead>
          <tr>
            <th>Veículo</th>
            <th>Responsável</th>
            <th style={{width: '50%'}}>Balanço de Consumo</th>
            <th>Saldo Atual (km)</th>
          </tr>
        </thead>
        <tbody>
          {saldos.map((veiculo) => (
            <tr key={veiculo.id}>
              <td>{veiculo.modelo} ({veiculo.placa})</td>
              <td>{veiculo.responsavel || 'N/A'}</td>
              {/* Usa o novo componente aqui */}
              <td>
                <SaldoVeiculo veiculo={veiculo} />
              </td>
              <td style={{ color: veiculo.saldo_km < 0 ? '#f44336' : '#4caf50', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {veiculo.saldo_km.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardConsumo;