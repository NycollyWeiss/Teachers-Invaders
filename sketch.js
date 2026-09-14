// Projeto Teachers Invaders - Simulador p5.js
 
/*
  Instruções de Execução:
  .
  .
  .
 */

let imgFundo, imgFundoTerra, imgFundoMarte, imgFundoJupiter;
let imgTerra, imgMarte, imgJupiter;
let imgEttore, imgGuilherme, imgThiago;
let imgEttoreTiro, imgGuilhermeTiro, imgThiagoTiro;
let imgBill, imgBoludo, imgPendejo, imgPrin, imgPainel, imgNave, imgBtnNaoToque;

let audioFunkyTown, audioPew, audioPancada;

let canvas;
let tela = 0; // 0: menu, 1: planetas, 2: profs, 3: jogo
let planetaSelecionado = 'Terra';
let professorSelecionado = 'Ettore';

// efeitos visuais do menu
let profsMenu = [];
let estrelasMenu = [];

// parametros fisicos
let v0 = 50;
let angle = 30;
let y0 = 10;
let g = 9.81;

// variáveis de calculo
let v0x = 0, v0y = 0;
let tVoo = 0, yMax = 0, alcance = 0;

// estado do disparo
let emLancamento = false;
let tempoSimulacao = 0;
let xAtual = 0, yAtual = 0;
let rastroAtual = [];
let historicoTrajetorias = [];

// tratamento de erros e alertas
let mensagemErro = "";
let tempoMensagemErro = 0;

// interação
let arrastandoMira = false;
let arrastandoNave = false;
let alertaNaoToque = false;
let tempoAlerta = 0;

// aliens e botoes
let aliens = [];
let sliderV0, sliderAngle, sliderY0;
let btnLancar, btnReset, btnNaoToque;

let vitoriaAlcancada = false;
let vitoriaJaDisparada = false;
let tempoVitoria = 0;
const duracaoVitoria = 4000;

function preload() {
  imgFundo = loadImage('assets/fundo.png'); 
  imgFundoTerra = loadImage('assets/Fundo_Terra.png');
  imgFundoMarte = loadImage('assets/Fundo_Marte.png'); 
  imgFundoJupiter = loadImage('assets/Fundo_Jupiter.png');
  
  imgTerra = loadImage('assets/Terra.png');
  imgMarte = loadImage('assets/Marte.png');
  imgJupiter = loadImage('assets/Jupiter.png');
  
  imgEttore = loadImage('assets/Ettore_Icon.png');
  imgGuilherme = loadImage('assets/Guilherme_Icon.png');
  imgThiago = loadImage('assets/Thiago_Icon.png');

  imgEttoreTiro = loadImage('assets/Ettore_Tiro.png');
  imgGuilhermeTiro = loadImage('assets/Guilherme_Tiro.png');
  imgThiagoTiro = loadImage('assets/Thiago_Tiro.png');

  imgBill = loadImage('assets/Bill.png');
  imgBoludo = loadImage('assets/Boludo.png');
  imgPendejo = loadImage('assets/Pendejo.png');
  imgPrin = loadImage('assets/Prin.png');
  imgPainel = loadImage('assets/Painel_Finalizado.png');
  imgNave = loadImage('assets/Nave_Pow_Phiew.png');
  imgBtnNaoToque = loadImage('assets/Botao_Nao_Toque.png');

  audioFunkyTown = loadSound('assets/funkytown.mp3');
  audioPew = loadSound('assets/pew.mp3');
  audioPancada = loadSound('assets/pancada.mp3');
}

function setup() {
  canvas = createCanvas(900, 650);
  canvas.parent('canvas-container');
  textFont('Press Start 2P');
  noSmooth();

  criarControles();
  esconderControles();
  reiniciarAliens();
  inicializarMenuEfeitos();
}

function draw() {
  cursor(ARROW);

  switch (tela) {
    case 0:
      esconderControles();
      telaInicio();
      break;
    case 1:
      esconderControles();
      telaEscolhaPlaneta();
      break;
    case 2:
      esconderControles();
      telaEscolhaProfessor();
      break;
    case 3:
      posicionarControles();
      mostrarControles();
      telaJogo();
      break;
  }
}

function inicializarMenuEfeitos() {
  estrelasMenu = [];
  for (let i = 0; i < 28; i++) {
    estrelasMenu.push({
      x: random(width),
      y: random(height),
      tamanho: random(4, 9),
      fase: random(TWO_PI),
      velBrilho: random(0.02, 0.06)
    });
  }

  profsMenu = [
    { img: imgEttore, x: 80, y: 120, vx: 0.6, vy: 0.3, rot: 0, vRot: 0.015, tam: 55 },
    { img: imgGuilherme, x: 780, y: 500, vx: -0.5, vy: -0.4, rot: 1, vRot: -0.012, tam: 60 },
    { img: imgThiago, x: 700, y: 140, vx: -0.4, vy: 0.5, rot: 2, vRot: 0.018, tam: 52 }
  ];
}

function calcularFisica() {
  if (!emLancamento) {
    v0 = sliderV0.value();
    angle = sliderAngle.value();
    y0 = sliderY0.value();
  }

  if (planetaSelecionado === 'Marte') g = 3.71;
  else if (planetaSelecionado === 'Júpiter') g = 24.79;
  else g = 9.81;

  let rad = radians(angle);
  v0x = v0 * cos(rad);
  v0y = v0 * sin(rad);

  let delta = sq(v0y) + 2 * g * y0;
  tVoo = delta >= 0 ? (v0y + sqrt(delta)) / g : 0;
  yMax = y0 + sq(v0y) / (2 * g);
  alcance = v0x * tVoo;
}

function telaJogo() {
  if (planetaSelecionado === 'Terra' && imgFundoTerra) {
    image(imgFundoTerra, 0, 0, width, height);
  } else if (planetaSelecionado === 'Marte' && imgFundoMarte) {
    image(imgFundoMarte, 0, 0, width, height);
  } else if (planetaSelecionado === 'Júpiter' && imgFundoJupiter) {
    image(imgFundoJupiter, 0, 0, width, height);
  } else {
    image(imgFundo, 0, 0, width, height);
  }

  calcularFisica();

  let meterToPx = 1.6;
  let origemX = 70;
  let chaoY = 420;

  if (arrastandoNave && !emLancamento) {
    let mY = constrain(mouseY, chaoY - (200 * meterToPx), chaoY);
    y0 = round((chaoY - mY) / meterToPx);
    sliderY0.value(y0);
  }

  stroke(120, 140, 180, 150);
  strokeWeight(2);
  line(origemX, chaoY, width - 20, chaoY);
  line(origemX, 55, origemX, chaoY);

  noStroke();
  fill(200, 220, 255);
  textSize(8);
  textAlign(RIGHT, CENTER);
  text("ALTURA Y (m)", origemX + 100, 60);
  textAlign(RIGHT, TOP);
  text("DISTÂNCIA X (m)", width - 20, chaoY + 8);

  stroke(255, 255, 255, 60);
  strokeWeight(1.5);
  noFill();
  for (let traj of historicoTrajetorias) {
    beginShape();
    for (let p of traj) vertex(p.x, p.y);
    endShape();
  }

  let naveY = chaoY - (y0 * meterToPx);

  desenharVetorMira(origemX, naveY);

  imageMode(CENTER);
  image(imgNave, origemX, naveY, 100, 100);
  imageMode(CORNER);

  desenharAliens(meterToPx, origemX, chaoY);

  if (emLancamento) {
    tempoSimulacao += deltaTime / 1000;

    if (tempoSimulacao <= tVoo) {
      xAtual = v0x * tempoSimulacao;
      yAtual = y0 + v0y * tempoSimulacao - 0.5 * g * sq(tempoSimulacao);

      let posPxX = origemX + xAtual * meterToPx;
      let posPxY = chaoY - yAtual * meterToPx;

      // checagem de saída da tela: 
      // cancela o tiro se passar da borda direita (width + 20) ou do topo (y < -30)
      if (posPxX > width + 20 || posPxY < -30) {
        emLancamento = false;
        historicoTrajetorias.push([...rastroAtual]);
        desbloquearControles();
      } else {
        rastroAtual.push({ x: posPxX, y: posPxY });

        imageMode(CENTER);
        let imgTiro = professorSelecionado === 'Ettore' ? imgEttoreTiro :
        professorSelecionado === 'Guilherme' ? imgGuilhermeTiro : imgThiagoTiro;
        image(imgTiro, posPxX, posPxY, 28, 28);
        imageMode(CORNER);
      }
    } else {
      emLancamento = false;
      historicoTrajetorias.push([...rastroAtual]);
      desbloquearControles();
    }
  }

  if (rastroAtual.length > 1) {
    stroke(255, 215, 0);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let p of rastroAtual) vertex(p.x, p.y);
    endShape();
  }

  desenharHUD();
  desenharBotaoVoltar();
  exibirAlertaErro();
  desenharTelaVitoria();

  if (alertaNaoToque) {
    push();
    fill(255, 0, 0, 40 + sin(frameCount * 0.2) * 30);
    rect(0, 0, width, height);

    fill(255, 80, 80);
    textSize(10);
    textAlign(CENTER, CENTER);
    text('ALERTA: SOBRECARGA NO SISTEMA!', width / 2, 60);
    pop();

    if (millis() - tempoAlerta > 3500) {
      alertaNaoToque = false;
      if (audioFunkyTown && audioFunkyTown.isPlaying()) {
      }
    }
  }
}

