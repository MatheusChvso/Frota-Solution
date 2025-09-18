    // frontend/src/components/PaginaHistoricoKM.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaginaHistoricoKM = () => {
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/leituras-km/historico', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setHistorico(response.data);
      } catch (error) {
        console.error('Erro ao buscar histórico de KM:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistorico();
  }, []);

  if (isLoading) {
    return <div className="container"><h2>Carregando Histórico...</h2></div>;
  }

  return (
    <div className="container">
      <h1>Histórico de Registro de KM</h1>
      <table className="tabela-historico">
        <thead>
          <tr>
            <th>Data da Leitura</th>
            <th>Veículo</th>
            <th>Placa</th>
            <th>Responsável</th>
            <th>KM Registrado</th>
          </tr>
        </thead>
        <tbody>
          {historico.map((leitura) => (
            <tr key={leitura.id}>
              <td>{new Date(leitura.data_leitura).toLocaleDateString('pt-BR')}</td>
              <td>{leitura.veiculo_modelo}</td>
              <td>{leitura.veiculo_placa}</td>
              <td>{leitura.vendedor_nome}</td>
              <td>{leitura.km_atual.toLocaleString()} km</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaHistoricoKM;