// frontend/src/components/ListaVeiculos.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';


const ListaVeiculos = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [novoVeiculo, setNovoVeiculo] = useState({ placa: '', marca: '', modelo: '', ano: '', km_atual: '', limite_km_mensal: '' });

  // <<< --- NOVOS ESTADOS PARA O MODAL DE EDIÇÃO --- >>>
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [veiculoEditando, setVeiculoEditando] = useState(null);


  const fetchVeiculos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/veiculos');
      setVeiculos(response.data);
    } catch (error) { console.error('Erro ao buscar veículos:', error); }
  };

  useEffect(() => { fetchVeiculos(); }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNovoVeiculo({ ...novoVeiculo, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/veiculos', novoVeiculo);
      setNovoVeiculo({ placa: '', marca: '', modelo: '', ano: '', km_atual: '', limite_km_mensal: '' });
      fetchVeiculos();
    } catch (error) { console.error('Erro ao criar veículo:', error); }
  };

  const handleDelete = async (id) => {
    console.log(`--- Botão Excluir clicado para o veículo ID: ${id} ---`); 
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await axios.delete(`http://localhost:3001/api/veiculos/${id}`);
        fetchVeiculos();
      } catch (error) { console.error('Erro ao excluir veículo:', error); }
    }
  };

  // <<< --- NOVAS FUNÇÕES PARA EDIÇÃO --- >>>
  const handleEdit = (veiculo) => {
    setVeiculoEditando(veiculo);
    setIsModalOpen(true); 
  };  

  const handleModalChange = (event) => {
    const { name, value } = event.target;
    setVeiculoEditando({ ...veiculoEditando, [name]: value });
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/veiculos/${veiculoEditando.id}`, veiculoEditando);
      setIsModalOpen(false);
      setVeiculoEditando(null);
      fetchVeiculos();
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
    }
  };


  return (
    <div>
      <h1>Gestão de Frota</h1>
      <h2>Cadastrar Novo Veículo</h2>
      {/* ... formulário de cadastro que já tínhamos ... */}
      <form onSubmit={handleSubmit}>
        <input name="placa" value={novoVeiculo.placa} onChange={handleInputChange} placeholder="Placa" required />
        <input name="marca" value={novoVeiculo.marca} onChange={handleInputChange} placeholder="Marca" required />
        <input name="modelo" value={novoVeiculo.modelo} onChange={handleInputChange} placeholder="Modelo" required />
        <input name="ano" type="number" value={novoVeiculo.ano} onChange={handleInputChange} placeholder="Ano" required />
        <input name="km_atual" type="number" value={novoVeiculo.km_atual} onChange={handleInputChange} placeholder="KM Atual" />
        <input name="limite_km_mensal" type="number" value={novoVeiculo.limite_km_mensal} onChange={handleInputChange} placeholder="Limite KM Mensal" />
        <button type="submit">Cadastrar</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h2>Frota Atual</h2>
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>KM Atual</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {veiculos.map((veiculo) => (
            <tr key={veiculo.id}>
              <td>{veiculo.placa}</td>
              <td>{veiculo.marca}</td>
              <td>{veiculo.modelo}</td>
              <td>{veiculo.ano}</td>
              <td>{veiculo.km_atual}</td>
              <td>{veiculo.status}</td>
              <td>
                <button onClick={() => handleEdit(veiculo)}>Editar</button> {/* <-- BOTÃO DE EDITAR --> */}
                <button onClick={() => handleDelete(veiculo.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* <<< --- NOVO MODAL DE EDIÇÃO --- >>> */}
      {isModalOpen && veiculoEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Veículo</h2>
            <form onSubmit={handleUpdateSubmit}>
              <input name="placa" value={veiculoEditando.placa} onChange={handleModalChange} />
              <input name="marca" value={veiculoEditando.marca} onChange={handleModalChange} />
              <input name="modelo" value={veiculoEditando.modelo} onChange={handleModalChange} />
              <input name="ano" type="number" value={veiculoEditando.ano} onChange={handleModalChange} />
              <input name="km_atual" type="number" value={veiculoEditando.km_atual} onChange={handleModalChange} />
              <input name="limite_km_mensal" type="number" value={veiculoEditando.limite_km_mensal} onChange={handleModalChange} />
              <input name="data_inicio_contrato" type="date" value={veiculoEditando.data_inicio_contrato || ''} onChange={handleModalChange} placeholder="Data de Início do Contrato" />
              <input name="tempo_contrato_meses" type="number" value={veiculoEditando.tempo_contrato_meses || ''} onChange={handleModalChange} placeholder="Duração do Contrato (meses)" />
              <input name="km_inicial_contrato" type="number" value={veiculoEditando.km_inicial_contrato || ''} onChange={handleModalChange} placeholder="KM Inicial do Contrato" />
              <select name="status" value={veiculoEditando.status} onChange={handleModalChange}>
                <option value="disponivel">Disponível</option>
                <option value="em_uso">Em Uso</option>
                <option value="manutencao">Manutenção</option>
              </select>
              <button type="submit">Salvar Alterações</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListaVeiculos;