import { AttributeNames } from '../modelDefinition/enums/attributeNames';
import preMethods from '../Shaders/tpmsPreProcessor.glsl?raw';
import tpmsMethods from '../Shaders/tpmsMethodDefinitions.glsl?raw';
import tpmsColors from '../Shaders/tpmsColorMethod.glsl?raw';

const handleColors = (data: any) => {
  const colorData = data[AttributeNames.Shmuck];

  const colorString = (colorEntry: any) =>
    `vec3( ${(colorEntry[AttributeNames.R].value / 255).toFixed(3)}, ${(colorEntry[AttributeNames.G].value / 255).toFixed(3)}, ${(
      colorEntry[AttributeNames.B].value / 255
    ).toFixed(3)} )`;

  const colorArray = (colorData[AttributeNames.ColorCount].v as Array<object>).map(colorString);

  return `const bool discreteGradient = ${colorData[AttributeNames.DiscreteGradient].value};
const int colorCount = ${colorData[AttributeNames.ColorCount].s.value};
vec3 COLORS[${colorData[AttributeNames.ColorCount].s.value}] = vec3[](${colorArray.join(',')});
`;
};

const mainMethodName: string[] = ['sdGyroid', 'sdSchwarzD', 'sdSchwarzP', 'sdPerlin', 'sdNeovius', 'sdMandelbrot'];

const getMainMethod = (data: any) => {
  const recursiveMethod = (vs: any[]): string =>
    `${mainMethodName[vs[0][AttributeNames.MethodEnumMain].value]}(p, ${vs.length > 1 ? `${recursiveMethod(vs.slice(1))} *` : ''}${vs[0][
      AttributeNames.MethodScale
    ].value.toFixed(3)})`;

  return `float getMainDistance(vec3 p) {
  return ${recursiveMethod(data.v)};
}`;
};

const postProcessingMethod: string[] = ['sin', 'cos'];

const getPostMethod = (data: any) => {
  if (!data.s.value) return '';
  const methodName = postProcessingMethod[data.v[AttributeNames.MethodEnumPost].value];
  const scaleValue = data.v[AttributeNames.MethodScale].value.toFixed(3);

  return `d = ${methodName}(d / ${scaleValue});`;
};

const preProcessingMethod: string[] = ['preSin', 'preCos', 'preModulus', 'preAlternate', 'preComplex'];

const getPreMethod = (data: any) => {
  if (!data.s.value) return '';
  const methodName = preProcessingMethod[data.v[AttributeNames.MethodEnumPre].value];
  const width = data.v[AttributeNames.XSpacing].value.toFixed(3);
  const height = data.v[AttributeNames.YSpacing].value.toFixed(3);

  return `locP = ${methodName}(locP, vec2(${width}, ${height}));`;
};

export const getDistanceMethod = (data: any) => {
  const scale = (data[AttributeNames.Viewport] as any)[AttributeNames.MousePosition][AttributeNames.ZoomLevel].value;
  const rotation = ((data[AttributeNames.Viewport] as any)[AttributeNames.MousePosition][AttributeNames.Rotation].value * Math.PI) / 180;
  const position = [
    (data[AttributeNames.Viewport] as any)[AttributeNames.MousePosition][AttributeNames.X].value * scale,
    (data[AttributeNames.Viewport] as any)[AttributeNames.MousePosition][AttributeNames.Y].value * scale,
    (data[AttributeNames.Viewport] as any)[AttributeNames.MousePosition][AttributeNames.Z].value,
  ];

  const vec3Position = `vec3(${position[0].toFixed(3)},${position[1].toFixed(3)},${position[2].toFixed(3)})`;

  const mainMethod = getMainMethod((data[AttributeNames.Methods] as any)[AttributeNames.MainMethods]);
  const preMethod = getPreMethod((data[AttributeNames.Methods] as any)[AttributeNames.PreProcessingMethods]);
  const postMethod = getPostMethod((data[AttributeNames.Methods] as any)[AttributeNames.PostProcessingMethods]);

  return `
${mainMethod}

float getDistance(vec3 p) {
  vec3 locP = vec3(rotate(p.xy * ${scale.toFixed(3)} - ${vec3Position}.xy, ${rotation.toFixed(3)}),0.0);
  ${preMethod}
  float d = getMainDistance(locP);
  ${postMethod}
  return 0.5 + d * 0.5;
}`;
};

export const getFragmentShader = (data: any) => {
  return `varying vec3 uvV;
${tpmsMethods}
${preMethods}
${handleColors(data)}

${tpmsColors}

${getDistanceMethod(data)}

void main() {
  // "Normalizing" with an arbitrary value
  float d = getDistance(uvV);
  vec3 color = getColorForDistance(d);

  gl_FragColor = vec4(color,1.0);
}`;
};
