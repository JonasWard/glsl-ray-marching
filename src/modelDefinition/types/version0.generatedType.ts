import { DataType } from 'url-safe-bitpacking';

type ColorType = {
  ['R']: { value: number; name: 'R'; type: DataType.INT; min: 0; max: 255; bits: 8 };
  ['G']: { value: number; name: 'G'; type: DataType.INT; min: 0; max: 255; bits: 8 };
  ['B']: { value: number; name: 'B'; type: DataType.INT; min: 0; max: 255; bits: 8 };
};

export type Version0 = {
  ['Viewport']: {
    ['Canvas Full Screen']:
      | {
          s: { value: true; name: 'Canvas Full Screen'; type: DataType.BOOLEAN };
          v: {
            ['Canvas Width']: { value: number; name: 'Canvas Width'; type: DataType.INT; min: 200; max: 4200; bits: 12 };
            ['Canvas Height']: { value: number; name: 'Canvas Height'; type: DataType.INT; min: 200; max: 4200; bits: 12 };
          };
        }
      | {
          s: { value: false; name: 'Canvas Full Screen'; type: DataType.BOOLEAN };
          v: {};
        };
    ['Origin']: {
      ['X']: { value: number; name: 'X'; type: DataType.FLOAT; min: -500; max: 500; precision: 3; significand: 20 };
      ['Y']: { value: number; name: 'Y'; type: DataType.FLOAT; min: -500; max: 500; precision: 3; significand: 20 };
      ['Z']: { value: number; name: 'Z'; type: DataType.FLOAT; min: -500; max: 500; precision: 3; significand: 20 };
    };
    ['Euler Angles']: {
      ['Pitch']: { value: number; name: 'Pitch'; type: DataType.FLOAT; min: -180; max: 180; precision: 1; significand: 12 };
      ['Roll']: { value: number; name: 'Roll'; type: DataType.FLOAT; min: -180; max: 180; precision: 1; significand: 12 };
      ['Yaw']: { value: number; name: 'Yaw'; type: DataType.FLOAT; min: -180; max: 180; precision: 1; significand: 12 };
    };
    ['Mouse Position']: {
      ['Rotation']: { value: number; name: 'Rotation'; type: DataType.FLOAT; min: 0; max: 360; precision: 1; significand: 12 };
      ['Zoom Level']: { value: number; name: 'Zoom Level'; type: DataType.FLOAT; min: 0.001; max: 1000; precision: 3; significand: 20 };
      ['Center Coordinate']: {
        ['Position X']: { value: number; name: 'Position X'; type: DataType.FLOAT; min: -1; max: 1; precision: 3; significand: 11 };
        ['Position Y']: { value: number; name: 'Position Y'; type: DataType.FLOAT; min: -1; max: 1; precision: 3; significand: 11 };
      };
    };
  };
  ['Methods']: {
    ['PreProcessing Methods']:
      | {
          s: { value: true; name: 'PreProcessing Methods'; type: DataType.BOOLEAN };
          v: {};
        }
      | {
          s: { value: false; name: 'PreProcessing Methods'; type: DataType.BOOLEAN };
          v: {
            ['MethodEnumPre']: { value: number; name: 'MethodEnumPre'; type: DataType.ENUM; max: 1; bits: 1 };
            ['X Spacing']: { value: number; name: 'X Spacing'; type: DataType.FLOAT; min: 0.1; max: 100; precision: 3; significand: 17 };
            ['Y Spacing']: { value: number; name: 'Y Spacing'; type: DataType.FLOAT; min: 0.1; max: 100; precision: 3; significand: 17 };
          };
        };
    ['Main Methods']:
      | {
          s: { value: 1; name: 'Main Methods'; type: DataType.INT; min: 1; max: 3; bits: 2 };
          v: [
            {
              ['MainMethodEnum']: { value: number; name: 'MainMethodEnum'; type: DataType.ENUM; max: 5; bits: 3 };
              ['MethodScale']: { value: number; name: 'MethodScale'; type: DataType.FLOAT; min: 0.001; max: 1000; precision: 3; significand: 20 };
            },
            {
              ['MainMethodEnum']: { value: number; name: 'MainMethodEnum'; type: DataType.ENUM; max: 5; bits: 3 };
              ['MethodScale']: { value: number; name: 'MethodScale'; type: DataType.FLOAT; min: 0.001; max: 1000; precision: 3; significand: 20 };
            }
          ];
        }
      | {
          s: { value: 2; name: 'Main Methods'; type: DataType.INT; min: 1; max: 3; bits: 2 };
          v: [
            {
              ['MainMethodEnum']: { value: number; name: 'MainMethodEnum'; type: DataType.ENUM; max: 5; bits: 3 };
              ['MethodScale']: { value: number; name: 'MethodScale'; type: DataType.FLOAT; min: 0.001; max: 1000; precision: 3; significand: 20 };
            },
            {
              ['MainMethodEnum']: { value: number; name: 'MainMethodEnum'; type: DataType.ENUM; max: 5; bits: 3 };
              ['MethodScale']: { value: number; name: 'MethodScale'; type: DataType.FLOAT; min: 0.001; max: 1000; precision: 3; significand: 20 };
            },
            {
              ['MainMethodEnum']: { value: number; name: 'MainMethodEnum'; type: DataType.ENUM; max: 5; bits: 3 };
              ['MethodScale']: { value: number; name: 'MethodScale'; type: DataType.FLOAT; min: 0.001; max: 1000; precision: 3; significand: 20 };
            }
          ];
        };
    ['PostProcessing Methods']:
      | {
          s: { value: true; name: 'PostProcessing Methods'; type: DataType.BOOLEAN };
          v: {};
        }
      | {
          s: { value: false; name: 'PostProcessing Methods'; type: DataType.BOOLEAN };
          v: {
            ['MethodEnumPost']: { value: number; name: 'MethodEnumPost'; type: DataType.ENUM; max: 1; bits: 1 };
            ['MethodScale']: { value: number; name: 'MethodScale'; type: DataType.FLOAT; min: 0.001; max: 1000; precision: 3; significand: 20 };
          };
        };
  };
  ['Shmuck']: {
    ['Discrete Gradient']: { value: boolean; name: 'Discrete Gradient'; type: DataType.BOOLEAN };
    ['Colour Count']:
      | {
          s: { value: 2; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType];
        }
      | {
          s: { value: 3; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType, ColorType];
        }
      | {
          s: { value: 4; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType, ColorType, ColorType];
        }
      | {
          s: { value: 5; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType, ColorType, ColorType, ColorType];
        }
      | {
          s: { value: 6; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType];
        }
      | {
          s: { value: 7; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType];
        }
      | {
          s: { value: 8; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType];
        }
      | {
          s: { value: 9; name: 'Colour Count'; type: DataType.INT; min: 2; max: 10; bits: 4 };
          v: [ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType, ColorType];
        };
  };
};
