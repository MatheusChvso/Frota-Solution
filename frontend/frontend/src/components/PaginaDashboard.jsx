// frontend/src/components/PaginaDashboard.jsx
import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { ProgressBar } from './PaginaRelatorio'; // Reutilizando nosso componente

const PaginaDashboard = () => {
  const [dados, setDados] = useState([]); // Agora é uma lista
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dashboard/visao-geral');
        setDados(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDados();
  }, []);

  if (isLoading) return <p>Carregando dashboard...</p>;

  return (
    <div>
      <h1>Dashboard - Visão Geral dos Contratos</h1>
      <p style={{ color: 'var(--cor-texto-secundario)', marginBottom: '16px' }}>
        Acompanhamento do consumo total de quilometragem de cada veículo em relação ao seu limite contratual.
      </p>
      <table style={{marginTop: '20px'}}>
        <thead>
          <tr>
            <th>Veículo</th>
            <th>Limite do Contrato (KM)</th>
            <th>Total Rodado (KM)</th>
            <th style={{width: '30%'}}>Uso do Contrato</th>
          </tr>
        </thead>
        <tbody>
          {dados.map(veiculo => (
            <tr key={veiculo.id}>
              <td>{veiculo.modelo} ({veiculo.placa})</td>
              <td>{veiculo.limiteContrato.toLocaleString('pt-BR')}</td>
              <td>{veiculo.kmTotalRodado.toLocaleString('pt-BR')}</td>
              <td>
                <ProgressBar percentage={veiculo.percentualUso} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaDashboard;