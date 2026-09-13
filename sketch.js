/*
 * TEACHERS INVADERS - SIMULADOR DE LANÇAMENTO OBLÍQUO (p5.js)
 * 
 * Instruções de Execução:
 * 1. Abra o arquivo 'index.html' em qualquer navegador web moderno.
 * 2. Certifique-se de que as pastas 'assets' e 'libraries' estejam no mesmo diretório.
 * 
 * Controles da Interface:
 * - Sliders: Ajustam Ângulo (1° a 89°), Velocidade V0 (1 a 100 m/s) e Altura Y0 (0 a 50 m).
 * - Mira/Nave: Arraste a ponta da seta amarela ou a própria nave com o mouse.
 * - Botão LANÇAR: Anima o projétil ao longo da trajetória calculada.
 * - Botão RESETAR: Limpa o histórico de trajetórias e reinicia os alvos.
 */

let imgFundo, imgFundoTerra, imgFundoMarte, imgFundoJupiter;
let imgTerra, imgMarte, imgJupiter;
let imgEttore, imgGuilherme, imgThiago;
let imgEttoreTiro, imgGuilhermeTiro, imgThiagoTiro;
let imgBill, imgBoludo, imgPendejo, imgPrin, imgPainel, imgNave;

let canvas;
let tela = 0; // 0: menu, 1: planetas, 2: profs, 3: jogo
let planetaSelecionado = 'Terra';
let professorSelecionado = 'Ettore';

// parametros fisicos
let v0 = 50;
let angle = 30;
let y0 = 10;
let g = 9.81;

// variaveis de calculo
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

// interacao
let arrastandoMira = false;
let arrastandoNave = false;
let alertaNaoToque = false;
let tempoAlerta = 0;

// aliens e botoes
let aliens = [];
let sliderV0, sliderAngle, sliderY0;
let btnLancar, btnReset, btnNaoToque;

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
}

