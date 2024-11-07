import React from 'react';
import { ViewWrapper } from './ViewWrapper';
import { DataEntry, EnumSemantics, StateDataType } from 'url-safe-bitpacking';
import { DataEntryRenderer } from './dataentryrenderers/DataEntryRenderer';
import { DerivativeStateDataRenderer } from './DerivativeStateDataRenderer';
import { DerivativeStateDataType } from 'url-safe-bitpacking/dist/types';
import { AttributeNames } from '../../modelDefinition/enums/attributeNames';
import { ColorPicker } from './ColorPicker';

export enum DisplayType {
  NESTED,
  POPOVER,
  DRAWER,
  HIDDEN,
}

export const getDisplayType = (key: string, displayTypeMap?: { [key: string]: DisplayType }) => {
  if (displayTypeMap?.hasOwnProperty(key)) return displayTypeMap[key];
  return DisplayType.NESTED;
};

export type ISemtanticsRenderObjectProps = {
  data: StateDataType;
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

export const StateDataRenderer: React.FC<ISemtanticsRenderObjectProps> = ({
  data,
  name,
  updateEntry,
  versionEnumSemantics,
  displayTypeMap,
  activeName,
  setActiveName,
  asSlider,
  disabled = [],
}) => {
  // color state data renderer
  if (data.hasOwnProperty(AttributeNames.R) && data.hasOwnProperty(AttributeNames.G) && data.hasOwnProperty(AttributeNames.B) && Object.keys(data).length === 3)
    return <ColorPicker v={data as any} updateEntry={updateEntry} />;

  return (
    <ViewWrapper
      key={name}
      disabled={disabled}
      displayType={getDisplayType(name, displayTypeMap)}
      name={name}
      activeName={activeName}
      setActiveName={setActiveName}
    >
      {Object.entries(data).map(([semantic, value]) => {
        if (value.hasOwnProperty('type'))
          return (
            <ViewWrapper
              key={semantic}
              displayType={getDisplayType((value as DataEntry).internalName!, displayTypeMap)}
              name={(value as DataEntry).internalName!}
              activeName={activeName}
              setActiveName={setActiveName}
              disabled={disabled}
            >
              <DataEntryRenderer
                asSlider={asSlider}
                key={semantic}
                dataEntry={value as DataEntry}
                updateEntry={updateEntry}
                versionEnumSemantics={versionEnumSemantics}
                hidden={getDisplayType(semantic, displayTypeMap) === DisplayType.HIDDEN}
              />
            </ViewWrapper>
          );
        if (value.hasOwnProperty('s') && value.hasOwnProperty('v'))
          return (
            <DerivativeStateDataRenderer
              asSlider={asSlider}
              key={`${semantic}-subdata`}
              name={semantic}
              s={(value as DerivativeStateDataType).s}
              v={(value as DerivativeStateDataType).v}
              versionEnumSemantics={versionEnumSemantics}
              updateEntry={updateEntry}
              displayType={getDisplayType(semantic, displayTypeMap)}
              displayTypeMap={displayTypeMap}
              activeName={activeName}
              setActiveName={setActiveName}
              disabled={disabled}
            />
          );

        return (
          <StateDataRenderer
            asSlider={asSlider}
            key={`${semantic}-subdata`}
            name={semantic}
            data={value as StateDataType}
            versionEnumSemantics={versionEnumSemantics}
            updateEntry={updateEntry}
            displayType={getDisplayType(semantic, displayTypeMap)}
            displayTypeMap={displayTypeMap}
            activeName={activeName}
            setActiveName={setActiveName}
            disabled={disabled}
          />
        );
      })}
    </ViewWrapper>
  );
};
