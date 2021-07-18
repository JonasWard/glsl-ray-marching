var mesh, timer, shaderProgram;

dat.GUI.prototype.removeFolder = function(name) {
    var folder = this.__folders[name];
    
    if (!folder) {
        return;
    }

    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
}

dat.GUI.prototype.hide = function() {
    this.domElement.style.display = 'none';
}

dat.GUI.prototype.show = function() {
    this.domElement.style.display = '';
}

function HSVtoRGB(c) {
    //method that returns r,g,b [0->1] from hsv color object
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = c.s, v = c.v, h = c.h;
    }
    // adjust to match p5 format
    h = h / 360.;
    i = Math.floor(h * 6.);
    f = h * 6. - i;
    p = v * (1. - s);
    q = v * (1. - f * s);
    t = v * (1. - (1. - f) * s);
    switch (i % 6.) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    c.r = r;
    c.g = g;
    c.b = b;
    // return an array for use in p5js
    return new function () {
        c.r;
        c.g;
        c.b;
    }
}

class Color {
    constructor(red, green, blue){
        this.isHSV = false;
        this.r = red;
        this.g = green;
        this.b = blue;
    }

    setHSV(hue,saturation,value) {
        this.isHSV = true;
        this.h = hue;
        this.s = saturation;
        this.v = value;

        HSVtoRGB(this);
    }

    setRGB(red, green, blue){
        this.isHSV = false;
        this.r = red;
        this.g = green;
        this.b = blue;
    }

    static fromHSV(hue,saturation,value){
        var c = new Color(0., 0., 0.);
        c.setHSV(hue, saturation, value);
        return c;
    }
}

var scales = new function () {
    this.preProcessingA = 2.;
    this.preProcessingB = 2.;
    this.preProcessingC = 0.;
    this.distanceA = -1.80;
    this.distanceB = -1.00;
    this.distanceC = -1.00;
    this.postProcessing = 0.;
}

var userInput = new function() {
    this.zoomLevel = 1.;
    this.base = [0., 0.];
    this.origin = [0., 0.];
    this.mousePosition = [0., 0.];
    this.mouseDelta = [0., 0.];
    this.output = [0., 0.];
    this.rotation = 0.000;
    this.reset = false;
}

var colorData = new function() {
    this.count = 2;
    this.minColor = 2;
    this.maxColor = 11;

    this.colors = [
        Color.fromHSV(0., 0., 0.),
        Color.fromHSV(244, .93, 0.56),
        Color.fromHSV(350, .85, .77),
        Color.fromHSV(50, 1., 0.8),
        Color.fromHSV(200, 0.7, 0.7 ),
        Color.fromHSV(80, 1., 0.8),
        Color.fromHSV(300, 0.7, 0.7),
        Color.fromHSV(140, 1., 0.8),
        Color.fromHSV(60, 0.7, 0.7),
        Color.fromHSV(240, 1., 0.8),
        Color.fromHSV(160, 0.7, 0.7)
    ];

    this.color0 = this.colors[0];
    this.color1 = this.colors[1];
    this.color2 = this.colors[2];
    this.color3 = this.colors[3];
    this.color4 = this.colors[4];
    this.color5 = this.colors[5];
    this.color6 = this.colors[6];
    this.color7 = this.colors[7];
    this.color8 = this.colors[8];
    this.color9 = this.colors[9];
    this.color10 = this.colors[10];
}

var preProcessing = ["sin", "cos", "modTiling", "modAlternate", "complexTiling", "none"];

var preDict = {
    "sin": "sin",
    "cos": "cos",
    "modTiling": "modulus",
    "modAlternate": "alternate",
    "complexTiling": "complex",
    "none": null
}

var functionNames = ["sin", "cos", "gyroid", "schwarzD", "schwarzP", "perlin", "neovius", "mandelbrot", "none"];

var sdfDict = {
    "sin": "sdSin",
    "cos": "sdCos",
    "gyroid": "sdGyroid",
    "schwarzD": "sdSchwarzD",
    "schwarzP": "sdSchwarzP",
    "neovius": "sdNeovius",
    "perlin": "sdPerlin",
    "mandelbrot": "sdMandelbrot",
    "none": null
}

