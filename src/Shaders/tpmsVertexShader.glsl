varying vec3 uvV;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  uvV = vec3(uv, projectedPosition.z);
  gl_Position = projectedPosition;
}