let mesh, timer, shaderProgram;

// a sdf method scales the position in space with a certain distance or a distance method
// the definition of an sdf methods needs to define

// setting up base dat.GUI
dat.GUI.prototype.removeFolder = (name) => {
  const folder = this.__folders[name];

  if (!folder) return;

  folder.close();
  this.__ul.removeChild(folder.domElement.parentNode);
  delete this.__folders[name];
};

dat.GUI.prototype.hide = () => (this.domElement.style.display = 'none');

dat.GUI.prototype.show = () => (this.domElement.style.display = '');

// definition of different sdf methods
const preProcessing = ['sin', 'cos', 'modTiling', 'modAlternate', 'complexTiling', 'none', 'scale'];

const preDict = {
  sin: 'sin',
  cos: 'cos',
  modTiling: 'modulus',
  modAlternate: 'alternate',
  complexTiling: 'complex',
  scale: 'scalePre',
  none: null,
};

const functionNames = ['sin', 'cos', 'gyroid', 'schwarzD', 'schwarzP', 'perlin', 'neovius', 'mandelbrot', 'julia', 'none'];

const sdfDict = {
  sin: 'sdSin',
  cos: 'sdCos',
  gyroid: 'sdGyroid',
  schwarzD: 'sdSchwarzD',
  schwarzP: 'sdSchwarzP',
  neovius: 'sdNeovius',
  perlin: 'sdPerlin',
  mandelbrot: 'sdMandelbrot',
  julia: 'sdJulia',
  none: null,
};

const postProcessing = ['sin', 'cos', 'none'];

const postDict = {
  sin: 'sin',
  cos: 'cos',
  none: null,
};

const constructSDFData = (pre, f1, f2, f3, post) => {
  let sdf_string = '';

  if (!(sdfDict[f3] == null)) sdf_string = sdfDict[f3] + '(p, fScales.z)';

  if (!(sdfDict[f2] == null)) {
    if (!(sdf_string.length == 0)) sdf_string = sdfDict[f2] + '(p, fScales.y * ' + sdf_string + ')';
    else sdf_string = sdfDict[f2] + '(p, fScales.y)';
  }

  if (!(sdfDict[f1] == null)) {
    if (!(sdf_string.length == 0)) sdf_string = sdfDict[f1] + '(p, fScales.x * ' + sdf_string + ')';
    else sdf_string = sdfDict[f1] + '(p, fScales.x)';
  }

  if (!(postDict[post] == null)) {
    if (!(sdf_string.length == 0)) sdf_string = postDict[post] + '(ppScale * ' + sdf_string + ')';
    else sdf_string = '1.';
  }

  if (sdf_string.length == 0) sdf_string = '1.';

  const pre_calc = '';
  if (!(preDict[pre] == null)) pre_calc = '\n\tp = ' + preDict[pre] + '(p);\n';

  return pre_calc + '\n\treturn ' + sdf_string + ';\n';
};

const constructFragShader = () => {
  const sdfString = constructSDFData(functions.pre, functions.f1, functions.f2, functions.f3, functions.post);
  let shader = '';

  // setting the distance part of the shader
  let tpmsShaderSDF = '';
  const tpmsShaderA = jQuery.ajax({ type: 'GET', url: 'Shaders/tpmsShaderPartA', async: false }).responseText;
  if (sdfString == null) tpmsShaderSDF = jQuery.ajax({ type: 'GET', url: 'Shaders/tpmsShaderPartSDF', async: false }).responseText;
  else tpmsShaderSDF = sdfString;

  const tpmsShaderB = jQuery.ajax({ type: 'GET', url: 'Shaders/tpmsShaderPartB', async: false }).responseText;

  // setting the color map part of the shader
  let tpmsShaderColor = '';
  if (colorData.isDiscrete) {
    tpmsShaderColor = `
    float dRemap = float(floor( ( d * .5 + shift) * steps + .5 ) ) / steps;`;
  } else {
    tpmsShaderColor = `
    float dRemap = d * .5 + shift;`;
  }

  const tpmsShaderC = jQuery.ajax({ type: 'GET', url: 'Shaders/tpmsShaderPartC', async: false }).responseText;

  shader = tpmsShaderA + tpmsShaderSDF + tpmsShaderB + tpmsShaderColor + tpmsShaderC;

  // displaying the shader in the console to be able to easily debug it, also stored when saving a file
  console.log(shader);

  return shader;
};

// user adjustable variables
const canvasSizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const scales = {
  preProcessingA: 2,
  preProcessingB: 2,
  preProcessingC: 0,
  distanceA: -1.8,
  distanceB: -1.0,
  distanceC: -1.0,
  postProcessing: 0,
};

