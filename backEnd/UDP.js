const udp = require('dgram');

module.exports = function (message, port) {
    return {
        socket: udp.createSocket('udp4'),
        port: port || 0,
        inicializa() {
            this.socket.on('error', ((error) => error && console.error('Error: ' + error)));

            this.socket.on('close', (() => this.port ? console.log(`Servidor: Socket UDP fechado!`) : console.log(`Cliente: Socket UDP fechado!`)));

            this.socket.on('message', message || function (msg, info) {
                console.log(`Mensagem recebida: ${msg.toString()}`);
                console.log(`Recebido ${msg.length} bytes de ${info.address}:${info.port}`);
            });

            this.socket.bind(this.port);
        }
    }
}