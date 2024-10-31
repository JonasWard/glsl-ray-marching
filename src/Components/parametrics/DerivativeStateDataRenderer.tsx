import { DataEntry } from 'url-safe-bitpacking';
import { EnumSemantics, StateDataType } from 'url-safe-bitpacking';
import { DisplayType, getDisplayType, StateDataRenderer } from './StateDataRenderer';
import { ViewWrapper } from './ViewWrapper';
import React from 'react';
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer';

type IDerivativeStateDataRenderer = {
  s: DataEntry;
  v: StateDataType | StateDataType[];
  name: string;
  updateEntry: (dataEntry: DataEntry | DataEntry[]) => void;
  versionEnumSemantics?: EnumSemantics;
  displayTypeMap?: { [key: string]: DisplayType };
  displayType?: DisplayType;
  activeName: string;
  setActiveName: (name: string) => void;
  asSlider?: boolean;
  disabled?: string[];
};

export const DerivativeStateDataRenderer: React.FC<IDerivativeStateDataRenderer> = ({
  s,
  v,
  name,
  updateEntry,
  versionEnumSemantics,
  displayTypeMap,
  activeName,
  setActiveName,
  asSlider,
  disabled = [],
}) => (
  <ViewWrapper
    key={name}
    displayType={getDisplayType(s.internalName!, displayTypeMap)}
    name={s.internalName!}
    activeName={activeName}
    setActiveName={setActiveName}
    disabled={disabled}
  >
    <DataEntryRenderer asSlider={asSlider} key={name} dataEntry={s} updateEntry={updateEntry} versionEnumSemantics={versionEnumSemantics} />
    {Array.isArray(v) ? (
      v.map((locV) => (
        <StateDataRenderer
          asSlider={asSlider}
          key={`${name}-subdata`}
          name={name}
          data={locV}
          versionEnumSemantics={versionEnumSemantics}
          updateEntry={updateEntry}
          displayType={getDisplayType(name, displayTypeMap)}
          displayTypeMap={displayTypeMap}
          activeName={activeName}
          setActiveName={setActiveName}
          disabled={disabled}
        />
      ))
    ) : (
      <StateDataRenderer
        asSlider={asSlider}
        key={`${name}-subdata`}
        name={name}
        data={v}
        versionEnumSemantics={versionEnumSemantics}
        updateEntry={updateEntry}
        displayType={getDisplayType(name, displayTypeMap)}
        displayTypeMap={displayTypeMap}
        activeName={activeName}
        setActiveName={setActiveName}
        disabled={disabled}
      />
    )}
  </ViewWrapper>
);
