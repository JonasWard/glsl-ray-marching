import React from 'react';

export interface IInputBoxProps {
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const InputBox: React.FC<IInputBoxProps> = (props) => {
  return <div className='input-box-wrapper'></div>;
};

export default InputBox;