function desenharVetorMira(ox, oy) {
  let tamSeta = map(v0, 1, 200, 52, 150);
  let rad = radians(angle);

  let pontaX = ox + cos(rad) * tamSeta;
  let pontaY = oy - sin(rad) * tamSeta;

  stroke('#00FFCC');
  strokeWeight(3);
  line(ox, oy, pontaX, pontaY);

  push();
  translate(pontaX, pontaY);
  rotate(-rad);
  fill('#00FFCC');
  noStroke();
  triangle(0, 0, -8, -4, -8, 4);
  pop();

  if (arrastandoMira && !emLancamento) {
    let dx = mouseX - ox;
    let dy = oy - mouseY;
    angle = constrain(round(degrees(atan2(dy, dx))), 1, 89);
    sliderAngle.value(angle);
  }
}

function desenharHUD() {
  image(imgPainel, 0, 0, width, height);

  push();
  noStroke();

  fill('#dbdacc');
  textSize(8);
  textAlign(LEFT, TOP);
  let col1X = 35;
  let startY = 475;
  let gap = 22;

  text(`PLANETA: ${planetaSelecionado.toUpperCase()}`, col1X, startY);
  text(`GRAVIDADE: ${g} m/s²`, col1X, startY + gap);
  text(`ANGULO: ${angle}°`, col1X, startY + gap * 2);
  text(`VELOCIDADE (V0): ${v0} m/s`, col1X, startY + gap * 3);
  text(`ALTURA (Y0): ${y0} m`, col1X, startY + gap * 4);
  text(`VX: ${v0x.toFixed(1)} m/s | VY: ${v0y.toFixed(1)} m/s`, col1X, startY + gap * 5);

  fill('#03fc24');
  textSize(11);
  textAlign(CENTER, CENTER);
  let greenX = 450;
  let greenYCenter = 543;
  let greenGap = 40;

  text(`ALCANCE HORIZ.: ${alcance.toFixed(1)} m`, greenX, greenYCenter - greenGap);
  text(`ALTURA MAXIMA : ${yMax.toFixed(1)} m`, greenX, greenYCenter);
  text(`TEMPO DE VOO   : ${tVoo.toFixed(2)} s`, greenX, greenYCenter + greenGap);

  fill(220);
  textSize(8);
  textAlign(LEFT, TOP);
  text("ÂNGULO", 635, 480);
  text("VELOCIDADE", 635, 540);
 text("ALTURA", 765, 490);
  pop();
}

