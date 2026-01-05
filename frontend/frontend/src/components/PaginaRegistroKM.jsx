// frontend/src/components/PaginaRegistroKM.jsx (CORRIGIDO)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PaginaRegistroKM = () => {
  const { user } = useContext(AuthContext);

  const [listaVeiculos, setListaVeiculos] = useState([]);
  const [alocacaoSelecionadaId, setAlocacaoSelecionadaId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [kmInput, setKmInput] = useState('');
  const [dataLeitura, setDataLeitura] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchVeiculos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url;
      
      // LÓGICA NOVA: Se for admin, busca todos. Se não, busca só os do usuário.
      if (user && user.perfil === 'admin') {
          url = 'http://192.168.17.200:3001/api/leituras-km/todos-veiculos-ativos';
      } else {
          url = 'http://192.168.17.200:3001/api/leituras-km/meu-veiculo';
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setListaVeiculos(response.data);
      
      // Seleciona o primeiro automaticamente se houver lista
      if (response.data.length > 0) {
        setAlocacaoSelecionadaId(response.data[0].id_alocacao.toString());
      }
    } catch (err) {
      setError('Erro ao buscar lista de veículos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Garante que só busca quando o user estiver carregado
    if (user) {
        fetchVeiculos();
    }
  }, [user]);

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
        id_alocacao: Number(alocacaoSelecionadaId)
      };
      await axios.post('http://192.168.17.200:3001/api/leituras-km', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Quilometragem registrada com sucesso!');
      setKmInput('');
      fetchVeiculos(); // Atualiza a lista para pegar a KM nova
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocorreu um erro ao registrar.';
      setError(errorMessage);
    }
  };
  
  const veiculoAtual = alocacaoSelecionadaId 
    ? listaVeiculos.find(v => v.id_alocacao === Number(alocacaoSelecionadaId)) 
    : null;

  if (isLoading) {
    return <p>Carregando informações...</p>;
  }

  return (
    <div>
      <h1>Registrar KM {user?.perfil === 'admin' ? '(Administrativo)' : 'Diário'}</h1>
      <p>Olá, {user?.nome}!</p>

      {listaVeiculos.length > 0 ? (
        <div>
          {/* Mostra o select se for Admin OU se o usuário tiver mais de 1 carro */}
          {(listaVeiculos.length > 1 || user?.perfil === 'admin') && (
            <div style={{marginBottom: '1rem'}}>
              <label htmlFor="veiculo-select" style={{display: 'block', marginBottom: '0.5rem'}}>
                  {user?.perfil === 'admin' ? 'Selecione o Veículo/Condutor:' : 'Selecione o Veículo:'}
              </label>
              <select 
                id="veiculo-select"
                value={alocacaoSelecionadaId}
                onChange={(e) => setAlocacaoSelecionadaId(e.target.value)}
                style={{ padding: '8px', minWidth: '300px' }}
              >
                {listaVeiculos.map(v => (
                  <option key={v.id_alocacao} value={v.id_alocacao.toString()}>
                    {/* Exibe o nome do condutor se for admin */}
                    {user?.perfil === 'admin' && v.nome_condutor ? `${v.nome_condutor} - ` : ''}
                    {v.modelo} ({v.placa})
                  </option>
                ))}
              </select>
            </div>
          )}

          {veiculoAtual && (
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
              <h2>Dados do Veículo</h2>
              {user?.perfil === 'admin' && veiculoAtual.nome_condutor && (
                  <p><strong>Condutor Responsável:</strong> {veiculoAtual.nome_condutor}</p>
              )}
              <p><strong>Placa:</strong> {veiculoAtual.placa}</p>
              <p><strong>Modelo:</strong> {veiculoAtual.modelo}</p>
              <p><strong>Última KM Registrada:</strong> {veiculoAtual.km_atual ? veiculoAtual.km_atual.toLocaleString('pt-BR') : 0} km</p>
            </div>
          )}

          <hr style={{ margin: '20px 0' }} />

          <h3>Inserir Nova Leitura</h3>
          <form onSubmit={handleSubmit} className="form-cadastro">
            <input 
              type="number" 
              value={kmInput}
              onChange={(e) => setKmInput(e.target.value)}
              placeholder={`Maior que ${veiculoAtual?.km_atual || 0}`}
              required 
            />
            <input 
              type="date" 
              value={dataLeitura}
              onChange={(e) => setDataLeitura(e.target.value)}
              required
            />
            <button type="submit">Registrar Leitura</button>
          </form>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
        </div>
      ) : (
        <div>
          <h2>Nenhum veículo ativo encontrado</h2>
          <p>Não há alocações ativas no momento para exibir.</p>
        </div>
      )}
    </div>
  );
};

export default PaginaRegistroKM;