// frontend/src/components/PaginaHistoricoKM.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';

const PaginaHistoricoKM = () => {
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://192.168.17.200:3001/api/leituras-km/historico', {
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

  const headers = [
    { label: "Data da Leitura", key: "data_leitura" },
    { label: "Modelo Veículo", key: "veiculo_modelo" },
    { label: "Placa Veículo", key: "veiculo_placa" },
    { label: "Responsável", key: "vendedor_nome" },
    { label: "KM Registrado", key: "km_atual" },
    { label: "KM Percorridos", key: "km_percorridos" }
  ];

  // ==== ESTILO DO BOTÃO DEFINIDO DIRETAMENTE AQUI ====
  const buttonStyle = {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#007bff', // Uma cor azul padrão que sempre será visível
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer'
  };

  if (isLoading) {
    return <div className="container"><h2>Carregando Histórico...</h2></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Histórico de Registro de KM</h1>
        
        {/* Usando a propriedade 'style' para garantir a visibilidade */}
        <CSVLink
          data={historico}
          headers={headers}
          filename={"historico-km.csv"}
          style={buttonStyle} // <-- A CORREÇÃO ESTÁ AQUI
          target="_blank"
        >
          Exportar para CSV
        </CSVLink>
      </div>
      
      <table className="tabela-historico">
        <thead>
          <tr>
            <th>Data da Leitura</th>
            <th>Veículo</th>
            <th>Placa</th>
            <th>Responsável</th>
            <th>KM Registrado</th>
            <th>KM Percorridos</th> 
          </tr>
        </thead>
        <tbody>
          {historico.map((leitura) => (
            <tr key={leitura.id}>
              <td>{new Date(leitura.data_leitura).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
              <td>{leitura.veiculo_modelo}</td>
              <td>{leitura.veiculo_placa}</td>
              <td>{leitura.vendedor_nome}</td>
              <td>{leitura.km_atual.toLocaleString()} km</td>
              <td style={{ fontWeight: 'bold' }}>
                {leitura.km_percorridos > 0 ? `${leitura.km_percorridos.toLocaleString()} km` : '---'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaHistoricoKM;