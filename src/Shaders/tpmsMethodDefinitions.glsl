// Gyroid Marching
const float tau = 6.2831853072;
const float staticZ = 0.;

// other static input parameters
const vec3 mvVec = vec3(0.);
const float alpha = 1.;

// helper method for calculating the modulus of a value
float modulusFloat(float a, float b) {
  return a - (b * floor(a/b));
}

float signV(float v){
  if (v < 0.) {
    return -1.;
  } else if (v > 0.) {
    return 1.;
  } else {
    return 0.;
  }
}

vec2 fgCircusquare(vec2 p){
  // circle to square mapping assuming that u and v are elements of [-1, 1]
  float x2 = p.x * p.x;
  float y2 = p.y * p.y;
  float sq_l = x2 + y2;
  float l = sqrt(sq_l);
  float mult = sqrt(l*(l - sqrt(sq_l - 4. * x2 * y2)));
  return vec2(
    signV(p.x)*mult/(1.41421 * p.x),
    signV(p.y)*mult/(1.41421 * p.y)
  );
}

vec2 fgSquircular(vec2 p){
  // square to circle mapping assuming that x and y are elements of [-1, 1]
  float l = length(p);
  float sq_l = l * l;
  float x2 = p.x * p.x;
  float y2 = p.y * p.y;
  float top = sqrt(sq_l - x2 * y2);
  float mult = top / l;

  return vec2(p.x * mult, p.y * mult);
}

//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

float sdPerlin(vec3 p, float scale) {
  p *= scale;
  float d = cnoise(p);
  return d;
}

// mandelbrot
vec2 complexMult(vec2 a, vec2 b) {
	return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

float testMandelbrot(vec2 coord) {
  // turn this up to 5000 or so if you have a good gpu
  // for better details but less vibrant color in extreme zoom
  const int iterations = 912;
	vec2 testPoint = vec2(0,0);
	for (int i = 0; i < iterations; i++){
		testPoint = complexMult(testPoint,testPoint) + coord;
    float ndot = dot(testPoint,testPoint);
		if (ndot > 45678.0) {
      float sl = float(i) - log2(log2(ndot))+4.0;
      return sl/float(iterations) * 2.5;
		}
	}
	return 0.0;
}

const float rMin = 0.0;
const float rMax = 10.0;
const float iMin = 0.0;
const float iMax = 10.0;

float julliaSet(vec2 c) {
	vec2 testPoint = vec2(0,0);

  const int iterations = 912;
	for (int i = 0; i < iterations; i++){
    testPoint = complexMult(testPoint,testPoint) + c;
    float ndot = dot(testPoint,testPoint);

    if(ndot > 4. ) { 
      float sl = float(i);
			return sl/float(iterations) * 2.5;
    } 
  } 

  return 0.0;
}

float sdMandelbrot(vec3 p, float scale){
  return testMandelbrot(vec2(p.x, p.y) * scale);
}

float sdJulia(vec3 p, float scale){
  return julliaSet(vec2(p.x, p.y) * scale);
}

float sdSin(vec3 p, float scale) {
  p *= scale;
  float d = length(sin(p));
  d *= .5777; // 1 / sqrt(3)
	return d;
}

float sdCos(vec3 p, float scale) {
  p *= scale;
  float d = length(cos(p));
  d *= .5777; // 1 / sqrt(3)
	return d;
}

float sdGyroid(vec3 p, float scale) {
  p *= scale;
  float d = dot(sin(p), cos(p.yzx) );
  d *= .3333;
	return d;
}

float sdSchwarzD(vec3 p, float scale) {
  p *= scale;
  vec3 s = sin(p);
  vec3 c = cos(p);
  float d = s.x * s.y * s.z + s.x * c.y * c.z + c.x * s.y * c.z + c.x * c.y * s.z;
  d *= .3333;
	return d;
}

float sdSchwarzP(vec3 p, float scale) {
  p *= scale;
  p = cos(p);
  float d = p.x + p.y + p.z;
  d *= .3333;
	return d;
}

float sdNeovius(vec3 p, float scale) {
  p *= scale;
  p = cos(p);
  return (3.*(p.x+p.y+p.z)+4.*p.x*p.y*p.z) * 0.0769; // 1/13. -> domain Neovius
}

vec2 rotate(vec2 v, float r) {
  return vec2(v.x * cos(r) - v.y * sin(r), v.x * sin(r) + v.y * cos(r));
}