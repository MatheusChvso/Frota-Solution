// frontend/src/components/PaginaMural.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaginaMural = () => {
  const [pendentes, setPendentes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendentes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dashboard/mural-da-vergonha');
        setPendentes(response.data);
      } catch (error) {
        console.error('Erro ao buscar pendentes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendentes();
  }, []);

  if (isLoading) {
    return <p>Verificando os registros do dia...</p>;
  }

  return (
    <div className="pagina-mural">
      <div className="mural-titulo">
        <h1>Mural da Vergonha</h1>
        <p>🏆 O CLUBE DO "AMANHÃ EU ANOTO" 🏆</p>
      </div>

      {pendentes.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {pendentes.map((p, index) => (
            <div key={index} className="mural-card">
              {/* Adicionaremos a foto aqui no futuro */}
              <img 
                src={p.caminho_foto || 'https://via.placeholder.com/150/cccccc/000000?Text=PROCURADO'} 
                alt={`Foto de ${p.nome}`}
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <h3 style={{ marginTop: '10px' }}>{p.nome}</h3>
              <p>Visto pela última vez com o veículo:</p>
              <p><strong>{p.modelo} ({p.placa})</strong></p>
              <p>A quilometragem atual é um mistério...</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
          <h2>🎉 Incrível! O Mural está Vazio! 🎉</h2>
          <p>Todos os vendedores registraram a quilometragem hoje. Bom trabalho, equipe!</p>
        </div>
      )}
    </div>
  );
};

export default PaginaMural;