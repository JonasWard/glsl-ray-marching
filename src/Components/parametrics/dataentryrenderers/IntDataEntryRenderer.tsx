import { InputNumber } from 'antd';
import { IconRenderer } from '../IconRenderer';
import React from 'react';
import { IntDataEntry } from 'url-safe-bitpacking/dist/types';
import { SliderWrapper } from '../SliderWrapperComponent';

export interface IIntDataEntryRendererProps {
  int: IntDataEntry;
  onChange: (newValue: IntDataEntry) => void;
  customMin?: number;
  customMax?: number;
  asSlider?: boolean;
}

export const IntDataEntryRenderer: React.FC<IIntDataEntryRendererProps> = ({ int, onChange, customMax, customMin, asSlider }) => (
  <SliderWrapper
    icon={<IconRenderer name={int.name} type={int.type} size={20} />}
    step={1}
    value={int.value}
    onChange={(value: number) => onChange({ ...int, value })}
    min={customMin ?? int.min}
    max={customMax ?? int.max}
    precision={0}
  />
);
