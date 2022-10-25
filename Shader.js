var shaderText = '';


function nearestPowerOf2(n) {
    return 1 << 31 - Math.clz32(n);
}

// converts as list of floats to an rgba texture, rg values represent 1 value, ba represent
// store minimum and maximum values of the range in a uniform
const textureFromArray = (gl, values) => {
    const dataItems = values;
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    const delta = maxVal - minVal;
    const deltaMultiplier = 256 * 256 / delta;

    // regrading
    const regradedValues = values.map(v => Math.floor(deltaMultiplier * (v - minVal)))
    const uint8Values = [];

    regradedValues.forEach(v => {
        const v1 = Math.floor(v % 256);
        const v0 = Math.floor((v - v1) / 256 % 256);

        uint8Values.push(v1, v0);
    })

    // finding the size of the texture
    const pixelCount = uint8Values.length / 2.;
    const heightWidth = nearestPowerOf2(Math.sqrt(pixelCount)) * 2;

    var dataTypedArray = new Uint8Array(uint8Values); // Don't need to do this if the data is already in a typed array
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, heightWidth, heightWidth, 0, type, gl.UNSIGNED_BYTE, dataTypedArray);
    // Other texture setup here, like filter modes and mipmap generation
}

class Shader
{
    constructor(vertShaderId, fragShaderString)
    {
        this.shaderProgram = gl.createProgram();

        var vertexShader = this.getShader(gl, vertShaderId);
        var fragmentShader = this.strFragShader(gl, fragShaderString);
    
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);
    
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
    }

    /**
     * Read the shader file, compile it, and create a WebGL shader
     * @param {WebGLRenderingContext} gl Current WebGL rendering context
     * @param {HTML Class ID} id Class ID of the shader in the active DOM 
     */
    strFragShader(gl, string) {
        var shader;

        shader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(shader, string);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }
    
        var k = shaderScript.getAttribute('src');
        this.readTextFile(k);
    
        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
    
        gl.shaderSource(shader, shaderText);
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    
        return shader;
    }
    
    readTextFile(file)
    {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    shaderText = rawFile.responseText;
                }
            }
        }
        rawFile.send(null);
    }

    /**
     * Return the WebGL shader program
     */
    GetProgram()
    {
        return this.shaderProgram;
    }

    /**
     * Set the WebGL shader program to be the active renderer
     */
    UseProgram()
    {
        gl.useProgram(this.shaderProgram);
    }

    /**
     * Set a vec2 uniform in the shader program
     * @param {string} uniformName Name of the uniform in the shader program
     * @param {flat array} integer 3D color vector to pass to the shader
     */
    SetUniformInt(uniformName, integer) 
    {
        var roundedInt = Math.floor(integer+.5);
        console.log("roundInt "+uniformName+": "+roundedInt);
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, uniformName), roundedInt);
    }

    /**
     * Set a vec2 uniform in the shader program
     * @param {string} uniformName Name of the uniform in the shader program
     * @param {flat array} vector 3D color vector to pass to the shader
     */
    SetUniformColor(uniformName, cV) 
    {
        gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, uniformName), [cV.r, cV.g, cV.b]);
    }

    /**
     * Set a vec2 uniform in the shader program
     * @param {string} uniformName Name of the uniform in the shader program
     * @param {flat array} vector 2D vector to pass to the shader
     */
    SetUniformVec3(uniformName, vector)
    {
        gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, uniformName), vector);
    }

    /**
     * Set a vec2 uniform in the shader program
     * @param {string} uniformName Name of the uniform in the shader program
     * @param {flat array} vector 2D vector to pass to the shader
     */
    SetUniformVec2(uniformName, vector)
    {
        gl.uniform2fv(gl.getUniformLocation(this.shaderProgram, uniformName), vector);
    }

    /**
     * Set a float uniform in the shader program
     * @param {string} uniformName Name of the uniform in the shader program
     * @param {float} value Float to pass to the shader
     */
    SetUniform1f(uniformName, value)
    {
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, uniformName), value);
    }

    SetUniform10f = (uniformName, value) => gl.uniform1f(gl.getUniformLocation(this.shaderProgram, uniformName), 10, value);

    AddTexture = (uniformName, v, positions) => {
        var data = new Uint8Array([])
    }
}