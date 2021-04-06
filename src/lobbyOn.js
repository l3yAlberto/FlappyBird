const { ipcRenderer } = require('electron');
import sprites from './sprites.js';
import game from './game.js';
import menu from './menu.js';
export default function(mudarTela) {
    return {
        inicializa(){
            const menuBt = document.querySelector("#menu");
            ipcRenderer.removeAllListeners("getIp");

            ipcRenderer.once("getIp", (ev, args) => {
                input.value = args;
                conectar(args);
                console.log("Conectando");
            });

            const div = document.getElementById('option');
            let ws;
            
            menuBt.onclick = () => {
                div.remove();
                ws && ws.readyState == ws.OPEN && ws.close();
                mudarTela(menu(mudarTela));
            };

            const input = document.createElement('input');
            input.placeholder = "IP:PORTA -> Enter";
            input.onkeypress = (ev) => {
                if (ev.code === "Enter" && input.value) {
                    ipcRenderer.send('setIp', input.value);
                    const salas = document.querySelectorAll(".salas");
                    for (const salaLi of salas) salaLi.remove();
                    conectar(input.value);
                }
            }
            ipcRenderer.send('getIp');
            

            const li = document.createElement('li');
            li.className = "host";
            li.innerText = "Criar Sala";
            li.onclick = () => {
                const nome = document.querySelector("#option > input").value;
                if (input.value && nome) {
                    div.remove();
                    ws && ws.readyState == ws.OPEN && ws.close();
                    mudarTela(game(mudarTela, { ip: input.value, host: true, nome: nome }));
                } else alert("Digite seu nome.");
            };

            div.appendChild(li);
            div.appendChild(input);

            function conectar(ip) {

                ws?.close();

                ws = new WebSocket(`ws://${ip}`);

                ws.onerror = (ev) => console.log(ev);

                ws.onopen = (event) => {
                    console.log('INFO: Socket Opened\n');
                    ws.readyState == ws.OPEN && ws.send(JSON.stringify({ type: "salas" }));
                }
    
                ws.onclose = (ev) => console.log('INFO: Socket Closed\n');
    
                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    if (message.type == "salas") {
                        for (const sala of message.salas) {
                            const li = document.createElement('li');
                            li.className = "salas";
                            li.innerText = `Id: ${sala.salaId}\nnome: ${sala.owner}`;
                            li.onclick = () => {
                                const nome = document.querySelector("#option > input").value;
                                if (input.value && nome) {
                                    div.remove();
                                    ws && ws.readyState == ws.OPEN && ws.close();
                                    mudarTela(game(mudarTela, { ip: input.value, host: false, nome: nome, salaId: sala.salaId }));
                                } else alert("Digite seu nome.");
                            };
                            div.appendChild(li);
                        }
                    }
                }   
            }
        },
        desenha(){
            sprites.desenhaFundo();
        }
    }
};