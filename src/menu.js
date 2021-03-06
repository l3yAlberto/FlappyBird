const { ipcRenderer } = require('electron');
import lobbyLan from './lobbyLan.js';
import lobbyOn from './lobbyOn.js';
import sprites from './sprites.js';
export default function(mudarTela) {
    return {
        inicializa(){
            document.getElementById('option')?.remove();

            const menu = document.querySelector("#menu");
            menu.style = "visibility: hidden !important;";
            menu.onclick = () => {};
            ipcRenderer.removeAllListeners("getUsername");
            const gameDiv = document.getElementById('game-div');
            const div =  document.createElement('div');
            const nick = document.createElement('input');
            const lan = document.createElement('button');
            const online = document.createElement('button');

            div.className = "options";
            div.id = "option";
            nick.maxLength = '15';
            nick.placeholder = "Seu nome...";
            nick.onkeypress = (ev) => {
                if (ev.code === "Enter" && nick.value) ipcRenderer.send('setUsername', nick.value);
            }
            lan.innerText = "Modo LAN";
            online.innerText = "Modo ONLINE";

            ipcRenderer.send('close');

            
            ipcRenderer.once("getUsername", (ev, args) => nick.value = args);
            ipcRenderer.send('getUsername');

            lan.onclick = () => click(lobbyLan);

            online.onclick = () => click(lobbyOn);

            div.appendChild(nick);
            div.appendChild(lan);
            div.appendChild(online);
            gameDiv.appendChild(div);

            function click(lobby) {
                lan.remove();
                online.remove();
                menu.style = "";
                mudarTela(lobby(mudarTela));
            }
        },
        desenha(){
            sprites.desenhaFundo();
        }
    }
};