const userInput = {
  zoomLevel: 1,
  base: [0, 0],
  origin: [0, 0],
  mousePosition: [0, 0],
  mouseDelta: [0, 0],
  output: [0, 0],
  rotation: 0.785,
  reset: false,
};

const colorData = {
  isDiscrete: false,
  discreteSteps: 10,
  colorShift: 0.5,
  color0: [0, 255, 255],
  color1: [0, 0, 255],
};

const functions = {
  pre: 'none',
  f1: 'perlin',
  f2: 'schwarzP',
  f3: 'none',
  post: 'none',
};

// saving and loading methods
const saveMethod = () => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';

  const data = {
    canvasSizes,
    colorData,
    functions,
    scales,
    userInput,
    shader: constructFragShader(),
  };

  const fileName = 'pattern_settings.json';
  const jsonObject = JSON.stringify(data),
    blob = new Blob([jsonObject], { type: 'octet/stream' }),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

const saving = {
  saving: saveMethod,
};

// start() is the main function that gets called first by index.html
const start = () => {
  // Initialize the WebGL 2.0 canvas
  initCanvas();

  const newFragShader = constructFragShader();

  //tiff export
  const saveBlob = (() => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    return function saveData(blob, fileName) {
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
    };
  })();

  const btn = document.getElementById('save');
  btn.addEventListener('click', () => {
    drawScene();
    canvas.toBlob((blob) => {
      saveBlob(blob, `screencapture-${2 * canvas.width}x${2 * canvas.height}.png`);
    });
  });

  // Create timer that will be used for fragment shader
  timer = new Timer();

  // Read in, compile, and create a shader program
  shaderProgram = new Shader('vertShader', newFragShader);
  // Activate the shader program
  shaderProgram.UseProgram();

  // Set vertices of the mesh to be the canonical screen space
  const vertices = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0];

  // Set indices for the vertices above
  const indices = [2, 0, 1, 1, 0, 3];

  // Create a mesh based upon the defined vertices and indices
  mesh = new Mesh(vertices, indices, shaderProgram);

  // Render the scene
  drawScene();
};

const activePosition = (origin, zoomLevel, mD) => [origin[0] + mD[0] / zoomLevel, origin[1] + mD[1] / zoomLevel];

const switchShader = () => {
  const newFragShader = constructFragShader(constructSDFData(functions.pre, functions.f1, functions.f2, functions.f3, functions.post));
  shaderProgram = new Shader('vertShader', newFragShader);
  shaderProgram.UseProgram();
};

