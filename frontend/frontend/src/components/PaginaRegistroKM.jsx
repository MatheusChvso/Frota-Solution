// frontend/src/components/PaginaRegistroKM.jsx (CORRIGIDO)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PaginaRegistroKM = () => {
  const { user } = useContext(AuthContext);

  const [meusVeiculos, setMeusVeiculos] = useState([]);
  const [alocacaoSelecionadaId, setAlocacaoSelecionadaId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [kmInput, setKmInput] = useState('');
  const [dataLeitura, setDataLeitura] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMeusVeiculos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://192.168.17.200:3001/api/leituras-km/meu-veiculo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeusVeiculos(response.data);
      if (response.data.length > 0) {
        setAlocacaoSelecionadaId(response.data[0].id_alocacao.toString()); // Garante que o valor inicial seja string
      }
    } catch (err) {
      setError('Erro ao buscar seus veículos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeusVeiculos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!alocacaoSelecionadaId) {
      setError('Por favor, selecione um veículo.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        km_atual: parseInt(kmInput, 10),
        data_leitura: dataLeitura,
        id_alocacao: Number(alocacaoSelecionadaId) // CORREÇÃO: Converte para número antes de enviar
      };
      await axios.post('http://192.168.17.200:3001/api/leituras-km', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Quilometragem registrada com sucesso!');
      setKmInput('');
      fetchMeusVeiculos();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao registrar.';
      setError(errorMessage);
    }
  };
  
  // CORREÇÃO: Converte o ID selecionado (string) para número antes de comparar
  const veiculoAtual = alocacaoSelecionadaId 
    ? meusVeiculos.find(v => v.id_alocacao === Number(alocacaoSelecionadaId)) 
    : null;

  if (isLoading) {
    return <p>Carregando informações...</p>;
  }

  return (
    <div>
      <h1>Registrar KM Diário</h1>
      <p>Bem-vindo, {user?.nome}!</p>

      {meusVeiculos.length > 0 ? (
        <div>
          {meusVeiculos.length > 1 && (
            <div style={{marginBottom: '1rem'}}>
              <label htmlFor="veiculo-select" style={{display: 'block', marginBottom: '0.5rem'}}>Selecione o Veículo:</label>
              <select 
                id="veiculo-select"
                value={alocacaoSelecionadaId}
                onChange={(e) => setAlocacaoSelecionadaId(e.target.value)}
              >
                {meusVeiculos.map(v => (
                  <option key={v.id_alocacao} value={v.id_alocacao.toString()}>
                    {v.modelo} ({v.placa})
                  </option>
                ))}
              </select>
            </div>
          )}

          {veiculoAtual && (
            <div>
              <h2>Veículo Selecionado</h2>
              <p><strong>Placa:</strong> {veiculoAtual.placa}</p>
              <p><strong>Modelo:</strong> {veiculoAtual.modelo}</p>
              <p><strong>Última KM Registrada:</strong> {veiculoAtual.km_atual.toLocaleString('pt-BR')} km</p>
            </div>
          )}

          <hr style={{ margin: '20px 0' }} />

          <h3>Registrar Nova Quilometragem</h3>
          <form onSubmit={handleSubmit} className="form-cadastro">
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
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
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