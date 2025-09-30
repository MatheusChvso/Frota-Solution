// frontend/src/components/PaginaMural.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Paginamural.css';

const PaginaMural = () => {
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://192.168.17.200:3001/api/dashboard/status-registros', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRegistros(response.data);
      } catch (error) {
        console.error('Erro ao buscar status de registos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const pendentes = registros.filter(r => r.status_registro === 'Pendente');
  const feitos = registros.filter(r => r.status_registro === 'Feito');

  if (isLoading) {
    return <div className="container"><p>A verificar os registos do dia...</p></div>;
  }

  return (
    <div className="container pagina-checklist">
      <div className="checklist-titulo">
        <h1>Checklist de Registos Diários</h1>
        <p>Acompanhamento de quem já registou a quilometragem hoje.</p>
      </div>

      {registros.length > 0 && pendentes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
          <h2>🎉 Incrível! O Checklist está Completo! 🎉</h2>
          <p>Todos os vendedores registaram a quilometragem hoje. Bom trabalho, equipa!</p>
        </div>
      ) : (
        <div className="checklist-container">
          {/* Coluna de Registos Pendentes */}
          <div className="checklist-coluna">
            <h2>🚨 Pendentes ({pendentes.length})</h2>
            {pendentes.map(p => (
              <div key={p.placa} className="checklist-card pendente">
                <h3>{p.nome}</h3>
                <p>{p.modelo} ({p.placa})</p>
                {/* ALTERAÇÃO: Exibe a data do último registo, se existir */}
                {p.ultima_leitura ? (
                  <p className="checklist-data">
                    Último registo: {new Date(p.ultima_leitura).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                ) : (
                  <p className="checklist-data">Nenhum registo encontrado</p>
                )}
              </div>
            ))}
          </div>

          {/* Coluna de Registos Feitos */}
          <div className="checklist-coluna">
            <h2>✅ Feitos ({feitos.length})</h2>
            {feitos.map(p => (
              <div key={p.placa} className="checklist-card feito">
                <h3>{p.nome}</h3>
                <p>{p.modelo} ({p.placa})</p>
                {p.ultima_leitura && (
                  <p className="checklist-data">
                    Registado em: {new Date(p.ultima_leitura).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaMural;

