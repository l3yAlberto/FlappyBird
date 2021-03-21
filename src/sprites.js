const imagem = new Image();
imagem.src = './imagem/sprites.png';
const sons = {
    caiu: new Audio('./som/caiu.wav'),
    hit: new Audio('./som/hit.wav'),
    ponto: new Audio('./som/ponto.wav'),
    pulo: new Audio('./som/pulo.wav'),
    death: new Audio('./som/death.mp3'),
    tuturu: new Audio('./som/tuturu.mp3')
}

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = 500;

const sprites = {
    canvas: canvas,
    contexto: contexto,
    imagem: imagem,
    sons: sons,
    clock: 0,
    flappyBird: [
        { sx: 0, sy: 0, sWidth: 34, sHeight: 24 },
        { sx: 0, sy: 26, sWidth: 34, sHeight: 24 },
        { sx: 0, sy: 52, sWidth: 34, sHeight: 24 }
    ],
    flappyBirdPB: [
        { sx: 36, sy: 0, sWidth: 34, sHeight: 24 },
        { sx: 36, sy: 26, sWidth: 34, sHeight: 24 },
        { sx: 36, sy: 52, sWidth: 34, sHeight: 24 }
    ],
    pipe1: { sx: 0, sy: 169, sWidth: 52, sHeight: 400 },
    pipe2: { sx: 52, sy: 169, sWidth: 52, sHeight: 400 },
    floor: { sx: 0, sy: 610, sWidth: 224, sHeight: 112 },
    background: { sx: 390, sy: 0, sWidth: 276, sHeight: 204 },
    desenhaFundo(callback) {
        this.clock++;
        let backgroundX = - Math.floor((this.clock / 3) % this.background.sWidth),
        floorX = - Math.floor(this.clock % sprites.floor.sWidth);
        contexto.fillStyle = 'rgb(112, 197, 206)';
        contexto.fillRect(0, 0, canvas.width, canvas.height);

        const backgroundDesenhos = Math.ceil((canvas.width / this.background.sWidth) + 1);
        for (let i = 0; i < backgroundDesenhos ; i++) {
            contexto.drawImage(
                imagem,
                this.background.sx, this.background.sy,
                this.background.sWidth,
                this.background.sHeight,
                backgroundX + (i * this.background.sWidth), canvas.height - this.background.sHeight,
                this.background.sWidth, this.background.sHeight
            );
        }

        if (callback) callback();

        const floorDesenhos = Math.ceil((canvas.width / this.floor.sWidth) + 1);
        for (let i = 0; i < floorDesenhos ; i++) {
            contexto.drawImage(
                imagem,
                this.floor.sx, this.floor.sy,
                this.floor.sWidth,
                this.floor.sHeight,
                floorX + (i * this.floor.sWidth), canvas.height - this.floor.sHeight,
                this.floor.sWidth, this.floor.sHeight
            );
        }
    }
}

export default sprites;

