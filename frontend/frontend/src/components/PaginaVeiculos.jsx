import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const PaginaVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: '', marca: '', modelo: '', ano: '', km_atual: '',
    limite_km_mensal: '', data_inicio_contrato: '', tempo_contrato_meses: '', km_inicial_contrato: ''
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);
  const [error, setError] = useState('');

  const fetchVeiculos = async () => {
    try {
      const response = await api.get('/veiculos');
      setVeiculos(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
    }
  };

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoVeiculo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/veiculos', novoVeiculo);
      setNovoVeiculo({ placa: '', marca: '', modelo: '', ano: '', km_atual: '', limite_km_mensal: '', data_inicio_contrato: '', tempo_contrato_meses: '', km_inicial_contrato: '' });
      fetchVeiculos();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar veículo.');
      console.error('Erro ao criar veículo:', error);
    }
  };

  const handleEdit = (veiculo) => {
    const veiculoParaEditar = {
      ...veiculo,
      data_inicio_contrato: veiculo.data_inicio_contrato 
        ? new Date(veiculo.data_inicio_contrato).toISOString().split('T')[0] 
        : ''
    };
    setVeiculoEditando(veiculoParaEditar);
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setVeiculoEditando(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/veiculos/${veiculoEditando.id}`, veiculoEditando);
      setIsModalOpen(false);
      fetchVeiculos();
    } catch (error) {
      console.error('ERRO ao atualizar veículo:', error);
      alert(error.response?.data?.error || 'Erro ao atualizar.');
    }
  };

  const handleAbrirConfirmacaoDelete = (id) => {
    setIdParaDeletar(id);
  };

  const handleConfirmarDelete = async () => {
    if (!idParaDeletar) return;
    try {
      await api.delete(`/veiculos/${idParaDeletar}`);
      fetchVeiculos();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir veículo.');
    } finally {
      setIdParaDeletar(null);
    }
  };

  return (
    <div>
      <h2>Cadastrar Novo Veículo</h2>
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
          {/* Campos Básicos */}
          <input name="placa" value={novoVeiculo.placa} onChange={handleInputChange} placeholder="Placa" required />
          <input name="marca" value={novoVeiculo.marca} onChange={handleInputChange} placeholder="Marca" required />
          <input name="modelo" value={novoVeiculo.modelo} onChange={handleInputChange} placeholder="Modelo" required />
          <input name="ano" type="number" value={novoVeiculo.ano} onChange={handleInputChange} placeholder="Ano" required />
          
          {/* Campos de Contrato - AGORA OBRIGATÓRIOS */}
          <input name="km_inicial_contrato" type="number" value={novoVeiculo.km_inicial_contrato} onChange={handleInputChange} placeholder="KM Inicial do Contrato" required />
          <input name="limite_km_mensal" type="number" value={novoVeiculo.limite_km_mensal} onChange={handleInputChange} placeholder="Limite KM Mensal" required />
          <input name="data_inicio_contrato" type="date" value={novoVeiculo.data_inicio_contrato} onChange={handleInputChange} required />
          <input name="tempo_contrato_meses" type="number" value={novoVeiculo.tempo_contrato_meses} onChange={handleInputChange} placeholder="Duração Contrato (meses)" required />
          
          {/* Campo Opcional */}
          <input name="km_atual" type="number" value={novoVeiculo.km_atual} onChange={handleInputChange} placeholder="KM Atual (opcional)" />

          <button type="submit">Cadastrar</button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Veículos Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Modelo</th>
            <th>KM Atual</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((veiculo) => (
            <tr key={veiculo.id}>
              <td>{veiculo.placa}</td>
              <td>{veiculo.modelo}</td>
              <td>{veiculo.km_atual.toLocaleString('pt-BR')}</td>
              <td>{veiculo.status}</td>
              <td>
                <button onClick={() => handleEdit(veiculo)}><FaPencilAlt /></button>
                <button onClick={() => handleAbrirConfirmacaoDelete(veiculo.id)} style={{backgroundColor: 'var(--cor-vermelho-royal)', color: 'white'}}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && veiculoEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Veículo</h2>
            <form onSubmit={handleUpdateSubmit}>
                {/* Campos Básicos */}
                <input name="placa" value={veiculoEditando.placa} onChange={handleModalChange} placeholder="Placa" required />
                <input name="marca" value={veiculoEditando.marca} onChange={handleModalChange} placeholder="Marca" required />
                <input name="modelo" value={veiculoEditando.modelo} onChange={handleModalChange} placeholder="Modelo" required />
                <input name="ano" type="number" value={veiculoEditando.ano} onChange={handleModalChange} placeholder="Ano" required />
                <input name="km_atual" type="number" value={veiculoEditando.km_atual} onChange={handleModalChange} placeholder="KM Atual" />
                
                {/* Campos de Contrato - AGORA OBRIGATÓRIOS */}
                <input name="km_inicial_contrato" type="number" value={veiculoEditando.km_inicial_contrato || ''} onChange={handleModalChange} placeholder="KM Inicial do Contrato" required />
                <input name="limite_km_mensal" type="number" value={veiculoEditando.limite_km_mensal || ''} onChange={handleModalChange} placeholder="Limite KM Mensal" required />
                <input name="data_inicio_contrato" type="date" value={veiculoEditando.data_inicio_contrato || ''} onChange={handleModalChange} required />
                <input name="tempo_contrato_meses" type="number" value={veiculoEditando.tempo_contrato_meses || ''} onChange={handleModalChange} placeholder="Duração Contrato (meses)" required />
                
                <select name="status" value={veiculoEditando.status} onChange={handleModalChange}>
                    <option value="disponivel">Disponível</option>
                    <option value="em_uso">Em Uso</option>
                    <option value="manutencao">Manutenção</option>
                </select>
                <div className="modal-actions">
                    <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit">Salvar Alterações</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {idParaDeletar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Exclusão</h2>
            <p>Tem a certeza de que deseja excluir o veículo? Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setIdParaDeletar(null)}>Cancelar</button>
              <button 
                type="button" 
                onClick={handleConfirmarDelete} 
                style={{backgroundColor: 'var(--cor-vermelho-royal)', color: 'white'}}>
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaVeiculos;