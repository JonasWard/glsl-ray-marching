import React from 'react';
import { DisplayType, StateDataRenderer } from './StateDataRenderer';
import { DataEntry } from 'url-safe-bitpacking';
import { AttributeNames } from '../../modelDefinition/enums/attributeNames';
import { shouldUseDrawer } from '../utils/windowMethods';
import { EnumSemantics, StateDataType } from 'url-safe-bitpacking/dist/types';

const displayTypeMap = {
  [AttributeNames.Version]: DisplayType.HIDDEN,
  [AttributeNames.Viewport]: shouldUseDrawer() ? DisplayType.DRAWER : DisplayType.POPOVER,
  [AttributeNames.PostProcessingMethods]: shouldUseDrawer() ? DisplayType.DRAWER : DisplayType.POPOVER,
  [AttributeNames.PreProcessingMethods]: shouldUseDrawer() ? DisplayType.DRAWER : DisplayType.POPOVER,
  [AttributeNames.MainMethods]: shouldUseDrawer() ? DisplayType.DRAWER : DisplayType.POPOVER,
  [AttributeNames.Shmuck]: shouldUseDrawer() ? DisplayType.DRAWER : DisplayType.POPOVER,
};

type IParametricInputProps = {
  data: StateDataType;
  updateEntry: (dataEntry: DataEntry | DataEntry[]) => void;
  versionEnumSemantics?: EnumSemantics;
};

export const ParametricInput: React.FC<IParametricInputProps> = ({ data, updateEntry, versionEnumSemantics }) => {
  const [activeName, setActiveName] = React.useState('');

  return (
    <div style={{ position: 'fixed', left: 10, top: 10, padding: 8 }}>
      <StateDataRenderer
        asSlider
        data={data}
        name={''} // name is not used in this context
        updateEntry={updateEntry}
        versionEnumSemantics={versionEnumSemantics}
        activeName={activeName}
        setActiveName={setActiveName}
        displayTypeMap={displayTypeMap}
        // disabled={commingSoon}
      />
    </div>
  );
};
