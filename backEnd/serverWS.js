
const parentPort = (process.argv.includes("-c") ? require('worker_threads').parentPort : false);
const gameServer = require('./gameServer');
const WebSocket = require('ws');

const salas = {};

const wss = new WebSocket.Server({ port: (parentPort ? 8181 : 7171) });

wss.on('close', () => {
  console.log("Close: Ws");
  process.exit();
});

parentPort && parentPort.on('message', (value) => {
  if (value === "close") wss.close();
});

wss.on('connection', function connectionWebSocket(ws) {
  let idTimeout;
  let sala;
  let id;

  ws.on('message', (message) => {
    const msgJson = JSON.parse(message.toString());
    switch (msgJson.type) {
      case "pulo":
        if (id != undefined) sala.pulo(id);
        break;
      case "join":
        sala = salas[msgJson.salaId];
        if (!sala || (sala && (sala.start || sala.break))) ws.close();
        else join(msgJson.nome, msgJson.salaId);
        break;
      case "salas":
        const salasOb = {
          type: "salas",
          salas: []
        }
        for (const sala in salas) {
          if (salas[sala].owner && !salas[sala].start && salas[sala].salaId) {
            salasOb.salas.push({
              owner: salas[sala].owner,
              salaId: salas[sala].salaId
            });
          }
        }
        // console.log(salas, salasOb.salas);
        if (salasOb.salas.length) ws.send(JSON.stringify(salasOb));
        break;
      case "start":
        clearTimeout(idTimeout);
        if (sala.start) return;
        sala.start = true;
        parentPort && parentPort.postMessage({ type: "start" });
        const nomes = [];
        for (const jogador of sala.jogadores) nomes.push({ nome: jogador.nome, id: jogador.game.id });
        const msg = JSON.stringify({ type: "nomes", nomes: nomes });
        for (const jogador of sala.jogadores) jogador.sendEvent(msg);
        if (parentPort) for (let i = 0; i < 500; i++) sala.novoJogador(async (arg) => {}, ""); // temporario
        setTimeout(() => sala.loop(), 1304);
        break;
      case "newsala":
        idTimeout = setTimeout(() => closeSala(), 3 * 60 * 1000);
        const salaId = nonce(5);
        salas[salaId] = gameServer();
        salas[salaId].owner = msgJson.owner;
        salas[salaId].salaId = salaId;
        salas[salaId].inicializaPipe();
        sala = salas[salaId];
        join(msgJson.owner, salaId);
        // salas[salaId].sendState();
        parentPort && parentPort.postMessage({ type: "salaId", salaId: salaId});
        ws.send(JSON.stringify({ type: "host" }));
        break;
      default:
        break;
    }
  });

  ws.on('close', () => {
    if (sala?.jogadores) {
      sala.jogadores.forEach((value, i) => {
        if (value.game.id == id) {
          sala.jogadores.splice(i, 1);
        }
      });
    }
    if (sala?.jogadores.length === 0) {
      clearTimeout(idTimeout);
      closeSala();
    }
  });

  function closeSala() {
    console.log("closeSala");
    if (sala) {
      console.log(sala.owner);
      sala.start = true;
      sala.jogadores.forEach((value, i) => value.sendEvent(`{"type":"endgame"}`));
      sala.stop();
      delete salas[sala.salaId];
      ws.readyState == ws.OPEN && ws.close();
    }
  }

  function join(nome, salaId) {
    id = sala.novoJogador(async (arg) => ws.readyState === ws.OPEN && ws.send(arg), nome);
    ws.send(JSON.stringify({ type: "id", id: id, salaId: salaId }));
    sala.sendState();
  }
});

function nonce(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  if (!salas[text]) {
    return text;
  } else return nonce(length);
}