function setup() {
  canvas = createCanvas(900, 650);
  canvas.parent('canvas-container');
  textFont('Press Start 2P');
  noSmooth();

  criarControles();
  esconderControles();
  reiniciarAliens();
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

// equacoes analiticas do lancamento obliquo
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
  let alturaAreaJogo = 430;
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

  // drag para alterar altura inicial (limitado a 50m)
  if (arrastandoNave && !emLancamento) {
    let mY = constrain(mouseY, chaoY - (50 * meterToPx), chaoY);
    y0 = round((chaoY - mY) / meterToPx);
    sliderY0.value(y0);
  }

  // eixos do grafico
  stroke(120, 140, 180, 150);
  strokeWeight(2);
  line(origemX, chaoY, width - 20, chaoY);
  line(origemX, 55, origemX, chaoY);

  // rotulos dos eixos com unidades
  noStroke();
  fill(200, 220, 255);
  textSize(8);
  textAlign(RIGHT, CENTER);
  text("ALTURA Y (m)", origemX + 90, 48);
  textAlign(RIGHT, TOP);
  text("DISTÂNCIA X (m)", width - 20, chaoY + 8);

  // trajetorias anteriores
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
  image(imgNave, origemX, naveY, 44, 36);
  imageMode(CORNER);

  desenharAliens(meterToPx, origemX, chaoY);

  // animacao do tiro
  if (emLancamento) {
    tempoSimulacao += deltaTime / 1000;

    if (tempoSimulacao <= tVoo) {
      xAtual = v0x * tempoSimulacao;
      yAtual = y0 + v0y * tempoSimulacao - 0.5 * g * sq(tempoSimulacao);

      let posPxX = origemX + xAtual * meterToPx;
      let posPxY = chaoY - yAtual * meterToPx;

      rastroAtual.push({ x: posPxX, y: posPxY });

      imageMode(CENTER);
      let imgTiro = professorSelecionado === 'Ettore' ? imgEttoreTiro :
                    professorSelecionado === 'Guilherme' ? imgGuilhermeTiro : imgThiagoTiro;
      image(imgTiro, posPxX, posPxY, 28, 28);
      imageMode(CORNER);
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

  if (alertaNaoToque) {
    push();
    fill(255, 0, 0, 40 + sin(frameCount * 0.2) * 30);
    rect(0, 0, width, height);

    fill(255, 80, 80);
    textSize(10);
    textAlign(CENTER, CENTER);
    text('ALERTA: SOBRECARGA NO SISTEMA!', width / 2, 60);
    pop();

    if (millis() - tempoAlerta > 3500) alertaNaoToque = false;
  }
}

function desenharVetorMira(ox, oy) {
  let tamSeta = map(v0, 0, 100, 0, 100);
  let rad = radians(angle);

  let pontaX = ox + cos(rad) * tamSeta;
  let pontaY = oy - sin(rad) * tamSeta;

  if (tamSeta > 2) {
    stroke('#FFD700');
    strokeWeight(3);
    line(ox, oy, pontaX, pontaY);

    push();
    translate(pontaX, pontaY);
    rotate(-rad);
    fill('#FFD700');
    noStroke();
    triangle(0, 0, -8, -4, -8, 4);
    pop();
  }

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

  // entradas de dados e decomposicao
  fill('#00FFCC');
  textSize(7);
  textAlign(LEFT, TOP);
  let col1X = 45;
  let startY = 475;
  let gap = 16;

  text(`PLANETA: ${planetaSelecionado.toUpperCase()}`, col1X, startY);
  text(`GRAVIDADE: ${g} m/s²`, col1X, startY + gap);
  text(`ANGULO: ${angle}°`, col1X, startY + gap * 2);
  text(`VELOCIDADE (V0): ${v0} m/s`, col1X, startY + gap * 3);
  text(`ALTURA (Y0): ${y0} m`, col1X, startY + gap * 4);
  text(`VX: ${v0x.toFixed(1)} m/s | VY: ${v0y.toFixed(1)} m/s`, col1X, startY + gap * 5);

  // resultados calculados analiticamente
  fill(0, 255, 180);
  textSize(8);
  textAlign(CENTER, CENTER);
  let greenX = 450;
  let greenYCenter = 532;
  let greenGap = 22;

  text(`ALCANCE HORIZ.: ${alcance.toFixed(1)} m`, greenX, greenYCenter - greenGap);
  text(`ALTURA MAXIMA : ${yMax.toFixed(1)} m`, greenX, greenYCenter);
  text(`TEMPO DE VOO   : ${tVoo.toFixed(2)} s`, greenX, greenYCenter + greenGap);

  // titulos dos sliders
  fill(220);
  textSize(8);
  textAlign(LEFT, TOP);
  text("ÂNGULO", 635, 468);
  text("VELOCIDADE", 635, 520);
  text("ALTURA", 765, 465);
  pop();
}

function criarControles() {
  sliderAngle = createSlider(1, 89, 30, 1);
  sliderAngle.style('width', '100px');
  sliderAngle.style('accent-color', '#00FFCC');
  sliderAngle.style('cursor', 'pointer');

  sliderV0 = createSlider(1, 100, 50, 1);
  sliderV0.style('width', '100px');
  sliderV0.style('accent-color', '#00FFCC');
  sliderV0.style('cursor', 'pointer');

  sliderY0 = createSlider(0, 50, 10, 1);
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
  btnReset.mousePressed(resetarSimulacao);

  btnNaoToque = createButton('');
  btnNaoToque.size(60, 60);
  btnNaoToque.style('background', 'transparent');
  btnNaoToque.style('border', 'none');
  btnNaoToque.style('cursor', 'pointer');
  btnNaoToque.mousePressed(ativarNaoToque);
}

function posicionarControles() {
  let cx = canvas.position().x;
  let cy = canvas.position().y;

  btnLancar.position(cx + 42, cy + 560);
  btnReset.position(cx + 140, cy + 560);

  sliderAngle.position(cx + 635, cy + 452);
  sliderV0.position(cx + 635, cy + 506);
  sliderY0.position(cx + 742, cy + 488);
  btnNaoToque.position(cx + 735, cy + 550);
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
}

function reiniciarAliens() {
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

    image(a.img, px, py, 36, 36);

    if (emLancamento) {
      let posPxX = origemX + xAtual * meterToPx;
      let posPxY = chaoY - yAtual * meterToPx;

      if (dist(posPxX, posPxY, px, py) < 24) a.vivo = false;
    }
  }
  imageMode(CORNER);
}

function desenharBotaoVoltar() {
  let isHover = mouseX > 15 && mouseX < 115 && mouseY > 15 && mouseY < 45;

  push();
  rectMode(CORNER);
  stroke(isHover ? '#FFD700' : 180);
  strokeWeight(2);
  fill(isHover ? color(40, 40, 60, 220) : color(20, 20, 35, 200));
  rect(15, 15, 100, 30, 4);

  noStroke();
  fill(isHover ? '#FFD700' : 220);
  textSize(8);
  textAlign(CENTER, CENTER);
  text('< VOLTAR', 65, 30);
  pop();

  if (isHover) cursor(HAND);
  return isHover;
}

function telaInicio() {
  image(imgFundo, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(24);
  text('TEACHERS INVADERS', width / 2, 180);

  let isHover = mouseX > 350 && mouseX < 550 && mouseY > 295 && mouseY < 345;
  if (isHover) cursor(HAND);

  stroke(isHover ? '#FFD700' : 255);
  strokeWeight(3);
  fill(0, 0, 0, 180);
  rectMode(CENTER);
  rect(width / 2, 320, isHover ? 210 : 200, isHover ? 55 : 50, 8);

  noStroke();
  fill(isHover ? '#FFD700' : 255);
  textSize(14);
  text('INICIAR', width / 2, 320);
}

function telaEscolhaPlaneta() {
  image(imgFundo, 0, 0, width, height);
  desenharBotaoVoltar();

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(20);
  text('ESCOLHA UM PLANETA', width / 2, 100);

  let flutuar = sin(frameCount * 0.05) * 6;
  imageMode(CENTER);

  // Marte
  let hMarte = dist(mouseX, mouseY, 220, 310) < 65;
  if (hMarte) cursor(HAND);
  image(imgMarte, 220, 310 + flutuar, hMarte ? 145 : 130, hMarte ? 145 : 130);
  fill(hMarte ? '#FFD700' : 255);
  textSize(12);
  text('MARTE', 220, 430);

  // Terra
  let hTerra = dist(mouseX, mouseY, 450, 310) < 70;
  if (hTerra) cursor(HAND);
  image(imgTerra, 450, 310 - flutuar, hTerra ? 155 : 140, hTerra ? 155 : 140);
  fill(hTerra ? '#FFD700' : 255);
  text('TERRA', 450, 430);

  // Jupiter
  let hJupiter = dist(mouseX, mouseY, 680, 310) < 90;
  if (hJupiter) cursor(HAND);
  image(imgJupiter, 680, 310 + flutuar, hJupiter ? 225 : 210, hJupiter ? 165 : 150);
  fill(hJupiter ? '#FFD700' : 255);
  text('JÚPITER', 680, 430);

  imageMode(CORNER);
}

function telaEscolhaProfessor() {
  image(imgFundo, 0, 0, width, height);
  desenharBotaoVoltar();

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(20);
  text('ESCOLHA UM PROFESSOR', width / 2, 100);

  let flutuar = sin(frameCount * 0.05) * 5;
  imageMode(CENTER);

  // Ettore
  let hEttore = dist(mouseX, mouseY, 220, 310) < 65;
  if (hEttore) cursor(HAND);
  image(imgEttore, 220, 310 + flutuar, hEttore ? 145 : 130, hEttore ? 145 : 130);
  fill(hEttore ? '#FFD700' : 255);
  textSize(12);
  text('ETTORE', 220, 430);

  // Guilherme
  let hGuilherme = dist(mouseX, mouseY, 450, 310) < 65;
  if (hGuilherme) cursor(HAND);
  image(imgGuilherme, 450, 310 - flutuar, hGuilherme ? 145 : 130, hGuilherme ? 145 : 130);
  fill(hGuilherme ? '#FFD700' : 255);
  text('GUILHERME', 450, 430);

  // Thiago
  let hThiago = dist(mouseX, mouseY, 680, 310) < 65;
  if (hThiago) cursor(HAND);
  image(imgThiago, 680, 310 + flutuar, hThiago ? 145 : 130, hThiago ? 145 : 130);
  fill(hThiago ? '#FFD700' : 255);
  text('THIAGO', 680, 430);

  imageMode(CORNER);
}

function mousePressed() {
  if (tela > 0 && mouseX > 15 && mouseX < 115 && mouseY > 15 && mouseY < 45) {
    tela--;
    if (tela < 3) historicoTrajetorias = [];
    return;
  }

  if (tela === 0) {
    if (mouseX > 350 && mouseX < 550 && mouseY > 295 && mouseY < 345) tela = 1;
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
    let tamSeta = map(v0, 0, 100, 0, 100);
    let rad = radians(angle);
    let px = ox + cos(rad) * tamSeta;
    let py = oy - sin(rad) * tamSeta;

    if (dist(mouseX, mouseY, px, py) < 25) arrastandoMira = true;
    else if (dist(mouseX, mouseY, ox, oy) < 30) arrastandoNave = true;
  }
}

function mouseReleased() {
  arrastandoMira = false;
  arrastandoNave = false;
}

function windowResized() {
  if (tela === 3) posicionarControles();
}