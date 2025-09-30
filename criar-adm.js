// #####################################################################
// # SCRIPT NODE.JS PARA CRIAR/RECRIAR O UTILIZADOR ADMINISTRADOR      #
// # Execute este ficheiro diretamente com o Node.js para garantir a   #
// # compatibilidade da encriptação da senha.                          #
// #####################################################################

const db = require('./db');
const bcrypt = require('bcrypt');

const admin = {
  nome: 'Administrador',
  email: 'admin@email.com',
  senhaPlana: 'senha', // A senha que irá utilizar para fazer login
  perfil: 'admin',
};

async function criarAdmin() {
  console.log('A iniciar a criação do utilizador administrador...');
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Apaga o utilizador admin anterior para evitar duplicados
    console.log(`A apagar utilizador existente com o email: ${admin.email}...`);
    await connection.query("DELETE FROM vendedores WHERE email = ?", [admin.email]);
    console.log('Utilizador anterior apagado com sucesso.');

    // 2. Encripta a nova senha
    console.log('A encriptar a nova senha...');
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(admin.senhaPlana, saltRounds);
    console.log('Senha encriptada com sucesso.');

    // 3. Insere o novo utilizador com a senha encriptada
    console.log('A inserir o novo utilizador administrador na base de dados...');
    const sql = `
      INSERT INTO vendedores (nome, email, senha, perfil) 
      VALUES (?, ?, ?, ?)
    `;
    await connection.query(sql, [admin.nome, admin.email, senhaHash, admin.perfil]);
    console.log('Novo utilizador administrador inserido com sucesso!');

    await connection.commit();
    
    console.log('\n--- SUCESSO ---');
    console.log('O utilizador administrador foi criado/recriado.');
    console.log(`Email: ${admin.email}`);
    console.log(`Senha: ${admin.senhaPlana}`);
    console.log('Pode agora reiniciar o seu servidor backend e tentar fazer login.');

  } catch (error) {
    await connection.rollback();
    console.error('\n--- ERRO ---');
    console.error('Ocorreu um erro ao criar o utilizador administrador:', error);
  } finally {
    connection.release();
    process.exit(); // Termina o script
  }
}

criarAdmin();
