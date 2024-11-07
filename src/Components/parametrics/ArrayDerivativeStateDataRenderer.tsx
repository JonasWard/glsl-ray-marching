import { DataEntry, EnumSemantics, getDataEntryArray, StateDataType } from 'url-safe-bitpacking';
import { DisplayType, getDisplayType, StateDataRenderer } from './StateDataRenderer';
import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { IntDataEntry } from 'url-safe-bitpacking/dist/types';
import { IntDataEntryRenderer } from './dataentryrenderers/IntDataEntryRenderer';

const PREFIX_SEPERATOR_DELIMETER = '_';

const stringMappingForDeleting = (entry: DataEntry, baseString: string, reductionAmount: number = 1): DataEntry => {
  const relevantInternalName = (entry.internalName as string).replace(baseString, '').slice(1);
  const [currentIndex, postfix] = relevantInternalName.split(PREFIX_SEPERATOR_DELIMETER);
  const newIndex = Number(currentIndex) - reductionAmount;

  return {
    ...entry,
    internalName: `${baseString}${PREFIX_SEPERATOR_DELIMETER}${newIndex}${PREFIX_SEPERATOR_DELIMETER}${postfix}`,
  };
};

type IArrayDerivativeStateDataRenderer = {
  s: IntDataEntry;
  v: StateDataType[];
  updateEntry: (dataEntry: DataEntry | DataEntry[]) => void;
  versionEnumSemantics?: EnumSemantics;
  displayTypeMap?: { [key: string]: DisplayType };
  activeName: string;
  setActiveName: (name: string) => void;
  asSlider?: boolean;
  disabled?: string[];
};

export const ArrayDerivativeStateDataRenderer: React.FC<IArrayDerivativeStateDataRenderer> = ({
  s,
  v,
  updateEntry,
  versionEnumSemantics,
  displayTypeMap,
  activeName,
  setActiveName,
  asSlider,
  disabled,
}) => {
  const handleDelete = (i: number) => {
    const stateDataToUpdate = { ...s, value: s.value - 1 };
    // simple case where you can just remove the last value by updating the state value
    if (i === v.length - 1) updateEntry(stateDataToUpdate);
    // in this case you need to map the content of the indexes after the deleted index to the items with a lower index
    else
      updateEntry([
        ...v
          .slice(i + 1)
          .map(getDataEntryArray)
          .flat()
          .map((d) => stringMappingForDeleting(d, s.internalName!)),
        stateDataToUpdate,
      ]);
  };

  const hanldeAdd = () => updateEntry({ ...s, value: s.value + 1 });

  const canDelete = v.length > s.min;
  const canAdd = v.length < s.max;

  return (
    <>
      <IntDataEntryRenderer displayStyle='dropdown' key={s.name} int={s} onChange={updateEntry} />
      {v.map((locV, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 6, alignItems: 'center' }}>
          <div style={{ width: canDelete ? '95%' : '100%' }}>
            <StateDataRenderer
              asSlider={asSlider}
              key={`${s.name}-subdata`}
              name={''}
              data={locV}
              versionEnumSemantics={versionEnumSemantics}
              updateEntry={updateEntry}
              displayType={getDisplayType(s.name, displayTypeMap)}
              displayTypeMap={displayTypeMap}
              activeName={activeName}
              setActiveName={setActiveName}
              disabled={disabled}
            />
          </div>
          {canDelete ? (
            <div style={{ width: '5%' }}>
              <FaTrash size={20} style={{ cursor: 'pointer' }} onClick={() => handleDelete(i)} />
            </div>
          ) : null}
        </div>
      ))}
      {canAdd ? (
        <div style={{ width: '100%', justifyContent: 'center' }}>
          <FaPlus size={20} style={{ cursor: 'pointer' }} onClick={() => hanldeAdd()} />
        </div>
      ) : null}
    </>
  );
};
