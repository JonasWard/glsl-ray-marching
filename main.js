let mesh, timer, shaderProgram;

const LOCAL_STORAGE_KEY = 'patternGen0.2';

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

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ canvasSizes, colorData, functions, scales, userInput, shader }));

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

const data = {
  canvasSizes,
  colorData,
  functions,
  scales,
  userInput,
};

const defaultData = JSON.parse(JSON.stringify(data));

// saving and loading methods
const saveMethod = () => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';

  const filenameMethod = () => {
    const d = new Date();
    const year = d.getFullYear().toString().slice(-2);
    const month = d.getMonth();
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();

    // function name
    let function_name = '';
    if (functions.f1 != 'none') function_name += '_' + functions.f1;
    if (functions.f2 != 'none') function_name += '_' + functions.f2;
    if (functions.f3 != 'none') function_name += '_' + functions.f3;

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}_PatternGen_02` + function_name + `.json`;
  };

  const fileName = filenameMethod();
  const jsonObject = JSON.stringify({ ...data, shader: constructFragShader() }),
    blob = new Blob([jsonObject], { type: 'octet/stream' }),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

// updating object in place helper method
const updateObjectAttributes = (objToUpdate, newObject) => {
  for (const key of Object.keys(newObject)) objToUpdate[key] = newObject[key];
};

const updatePatternSettingsObject = (newPatternObject) => {
  try {
    if (newPatternObject.canvasSizes != null) updateObjectAttributes(data.canvasSizes, newPatternObject.canvasSizes);
    if (newPatternObject.colorData != null) updateObjectAttributes(data.colorData, newPatternObject.colorData);
    if (newPatternObject.functions != null) updateObjectAttributes(data.functions, newPatternObject.functions);
    if (newPatternObject.scales != null) updateObjectAttributes(data.scales, newPatternObject.scales);
    if (newPatternObject.userInput != null) updateObjectAttributes(data.userInput, newPatternObject.userInput);
  } catch (e) {
    console.log(e);
  }
};

// loading method
const loadMethod = () => {
  // Create a file input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  // Add an event listener for when the file is selected
  input.addEventListener('change', () => {
    // Get the selected file
    const file = input.files[0];

    // Create a file reader
    const reader = new FileReader();

    // Add an event listener for when the file is loaded
    reader.addEventListener('load', () => {
      // Parse the json string into an object
      const newData = JSON.parse(reader.result);

      // Log the data to the console
      updatePatternSettingsObject(newData);
    });

    // Read the file as a text
    reader.readAsText(file);
  });

  // Click the input element to open the file dialog
  input.click();
};

const resetMethod = () => updatePatternSettingsObject(defaultData);

const saving = {
  saving: saveMethod,
  loading: loadMethod,
  reset: resetMethod,
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

  if (localStorage.getItem(LOCAL_STORAGE_KEY) != null) updatePatternSettingsObject(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)));

  const scalesData = gui.addFolder('scales');
  const preProc = scalesData.addFolder('preProcessing');
  preProc.add(data.scales, 'preProcessingA', -1.0, 10.0);
  preProc.add(data.scales, 'preProcessingB', -1.0, 10.0);
  preProc.add(data.scales, 'preProcessingC', -1.0, 10.0);
  scalesData.add(data.scales, 'distanceA', -3.0, 5.0);
  scalesData.add(data.scales, 'distanceB', -3.0, 5.0);
  scalesData.add(data.scales, 'distanceC', -3.0, 5.0);
  scalesData.add(data.scales, 'postProcessing', -3.0, 5.0);

  const functionDescriptions = gui.addFolder('functions');
  functionDescriptions.add(data.functions, 'pre', preProcessing).onChange(() => switchShader());
  functionDescriptions.add(data.functions, 'f1', functionNames).onChange(() => switchShader());
  functionDescriptions.add(data.functions, 'f2', functionNames).onChange(() => switchShader());
  functionDescriptions.add(data.functions, 'f3', functionNames).onChange(() => switchShader());
  functionDescriptions.add(data.functions, 'post', postProcessing).onChange(() => switchShader());

  const adjustables = gui.addFolder('user input');
  adjustables.add(data.userInput, 'rotation', -3.1415927, 3.1415927);
  adjustables.add(data.userInput, 'zoomLevel', -100, 100);

  userInput.reset = false;

  const obj = {
    reset: () => {
      data.userInput.output = [0, 0];
      data.userInput.origin = [0, 0];
      data.userInput.mousePosition = [0, 0];
      data.userInput.mouseDelta = [0, 0];
      data.userInput.zoomLevel = 1;
      data.userInput.rotation = 0;
    },
  };
  adjustables.add(obj, 'reset');

  // saving and loading settings
  const io = gui.addFolder('save / load');
  io.add(saving, 'saving');
  io.add(saving, 'loading');
  io.add(saving, 'reset');

  // adding the color menu
  const colors = gui.addFolder('colors');
  colors.addColor(data.colorData, 'color0');
  colors.addColor(data.colorData, 'color1');
  colors.add(data.colorData, 'isDiscrete').onChange(() => switchShader());
  colors.add(data.colorData, 'discreteSteps', 2, 10).onChange(() => switchShader());
  colors.add(data.colorData, 'colorShift', 0.0, 1.0).onChange(() => switchShader());

  // changing the canvas size
  const gameCanvas = document.getElementById('game-surface');
  gameCanvas.width = data.canvasSizes.width;
  gameCanvas.height = data.canvasSizes.height;
  const canvasSizeGUI = gui.addFolder('canvas size');
  canvasSizeGUI.add(gameCanvas, 'width', 100, 5000);
  canvasSizeGUI.add(gameCanvas, 'height', 100, 5000);
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
  shaderProgram.SetUniformVec2('base', data.userInput.base);
  shaderProgram.SetUniform1f('rotation', data.userInput.rotation);

  shaderProgram.SetUniformVec2('mousePosition', data.userInput.output);

  shaderProgram.SetUniform1f('zoomLevel', data.userInput.zoomLevel);

  shaderProgram.SetUniformVec3('fScales', [Math.pow(10, data.scales.distanceA), Math.pow(10, data.scales.distanceB), Math.pow(10, data.scales.distanceC)]);

  shaderProgram.SetUniformVec3('color1', [data.colorData.color0[0] / 255, data.colorData.color0[1] / 255, data.colorData.color0[2] / 255]);
  shaderProgram.SetUniformVec3('color2', [data.colorData.color1[0] / 255, data.colorData.color1[1] / 255, data.colorData.color1[2] / 255]);
  shaderProgram.SetUniform1f('steps', data.colorData.discreteSteps - 1);
  shaderProgram.SetUniform1f('shift', data.colorData.colorShift);

  shaderProgram.SetUniformVec3('preScales', [
    Math.round(Math.pow(10, data.scales.preProcessingA)),
    Math.round(Math.pow(10, data.scales.preProcessingB)),
    Math.pow(10, data.scales.preProcessingC),
  ]);
  shaderProgram.SetUniform1f('ppScale', Math.pow(10, data.scales.postProcessing));

  // Tell WebGL to draw the scene
  mesh.Draw();
};
