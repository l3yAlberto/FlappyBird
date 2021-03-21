import menu from './menu.js';

let telaAtiva = {};

function loop() {
    telaAtiva.desenha();
    requestAnimationFrame(loop);
}

function mudarTela(tela) {
    telaAtiva = tela;
    tela.inicializa();
    console.log(telaAtiva);
}

mudarTela(menu(mudarTela));
requestAnimationFrame(loop);