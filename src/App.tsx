import React, { useEffect, useRef } from 'react';
import './App.css';
import { parserObjects } from './modelDefinition/model';
import { ParametricInput } from './Components/parametrics/ParametricInput';
import { DataEntry, getStateValue } from 'url-safe-bitpacking';
import { versionEnumSemantics } from './modelDefinition/types/semantics';
import { InitWebGL } from './config/init';
import { useData } from './state';

export const App: React.FC = () => {
  const data = useData((s) => s.data);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateEntry = (update: DataEntry | DataEntry[]): void => useData.getState().setData(parserObjects.updater(useData.getState().data, update));

  const updateWebGLContext = () => canvasRef.current && InitWebGL(canvasRef.current, getStateValue(useData.getState().data));

  useEffect(() => {
    updateWebGLContext();
  }, [data]);

  useEffect(() => {
    const onResize = () => updateWebGLContext();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div>
      <canvas id='webgl-canvas' ref={canvasRef} style={{ opacity: 0.5, backgroundColor: 'red' }}>
        Your browser does not support HTML5
      </canvas>
      <ParametricInput data={data} updateEntry={updateEntry} versionEnumSemantics={versionEnumSemantics} />
    </div>
  );
};