var postProcessing = ["sin", "cos", "none"];

var postDict = {
    "sin": "sin",
    "cos": "cos",
    "none": null
}

var functions = new function() {
    this.pre = "none"
    this.f1 = "gyroid";
    this.f2 = "schwarzD";
    this.f3 = "schwarzP";
    this.post = "none";
}

var constructSDFData = function(pre, f1, f2, f3, post) {
    var sdf_string = '';

    if (!(sdfDict[f3] == null)) {
        sdf_string = sdfDict[f3] + "(p, fScales.z)";
    }

    if (!(sdfDict[f2] == null)) {
        if (!(sdf_string.length == 0)) {
            sdf_string = sdfDict[f2] + "(p, fScales.y * " + sdf_string + ")";
        } else {
            sdf_string = sdfDict[f2] + "(p, fScales.y)";
        }
    }

    if (!(sdfDict[f1] == null)) {
        if (!(sdf_string.length == 0)) {
            sdf_string = sdfDict[f1] + "(p, fScales.x * " + sdf_string + ")";
        } else {
            sdf_string = sdfDict[f1] + "(p, fScales.x)";
        }
    }

    if (!(postDict[post] == null)) {
        if (!(sdf_string.length == 0)) {
            sdf_string = postDict[post] + "(ppScale * " + sdf_string + ")";
        } else {
            sdf_string = "1.";
        }
    }

    if (sdf_string.length == 0) {
        sdf_string = "1.";
    }

    var pre_calc = '';
    if (!(preDict[pre] == null)) {
        pre_calc = "\n\tp = " + preDict[pre] + "(p);\n";
    }

    sdf_string = pre_calc + "\n\treturn " + sdf_string + ";\n";

    return sdf_string;
}

var constructFragShader = function(sdfString = null) {
    var shader = '';
    var tpmsShaderA = jQuery.ajax({type: "GET", url: "Shaders/tpmsShaderPartA", async: false}).responseText;
    if (sdfString == null) {
        console.log("null string");
        var tpmsShaderSDF = jQuery.ajax({type: "GET", url: "Shaders/tpmsShaderPartSDF", async: false}).responseText;
    } else {
        console.log("given string");
        var tpmsShaderSDF = sdfString;
    }

    var tpmsShaderB = jQuery.ajax({type: "GET", url: "Shaders/tpmsShaderPartB", async: false}).responseText;

    shader = tpmsShaderA + tpmsShaderSDF + tpmsShaderB;

    console.log(shader);

    return shader;
}

// start() is the main function that gets called first by index.html
var start = function () {

    // Initialize the WebGL 2.0 canvas
    initCanvas();

    var newFragShader = constructFragShader(constructSDFData(functions.pre, functions.f1, functions.f2, functions.f3, functions.post));

    //tiff export
    const saveBlob = (function () {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        return function saveData(blob, fileName) {
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
        };
    }());

    var btn = document.getElementById("save");
    btn.addEventListener('click', () => {
        drawScene();
        canvas.toBlob((blob) => {
            saveBlob(blob, `screencapture-${2*canvas.width}x${2*canvas.height}.tiff`);
        });
    });

    // Create timer that will be used for fragment shader
    timer = new Timer();

    // Read in, compile, and create a shader program
    shaderProgram = new Shader('vertShader', newFragShader);
    // Activate the shader program
    shaderProgram.UseProgram();

    // Set vertices of the mesh to be the canonical screen space
    var vertices = [
        -1.0, -1.0,
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0
    ];

    // Set indices for the vertices above
    var indices = [2, 0, 1,
        1, 0, 3];

    // Create a mesh based upon the defined vertices and indices
    mesh = new Mesh(vertices, indices, shaderProgram);

    // Render the scene
    drawScene();
};

