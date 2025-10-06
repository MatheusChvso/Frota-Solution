import React, { useState, useEffect } from 'react';
import api from '../api'; // Usar o ficheiro central

const StatusBadge = ({ status }) => {
    const style = { padding: '4px 8px', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '0.8em' };
    if (status === 'Atrasada') style.backgroundColor = 'var(--cor-vermelho-royal)';
    else if (status === 'Atenção') style.backgroundColor = '#ff9800';
    else style.backgroundColor = '#4caf50';
    return <span style={style}>{status}</span>;
};

const MaintenanceModal = ({ vehicle, tiposManutencao, onClose, onUpdate }) => {
    const [historico, setHistorico] = useState([]);
    const [novoRegistro, setNovoRegistro] = useState({
        id_tipo_manutencao: '',
        data_realizacao: new Date().toISOString().split('T')[0],
        km_realizacao: vehicle.km_atual,
        custo: '',
        observacoes: ''
    });

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const res = await api.get(`/manutencao/historico/${vehicle.id}`);
                setHistorico(res.data);
            } catch (error) { console.error("Erro ao buscar histórico", error); }
        };
        fetchHistorico();
    }, [vehicle.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNovoRegistro(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/manutencao/historico', {
                ...novoRegistro,
                id_veiculo: vehicle.id
            });
            alert('Serviço registado com sucesso!');
            onUpdate();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao registar serviço.');
            console.error("Erro ao registar serviço:", error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{width: '600px'}}>
                <h2>Histórico de Manutenção - {vehicle.modelo} ({vehicle.placa})</h2>
                <form onSubmit={handleSubmit} style={{marginBottom: '20px'}}>
                    <h4>Registar Novo Serviço Realizado</h4>
                    <select name="id_tipo_manutencao" value={novoRegistro.id_tipo_manutencao} onChange={handleInputChange} required><option value="">Selecione o tipo de serviço</option>{tiposManutencao.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}</select>
                    <input name="km_realizacao" type="number" value={novoRegistro.km_realizacao} onChange={handleInputChange} placeholder="KM da realização" required />
                    <input name="data_realizacao" type="date" value={novoRegistro.data_realizacao} onChange={handleInputChange} required />
                    <input name="custo" type="number" step="0.01" value={novoRegistro.custo} onChange={handleInputChange} placeholder="Custo (opcional)" />
                    <textarea name="observacoes" value={novoRegistro.observacoes} onChange={handleInputChange} placeholder="Observações (opcional)" />
                    <button type="submit">Registar Serviço</button>
                </form>
                <h4>Histórico de Serviços</h4>
                <table>
                    <thead><tr><th>Serviço</th><th>Data</th><th>KM</th></tr></thead>
                    <tbody>
                        {historico.length > 0 ? historico.map(h => (
                            <tr key={h.id}><td>{h.nome_manutencao}</td><td>{new Date(h.data_realizacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td><td>{h.km_realizacao.toLocaleString('pt-BR')}</td></tr>
                        )) : <tr><td colSpan="3">Nenhum serviço registado.</td></tr>}
                    </tbody>
                </table>
                <button type="button" onClick={onClose} style={{marginTop: '20px'}}>Fechar</button>
            </div>
        </div>
    );
};

const PaginaManutencao = () => {
    const [frota, setFrota] = useState([]);
    const [tiposManutencao, setTiposManutencao] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, vehicle: null });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resFrota, resTipos] = await Promise.all([
                api.get('/manutencao/status-frota'),
                api.get('/manutencao/tipos')
            ]);
            setFrota(resFrota.data);
            setTiposManutencao(resTipos.data);
        } catch (error) { console.error("Erro ao buscar dados da página:", error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (vehicle) => {
        setModalState({ isOpen: true, vehicle: vehicle });
    };

    const handleCloseModalAndUpdate = () => {
        setModalState({ isOpen: false, vehicle: null });
        fetchData();
    };

    if (isLoading) return <p>A calcular status de manutenção da frota...</p>;

    return (
        <div>
            <h1>Painel de Controlo de Manutenção</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {frota.map(veiculo => (
                    <div key={veiculo.id} style={{ border: '1px solid var(--cor-borda)', borderRadius: '8px', padding: '16px', width: '350px', backgroundColor: 'var(--cor-superficie)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{flexGrow: 1}}>
                            <h3>{veiculo.modelo} ({veiculo.placa})</h3>
                            <p>KM Atual: {veiculo.km_atual.toLocaleString('pt-BR')}</p>
                            <hr style={{margin: '10px 0'}}/>
                            <h4>Status dos Serviços:</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {veiculo.manutencoes.map(m => (
                                    <li key={m.id_tipo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span>{m.nome}</span>
                                        <StatusBadge status={m.status} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button onClick={() => handleOpenModal(veiculo)} style={{marginTop: '10px', width: '100%'}}>Ver Histórico / Registar Serviço</button>
                    </div>
                ))}
            </div>
            {modalState.isOpen && (
                <MaintenanceModal 
                    vehicle={modalState.vehicle} 
                    tiposManutencao={tiposManutencao}
                    onClose={() => setModalState({isOpen: false, vehicle: null})}
                    onUpdate={handleCloseModalAndUpdate}
                />
            )}
        </div>
    );
};

export default PaginaManutencao;
