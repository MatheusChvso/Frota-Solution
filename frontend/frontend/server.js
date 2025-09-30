// C:/apps/dist/server.js

const { exec } = require('child_process');

// COMANDO CORRIGIDO: Adicionamos o número da porta no final
const command = 'npx serve -s -l 8080 .';

console.log(`Iniciando o servidor frontend com o comando: ${command}`);

const serverProcess = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o servidor: ${error}`);
    return;
  }
});

// Exibe o output do servidor no log do PM2
serverProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});