var activePosition = function(origin, zoomLevel, mD) {
    p = [
        origin[0] + mD[0] / zoomLevel,
        origin[1] + mD[1] / zoomLevel
    ]

    return p;
}

function switchShader() {
    var newFragShader = constructFragShader(constructSDFData(functions.pre, functions.f1, functions.f2, functions.f3, functions.post));

    shaderProgram = new Shader('vertShader', newFragShader);
    shaderProgram.UseProgram();
}

function colorUpdate(gui) {
    gui.removeFolder('colors');

    var colors = gui.addFolder('colors');
    for (i = 0; i < colorData.count; i++) {
        c = colors.addColor(colorData, 'color'+i).onChange( function () {
            colorData.colors[i].setRGB(c.r, c.g, c.b);
            console.log(c);
            console.log(colorData.colors[i]);
        });
    }

    var oneMoreColor = { add:function(){
        console.log("adding color");
        if (colorData.count < colorData.maxColor) {
            colorData.count += 1;
        }
        console.log(colorData.count);
        colorUpdate(gui);
    }};

    var oneLessColor = { remove:function(){
        console.log("removing color");
        if (colorData.count > colorData.minColor) {
            colorData.count -= 1;
        }
        console.log(colorData.count);
        colorUpdate(gui);
    }};

    colors.add(oneMoreColor, 'add');
    colors.add(oneLessColor, 'remove');

    colors.show();
}

// starts the canvas and gl
var initCanvas = function () {
    canvas = document.getElementById('game-surface');
    // console.log(canvas);
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });   // WebGL 2
    // console.log(gl);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    canvas.addEventListener('wheel', function (event) {
        wheelValue = event.deltaY;

        if (event.shiftKey) {
            console.log("shift keying");
            if (event.deltaX < 0) {
                userInput.rotation += .1;
            } else if (event.deltaX > 0) {
                userInput.rotation -= .1;
            }

            // console.log(userInput.rotation);
        } else {
            console.log("not shift keying");
            if (event.deltaY < 0) {
                userInput.zoomLevel *= 1.1;
            } else if (event.deltaY > 0) {
                userInput.zoomLevel *= .9;
            }
        }
    });

    mousedDownActive=false;

    canvas.addEventListener('mousedown', function (event) {
        mousedDownActive=true;
        userInput.mousePosition = [event.x, event.y];
        userInput.output = userInput.origin;
    });

    canvas.addEventListener('mousemove', function (event) {
        if(mousedDownActive){
            userInput.mouseDelta = [
                event.x - userInput.mousePosition[0],
                userInput.mousePosition[1] - event.y
            ];
            userInput.output = activePosition(userInput.origin, userInput.zoomLevel, userInput.mouseDelta);
            console.log(userInput.output);
        };
    });

    canvas.addEventListener('mouseup', function () {
        userInput.origin = activePosition(userInput.origin, userInput.zoomLevel, userInput.mouseDelta);
        userInput.output = userInput.origin;
        userInput.mouseDelta = [0., 0.];
        userInput.mousePosition = [0., 0.];

        mousedDownActive=false;
    });

    var gui = new dat.GUI();

    var scalesData = gui.addFolder('scales');
    var preProc = scalesData.addFolder('preProcessing');
    preProc.add(scales, 'preProcessingA', -1.00, 10.00);
    preProc.add(scales, 'preProcessingB', -1.00, 10.00);
    preProc.add(scales, 'preProcessingC', -1.00, 10.00);
    scalesData.add(scales, 'distanceA', -3.00, 5.00);
    scalesData.add(scales, 'distanceB', -3.00, 5.00);
    scalesData.add(scales, 'distanceC', -3.00, 5.00);
    scalesData.add(scales, 'postProcessing', -3.00, 5.00);

    var functionDescriptions = gui.addFolder('functions');
    functionDescriptions.add(functions, 'pre', preProcessing).onChange( function () {
        switchShader();
    });
    functionDescriptions.add(functions, 'f1', functionNames).onChange( function () {
        switchShader();
    });
    functionDescriptions.add(functions, 'f2', functionNames).onChange( function () {
        switchShader();
    });
    functionDescriptions.add(functions, 'f3', functionNames).onChange( function () {
        switchShader();
    });
    functionDescriptions.add(functions, 'post', postProcessing).onChange( function () {
        switchShader();
    });

    var adjustables = gui.addFolder('user input');
    adjustables.add(userInput, 'rotation', -3.1415927, 3.1415927);

    userInput.reset = false;

    var obj = { reset:function(){
        console.log("reseting parameters");
        userInput.output = [0., 0.];
        userInput.origin = [0., 0.];
        userInput.mousePosition = [0., 0.];
        userInput.mouseDelta = [0., 0.];
        userInput.zoomLevel = 1.;
    }};
    adjustables.add(obj, 'reset');

    colorUpdate(gui);
}

