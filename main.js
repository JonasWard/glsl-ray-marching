var mesh, timer, shaderProgram;

var scales = new function () {
    this.gyroidA = -1.80;
    this.gyroidB = -1.00;
    this.gyroidC = -1.00;
}

var userInput = new function() {
    this.zoomLevel = 1.;
    this.base = [0., 0.];
    this.origin = [0., 0.];
    this.mousePosition = [0., 0.];
    this.mouseDelta = [0., 0.];
    this.output = [0., 0.];
    this.rotation = 0.;
    this.reset = false;
}

var constructFragShader = function(sdfString = null) {
    var shader = '';
    var tpmsShaderA = jQuery.ajax({type: "GET", url: "Shaders/tpmsShaderPartA", async: false}).responseText;
    if (sdfString == null) {
        var tpmsShaderSDF = jQuery.ajax({type: "GET", url: "Shaders/tpmsShaderPartSDF", async: false}).responseText;
    } else {
        var tpmsShaderSDF = sdfString;
    }

    var tpmsShaderB = jQuery.ajax({type: "GET", url: "Shaders/tpmsShaderPartB", async: false}).responseText;

    shader = tpmsShaderA + tpmsShaderSDF + tpmsShaderB;

    return shader;
}

// start() is the main function that gets called first by index.html
var start = function () {

    // Initialize the WebGL 2.0 canvas
    initCanvas();

    var newFragShader = constructFragShader();
    console.log(newFragShader);

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

// starts the canvas and gl
var initCanvas = function () {
    canvas = document.getElementById('game-surface');
    gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });   // WebGL 2

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.pres

    canvas.addEventListener('wheel', function (event) {
        console.log(event.deltaY);
        if (event.shiftKey) {
            if (event.deltaY < 0) {
                userInput.rotation += 0.01;
            }
            else if (event.deltaY > 0) {
                userInput.rotation -= 0.01;
            }
        } else {
            if (event.deltaY < 0) {
                userInput.zoomLevel *= 1.1;
            }
            else if (event.deltaY > 0) {
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
    scalesData.add(scales, 'gyroidA', -3.00, 5.00);
    scalesData.add(scales, 'gyroidB', -3.00, 5.00);
    scalesData.add(scales, 'gyroidC', -3.00, 5.00);

    var adjustables = gui.addFolder('user input');
    adjustables.add(userInput, 'rotation', -3.1415927, 3.1415927);
    adjustables.add(userInput, 'reset');
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

    if (userInput.reset) {
        console.log("reseting parameters");
        userInput.output = [0., 0.];
        userInput.origin = [0., 0.];
        userInput.mousePosition = [0., 0.];
        userInput.mouseDelta = [0., 0.];
        userInput.zoomLevel = 1.;
    }

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
        Math.pow(10., scales.gyroidA),
        Math.pow(10., scales.gyroidB),
        Math.pow(10., scales.gyroidC)
    ]);

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
