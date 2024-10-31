import React from 'react';
import './input-number.css';
import { GrUpdate } from 'react-icons/gr';

interface IInputNumberProps {
  value: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const InputNumber: React.FC<IInputNumberProps> = (props) => {
  const [localValue, setLocalValue] = React.useState(props.value);
  const updateGlobalValue = () => props.onChange(localValue);

  return (
    <div style={props.style} className='input-number-wrapper'>
      <button className='input-number-button' disabled={localValue === props.value} onClick={updateGlobalValue}>
        {props.icon ?? <GrUpdate />}
      </button>
      <input
        className='input-number'
        type='number'
        value={localValue}
        onChange={(e) => {
          setLocalValue(Number(e.target.value));
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            updateGlobalValue();
          }
        }}
        onBlur={updateGlobalValue}
      />
    </div>
  );
};

export default InputNumber;