function criarControles() {
  sliderAngle = createSlider(1, 89, 30, 1);
  sliderAngle.style('width', '100px');
  sliderAngle.style('accent-color', '#00FFCC');
  sliderAngle.style('cursor', 'pointer');

  sliderV0 = createSlider(1, 200, 50, 1);
  sliderV0.style('width', '100px');
  sliderV0.style('accent-color', '#00FFCC');
  sliderV0.style('cursor', 'pointer');

  sliderY0 = createSlider(0, 200, 10, 1);
  sliderY0.style('width', '90px');
  sliderY0.style('transform', 'rotate(-90deg)');
  sliderY0.style('accent-color', '#00FFCC');
  sliderY0.style('cursor', 'pointer');

  btnLancar = createButton('LANÇAR');
  btnLancar.size(85, 28);
  btnLancar.style('font-family', '"Press Start 2P"');
  btnLancar.style('font-size', '8px');
  btnLancar.style('background-color', '#4CAF50');
  btnLancar.style('color', '#FFFFFF');
  btnLancar.style('border', '2px solid white');
  btnLancar.style('border-radius', '4px');
  btnLancar.style('cursor', 'pointer');
  btnLancar.style('z-index', '10');
  btnLancar.mousePressed(iniciarLancamento);

  btnReset = createButton('RESETAR');
  btnReset.size(85, 28);
  btnReset.style('font-family', '"Press Start 2P"');
  btnReset.style('font-size', '8px');
  btnReset.style('background-color', '#F44336');
  btnReset.style('color', '#FFFFFF');
  btnReset.style('border', '2px solid white');
  btnReset.style('border-radius', '4px');
  btnReset.style('cursor', 'pointer');
  btnReset.style('z-index', '10');
  btnReset.mousePressed(resetarSimulacao);

  btnNaoToque = createImg('assets/Botao_Nao_Toque.png', 'NÃO TOQUE');
  btnNaoToque.size(80, 80);
  btnNaoToque.style('border', 'none');
  btnNaoToque.style('background', 'transparent');
  btnNaoToque.style('cursor', 'pointer');
  btnNaoToque.style('z-index', '10');
  btnNaoToque.mousePressed(ativarNaoToque);
}

function posicionarControles() {
  let cx = canvas.position().x;
  let cy = canvas.position().y;

  btnLancar.position(cx + 42, cy + 540);
  btnReset.position(cx + 140, cy + 540);

  sliderAngle.position(cx + 635, cy + 452);
  sliderV0.position(cx + 635, cy + 506);
  sliderY0.position(cx + 742, cy + 488);
  btnNaoToque.position(cx + 810, cy + 450);
}

function bloquearControles() {
  sliderV0.attribute('disabled', '');
  sliderAngle.attribute('disabled', '');
  sliderY0.attribute('disabled', '');
  btnLancar.attribute('disabled', '');
  btnReset.attribute('disabled', '');
}

function desbloquearControles() {
  sliderV0.removeAttribute('disabled');
  sliderAngle.removeAttribute('disabled');
  sliderY0.removeAttribute('disabled');
  btnLancar.removeAttribute('disabled');
  btnReset.removeAttribute('disabled');
}

function mostrarControles() {
  sliderV0.show(); sliderAngle.show(); sliderY0.show();
  btnLancar.show(); btnReset.show(); btnNaoToque.show();
}

function esconderControles() {
  sliderV0.hide(); sliderAngle.hide(); sliderY0.hide();
  btnLancar.hide(); btnReset.hide(); btnNaoToque.hide();
}

function mostrarErro(msg) {
  mensagemErro = msg;
  tempoMensagemErro = millis();
}

function exibirAlertaErro() {
  if (mensagemErro !== "" && millis() - tempoMensagemErro < 3500) {
    push();
    fill(255, 50, 50, 220);
    rectMode(CENTER);
    rect(width / 2, 30, 550, 30, 5);
    fill(255);
    textSize(8);
    textAlign(CENTER, CENTER);
    text(mensagemErro, width / 2, 30);
    pop();
  }
}

function iniciarLancamento() {
  if (emLancamento) return;

  if (v0 <= 0) {
    mostrarErro("ENTRADA INVÁLIDA: VELOCIDADE DEVE SER MAIOR QUE ZERO!");
    return;
  }
  if (angle < 1 || angle > 89) {
    mostrarErro("ENTRADA INVÁLIDA: ÂNGULO DEVE ESTAR ENTRE 1° E 89°!");
    return;
  }

  if (audioPew) {
    audioPew.play();
  }

  emLancamento = true;
  tempoSimulacao = 0;
  rastroAtual = [];
  bloquearControles();
}

function resetarSimulacao() {
  emLancamento = false;
  tempoSimulacao = 0;
  rastroAtual = [];
  historicoTrajetorias = [];
  reiniciarAliens();
  desbloquearControles();
}

function ativarNaoToque() {
  alertaNaoToque = true;
  tempoAlerta = millis();

  if (audioFunkyTown && audioFunkyTown.isLoaded()) {
    if (!audioFunkyTown.isPlaying()) {
      audioFunkyTown.play(); // Ou audioFunkyTown.loop(); se quiser que repita caso acabe
    }
  }
}