// starts the canvas and gl
const initCanvas = () => {
  canvas = document.getElementById('game-surface');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }); // WebGL 2
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  canvas.addEventListener('wheel', (event) => {
    wheelValue = event.deltaY;

    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        userInput.rotation += 0.1;
      } else if (event.deltaY > 0) {
        userInput.rotation -= 0.1;
      }
    } else if (event.altKey) {
      event.preventDefault();
      const scaleValue = event.ctrlKey ? 0.01 : 0.1;
      if (event.deltaY < 0) userInput.zoomLevel *= 1 + scaleValue;
      else if (event.deltaY > 0) userInput.zoomLevel *= 1 - scaleValue;
    }
  });

  mousedDownActive = false;

  canvas.addEventListener('mousedown', (event) => {
    mousedDownActive = true;
    userInput.mousePosition = [event.x, event.y];
    userInput.output = userInput.origin;
  });

  canvas.addEventListener('mousemove', (event) => {
    if (mousedDownActive) {
      userInput.mouseDelta = [event.x - userInput.mousePosition[0], userInput.mousePosition[1] - event.y];
      userInput.output = activePosition(userInput.origin, userInput.zoomLevel, userInput.mouseDelta);
    }
  });

  canvas.addEventListener('mouseup', () => {
    userInput.origin = activePosition(userInput.origin, userInput.zoomLevel, userInput.mouseDelta);
    userInput.output = userInput.origin;
    userInput.mouseDelta = [0, 0];
    userInput.mousePosition = [0, 0];

    mousedDownActive = false;
  });

  const gui = new dat.GUI();

  const scalesData = gui.addFolder('scales');
  const preProc = scalesData.addFolder('preProcessing');
  preProc.add(scales, 'preProcessingA', -1.0, 10.0);
  preProc.add(scales, 'preProcessingB', -1.0, 10.0);
  preProc.add(scales, 'preProcessingC', -1.0, 10.0);
  scalesData.add(scales, 'distanceA', -3.0, 5.0);
  scalesData.add(scales, 'distanceB', -3.0, 5.0);
  scalesData.add(scales, 'distanceC', -3.0, 5.0);
  scalesData.add(scales, 'postProcessing', -3.0, 5.0);

  const functionDescriptions = gui.addFolder('functions');
  functionDescriptions.add(functions, 'pre', preProcessing).onChange(() => switchShader());
  functionDescriptions.add(functions, 'f1', functionNames).onChange(() => switchShader());
  functionDescriptions.add(functions, 'f2', functionNames).onChange(() => switchShader());
  functionDescriptions.add(functions, 'f3', functionNames).onChange(() => switchShader());
  functionDescriptions.add(functions, 'post', postProcessing).onChange(() => switchShader());

  const adjustables = gui.addFolder('user input');
  adjustables.add(userInput, 'rotation', -3.1415927, 3.1415927);
  adjustables.add(userInput, 'zoomLevel', -100, 100);

  userInput.reset = false;

  const obj = {
    reset: () => {
      console.log('reseting parameters');
      userInput.output = [0, 0];
      userInput.origin = [0, 0];
      userInput.mousePosition = [0, 0];
      userInput.mouseDelta = [0, 0];
      userInput.zoomLevel = 1;
      userInput.rotation = 0;
    },
  };
  adjustables.add(obj, 'reset');

  // saving and loading settings
  const io = gui.addFolder('save / load');
  io.add(saving, 'saving');

  // adding the color menu
  const colors = gui.addFolder('colors');
  colors.addColor(colorData, 'color0');
  colors.addColor(colorData, 'color1');
  colors.add(colorData, 'isDiscrete').onChange(() => switchShader());
  colors.add(colorData, 'discreteSteps', 2, 10).onChange(() => switchShader());
  colors.add(colorData, 'colorShift', 0.0, 1.0).onChange(() => switchShader());

  // changing the canvas size
  const gameCanvas = document.getElementById('game-surface');
  gameCanvas.width = canvasSizes.width;
  gameCanvas.height = canvasSizes.height;
  const canvasSizeGUI = gui.addFolder('canvas size');
  canvasSizes.width = canvasSizeGUI.add(gameCanvas, 'width', 100, 5000);
  canvasSizes.height = canvasSizeGUI.add(gameCanvas, 'height', 100, 5000);
  const fillWindow = {
    'fill window': () => {
      gameCanvas.width = window.innerWidth;
      gameCanvas.height = window.innerHeight;
    },
  };
  canvasSizeGUI.add(fillWindow, 'fill window');
};

const drawScene = () => {
  normalSceneFrame = window.requestAnimationFrame(drawScene);

  userInput.base = [gl.canvas.width * 0.5, gl.canvas.height * 0.5];

  // Adjust scene for any canvas resizing
  // Update the viewport to the current canvas size
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Set background color to sky blue, used for debug purposes
  gl.clearColor(0.53, 0.81, 0.92, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Update the timer
  timer.Update();

  // Set uniform values of the fragment shader
  shaderProgram.SetUniformVec2('resolution', [gl.canvas.width, gl.canvas.height]);
  shaderProgram.SetUniform1f('time', timer.GetTicksInRadians());
  shaderProgram.SetUniform1f('fractalIncrementer', timer.GetFractalIncrement());
  shaderProgram.SetUniformVec2('base', userInput.base);
  shaderProgram.SetUniform1f('rotation', userInput.rotation);

  shaderProgram.SetUniformVec2('mousePosition', userInput.output);

  shaderProgram.SetUniform1f('zoomLevel', userInput.zoomLevel);

  shaderProgram.SetUniformVec3('fScales', [Math.pow(10, scales.distanceA), Math.pow(10, scales.distanceB), Math.pow(10, scales.distanceC)]);

  shaderProgram.SetUniformVec3('color1', [colorData.color0[0] / 255, colorData.color0[1] / 255, colorData.color0[2] / 255]);
  shaderProgram.SetUniformVec3('color2', [colorData.color1[0] / 255, colorData.color1[1] / 255, colorData.color1[2] / 255]);
  shaderProgram.SetUniform1f('steps', colorData.discreteSteps - 1);
  shaderProgram.SetUniform1f('shift', colorData.colorShift);

  shaderProgram.SetUniformVec3('preScales', [
    Math.round(Math.pow(10, scales.preProcessingA)),
    Math.round(Math.pow(10, scales.preProcessingB)),
    Math.pow(10, scales.preProcessingC),
  ]);
  shaderProgram.SetUniform1f('ppScale', Math.pow(10, scales.postProcessing));

  // Tell WebGL to draw the scene
  mesh.Draw();
};
