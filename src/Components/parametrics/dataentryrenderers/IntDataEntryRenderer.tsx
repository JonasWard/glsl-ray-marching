import { InputNumber, Select } from 'antd';
import { IconRenderer } from '../IconRenderer';
import React from 'react';
import { IntDataEntry } from 'url-safe-bitpacking/dist/types';
import { SliderWrapper } from '../SliderWrapperComponent';

export interface IIntDataEntryRendererProps {
  int: IntDataEntry;
  onChange: (newValue: IntDataEntry) => void;
  customMin?: number;
  customMax?: number;
  displayStyle?: 'slider' | 'dropdown' | 'input';
}

export const IntDataEntryRenderer: React.FC<IIntDataEntryRendererProps> = ({ int, onChange, customMax, customMin, displayStyle = 'slider' }) => {
  switch (displayStyle) {
    case 'slider':
      return (
        <SliderWrapper
          icon={<IconRenderer name={int.name} type={int.type} size={20} />}
          step={1}
          value={int.value}
          onChange={(value: number) => onChange({ ...int, value })}
          min={customMin ?? int.min}
          max={customMax ?? int.max}
          precision={0}
          bits={int.bits}
        />
      );
    case 'input':
      return (
        <InputNumber
          step={1}
          value={int.value}
          onChange={(value: number | null) => value !== null && onChange({ ...int, value })}
          min={customMin ?? int.min}
          max={customMax ?? int.max}
          precision={0}
        />
      );
    case 'dropdown':
      return (
        <Select
          value={int.value}
          options={[...Array(int.max - int.min + 1).keys()].map((v) => ({ value: v + int.min, label: v + int.min }))}
          onChange={(value: number) => onChange({ ...int, value })}
        ></Select>
      );
  }
};