function reiniciarAliens() {
  vitoriaAlcancada = false;
  vitoriaJaDisparada = false;
  tempoVitoria = 0;

  aliens = [
    { img: imgBill, x: 160, baseY: 90, fase: 0, vivo: true },
    { img: imgBoludo, x: 230, baseY: 150, fase: 1.2, vivo: true },
    { img: imgPendejo, x: 300, baseY: 60, fase: 2.4, vivo: true },
    { img: imgPrin, x: 370, baseY: 130, fase: 3.6, vivo: true },
    { img: imgBill, x: 440, baseY: 170, fase: 0.8, vivo: true },
    { img: imgBoludo, x: 500, baseY: 100, fase: 2.0, vivo: true }
  ];
}

function desenharAliens(meterToPx, origemX, chaoY) {
  imageMode(CENTER);
  for (let a of aliens) {
    if (!a.vivo) continue;

    let yFlutuante = a.baseY + sin(frameCount * 0.05 + a.fase) * 6;
    let px = origemX + a.x * meterToPx;
    let py = chaoY - yFlutuante * meterToPx;

    image(a.img, px, py, 60, 60);

    if (emLancamento) {
      let posPxX = origemX + xAtual * meterToPx;
      let posPxY = chaoY - yAtual * meterToPx;

      if (dist(posPxX, posPxY, px, py) < 35) {
        a.vivo = false;
        if (audioPancada) {
          audioPancada.play();
        }
      }
    }
  }
  imageMode(CORNER);

  if (!vitoriaJaDisparada && aliens.every(alien => !alien.vivo)) {
    vitoriaAlcancada = true;
    vitoriaJaDisparada = true;
    tempoVitoria = millis();
  }
}

function desenharTelaVitoria() {
  if (!vitoriaAlcancada) return;

  if (millis() - tempoVitoria > duracaoVitoria) {
    vitoriaAlcancada = false;
    return;
  }

  push();
  noStroke();
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  fill('#ffe100');
  textAlign(CENTER, CENTER);
  textSize(16);
  text('PARABÉNS, VOCÊ DERROTOU TODOS ELES', width / 2, height / 2 - 15);
  text('COM O PODER DO CONHECIMENTO!', width / 2, height / 2 + 15);
  pop();
}

function desenharBotaoVoltar() {
  let isHover = mouseX > 15 && mouseX < 115 && mouseY > 15 && mouseY < 45;

  push();
  rectMode(CORNER);
  stroke(isHover ? '#00FFCC' : 180);
  strokeWeight(2);
  fill(isHover ? color(10, 45, 70, 220) : color(20, 20, 35, 200));
  rect(15, 15, 100, 30, 4);

  noStroke();
  fill(isHover ? '#00FFCC' : 255);
  textSize(8);
  textAlign(CENTER, CENTER);
  text('< VOLTAR', 65, 30);
  pop();

  if (isHover) cursor(HAND);
  return isHover;
}

function desenharEstrelasMenu() {
  push();
  rectMode(CENTER);
  noStroke();
  for (let e of estrelasMenu) {
    e.fase += e.velBrilho;
    let α = map(sin(e.fase), -1, 1, 60, 255);
    fill(255, 255, 255, α);

    let t = e.tamanho * (0.8 + sin(e.fase) * 0.2);
    rect(e.x, e.y, t, t / 3);
    rect(e.x, e.y, t / 3, t);
  }
  pop();
}

function desenharEstrelaPixel(x, y, tam, alfa) {
  push();
  translate(x, y);
  fill(255, 255, 255, alfa);
  noStroke();
  rectMode(CENTER);

  rect(0, 0, tam * 2.5, tam * 2.5);
  rect(0, -tam * 2.5, tam * 1.2, tam * 2.5);
  rect(0, tam * 2.5, tam * 1.2, tam * 2.5);
  rect(-tam * 2.5, 0, tam * 2.5, tam * 1.2);
  rect(tam * 2.5, 0, tam * 2.5, tam * 1.2);

  rect(0, -tam * 4.5, tam * 0.8, tam * 1.5);
  rect(0, tam * 4.5, tam * 0.8, tam * 1.5);
  rect(-tam * 4.5, 0, tam * 1.5, tam * 0.8);
  rect(tam * 4.5, 0, tam * 1.5, tam * 0.8);
  pop();
}

