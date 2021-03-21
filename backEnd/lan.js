const { ipcMain } = require('electron');
const { Worker } = require('worker_threads');
const dgram = require('dgram');
let socket = {};
let worker = {};

ipcMain.on('close', closeConnection);

ipcMain.on('salas', (eventSalas, args) => {
    closeConnection();

    socket = dgram.createSocket('udp4');

    socket.on('close', () => console.log(`Cliente: Socket UDP fechado!`));

    socket.on('listening', () => {
        socket.setBroadcast(true);
        socket.send(JSON.stringify({ type: "ping" }), 7171, "255.255.255.255", (error) => error ? console.error(error) : socket.setBroadcast(false));
    });

    socket.on('message', (msg, info) => {
        try {
            const msgJson = JSON.parse(msg.toString()); // { type: "pong", nome: nome }
            if (msgJson.type === "pong") {
                eventSalas.reply("sala", {
                    nome: msgJson.nome,
                    ip: info.address,
                    salaId: msgJson.salaId
                }); // {nome: Nome da sala, ip: Ip da sala }
                console.log("eventSalas: Mensagem recebida:", msg.toString(), info.address);
            }
        } catch (error) { console.error(error) }
    });

    socket.bind();
});

ipcMain.on('host', async (eventHost, nome) => {
    // nome = "Seu nome"
    closeConnection();

    worker = new Worker(__dirname + '/serverWS.js', { workerData: null, argv: ["-c"] });
    socket = dgram.createSocket('udp4');
    let salaId;

    worker.on('message', (msg) => {
        switch (msg.type) {
            case "start":
                console.log("Partida iniciada");
                socket.close && socket.close();
                break;
            case "salaId":
                salaId = msg.salaId;
                socket.bind(7171);
                break;
            // default:
            //     break;
        }
    });

    socket.on('close', () => console.log(`Servidor: Socket UDP fechado!`));

    socket.on('message', (msg, info) => {
        try {
            const msgJson = JSON.parse(msg.toString());
            if (msgJson.type === "ping") {
                socket.send(JSON.stringify({ type: "pong", nome: nome, salaId: salaId }), info.port, info.address, (error) => {
                    if (error) console.error(error); else console.log("eventHost: Mensagem recebida", msg.toString(), info.address);
                });
            }
        } catch (error) { console.error(error) }
    });
});

function closeConnection() {
    try {
        worker.postMessage && worker.postMessage("close");
        worker.removeAllListeners && worker.removeAllListeners("message")
        worker.terminate && worker.terminate();
        socket.close && socket.close();
    } catch (error) {}
}