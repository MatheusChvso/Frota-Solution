import React, { useState, useEffect } from 'react';
import api from '../api'; // Usa o novo ficheiro central
import './Paginamural.css';

const PaginaMural = () => {
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Agora a chamada é mais limpa, sem precisar de configurar cabeçalhos
        const response = await api.get('/dashboard/status-registros');
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
                {/* LÓGICA CORRIGIDA PARA PENDENTES */}
                <p className="checklist-card-data">
                  {p.data_ultimo_registro
                    ? `Último registo: ${new Date(p.data_ultimo_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                    : 'Nenhum registo encontrado'
                  }
                </p>
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
                 {/* LÓGICA CORRIGIDA PARA FEITOS */}
                <p className="checklist-card-data">
                  {p.data_ultimo_registro
                    ? `Registado em: ${new Date(p.data_ultimo_registro).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                    : ''
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaMural;

