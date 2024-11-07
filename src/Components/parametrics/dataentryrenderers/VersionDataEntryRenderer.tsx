import { Select } from 'antd';
import React from 'react';
import { IconRenderer } from '../IconRenderer';
import { VersionDataEntry, EnumSemantics } from 'url-safe-bitpacking/dist/types';

export type IVersionDataEntryRendererProps = {
  version: VersionDataEntry;
  onChange: (newValue: VersionDataEntry) => void;
  versionEnumSemantics?: EnumSemantics;
};

const defaultSelectorValues = (max: number, key: string) => [...Array(max).keys()].map((i) => ({ value: i, label: `${key} ${i}` }));

export const VersionDataEntryRenderer: React.FC<IVersionDataEntryRendererProps> = ({ version, onChange, versionEnumSemantics }) => {
  const options = ((versionEnumSemantics && versionEnumSemantics[version.name]) ?? defaultSelectorValues(2 ** version.bits, version.name)).map((v) => ({
    ...v,
    label: <IconRenderer name={v.label} />,
  }));

  return <Select style={{ width: '100%' }} options={options} value={version.value} onSelect={(value) => onChange({ ...version, value })} />;
};
