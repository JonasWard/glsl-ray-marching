// webgl link
precision mediump float;

uniform float time;


// Gyroid Marching
const float tau = 6.2831853072;
const float staticZ = 0.;

// // general transformation
// uniform vec3 mvVec;
// uniform float alpha;

// function parameters
uniform vec3 fScales;

// color scheme
const vec3 color1 = vec3(0., 0., 1.);
const vec3 color2 = vec3(1., 0., 0.);

// user interraction
uniform vec2 mousePosition;
uniform float zoomLevel;
uniform float rotation;
uniform vec2 base;

// other static input parameters
const vec3 mvVec = vec3(0.);
const float alpha = 1.;

float sdGyroid(vec3 p, float scale) {
    p *= scale;
    float d = dot(sin(p), cos(p.yzx) );
    d *= .3333;
	return d;
}

float GetDist(vec3 p) {
    float d_g = sdGyroid(p, fScales.x * sdGyroid(p, fScales.y) );
    return d_g;
}

float GetDist(vec3 p, float scaleA, float scaleB) {
    float d_g = sdGyroid(p, scaleB * sdGyroid(p, scaleA) );
    return d_g;
}

float GetDist(vec2 p) {
    return GetDist(vec3(p, 0.));
}

vec3 colorFromDistance(float d) {
    // float dRemap = float(floor( ( d * .5 + .5) * steps + .5 ) ) / steps;
    float dRemap = d * .5 + .5;
    vec3 color = mix(color1,color2, dRemap );

    return color;
}

vec3 translate(vec3 p, vec3 mv) {
    return (p + mv);
}

vec3 translate(vec3 p) {
    return translate(p, mvVec);
}

vec2 rotate(vec2 p, float a) {
    return vec2(
        p.x * cos(a) - p.y * sin(a),
        p.x * sin(a) + p.y * cos(a)
    );
}

vec2 rotate(vec2 p) {
    return rotate(p, rotation);
}

void main()
{
    vec2 scaledVec = (gl_FragCoord.xy - base) / zoomLevel - mousePosition;
    scaledVec = rotate(scaledVec);
    // scaledVec = scaledVec - mousePosition;

    vec3 p = vec3(scaledVec, 0.);
    
    // p = rotate( p );
    
    float d = GetDist(p);
    
    vec3 n = colorFromDistance(d * 2.);

    gl_FragColor = vec4(n, 1.);
}