function desenharEstrelasPixeladas() {
  let t1 = sin(frameCount * 0.08) * 0.2 + 1;
  let t2 = cos(frameCount * 0.08) * 0.2 + 1;
  let a1 = map(sin(frameCount * 0.06), -1, 1, 140, 255);
  let a2 = map(cos(frameCount * 0.06), -1, 1, 140, 255);

  desenharEstrelaPixel(55, 170, 3.2 * t1, a1);
  desenharEstrelaPixel(105, 300, 2.3 * t2, a2);

  desenharEstrelaPixel(855, 170, 3.2 * t2, a2);
  desenharEstrelaPixel(805, 300, 2.3 * t1, a1);
}

function desenharProfsFlutuantes() {
  push();
  imageMode(CENTER);
  for (let p of profsMenu) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vRot;

    if (p.x < -60) p.x = width + 60;
    if (p.x > width + 60) p.x = -60;
    if (p.y < -60) p.y = height + 60;
    if (p.y > height + 60) p.y = -60;

    push();
    translate(p.x, p.y);
    rotate(p.rot);
    image(p.img, 0, 0, p.tam, p.tam);
    pop();
  }
  pop();
}

function telaInicio() {
  image(imgFundo, 0, 0, width, height);

  desenharEstrelasMenu();
  desenharProfsFlutuantes();
  desenharEstrelasPixeladas();

  let esc = 1 + sin(frameCount * 0.04) * 0.03;
  let yOffset = sin(frameCount * 0.03) * 6;

  push();
  translate(width / 2, 190 + yOffset);
  scale(esc);
  textAlign(CENTER, CENTER);

  fill(0, 229, 255, 90);
  noStroke();
  textSize(83);
  text('TEACHERS', 2, 30);
  text('INVADERS', 2, 130);

  fill(255);
  stroke(0, 229, 255);
  strokeWeight(5);
  textSize(83);
  text('TEACHERS', 0, 30);
  text('INVADERS', 0, 130);
  pop();

  let btnX = width / 2;
  let btnY = 480;
  let btnW = 240;
  let btnH = 60;

  let isHover = mouseX > btnX - btnW / 2 && mouseX < btnX + btnW / 2 &&
  mouseY > btnY - btnH / 2 && mouseY < btnY + btnH / 2;

  if (isHover) cursor(HAND);

  push();
  rectMode(CENTER);

  if (isHover) {
    noStroke();
    fill(0, 229, 255, 80);
    rect(btnX, btnY, btnW + 14, btnH + 14, 12);
  }

  stroke(isHover ? '#00FFCC' : '#00E5FF');
  strokeWeight(3);
  fill(isHover ? color(10, 45, 70, 230) : color(8, 20, 38, 200));
  rect(btnX, btnY, isHover ? btnW + 6 : btnW, isHover ? btnH + 4 : btnH, 8);

  noStroke();
  fill(isHover ? '#00FFCC' : '#FFFFFF');
  textSize(16);
  textAlign(CENTER, CENTER);
  text('INICIAR', btnX, btnY + 2);
  pop();
}

function telaEscolhaPlaneta() {
  image(imgFundo, 0, 0, width, height);
  desenharBotaoVoltar();

  let flutuarTitulo = sin(frameCount * 0.05) * 5;

  push();
  textAlign(CENTER, CENTER);
  noStroke(); // adicionado noStroke para remover bordas herdadas
  fill(255);
  textSize(20);
  text('ESCOLHA UM PLANETA', width / 2, 100 + flutuarTitulo);
  pop();

  let flutuar = sin(frameCount * 0.05) * 6;
  imageMode(CENTER);

  push();
  textAlign(CENTER, CENTER);
  noStroke(); // sem bordas nos nomes dos planetas
  
  let hMarte = dist(mouseX, mouseY, 220, 310) < 65;
  if (hMarte) cursor(HAND);
  image(imgMarte, 220, 310 + flutuar, hMarte ? 145 : 130, hMarte ? 145 : 130);
  fill(hMarte ? '#00FFCC' : 255);
  textSize(12);
  text('MARTE', 220, 430);

  let hTerra = dist(mouseX, mouseY, 450, 310) < 70;
  if (hTerra) cursor(HAND);
  image(imgTerra, 450, 310 - flutuar, hTerra ? 155 : 140, hTerra ? 155 : 140);
  fill(hTerra ? '#00FFCC' : 255);
  text('TERRA', 450, 430);

  let hJupiter = dist(mouseX, mouseY, 680, 310) < 90;
  if (hJupiter) cursor(HAND);
  image(imgJupiter, 680, 310 + flutuar, hJupiter ? 225 : 210, hJupiter ? 165 : 150);
  fill(hJupiter ? '#00FFCC' : 255);
  text('JÚPITER', 680, 430);
  pop();

  imageMode(CORNER);
}

