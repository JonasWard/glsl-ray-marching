import React, { useEffect, useRef } from 'react';
import './App.css';
import { parserObjects } from './modelDefinition/model';
import { ParametricInput } from './Components/parametrics/ParametricInput';
import { DataEntry } from 'url-safe-bitpacking';
import { versionEnumSemantics } from './modelDefinition/types/semantics';
import { useData } from './state';
import { ThreeCanvas } from './webgl/ThreeCanvas';
import { useParams } from 'react-router-dom';
import { Button, message } from 'antd';
import { LiaFileDownloadSolid } from 'react-icons/lia';
import { useDebounce } from 'use-debounce';
import { Version0Type } from './modelDefinition/types/version0.generatedType';

const defaultState = 'C9KEPShD0oQ4Q4Q4QAAAGuPofRAOEAcIgBCpQDnoLEsLD_gAB_gABc2Nj_gAASBQVoqI0';

const isIOS = () => {
  return (
    ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

export const App: React.FC = () => {
  const { stateString } = useParams();
  const [renderData] = useDebounce(useData.getState().data, isIOS() ? 50 : 0);
  const data = useData((s) => s.data);
  const updateEntry = useData((s) => s.updateDataEntry);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    window.history.replaceState(null, 'Same Page Title', `/glsl-ray-marching/#${parserObjects.stringify(renderData)}`);
  }, [renderData]);

  useEffect(() => {
    useData.setState({
      updateDataEntry: (update: DataEntry | DataEntry[]): void => useData.getState().setData(parserObjects.updater(useData.getState().data, update)),
    });

    if (stateString) {
      try {
        useData.getState().setData(parserObjects.parser(stateString));
      } catch (e) {
        try {
          useData.getState().setData(parserObjects.parser(defaultState));
          message.warning('the state string you tried to use was not valid, using the default state instead');
        } catch (e) {
          useData.getState().setData(parserObjects.parser());
          message.error('the default!! state string was not valid, using the default object state instead');
        }
      }
    } else {
      try {
        useData.getState().setData(parserObjects.parser(defaultState));
      } catch (e) {
        useData.getState().setData(parserObjects.parser());
        message.error('the default!! state string was not valid, using the default object state instead');
      }
    }
  }, []);

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `glsl-ray-marching.${parserObjects.stringify(data)}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <>
      <ThreeCanvas renderData={renderData as any as Version0Type} canvasRef={canvasRef} updateEntry={updateEntry} />
      <ParametricInput data={data} updateEntry={updateEntry} versionEnumSemantics={versionEnumSemantics} />
      <Button style={{ position: 'fixed', top: '15px', right: '15px' }} onClick={downloadPNG}>
        <LiaFileDownloadSolid style={{ position: 'absolute', width: 20, height: 20 }} size={16} />
      </Button>
    </>
  );
};
