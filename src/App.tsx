import React, { useEffect } from 'react';
import './App.css';
import { parserObjects } from './modelDefinition/model';
import { ParametricInput } from './Components/parametrics/ParametricInput';
import { DataEntry } from 'url-safe-bitpacking';
import { versionEnumSemantics } from './modelDefinition/types/semantics';
import { useData } from './state';
import { ThreeCanvas } from './webgl/ThreeCanvas';
import { useParams } from 'react-router-dom';

const defaultState = 'CAAAOwNbYDYzAy50TawGGoRAC9mAGfgAPnQ____AAAA';

export const App: React.FC = () => {
  const { stateString } = useParams();
  const data = useData((s) => s.data);

  useEffect(() => {
    useData.getState().setData(parserObjects.parser(stateString ?? defaultState));
  }, []);

  useEffect(() => {
    window.history.replaceState(null, 'Same Page Title', `/glsl-ray-marching/#${parserObjects.stringify(data)}`);
  }, [data]);

  const updateEntry = (update: DataEntry | DataEntry[]): void => useData.getState().setData(parserObjects.updater(useData.getState().data, update));

  return (
    <div>
      <ThreeCanvas />
      <ParametricInput data={data} updateEntry={updateEntry} versionEnumSemantics={versionEnumSemantics} />
    </div>
  );
};
