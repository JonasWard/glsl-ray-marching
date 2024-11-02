vec3 getColorForDistance(float d) {
  float t = d * (float(colorCount) - 1.0);
  float tD = modulusFloat(t, 1.0);
  int i0 = int(t - tD);
  int i1 = i0 + 1;

  if (discreteGradient) {
    if (tD < 0.5) {
      return COLORS[i0];
    }
    else {
      return COLORS[i1];
    }
  }
  else {
    return mix(COLORS[i0], COLORS[i1], tD);
  }
}
