import {
  vertexShaderSource,
  fragmentShaderSource,
  createShader,
  createProgram,
  resize,
} from "./webgl.config.js";

const canvas = document.getElementById("glcanvas"),
  highscoreButton = document.getElementById("highscore"),
  highscoreContainer = document.getElementById("highscore-container"),
  highscoreList = document.getElementById("highscore-list"),
  backButton = document.getElementById("back"),
  menu = document.getElementById("menu"),
  playButton = document.getElementById("play"),
  scoreContainer = document.getElementById("score-container"),
  scoreValue = document.getElementById("score"),
  apiUrl = "http://localhost:3000";

let xVelocity = 0,
  yVelocity = 0,
  snakeXPosition = 10,
  snakeYPosition = 10,
  appleXPosition = 15,
  appleYPosition = 15,
  gridSize = 20,
  tileCount = 20,
  trail = [],
  tail = 0,
  tick = null,
  score = 0,
  highscores = [];

window.onload = () => {
  fetch(`${apiUrl}/highscore`, {
    headers: {
      "content-type": "application/json; charset=UTF-8",
    },
    method: "GET",
  })
    .then((data) => {
      return data.json();
    })
    .then((response) => {
      const scores = [...response];

      scores.sort((a, b) => {
        if (a < b) {
          return 1;
        }
        if (a > b) {
          return -1;
        }
        return 0;
      });

      highscores = scores;
    })
    .catch((error) => console.log(error));
};

const game = (gl, colorAttributeLocation, offset) => {
  snakeXPosition += xVelocity;
  snakeYPosition += yVelocity;

  if (snakeXPosition < 0) {
    snakeXPosition = tileCount - 1;
  }

  if (snakeXPosition > tileCount - 1) {
    snakeXPosition = 0;
  }

  if (snakeYPosition < 0) {
    snakeYPosition = tileCount - 1;
  }

  if (snakeYPosition > tileCount - 1) {
    snakeYPosition = 0;
  }

  trail.forEach((element) => {
    if (element.x === snakeXPosition && element.y === snakeYPosition) {
      gameOver();
      return;
    }
  });

  trail.push({ x: snakeXPosition, y: snakeYPosition });

  while (trail.length > tail) {
    trail.shift();
  }

  if (appleXPosition === snakeXPosition && appleYPosition === snakeYPosition) {
    tail++;
    score += 10;

    setScore();

    appleXPosition = Math.floor(Math.random() * tileCount);
    appleYPosition = Math.floor(Math.random() * tileCount);
  }

  drawApple(gl, colorAttributeLocation, offset);
  drawSnake(gl, colorAttributeLocation, offset);
};

const keyPush = (event) => {
  switch (event.key) {
    case "ArrowUp":
      xVelocity = 0;
      yVelocity = 1;
      break;
    case "ArrowRight":
      xVelocity = 1;
      yVelocity = 0;
      break;
    case "ArrowDown":
      xVelocity = 0;
      yVelocity = -1;
      break;
    case "ArrowLeft":
      xVelocity = -1;
      yVelocity = 0;
      break;
  }
};

const mapPosition = (xPosition, yPosition) => {
  let mappedXPosition, mappedYPosition;

  mappedXPosition = xPosition < 10 ? (xPosition - 10) / 10 : xPosition / 10 - 1;

  mappedYPosition = yPosition < 10 ? (yPosition - 10) / 10 : yPosition / 10 - 1;

  return [
    mappedXPosition,
    mappedYPosition,
    mappedXPosition,
    mappedYPosition + 0.1,
    mappedXPosition + 0.1,
    mappedYPosition + 0.1,
    mappedXPosition,
    mappedYPosition,
    mappedXPosition + 0.1,
    mappedYPosition,
    mappedXPosition + 0.1,
    mappedYPosition + 0.1,
  ];
};

const getApplePosition = () => {
  return mapPosition(appleXPosition, appleYPosition);
};

const getSnakePosition = () => {
  const headPosition = mapPosition(snakeXPosition, snakeYPosition);

  const trailPosition = trail.map((element) => {
    return mapPosition(element.x, element.y);
  });

  return [...headPosition, ...trailPosition.flat()];
};

