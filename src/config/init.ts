import { AttributeNames } from '../modelDefinition/enums/attributeNames';

const vsSource = `
    attribute vec4 aVertexPosition;
    void main(void) {
        gl_Position = aVertexPosition;
    }
`;

const fsSource = `
#define TAU                         6.2831853071795862
    precision mediump float;
    uniform float uTime;
    uniform vec2 uCenter;
    uniform vec2 uInverseResolution;
    uniform float uProportion;
    const float amplitude = 250.0;

    void main(void) {
        vec2 uv = (vec2(gl_FragCoord.xy) * vec2(uProportion, 1.0) - uCenter );
        float angle = atan(uv.y, uv.x);
        float radius = length(uv) * 1.0 + sin(angle );
        float localAmplitude = (1.5 + 0.5 * sin(radius * 10.0 / amplitude) + uProportion) * amplitude;
        float index = radius  / localAmplitude;
        radius = radius / localAmplitude + (angle + sin(angle * (index - mod(index, 1.0))) + uTime) / TAU;
        vec3 color = vec3(0.5 + 0.5 * sin(TAU * radius - 1.0), 0.5 + 0.5 * sin(TAU * radius), 0.5 + 0.5 * sin(TAU * radius + 1.0));
        gl_FragColor = vec4(color, 1.0);
    }
`;

const loadShader = (gl: WebGLRenderingContext, type: GLenum, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const initShader = (gl: WebGLRenderingContext, data: any) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  if (!(vertexShader && fragmentShader && shaderProgram)) return null;

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
};

const handlingWidthHeight = (canvas: HTMLCanvasElement, data: any) => {
  const hasCanvasDimensionsDefined = !(data as any)[AttributeNames.CanvasFullScreen].s;

  canvas.width = hasCanvasDimensionsDefined ? (data as any)[AttributeNames.CanvasFullScreen].v[AttributeNames.CanvasWidth] : window.innerWidth;
  canvas.height = hasCanvasDimensionsDefined ? (data as any)[AttributeNames.CanvasFullScreen].v[AttributeNames.CanvasHeight] : window.innerHeight;
};

const handleMesh = (gl: WebGLRenderingContext, shaderProgram: WebGLProgram) => {
  gl.clear(gl.DEPTH_BUFFER_BIT);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [-1, 1, 1, 1, -1, -1, 1, -1];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(vertexPosition);
  gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(shaderProgram);
};

export const InitWebGL = (canvas: HTMLCanvasElement, data: any) => {
  handlingWidthHeight(canvas, data[AttributeNames.Viewport]);

  const gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  const shaderProgram = initShader(gl, data);
  if (!shaderProgram) {
    console.log('Could not initialize shaders');
    return;
  }

  const timeUniformLocation = gl.getUniformLocation(shaderProgram, 'uTime');
  const centerUniformLocation = gl.getUniformLocation(shaderProgram, 'uCenter');
  const resolution = gl.getUniformLocation(shaderProgram, 'uInverseResolution');
  const uProportion = gl.getUniformLocation(shaderProgram, 'uProportion');

  const render = () => {
    const time = 35 + Math.sin(Date.now() * 0.00005) * 25;
    const localTime = time * (100 / window.innerWidth) ** 0.5;
    const proportion = ((canvas.height / canvas.width) * window.innerWidth) / window.innerHeight;

    const sizeMultiplier = window.innerWidth * 0.2;

    // time based lisajoue figures
    const a = Math.sin(localTime * 0.01) * 5.0;
    const b = Math.cos(localTime * 0.01) * 5.0;
    const t = localTime * 0.2;
    const delta = Math.cos(localTime * 0.05);

    const x = window.innerWidth * 0.5 + sizeMultiplier * Math.sin(a * t * 2.0 + delta);
    const y = window.innerHeight * 0.5 + sizeMultiplier * proportion * Math.sin(b * t * 2.0);

    // const x = window.innerWidth * 0.5;
    // const y = window.innerHeight * 0.5;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shaderProgram);
    gl.uniform1f(timeUniformLocation, localTime * 10.0); // Convert time to seconds
    gl.uniform2f(centerUniformLocation, x, y);
    gl.uniform2f(resolution, 1 / window.innerWidth, 1 / window.innerHeight);
    gl.uniform1f(uProportion, proportion);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

  handleMesh(gl, shaderProgram);
};
