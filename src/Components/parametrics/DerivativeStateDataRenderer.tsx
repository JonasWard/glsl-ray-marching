import { DataEntry, IntData } from 'url-safe-bitpacking';
import { EnumSemantics, StateDataType } from 'url-safe-bitpacking';
import { DisplayType, getDisplayType, StateDataRenderer } from './StateDataRenderer';
import { ViewWrapper } from './ViewWrapper';
import React from 'react';
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer';
import { ArrayDerivativeStateDataRenderer } from './ArrayDerivativeStateDataRenderer';
import { IntDataEntry } from 'url-safe-bitpacking/dist/types';

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
    displayType={getDisplayType(s.name!, displayTypeMap)}
    name={s.name!}
    activeName={activeName}
    setActiveName={setActiveName}
    disabled={disabled}
  >
    {Array.isArray(v) ? (
      <ArrayDerivativeStateDataRenderer
        s={s as IntDataEntry}
        v={v}
        versionEnumSemantics={versionEnumSemantics}
        updateEntry={updateEntry}
        displayTypeMap={displayTypeMap}
        activeName={activeName}
        setActiveName={setActiveName}
        disabled={disabled}
        asSlider={asSlider}
      />
    ) : (
      <>
        <DataEntryRenderer asSlider={asSlider} key={name} dataEntry={s} updateEntry={updateEntry} versionEnumSemantics={versionEnumSemantics} />
        <StateDataRenderer
          asSlider={asSlider}
          key={`${name}-subdata`}
          name={''}
          data={v}
          versionEnumSemantics={versionEnumSemantics}
          updateEntry={updateEntry}
          displayType={getDisplayType(name, displayTypeMap)}
          displayTypeMap={displayTypeMap}
          activeName={activeName}
          setActiveName={setActiveName}
          disabled={disabled}
        />
      </>
    )}
  </ViewWrapper>
);