var drawScene = function () {
    normalSceneFrame = window.requestAnimationFrame(drawScene);

    userInput.base = [
        gl.canvas.width * .5,
        gl.canvas.height * .5
    ];

    // Adjust scene for any canvas resizing
    resize(gl.canvas);
    // Update the viewport to the current canvas size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Set background color to sky blue, used for debug purposes
    gl.clearColor(0.53, 0.81, 0.92, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update the timer
    timer.Update();

    // console.log();

    // Set uniform values of the fragment shader
    shaderProgram.SetUniformVec2("resolution", [gl.canvas.width, gl.canvas.height]);
    shaderProgram.SetUniform1f("time", timer.GetTicksInRadians());
    shaderProgram.SetUniform1f("fractalIncrementer", timer.GetFractalIncrement());
    shaderProgram.SetUniformVec2("base", userInput.base);
    shaderProgram.SetUniform1f("rotation", userInput.rotation);

    // console.log("happy");

    shaderProgram.SetUniformVec2("mousePosition", userInput.output);

    shaderProgram.SetUniform1f("zoomLevel", userInput.zoomLevel);

    shaderProgram.SetUniformVec3("fScales", [
        Math.pow(10., scales.distanceA),
        Math.pow(10., scales.distanceB),
        Math.pow(10., scales.distanceC)
    ]);

    shaderProgram.SetUniformVec3("preScales", [
        Math.round(Math.pow(10., scales.preProcessingA)),
        Math.round(Math.pow(10., scales.preProcessingB)),
        Math.pow(10., scales.preProcessingC)
    ]);
    shaderProgram.SetUniform1f("ppScale", Math.pow(10., scales.postProcessing));

    // Tell WebGL to draw the scene
    mesh.Draw();
}

//switch between different shaders

// function switchShader() {

//     if (shader.type == "gyroid") {
//         frag = 'gyroid'
//     } else if (shader.type == "gyroidCylinderSmooth") {
//         frag = 'gyroidCylinderSmooth'
//     } else if (shader.type == "gyroidCylinderStepped") {
//         frag = 'gyroidCylinderStepped'
//     } else if (shader.type == "indexedGyroid") {
//         frag = 'gyroidIndexed'
//     } else if (shader.type == "schwarzDPPIndexed") {
//         frag = 'schwarzDPPIndexed'
//     } else if (shader.type == "schwarzDPPGradient") {
//         frag = 'schwarzDPPGradient'
//     } else if (shader.type == "schwarzDPPSmooth") {
//         frag = 'schwarzDPPSmooth'
//     } else if (shader.type == "gyroidSmooth") {
//         frag = 'gyroidSmooth'
//     }

//     shaderProgram = new Shader('vertShader', frag);
//     // Activate the shader program
//     shaderProgram.UseProgram();

// }

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    // adjust to match p5 format
    h = h / 360.;
    i = Math.floor(h * 6.);
    f = h * 6. - i;
    p = v * (1. - s);
    q = v * (1. - f * s);
    t = v * (1. - (1. - f) * s);
    switch (i % 6.) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    // return an array for use in p5js
    return new function () {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

// resizes canvas to fit browser window
var resize = function (canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        aspectRatio = displayWidth / displayHeight;
    }
}
