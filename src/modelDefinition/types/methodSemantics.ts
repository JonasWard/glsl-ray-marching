export enum MethodNames {
  Gyroid = 'Gyroid',
  SchwarzD = 'SchwarzD',
  SchwarzP = 'SchwarzP',
  Perlin = 'Perlin',
  Neovius = 'Neovius',
  Mandelbrot = 'Mandelbrot',
  Sin = 'Sine',
  Cos = 'Cosine',
  Complex = 'Complex',
  Modulus = 'Modulus',
  AlternatingMoldus = 'AlternatingMoldus',
  None = 'None',
}

export const mainMethods = [MethodNames.Gyroid, MethodNames.SchwarzD, MethodNames.SchwarzP, MethodNames.Perlin, MethodNames.Neovius, MethodNames.Mandelbrot];
export const preProcessingMethods = [MethodNames.Complex, MethodNames.Modulus, MethodNames.AlternatingMoldus];
export const postProcessingMethods = [MethodNames.Sin, MethodNames.Cos];

export const MainMethodLabels = mainMethods.map((value, index) => ({ value: index, label: value }));
export const PreProcessingMethodLabels = preProcessingMethods.map((value, index) => ({ value: index, label: value }));
export const PostProcessingMethodLabels = postProcessingMethods.map((value, index) => ({ value: index, label: value }));