function telaEscolhaProfessor() {
  image(imgFundo, 0, 0, width, height);
  desenharBotaoVoltar();

  let flutuarTitulo = sin(frameCount * 0.05) * 5;

  push();
  textAlign(CENTER, CENTER);
  noStroke(); // adicionado noStroke para remover bordas herdadas
  fill(255);
  textSize(20);
  text('ESCOLHA UM PROFESSOR', width / 2, 100 + flutuarTitulo);
  pop();

  let flutuar = sin(frameCount * 0.05) * 5;
  imageMode(CENTER);

  push();
  textAlign(CENTER, CENTER);
  noStroke(); // nomes dos professores sem bordas

  let hEttore = dist(mouseX, mouseY, 220, 310) < 65;
  if (hEttore) cursor(HAND);
  image(imgEttore, 220, 310 + flutuar, hEttore ? 145 : 130, hEttore ? 145 : 130);
  fill(hEttore ? '#00FFCC' : 255);
  textSize(12);
  text('ETTORE', 220, 430);

  let hGuilherme = dist(mouseX, mouseY, 450, 310) < 65;
  if (hGuilherme) cursor(HAND);
  image(imgGuilherme, 450, 310 - flutuar, hGuilherme ? 145 : 130, hGuilherme ? 145 : 130);
  fill(hGuilherme ? '#00FFCC' : 255);
  text('GUILHERME', 450, 430);

  let hThiago = dist(mouseX, mouseY, 680, 310) < 65;
  if (hThiago) cursor(HAND);
  image(imgThiago, 680, 310 + flutuar, hThiago ? 145 : 130, hThiago ? 145 : 130);
  fill(hThiago ? '#00FFCC' : 255);
  text('THIAGO', 680, 430);
  pop();

  imageMode(CORNER);
}

function mousePressed() {
  if (tela > 0 && mouseX > 15 && mouseX < 115 && mouseY > 15 && mouseY < 45) {
    tela--;
    if (tela < 3) historicoTrajetorias = [];
    return;
  }

  if (tela === 0) {
    if (mouseX > 330 && mouseX < 570 && mouseY > 450 && mouseY < 510) tela = 1;
  } else if (tela === 1) {
    if (dist(mouseX, mouseY, 220, 310) < 65) { planetaSelecionado = 'Marte'; tela = 2; }
    else if (dist(mouseX, mouseY, 450, 310) < 70) { planetaSelecionado = 'Terra'; tela = 2; }
    else if (dist(mouseX, mouseY, 680, 310) < 90) { planetaSelecionado = 'Júpiter'; tela = 2; }
  } else if (tela === 2) {
    if (dist(mouseX, mouseY, 220, 310) < 65) { professorSelecionado = 'Ettore'; tela = 3; }
    else if (dist(mouseX, mouseY, 450, 310) < 65) { professorSelecionado = 'Guilherme'; tela = 3; }
    else if (dist(mouseX, mouseY, 680, 310) < 65) { professorSelecionado = 'Thiago'; tela = 3; }
    reiniciarAliens();
  } else if (tela === 3 && !emLancamento) {
    let meterToPx = 1.6;
    let ox = 70;
    let oy = 420 - (y0 * meterToPx);
    let tamSeta = map(v0, 1, 200, 52, 150);
    let rad = radians(angle);
    let px = ox + cos(rad) * tamSeta;
    let py = oy - sin(rad) * tamSeta;

    if (dist(mouseX, mouseY, px, py) < 25) arrastandoMira = true;
    else if (dist(mouseX, mouseY, ox, oy) < 50) arrastandoNave = true;
  }
}

function mouseReleased() {
  arrastandoMira = false;
  arrastandoNave = false;
}

function windowResized() {
  if (tela === 3) posicionarControles();
}