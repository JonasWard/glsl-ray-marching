import { DataEntry, IntDataEntry } from 'url-safe-bitpacking/dist/types';
import { AttributeNames } from '../../modelDefinition/enums/attributeNames';
import React from 'react';

type IColorPickerProps = {
  v: { [AttributeNames.R]: IntDataEntry; [AttributeNames.G]: IntDataEntry; [AttributeNames.B]: IntDataEntry };
  updateEntry: (dataEntry: IntDataEntry | DataEntry[]) => void;
};

const rgbToHex = (r: number, g: number, b: number): string => '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
const hexToRgb = (s: string): [number, number, number] => {
  // Remove the leading '#' if present
  const hex = s.replace('#', '');

  // Convert the hex string to decimal integers
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return [r, g, b];
};

export const ColorPicker: React.FC<IColorPickerProps> = ({ v, updateEntry }) => {
  const updateValues = (e: any) => {
    if (!e.target.value) return;

    const [r, g, b] = hexToRgb(e.target.value);
    const valuesToUpdate: IntDataEntry[] = [];
    if (v[AttributeNames.R].value !== r) valuesToUpdate.push({ ...v[AttributeNames.R], value: r });
    if (v[AttributeNames.G].value !== g) valuesToUpdate.push({ ...v[AttributeNames.G], value: g });
    if (v[AttributeNames.B].value !== b) valuesToUpdate.push({ ...v[AttributeNames.B], value: b });

    if (valuesToUpdate.length) updateEntry(valuesToUpdate);
  };

  return <input value={rgbToHex(v[AttributeNames.R].value, v[AttributeNames.G].value, v[AttributeNames.B].value)} onChange={updateValues} type='color' />;
};
