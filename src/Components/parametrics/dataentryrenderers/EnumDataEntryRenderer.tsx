import { Select } from 'antd';
import React from 'react';
import { IconRenderer } from '../IconRenderer';
import { EnumSemantics } from 'url-safe-bitpacking';
import { EnumDataEntry } from 'url-safe-bitpacking/dist/types';

export type IEnumDataEntryRendererProps = {
  enumValue: EnumDataEntry;
  onChange: (newValue: EnumDataEntry) => void;
  versionEnumSemantics?: EnumSemantics;
};

const defaultSelectorValues = (max: number, key: string) => [...Array(max).keys()].map((i) => ({ value: i, label: `${key} ${i}` }));
const getVersionEnumSemanticsMap = (enumValue: EnumDataEntry, versionEnumSemantics?: EnumSemantics) => {
  if (versionEnumSemantics) {
    const filterEnumSemantics = Object.keys(versionEnumSemantics).filter((semantic) => enumValue.name.startsWith(semantic));
    if (filterEnumSemantics.length) return versionEnumSemantics[filterEnumSemantics[0]];
  }

  return defaultSelectorValues(enumValue.max, enumValue.name);
};

export const EnumDataEntryRenderer: React.FC<IEnumDataEntryRendererProps> = ({ enumValue, onChange, versionEnumSemantics }) => {
  const options = getVersionEnumSemanticsMap(enumValue, versionEnumSemantics).map((v) => ({
    ...v,
    label: <IconRenderer name={v.label} />,
  }));

  return <Select style={{ width: '100%' }} options={options} value={enumValue.value} onSelect={(value) => onChange({ ...enumValue, value })} />;
};
