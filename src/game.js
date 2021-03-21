import sprites from './sprites.js';
import menu from './menu.js';
export default function(mudarTela, args) {
    return {
        span: document.createElement("span"),
        jogadores: [],
        nomes: [],
        pipes: [],
        rank: [],
        pontos: 0,
        id: -1,
        attRank(){},
        inicializa(){
            const menuBt = document.querySelector("#menu");

            const rank = document.createElement("table");
            const tr0 = document.createElement("tr");
            const td0C = document.createElement("td");
            const td0N = document.createElement("td");
            const td0P = document.createElement("td");
            td0C.style = "width: 25px";
            td0N.style = "width: 110px";
            td0P.style = "width: 60px";
            rank.unselectable = "off";
            rank.className = "sel";
            rank.id = "rank";
            tr0.appendChild(td0C);
            tr0.appendChild(td0N);
            tr0.appendChild(td0P);
            rank.appendChild(tr0);
            document.querySelector("body").appendChild(rank);
            for (let i = 0; i < 5; i++) {
                const tr = document.createElement("tr");
                const idc = {
                    c: document.createElement("td"),
                    n: document.createElement("td"),
                    p: document.createElement("td")
                }
                idc.c.style = "width: 25px";
                idc.n.style = "width: 110px";
                idc.p.style = "width: 60px";
                tr.appendChild(idc.c);
                tr.appendChild(idc.n);
                tr.appendChild(idc.p);
                rank.appendChild(tr);
                this.rank.push(idc);
            }

            const div = document.querySelector("#game-div");
            this.span.innerText = this.pontos;
            this.span.unselectable = "off";
            this.span.style = `
                position: absolute;
                top: 6px;
                left: 50%;
                font-size: 30px;`;
            this.span.className = "sel";
            div.appendChild(this.span);

            const salaIdSpan = document.createElement('span');
            salaIdSpan.unselectable = "off";
            salaIdSpan.style = `
                position: absolute;
                top: 2px;
                left: 2px;
                font-size: 18px;
                opacity: 50%;`;
            salaIdSpan.className = "sel";
            div.appendChild(salaIdSpan);

            const self = this;
            const ws = new WebSocket(`ws://${args.ip}`);
            menuBt.onclick = () => {
                this.span.remove();
                rank.remove();
                salaIdSpan.remove();
                sprites.canvas.onclick = () => {};
                if (ws && ws.readyState == ws.OPEN) {
                    ws.close();
                } else mudarTela(menu(mudarTela));
            };

            ws.onopen = (event) => {
                console.log('INFO: Socket Opened\n');
                if (args.host) ws.readyState === ws.OPEN && ws.send(JSON.stringify({ type: "newsala", owner: args.nome}));
                else ws.readyState === ws.OPEN && ws.send(JSON.stringify({ type: "join", nome: args.nome, salaId: args.salaId}));
                const interval = setInterval(() => {
                    if (ws.readyState != ws.OPEN) clearInterval(interval);
                    self.attRank();
                }, 1.5 * 1000);
            };
            let data = Date.now();
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                switch (message.type) {
                    case "game":
                        const newData = Date.now();
                        if (newData - data > 80) console.log(newData - data);
                        data = newData;
                        if (self.jogadores.length > message.jogadores.length) {
                            const death = new Audio('./som/death.mp3');
                            death.currentTime = 0.5;
                            death.play();
                        }
                        self.jogadores = message.jogadores;
                        self.pipes = message.pipes;
                        break;
                    case "id":
                        self.id = message.id;
                        salaIdSpan.innerText = message.salaId;
                        break;
                    case "host":
                        sprites.canvas.onclick = () => {
                            ws.readyState === ws.OPEN && ws.send(`{"type":"start"}`);
                            sprites.canvas.onclick = () => {};
                        }
                        break;
                    case "nomes":
                        sprites.sons.tuturu.play();
                        setTimeout(() => {
                            sprites.canvas.onclick = () => {
                                ws.readyState === ws.OPEN && ws.send(`{"type":"pulo"}`);
                                new Audio('./som/jump.mp3').play();
                            }
                        }, sprites.sons.tuturu.duration * 1000);
                        self.nomes = message.nomes;
                        break;
                    case "endgame":
                        if (ws.readyState == ws.OPEN) setTimeout(() => ws.close(), 1000);
                        // alert("Fim de jogo");
                        break;
                    case "f":
                        sprites.sons.death.currentTime = 0.5;
                        sprites.sons.death.play();
                        sprites.canvas.onclick = () => {};
                        break;
                    default:
                        break;
                }                
            };

            ws.onclose = (event) => {
                this.span.remove();
                rank.remove();
                salaIdSpan.remove();
                mudarTela(menu(mudarTela));
            }

            this.attRank = async () => {
                const jogadores = self.jogadores.slice().sort((a, b) => {
                    if (a.pontos < b.pontos) return 1;
                    if (a.pontos > b.pontos) return -1;
                    return 0;
                });
                for (let i = 0; i < 5; i++) {
                    let lastPontos = 0;
                    let lastRank = 0;
                    if (jogadores[i]) {
                        for (const jogador of self.nomes) {
                            if (jogadores[i].id === jogador.id) {
                                if (jogadores[i].pontos != lastPontos) {
                                    lastPontos = jogadores[i].pontos;
                                    lastRank++;
                                }                                
                                addJg(`${lastRank}º`, jogador.nome, `${jogadores[i].pontos}`);
                            }
                        }
                    } else addJg();

                    function addJg(c, n, p) {
                        if (!c && self.rank[i].p.innerText) return;
                        self.rank[i].c.innerText = c || "";
                        self.rank[i].n.innerText = n || "";
                        self.rank[i].p.innerText = p || "";
                    }
                }
            }
        },
        desenha(){
            const jogador = {};
            sprites.desenhaFundo(() => {
                for (const pipe of this.pipes) {
                    if (pipe.x < sprites.canvas.width) {
                        this.desenhaPipe(pipe.x, pipe.y)
                    } else break;
                }
            });
            const frame = Math.floor((sprites.clock / 3) % 3);
            this.jogadores.forEach((value) => {
                if (value.id == this.id) {
                    jogador.x = value.x;
                    jogador.y = value.y;
                    jogador.d = true;
                    if (this.pontos != value.pontos) {
                        sprites.sons.ponto.play();
                        this.pontos = value.pontos;
                        this.span.innerText = this.pontos;
                        this.attRank();
                    }
                } else this.desenhaFlappyPB(value.x, value.y, frame);
            });
            jogador.d && this.desenhaFlappy(jogador.x, jogador.y, frame);
        },
        desenhaPipe(x, y){
            // baixo
            sprites.contexto.drawImage(
                sprites.imagem,
                sprites.pipe1.sx, sprites.pipe1.sy,
                sprites.pipe1.sWidth,
                sprites.pipe1.sHeight,
                x, y,
                sprites.pipe1.sWidth, sprites.pipe1.sHeight
            );

            // cima
            sprites.contexto.drawImage(
                sprites.imagem,
                sprites.pipe2.sx, sprites.pipe2.sy,
                sprites.pipe2.sWidth,
                sprites.pipe2.sHeight,
                x, (y - sprites.pipe2.sHeight) - 130,
                sprites.pipe2.sWidth, sprites.pipe2.sHeight
            );
        },
        desenhaFlappyPB(x, y, frame){
            sprites.contexto.drawImage(
                sprites.imagem,
                sprites.flappyBirdPB[frame].sx, sprites.flappyBirdPB[frame].sy,
                sprites.flappyBirdPB[frame].sWidth,
                sprites.flappyBirdPB[frame].sHeight,
                x, y,
                sprites.flappyBirdPB[frame].sWidth, sprites.flappyBirdPB[frame].sHeight
            );
        },
        desenhaFlappy(x, y, frame){
            sprites.contexto.drawImage(
                sprites.imagem,
                sprites.flappyBird[frame].sx, sprites.flappyBird[frame].sy,
                sprites.flappyBird[frame].sWidth,
                sprites.flappyBird[frame].sHeight,
                x, y,
                sprites.flappyBird[frame].sWidth, sprites.flappyBird[frame].sHeight
            );
        }
    }
};