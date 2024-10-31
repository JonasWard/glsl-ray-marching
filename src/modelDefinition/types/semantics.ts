import { EnumSemantics } from 'url-safe-bitpacking';
import { AttributeNames } from '../enums/attributeNames';
import { Versions } from './versions';
import { MethodLabels } from './methodSemantics';

export const versionEnumSemantics: EnumSemantics = {
  [AttributeNames.Version]: Versions,
  [AttributeNames.MethodEnum]: MethodLabels,
};
