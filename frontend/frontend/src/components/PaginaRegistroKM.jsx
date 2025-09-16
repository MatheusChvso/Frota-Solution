// frontend/src/components/PaginaRegistroKM.jsx (VERSÃO REFINADA)

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PaginaRegistroKM = () => {
  const { user } = useContext(AuthContext); // Pega o usuário logado do contexto

  const [meuVeiculo, setMeuVeiculo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kmInput, setKmInput] = useState('');
  const [dataLeitura, setDataLeitura] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMeuVeiculo = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/leituras-km/meu-veiculo');
      setMeuVeiculo(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setMeuVeiculo(null); // Usuário não tem veículo alocado
      } else {
        setError('Erro ao buscar dados do veículo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeuVeiculo();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!kmInput) {
      setError('Por favor, insira a quilometragem.');
      return;
    }

    try {
      const payload = {
        km_atual: parseInt(kmInput, 10),
        data_leitura: dataLeitura
      };
      await axios.post('http://localhost:3001/api/leituras-km', payload);
      setSuccess('Quilometragem registrada com sucesso!');
      setKmInput(''); // Limpa o input
      fetchMeuVeiculo(); // Re-busca os dados para atualizar a KM na tela
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao registrar.';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return <p>Carregando informações...</p>;
  }

  return (
    <div>
      <h1>Minha Página</h1>
      {/* AJUSTE AQUI para usar optional chaining */}
      <p>Bem-vindo, {user?.nome}!</p>

      {meuVeiculo ? (
        <div>
          <h2>Seu Veículo Alocado</h2>
          <p><strong>Placa:</strong> {meuVeiculo.placa}</p>
          <p><strong>Modelo:</strong> {meuVeiculo.modelo}</p>
          <p><strong>Última KM Registrada:</strong> {meuVeiculo.km_atual.toLocaleString('pt-BR')} km</p>

          <hr style={{ margin: '20px 0' }} />

          <h3>Registrar Nova Quilometragem</h3>
          <form onSubmit={handleSubmit}>
            <input 
              type="number" 
              value={kmInput}
              onChange={(e) => setKmInput(e.target.value)}
              placeholder="KM atual do odômetro"
              required 
            />
            <input 
              type="date" 
              value={dataLeitura}
              onChange={(e) => setDataLeitura(e.target.value)}
              required
            />
            <button type="submit">Registrar</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}
        </div>
      ) : (
        <div>
          <h2>Nenhum Veículo Alocado</h2>
          <p>Você não possui um veículo alocado no momento. Entre em contato com o gestor da frota.</p>
        </div>
      )}
    </div>
  );
};

export default PaginaRegistroKM;