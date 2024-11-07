import { IconRenderer } from '../IconRenderer';
import React from 'react';
import Checkbox from 'antd/es/checkbox/Checkbox';
import { BooleanDataEntry } from 'url-safe-bitpacking/dist/types';

export type IBooleanDataEntryRendererProps = {
  bool: BooleanDataEntry;
  onChange: (newValue: BooleanDataEntry) => void;
};

export const BooleanDataEntryRenderer: React.FC<IBooleanDataEntryRendererProps> = ({ bool, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <Checkbox style={{ marginRight: 8 }} checked={bool.value} onChange={() => onChange({ ...bool, value: !bool.value })} />
    <IconRenderer name={bool.name} type={bool.type} size={20} />
  </div>
);
