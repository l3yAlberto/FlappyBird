/**
 * Chão 388
 * floor -> sWidth: 224, sHeight: 112
 * flappyBird -> sWidth: 34, sHeight: 24
 * pipe -> sWidth: 52, sHeight: 400
 */
module.exports = function() {
    return {
        animation: require('./requestAnimationFrame')(),
        break: false,
        start: false,
        jogadores: [],
        owner: "",
        pipes: [],
        lastId: 0,
        inicializaPipe() {
            for (let i = 0, x = 1000; i < 25; i++, x += 202) {
                this.pipes.push({
                    x: x,
                    y: Math.floor(this.getRandomArbitrary(160, 358))
                });
            }
            this.animation.inicializa();
        },
        novoJogador(sendEvent, nome) {
            const jogador = {
                gravidade: 0,
                nome: nome || `${Date.now()}`,
                vivo: true,
                sendEvent,
                game: {
                    id: this.lastId,
                    pontos: 0,
                    x: 20 + Math.floor(Math.random() * 200), 
                    y: 20 + Math.floor(Math.random() * 200),
                }
            }
            jogador.pipe = this.pipes[0].x - jogador.game.x;
            this.lastId++;
            this.jogadores.push(jogador);
            return jogador;
        },
        attFlappy() {
            for (const jogador of this.jogadores) {
                if (jogador.vivo) {
                    jogador.gravidade += 0.5;
                    jogador.game.y += jogador.gravidade;
                    if (jogador.pipe < 0) {
                        jogador.game.pontos++;
                        for (const pipe of this.pipes) {
                            if (pipe.x > jogador.game.x){
                                jogador.pipe = pipe.x - jogador.game.x;
                                break;
                            }
                        }
                    } else jogador.pipe--;
                }
            }
        },
        attPipe() {
            for (const pipe of this.pipes) pipe.x--;
            if ((this.pipes[0].x + 52) <= 0) {
                this.pipes.shift();
                this.pipes.push({
                    x: this.pipes[this.pipes.length - 1].x + 202,
                    y: Math.floor(this.getRandomArbitrary(160, 358))
                });
            }
        },
        isLive(flappy) {
            for (const pipe of this.pipes) {
                if (flappy.y + 24 >= 388) return true;
                if (flappy.y <= (pipe.y - 130) || flappy.y + 24 >= pipe.y) {
                    if (flappy.x + 34 >= pipe.x && flappy.x + 34 <= pipe.x + 52) return true;
                    if (flappy.x >= pipe.x && flappy.x <= pipe.x + 52) return true;
                }
            }
            return false;
        },
        getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        },
        stop() {
            this.break = true;
            this.animation.break = true;
            this.animation.funcs.forEach((value, i) => this.animation.funcs[i] = this.animation.skip);
            this.animation.funcs = [];
        },
        async sendState() {
            if (this.break) return;
            const jgXY = [];
            for (const jogador of this.jogadores) {
                if (jogador.vivo) {
                    if (this.isLive(jogador.game)) {
                        jogador.vivo = false;
                        jogador.sendEvent && jogador.sendEvent(`{"type":"f"}`);
                    }
                    jgXY.push(jogador.game);
                }
            }
            if (jgXY.length) {
                const game = JSON.stringify({
                    pipes: this.pipes,
                    jogadores: jgXY,
                    type: "game"
                });
                for (const jogador of this.jogadores) jogador.sendEvent(game);
                setTimeout(() => this.sendState(), 10);
            } else {
                for (const jogador of this.jogadores) jogador.sendEvent(`{"type":"endgame"}`);
                this.stop();
            }
        },
        loop() {
            if (this.break) return;
            this.attPipe();
            this.attFlappy();
            this.animation.requestAnimationFrame(() => this.loop());
        }
    }
};