const drawApple = (gl, colorAttributeLocation, offset) => {
  const positions = getApplePosition();

  gl.disableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttrib4f(colorAttributeLocation, 196 / 255, 52 / 255, 8 / 255, 1);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const primitiveType = gl.TRIANGLES;
  const count = 6;
  gl.drawArrays(primitiveType, offset, count);
};

const drawSnake = (gl, colorAttributeLocation, offset) => {
  const positions = getSnakePosition();

  gl.disableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttrib4f(colorAttributeLocation, 27 / 255, 143 / 255, 79 / 255, 1);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const primitiveType = gl.TRIANGLES;
  const count = 6 * (1 + trail.length);
  gl.drawArrays(primitiveType, offset, count);
};

const setScore = () => {
  scoreValue.innerText = score.toString().padStart(5, "0");
};

playButton.addEventListener("click", () => {
  menu.style.display = "none";
  canvas.style.display = "initial";
  scoreContainer.style.visibility = "visible";

  play();
});

highscoreButton.addEventListener("click", () => {
  menu.style.display = "none";
  highscoreContainer.style.display = "flex";

  highscoreList.innerHTML = "";
  highscores.forEach((element, index) => {
    highscoreList.innerHTML += `<ul class="list">${index + 1}: ${element}</ul>`;
  });
});

backButton.addEventListener("click", () => {
  menu.style.display = "flex";
  highscoreContainer.style.display = "none";
});

const gameOver = () => {
  clearInterval(tick);

  menu.style.display = "flex";
  canvas.style.display = "none";
  scoreContainer.style.visibility = "hidden";

  const lowerScore = [...highscores].pop();

  if (score > lowerScore) {
    const scores = [...highscores];
    scores.push(score);

    scores.sort((a, b) => {
      if (a < b) {
        return 1;
      }
      if (a > b) {
        return -1;
      }
      return 0;
    });

    scores.pop();

    highscores = scores;

    fetch(`${apiUrl}/highscore`, {
      headers: {
        "content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ highscores }),
      method: "POST",
    }).catch((error) => console.log(error));
  }

  xVelocity = 0;
  yVelocity = 0;
  snakeXPosition = 10;
  snakeYPosition = 10;
  appleXPosition = 15;
  appleYPosition = 15;
  trail = [];
  tail = 0;
  score = 0;

  setScore();
};

const play = () => {
  // Aplica o context WebGL.
  const gl = canvas.getContext("webgl2");

  if (!gl) {
    return;
  }

  // Cria os dois shaders.
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  // Linka os dois shaders.
  const program = createProgram(gl, vertexShader, fragmentShader);

  // Procura a localização do atributo 'a_position'.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

  // Procurar posições de atributos é algo que deve ser feito durante a inicialização, e não no seu loop de renderização.
  // Atributos obtêm seus dados através de buffers.

  // Cria um buffer.
  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();

  // Vincula o buffer de posição.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  // Ativa o atributo. Se não for ativado, então, o atributo terá um valor constante.
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(colorAttributeLocation);

  const size = 2; // 2 componentes por iteração.
  const type = gl.FLOAT; // Os dados são floats de 32bits.
  const normalize = false; // Não normalize os dados.
  const stride = 0; // 0 = mover para frente size * sizeof(type) cada iteração para obter a próxima posição.
  const offset = 0; // Comece no início do buffer.

  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  gl.vertexAttribPointer(
    colorAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  resize(gl.canvas);

  // Diz para o WebGL como converter de ClipSpace para pixels
  // Mapeia de -1/+1 do ClipSpace para 0/gl.canvas.width para o 'x', e 0/canvas.height para 'y'.
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(program);

  document.addEventListener("keydown", keyPush);
  tick = setInterval(() => {
    // Limpa o canvas
    gl.clearColor(0, 0, 0, 0.03);
    gl.clear(gl.COLOR_BUFFER_BIT);

    game(gl, colorAttributeLocation, offset);
  }, 1000 / 10);
};
