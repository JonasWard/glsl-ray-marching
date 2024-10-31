import { VersionNames } from '../enums/versionNames';

export const Versions = Object.values(VersionNames).map((value, index) => ({ value: index, label: value }));

export type MethodType = {
  MethodEnum0: number;
  MethodScale0: number;
};

export type Values = {
  Methods: {
    'Main Methods': {
      'Main Methods': number;
      f0: number;
    };
  };
};
