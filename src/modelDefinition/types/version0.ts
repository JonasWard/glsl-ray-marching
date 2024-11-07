import { DataEntryFactory } from 'url-safe-bitpacking';
import { AttributeNames } from '../enums/attributeNames';
import { ArrayEntryDataType, OptionalEntryDataType, SingleLevelContentType } from 'url-safe-bitpacking/dist/types';
import { MainMethodLabels, PostProcessingMethodLabels } from './methodSemantics';

const mainMethodVersionStack: ArrayEntryDataType = [
  [1, 3],
  [
    DataEntryFactory.createEnum(0, MainMethodLabels.length - 1, `${AttributeNames.MethodEnumMain}`),
    DataEntryFactory.createFloat(1, 0.001, 1000, 3, `${AttributeNames.MethodScale}`),
  ],
];
const preMethodStack: OptionalEntryDataType = [
  false,
  [],
  [
    DataEntryFactory.createEnum(0, PostProcessingMethodLabels.length - 1, `${AttributeNames.MethodEnumPre}`),
    DataEntryFactory.createFloat(1, 0.1, 100, 3, `${AttributeNames.XSpacing}`),
    DataEntryFactory.createFloat(1, 0.1, 100, 3, `${AttributeNames.YSpacing}`),
  ],
];
const postMethodStack: OptionalEntryDataType = [
  false,
  [],
  [
    DataEntryFactory.createEnum(0, PostProcessingMethodLabels.length - 1, `${AttributeNames.MethodEnumPost}`),
    DataEntryFactory.createFloat(1, 0.001, 1000, 3, `${AttributeNames.MethodScale}`),
  ],
];

const colorArray: ArrayEntryDataType = [
  [2, 10],
  [
    DataEntryFactory.createInt(255, 0, 255, AttributeNames.R),
    DataEntryFactory.createInt(0, 0, 255, AttributeNames.G),
    DataEntryFactory.createInt(0, 0, 255, AttributeNames.B),
  ],
];

export const verionArrayDefinition0: SingleLevelContentType[] = [
  [
    AttributeNames.Viewport,
    [
      [
        AttributeNames.CanvasFullScreen,
        [
          true,
          [DataEntryFactory.createInt(200, 200, 4200, AttributeNames.CanvasWidth), DataEntryFactory.createInt(200, 200, 4200, AttributeNames.CanvasHeight)],
          [],
        ],
      ],
      [
        AttributeNames.WorldOrigin,
        [
          DataEntryFactory.createFloat(1, -500, 500, 3, AttributeNames.X),
          DataEntryFactory.createFloat(1, -500, 500, 3, AttributeNames.Y),
          DataEntryFactory.createFloat(1, -500, 500, 3, AttributeNames.Z),
        ],
      ],
      [
        AttributeNames.WorldEulerAngles,
        [
          DataEntryFactory.createFloat(0, -180, 180, 1, AttributeNames.Pitch),
          DataEntryFactory.createFloat(0, -180, 180, 1, AttributeNames.Roll),
          DataEntryFactory.createFloat(0, -180, 180, 1, AttributeNames.Yaw),
        ],
      ],
      [
        AttributeNames.MousePosition,
        [
          DataEntryFactory.createFloat(0, 0, 360, 1, AttributeNames.Rotation),
          DataEntryFactory.createFloat(1, 0.001, 1000, 3, AttributeNames.ZoomLevel),
          [
            AttributeNames.CenterCoordinate,
            [DataEntryFactory.createFloat(0, -1, 1, 3, AttributeNames.PositionX), DataEntryFactory.createFloat(0, -1, 1, 3, AttributeNames.PositionY)],
          ],
        ],
      ],
    ],
  ],
  [
    AttributeNames.Methods,
    [
      [AttributeNames.PreProcessingMethods, preMethodStack],
      [AttributeNames.MainMethods, mainMethodVersionStack],
      [AttributeNames.PostProcessingMethods, postMethodStack],
    ],
  ],
  [AttributeNames.Shmuck, [DataEntryFactory.createBoolean(false, AttributeNames.DiscreteGradient), [AttributeNames.ColorCount, colorArray]]],
];
