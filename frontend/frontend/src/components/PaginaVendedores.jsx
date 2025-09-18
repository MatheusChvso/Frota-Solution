// frontend/src/components/PaginaVendedores.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const PaginaVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [novoVendedor, setNovoVendedor] = useState({ nome: '', email: '', matricula: '', senha: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null);

  const fetchVendedores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/vendedores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVendedores(response.data);
    } catch (error) { console.error('Erro ao buscar vendedores:', error); }
  };

  useEffect(() => { fetchVendedores(); }, []);

  // --- FUNÇÕES PREENCHIDAS ---

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNovoVendedor({ ...novoVendedor, [name]: value });
  };

  const handleSubmit = async (event) => {
    // 1. Previne o refresh da página
    event.preventDefault(); 
    
    try {
      const token = localStorage.getItem('token');
      // 2. Inclui o token na requisição
      await axios.post('http://localhost:3001/api/vendedores', novoVendedor, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Vendedor cadastrado com sucesso!');
      setNovoVendedor({ nome: '', email: '', matricula: '', senha: '' }); // Limpa o formulário
      fetchVendedores(); // Atualiza a lista
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao cadastrar vendedor.');
      console.error('Erro ao cadastrar vendedor:', error);
    }
  };

  const handleEdit = (vendedor) => {
    setVendedorEditando({ ...vendedor }); // Copia os dados para o estado de edição
    setIsModalOpen(true);
  };

  const handleModalChange = (event) => {
    const { name, value } = event.target;
    setVendedorEditando({ ...vendedorEditando, [name]: value });
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/vendedores/${vendedorEditando.id}`, vendedorEditando, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsModalOpen(false);
      fetchVendedores();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao atualizar vendedor.');
      console.error('Erro ao atualizar vendedor:', error);
    }
  };

  const handleAbrirConfirmacaoDelete = (id) => {
    setIdParaDeletar(id);
  };

  const handleConfirmarDelete = async () => {
    if (!idParaDeletar) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/vendedores/${idParaDeletar}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVendedores();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir vendedor.');
      console.error('Erro ao excluir vendedor:', error);
    } finally {
      setIdParaDeletar(null);
    }
  };

  // --- JSX (COM FORMULÁRIO COMPLETO) ---
  return (
    <div>
      <h1>Gerenciar Vendedores</h1>
      <h2>Cadastrar Novo Vendedor</h2>
      <form onSubmit={handleSubmit} className="form-cadastro">
        <input type="text" name="nome" value={novoVendedor.nome} onChange={handleInputChange} placeholder="Nome Completo" required />
        <input type="email" name="email" value={novoVendedor.email} onChange={handleInputChange} placeholder="Email" required />
        <input type="text" name="matricula" value={novoVendedor.matricula} onChange={handleInputChange} placeholder="Matrícula (opcional)" />
        <input type="password" name="senha" value={novoVendedor.senha} onChange={handleInputChange} placeholder="Senha" required />
        <button type="submit">Cadastrar Vendedor</button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Vendedores Cadastrados</h2>
      <table>
        <thead>
          <tr><th>Nome</th><th>Email</th><th>Matrícula</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {vendedores.map((vendedor) => (
            <tr key={vendedor.id}>
              <td>{vendedor.nome}</td><td>{vendedor.email}</td><td>{vendedor.matricula}</td>
              <td>
                <button onClick={() => handleEdit(vendedor)}><FaPencilAlt /></button>
                <button onClick={() => handleAbrirConfirmacaoDelete(vendedor.id)} style={{backgroundColor: 'var(--cor-vermelho-royal)', color: 'white'}}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && vendedorEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Vendedor</h2>
            <form onSubmit={handleUpdateSubmit}>
              <label>Nome:</label><input type="text" name="nome" value={vendedorEditando.nome} onChange={handleModalChange} required />
              <label>Email:</label><input type="email" name="email" value={vendedorEditando.email} onChange={handleModalChange} required />
              <label>Matrícula:</label><input type="text" name="matricula" value={vendedorEditando.matricula} onChange={handleModalChange} />
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
            <p>Você tem certeza que deseja excluir este vendedor?</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setIdParaDeletar(null)}>Cancelar</button>
              <button type="button" onClick={handleConfirmarDelete} style={{backgroundColor: 'var(--cor-vermelho-royal)', color: 'white'}}>Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaVendedores;