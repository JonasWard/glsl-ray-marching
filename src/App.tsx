import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { parserObjects } from './modelDefinition/model';
import { ParametricInput } from './Components/parametrics/ParametricInput';
import { DataEntry, StateDataType } from 'url-safe-bitpacking';
import { versionEnumSemantics } from './modelDefinition/types/semantics';
import { useData } from './state';
import { ThreeCanvas } from './webgl/ThreeCanvas';
import { useParams } from 'react-router-dom';
import { Button } from 'antd';
import { LiaFileDownloadSolid } from 'react-icons/lia';

const defaultState = 'CAAAOwNbYDYzAy50TawGGoRAC9mAGfgAPnQ____AAAA';

export const App: React.FC = () => {
  const { stateString } = useParams();
  const data = useData((s) => s.data);
  const [localDataState, setLocalDataState] = useState(data);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      setDebouncedInputValue(localDataState);
    }, 50);
    return () => clearTimeout(delayInputTimeoutId);
  }, [localDataState, 50]);

  useEffect(() => {
    window.history.replaceState(null, 'Same Page Title', `/glsl-ray-marching/#${parserObjects.stringify(data)}`);
  }, [data]);

  useEffect(() => {
    const initData = parserObjects.parser(stateString || defaultState);
    setLocalDataState(initData);
    useData.getState().setData(initData);
  }, []);

  const setDebouncedInputValue = (newData: StateDataType) => useData.getState().setData(newData);

  const updateEntry = (update: DataEntry | DataEntry[]): void => setLocalDataState(parserObjects.updater(localDataState, update));

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `glsl-ray-marching.${parserObjects.stringify(data)}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <>
      <ThreeCanvas canvasRef={canvasRef} />
      <ParametricInput data={localDataState} updateEntry={updateEntry} versionEnumSemantics={versionEnumSemantics} />
      <Button style={{ position: 'fixed', top: '15px', right: '15px' }} onClick={downloadPNG}>
        <LiaFileDownloadSolid style={{ position: 'absolute', width: 20, height: 20 }} size={16} />
      </Button>
    </>
  );
};
