let img;

let tela = 0;

let telaInicial = 0;
let telaEscolha = 1;
let telaJogo = 2;

let btnIniciar;
let btnTerra;
let btnMarte;
let btnJupiter;
let btnVoltar;


function preload() {
  img = loadImage('assets/fundo.png');
}

function telaInicio(){

  image(img, 0, 0, width, height);
      fill('blue');
      textSize(50);
      text('Teachers Invaders', 100, 100);
      desenharGrade();
      btnIniciar.show();
      btnJupiter.hide();
      btnMarte.hide();
      btnVoltar.hide();
}



function setup() {

  createCanvas(600, 500);

  btnIniciar = createImg('assets/planeta.png');

  btnIniciar.position(255, 300);

  btnIniciar.size(90, 90);

  btnIniciar.mousePressed(clikinho1);

  btnJupiter = createImg('assets/planeta.png');

  btnJupiter.position(300, 300);

  btnJupiter.size(90, 90);

  btnJupiter.mousePressed(clikinho2);

  btnMarte = createImg('assets/planeta.png');

  btnMarte.position(150, 300);

  btnMarte.size(90, 90);

  btnMarte.mousePressed(clikinho2);

  btnVoltar = createImg('assets/planeta.png');

  btnVoltar.position(50, 50);

  btnVoltar.size(90, 90);

  btnVoltar.mousePressed(voltarTela);




  btnJupiter.hide();
  btnMarte.hide();
  btnVoltar.hide();

}


function clikinho1() {

  tela = 1;

}


function clikinho2() {

  tela = 2;

}


function voltarTela() {

  tela = tela - 1;

}


function draw() {

  switch(tela) {


    case 0:
      telaInicio();
      break;

    case 1:

      background(255);

      fill('blue');

      textSize(25);

      text('ESCOLHA O PLANETA', 150, 100);

      desenharGrade();

      btnIniciar.hide();

      btnJupiter.show();
      btnMarte.show();

      btnVoltar.show();

      break;

    case 2:

      background(67);

      fill('blue');

      textSize(40);

      text('JOGO', 250, 100);

      desenharGrade();

      btnIniciar.hide();

      btnJupiter.hide();
      btnMarte.hide();

      btnVoltar.show();

      break;

  }

}


function desenharGrade() {

  stroke(220, 100);

  strokeWeight(1);


  for (let x = 0; x < width; x += 50) {

    line(x, 0, x, height);

  }


  for (let y = 0; y < height; y += 50) {

    line(0, y, width, y);

  }

}