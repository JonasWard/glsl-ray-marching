export enum MethodNames {
  Gyroid = 'Gyroid',
  SchwarzD = 'SchwarzD',
  SchwarzP = 'SchwarzP',
  Perlin = 'Perlin',
  Neovius = 'Neovius',
  Mandelbrot = 'Mandelbrot',
  // Julia = 'Julia',
}

export const MethodLabels = Object.values(MethodNames).map((value, index) => ({ value: index, label: value }));
