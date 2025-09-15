// frontend/src/components/PaginaRelatorio.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Um pequeno componente para a barra de progresso
const ProgressBar = ({ percentage }) => {
  let color = '#4caf50'; // Verde
  if (percentage > 70) color = '#ff9800'; // Laranja
  if (percentage > 90) color = '#f44336'; // Vermelho

  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0de', borderRadius: '4px' }}>
      <div 
        style={{ 
          width: `${percentage > 100 ? 100 : percentage}%`, 
          backgroundColor: color, 
          height: '20px', 
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        {percentage}%
      </div>
    </div>
  );
};

const PaginaRelatorio = () => {
  const [relatorio, setRelatorio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatorio = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/relatorios/consumo-mensal');
        setRelatorio(response.data);
      } catch (error) {
        console.error("Erro ao buscar relatório:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelatorio();
  }, []);

  if (isLoading) {
    return <p>Gerando relatório...</p>;
  }

  return (
    <div>
      <h1>Relatório Mensal de Consumo de KM</h1>
      <p>Este relatório mostra o total de quilômetros rodados por cada veículo no mês corrente.</p>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Veículo</th>
            <th>Limite Mensal (KM)</th>
            <th>Rodado no Mês (KM)</th>
            <th style={{width: '30%'}}>Uso do Limite</th>
          </tr>
        </thead>
        <tbody>
          {relatorio.map(item => (
            <tr key={item.id}>
              <td>{item.modelo} ({item.placa})</td>
              <td>{item.limite_km_mensal}</td>
              <td>{item.km_rodados_mes}</td>
              <td>
                {item.limite_km_mensal > 0 ? (
                  <ProgressBar percentage={item.percentual_usado} />
                ) : (
                  <span>Sem limite definido</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaRelatorio;