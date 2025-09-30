-- #####################################################################
-- # ATENÇÃO: ESTE SCRIPT APAGA TODOS OS DADOS TRANSACIONAIS           #
-- #          DA BASE DE DADOS. EXECUTE APENAS QUANDO TIVER A CERTEZA   #
-- #          DE QUE DESEJA LIMPAR O AMBIENTE PARA PRODUÇÃO.            #
-- #                                                                   #
-- # RECOMENDA-SE FAZER UM BACKUP ANTES DE EXECUTAR.                   #
-- #####################################################################

-- Desativa temporariamente a verificação de chaves estrangeiras para permitir
-- que as tabelas sejam limpas em qualquer ordem, sem erros.
SET FOREIGN_KEY_CHECKS = 0;

-- Limpa todas as tabelas que contêm dados de teste.
-- O comando TRUNCATE TABLE é mais rápido que o DELETE e reinicia os contadores
-- de auto-incremento (os IDs começarão em 1 novamente).

-- Limpa os registos de quilometragem
TRUNCATE TABLE leituras_km;

-- Limpa o histórico de manutenções realizadas
TRUNCATE TABLE historico_manutencao;

-- Limpa as alocações de veículos para vendedores
TRUNCATE TABLE alocacoes;

-- Limpa o cadastro de veículos
TRUNCATE TABLE veiculos;

-- Limpa o cadastro de vendedores/utilizadores
TRUNCATE TABLE vendedores;

-- Limpa os tipos de manutenção cadastrados
TRUNCATE TABLE tipos_manutencao;


-- Reativa a verificação de chaves estrangeiras para garantir a integridade
-- dos novos dados que serão inseridos.
SET FOREIGN_KEY_CHECKS = 1;

-- Mensagem de sucesso
SELECT 'Base de dados limpa com sucesso e pronta para produção!' AS status;
