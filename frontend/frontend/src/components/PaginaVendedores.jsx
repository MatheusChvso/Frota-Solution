// frontend/src/components/PaginaVendedores.jsx (VERSÃO ATUALIZADA)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrash } from 'react-icons/fa'; // Importa os ícones

const PaginaVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [novoVendedor, setNovoVendedor] = useState({ nome: '', email: '', matricula: '', senha: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState(null);
  const [idParaDeletar, setIdParaDeletar] = useState(null); // Estado para o modal de exclusão

  const fetchVendedores = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/vendedores');
      setVendedores(response.data);
    } catch (error) { console.error('Erro ao buscar vendedores:', error); }
  };

  useEffect(() => { fetchVendedores(); }, []);

  const handleInputChange = (event) => { /* ...código existente... */ };
  const handleSubmit = async (event) => { /* ...código existente... */ };
  const handleEdit = (vendedor) => { /* ...código existente... */ };
  const handleModalChange = (event) => { /* ...código existente... */ };
  const handleUpdateSubmit = async (event) => { /* ...código existente... */ };

  // Lógica de exclusão atualizada
  const handleAbrirConfirmacaoDelete = (id) => {
    setIdParaDeletar(id);
  };

  const handleConfirmarDelete = async () => {
    if (!idParaDeletar) return;
    try {
      await axios.delete(`http://localhost:3001/api/vendedores/${idParaDeletar}`);
      fetchVendedores();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir vendedor.');
      console.error('Erro ao excluir vendedor:', error);
    } finally {
      setIdParaDeletar(null);
    }
  };

  return (
    <div>
      <h1>Gerenciar Vendedores</h1>
      <h2>Cadastrar Novo Vendedor</h2>
      <form onSubmit={handleSubmit}>
        {/* ... inputs do formulário ... */}
        <button type="submit">Cadastrar Vendedor</button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Vendedores Cadastrados</h2>
      {/* Tabela sem border="1" */}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Matrícula</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map((vendedor) => (
            <tr key={vendedor.id}>
              <td>{vendedor.nome}</td>
              <td>{vendedor.email}</td>
              <td>{vendedor.matricula}</td>
              <td>
                {/* Botões com ícones */}
                <button onClick={() => handleEdit(vendedor)}><FaPencilAlt /></button>
                <button onClick={() => handleAbrirConfirmacaoDelete(vendedor.id)} style={{backgroundColor: 'var(--cor-vermelho-royal)', color: 'white'}}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Edição (sem alterações na lógica) */}
      {isModalOpen && vendedorEditando && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <h2>Editar Vendedor</h2>
                  <form onSubmit={handleUpdateSubmit}>
                    {/* ... inputs do modal de edição ... */}
                    <div className="modal-actions">
                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit">Salvar Alterações</button>
                    </div>
                  </form>
              </div>
          </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {idParaDeletar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Exclusão</h2>
            <p>Você tem certeza que deseja excluir este vendedor?</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setIdParaDeletar(null)}>Cancelar</button>
              <button type="button" onClick={handleConfirmarDelete} style={{backgroundColor: 'var(--cor-vermelho-royal)', color: 'white'}}>
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaVendedores;