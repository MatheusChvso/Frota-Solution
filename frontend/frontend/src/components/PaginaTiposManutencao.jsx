// frontend/src/components/PaginaTiposManutencao.jsx (VERSÃO COM LOGS)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaTrash } from 'react-icons/fa'; // Mantemos os ícones para o futuro

const PaginaTiposManutencao = () => {
  const [tipos, setTipos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Mantemos os outros estados para quando a página voltar ao normal
  const [novoTipo, setNovoTipo] = useState({ nome: '', intervalo_km_padrao: '', descricao: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);

  const fetchTipos = async () => {
    console.log('1. Iniciando busca de dados no frontend...');
    try {
      const response = await axios.get('http://localhost:3001/api/manutencao/tipos');
      console.log('2. Dados recebidos da API:', response.data);
      setTipos(response.data);
      console.log('3. Estado "tipos" foi atualizado.');
    } catch (error) {
      console.error("!!! ERRO AO BUSCAR DADOS:", error);
    } finally {
      setIsLoading(false);
      console.log('4. "isLoading" foi definido como false.');
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  // As outras funções (handleSubmit, etc.) não serão usadas neste teste,
  // mas podemos deixá-las aqui por enquanto.

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <h1>Gerenciar Tipos de Manutenção</h1>
      {/* O formulário fica aqui, mas não vamos usá-lo no teste */}

      <hr style={{ margin: '20px 0' }} />

      <h2>Tipos de Manutenção Cadastrados</h2>
      <table>
        <thead>
          <tr>
            <th>Nome do Serviço</th>
            <th>Intervalo Padrão</th>
            <th>Descrição</th>
            {/* <th>Ações</th> */}
          </tr>
        </thead>
        <tbody>
          {console.log('5. Renderizando a tabela. O valor de "tipos" é:', tipos)}
          {tipos.map(tipo => (
            <tr key={tipo.id}>
              <td>{tipo.nome}</td>
              <td>{tipo.intervalo_km_padrao} km</td>
              <td>{tipo.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaginaTiposManutencao;