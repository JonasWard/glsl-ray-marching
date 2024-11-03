import React, { useEffect, useRef } from 'react';
import './App.css';
import { parserObjects } from './modelDefinition/model';
import { ParametricInput } from './Components/parametrics/ParametricInput';
import { DataEntry } from 'url-safe-bitpacking';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    useData.getState().setData(parserObjects.parser(stateString ?? defaultState));
  }, []);

  useEffect(() => {
    window.history.replaceState(null, 'Same Page Title', `/glsl-ray-marching/#${parserObjects.stringify(data)}`);
  }, [data]);

  const updateEntry = (update: DataEntry | DataEntry[]): void => useData.getState().setData(parserObjects.updater(useData.getState().data, update));

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
      <ParametricInput data={data} updateEntry={updateEntry} versionEnumSemantics={versionEnumSemantics} />
      <Button style={{ position: 'absolute', top: '15px', right: '15px', width: '30px', height: '30px' }} onClick={downloadPNG}>
        <LiaFileDownloadSolid style={{ position: 'absolute', width: 20, height: 20 }} size={16} />
      </Button>
    </>
  );
};
