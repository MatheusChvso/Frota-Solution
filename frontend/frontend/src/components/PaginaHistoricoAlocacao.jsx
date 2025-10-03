import React, { useState, useEffect } from 'react';
import api from '../api'; // Usamos o nosso centralizador de API

const PaginaHistoricoAlocacao = () => {
  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        // Faz a chamada para a nova rota de histórico que iremos criar no backend
        const response = await api.get('/alocacoes/historico');
        setHistorico(response.data);
      } catch (err) {
        setError('Falha ao carregar o histórico. Verifique se tem permissão e tente novamente.');
        console.error('Erro ao buscar histórico de alocações:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  if (isLoading) {
    return <p>A carregar histórico de alocações...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Histórico de Alocações</h1>
      <p>Todos os registos de alocação de veículos, incluindo os já finalizados.</p>
      
      <table style={{ marginTop: '1.5rem' }}>
        <thead>
          <tr>
            <th>Veículo (Modelo e Placa)</th>
            <th>Vendedor</th>
            <th>Data de Início</th>
            <th>Data de Fim</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {historico.length > 0 ? (
            historico.map(aloc => (
              <tr key={aloc.id}>
                <td>{aloc.modelo} ({aloc.placa})</td>
                <td>{aloc.vendedor_nome}</td>
                <td>{new Date(aloc.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>
                  {aloc.data_fim 
                    ? new Date(aloc.data_fim).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                    : '—'}
                </td>
                <td>
                  {aloc.data_fim 
                    ? <span style={{ color: '#6c757d', fontWeight: 'bold' }}>Finalizada</span> 
                    : <span style={{ color: '#28a745', fontWeight: 'bold' }}>Ativa</span>}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum registo de alocação encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaHistoricoAlocacao;
