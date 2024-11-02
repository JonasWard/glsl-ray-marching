vec3 preModulus(vec3 p, vec2 uv){
  return vec3(mod(p.xy, uv) - uv * .5, p.z);
}

vec2 alternater(vec2 pInd, vec2 pMod, vec2 uv){
  float coorU = mod(pInd.x/uv.x, 2.);
  float coorV = mod(pInd.y/uv.y, 2.);
  if ((coorU == 0.) && (coorV == 0.)){
      return pMod;
  } else if ((coorU == 1.) && (coorV == 0.)) {
      return vec2(uv.x - pMod.x, pMod.y);
  } else if ((coorU == 0.) && (coorV == 1.)) {
      return vec2(pMod.x, uv.y - pMod.y);
  } else {
      return vec2(uv.x - pMod.x, uv.y - pMod.y);
  }
}

vec3 preAlternate(vec3 p, vec2 uv){
  vec2 pMod = mod(p.xy, uv);
  vec2 pInd = p.xy - pMod;

  pMod = alternater(pInd, pMod, uv);

  return vec3(pMod - uv.xy * .5, p.z);
}

vec3 preScale(vec3 p, vec2 uv){
  return vec3(p.x / uv.x, p.y / uv.y, p.z);
}

vec3 preSin(vec3 p, vec2 uv){
  return vec3(sin(vec2(p.x / uv.x, p.y / uv.y)), p.z);
}

vec3 preCos(vec3 p, vec2 uv){
  return vec3(cos(vec2(p.x / uv.x, p.y / uv.y)), p.z);
}

vec3 preComplex(vec3 p, vec2 uv){
  vec2 pMod = mod(p.xy, uv);
  vec2 pInd = p.xy - pMod;

  pMod = alternater(pInd, pMod, uv);
  vec2 pXY = pMod * 2. - uv.xy;
  pXY = fgSquircular(vec2(pXY.x / (uv.x-0.00001), pXY.y / uv.y-0.00001));
  return vec3(pXY.x * uv.x * .5, pXY.y * uv.y *.5, p.z);
}