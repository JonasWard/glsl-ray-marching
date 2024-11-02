import { EnumSemantics } from 'url-safe-bitpacking';
import { AttributeNames } from '../enums/attributeNames';
import { Versions } from './versions';
import { MainMethodLabels, PostProcessingMethodLabels, PreProcessingMethodLabels } from './methodSemantics';

export const versionEnumSemantics: EnumSemantics = {
  [AttributeNames.Version]: Versions,
  [AttributeNames.MethodEnumMain]: MainMethodLabels,
  [AttributeNames.MethodEnumPost]: PostProcessingMethodLabels,
  [AttributeNames.MethodEnumPre]: PreProcessingMethodLabels,
};
