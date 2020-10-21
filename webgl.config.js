// Fornece as coordenadas.
const vertexShaderSource = `
precision mediump int;
precision mediump float;

attribute vec4 a_position;
attribute vec3 a_color;

varying vec4 v_color;

void main() {
  gl_Position = a_position;
  v_color = vec4(a_color, 1.0);
}
`;

// Fornece a cor.
const fragmentShaderSource = `
precision mediump int;
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

// Função para criar o shader, fazer o upload da fonte GLSL e compilar o shader.
const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return undefined;
};

// Função para linkar os shaders.
const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return undefined;
};

// Função para redimensionar o canvas
const resize = (canvas) => {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
};

export {
  vertexShaderSource,
  fragmentShaderSource,
  createShader,
  createProgram,
  resize,
};
