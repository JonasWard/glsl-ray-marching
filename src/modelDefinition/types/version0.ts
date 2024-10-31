import { DataEntryFactory } from 'url-safe-bitpacking';
import { AttributeNames } from '../enums/attributeNames';
import { ArrayEntryDataType, SingleLevelContentType } from 'url-safe-bitpacking/dist/types';

const versionStack: ArrayEntryDataType = [
  [1, 3],
  [DataEntryFactory.createEnum(0, 6, `${AttributeNames.MethodEnum}`), DataEntryFactory.createFloat(1, 0.001, 1000, 3, `${AttributeNames.MethodScale}`)],
];

const colorArray: ArrayEntryDataType = [
  [2, 10],
  [
    DataEntryFactory.createInt(0, 0, 255, AttributeNames.R),
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
        AttributeNames.MousePosition,
        [DataEntryFactory.createFloat(1, 0.001, 1000, 3, AttributeNames.Rotation), DataEntryFactory.createFloat(1, 0.001, 1000, 3, AttributeNames.ZoomLevel)],
      ],
    ],
  ],
  [
    AttributeNames.Methods,
    [
      [AttributeNames.PreProcessingMethods, versionStack],
      [AttributeNames.PostProcessingMethods, versionStack],
      [AttributeNames.MainMethods, versionStack],
    ],
  ],
  [AttributeNames.Shmuck, [DataEntryFactory.createBoolean(false, AttributeNames.DiscreteGradient), [AttributeNames.ColorCount, colorArray]]],
];
