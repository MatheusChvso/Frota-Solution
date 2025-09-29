// C:/apps/dist/server.js

const { exec } = require('child_process');

// Comando para iniciar o 'serve' em modo de página única no diretório atual.
const command = 'npx serve -s .';

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