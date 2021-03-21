import game from './game.js';
import menu from './menu.js';
import sprites from './sprites.js';
const { ipcRenderer } = require('electron');
export default function(mudarTela) {
    return {
        inicializa(){
            ipcRenderer.removeAllListeners("sala");

            const div = document.getElementById('option');
            const menuBt = document.querySelector("#menu");
            menuBt.onclick = () => {
                div.remove();
                mudarTela(menu(mudarTela));
            };

            const input = document.createElement('input');
            input.placeholder = "IP:8181/ID -> Enter";
            input.onkeypress = (ev) => {
                if (ev.code === "Enter") {
                    const nome = document.querySelector("#option > input").value;
                    const ipPortaId = input.value.split('/');
                    if (ipPortaId.length > 1 && nome) {
                        div.remove();
                        mudarTela(game(mudarTela, { ip: ipPortaId[0], host: false, nome: nome, salaId: ipPortaId[1] }));
                    } else alert("Digite seu nome e ip do servidor.");
                }
            }

            const li = document.createElement('li');
            li.className = "host";
            li.innerText = "Host";
            li.onclick = () => {
                const nome = document.querySelector("#option > input").value;
                if (nome) {
                    div.remove();
                    ipcRenderer.send('host', nome);
                    mudarTela(game(mudarTela, { ip: "localhost:8181", host: true, nome: nome }));
                } else alert("Digite seu nome.");
            };

            div.appendChild(li);
            div.appendChild(input);

            ipcRenderer.send('salas');

            ipcRenderer.on('sala', (event, args) => {
                // args = {nome: Nome da sala, ip: Ip da sala }
                const li = document.createElement('li');
                li.className = "salas";
                li.innerText = `Id: ${args.salaId}\nnome: ${args.nome}`;
                li.onclick = () => {
                    const nome = document.querySelector("#option > input").value;
                    if (nome) {
                        div.remove();
                        ipcRenderer.send('close');
                        mudarTela(game(mudarTela, { ip: `${args.ip}:8181`, host: false, nome: nome, salaId: args.salaId }));
                    } else alert("Digite seu nome.");
                };
                div.appendChild(li);
            });
        },
        desenha(){
            sprites.desenhaFundo();
        }
    }
};