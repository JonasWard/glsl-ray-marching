import React, { ReactNode } from 'react';
import { CiLineHeight } from 'react-icons/ci';
import { FaArchway, FaRegSquare, FaSquareFull } from 'react-icons/fa';
import { FaRegSquareFull } from 'react-icons/fa6';
import { PiCubeFocusFill } from 'react-icons/pi';
import { GiFootprint } from 'react-icons/gi';
import { MdOutlineLayers } from 'react-icons/md';
import { FiLayers } from 'react-icons/fi';
import { DataType } from 'url-safe-bitpacking';
import { AttributeNames } from 'src/modelDefinition/enums/attributeNames';
import { VersionNames } from 'src/modelDefinition/enums/versionNames';
import { MethodNames } from 'src/modelDefinition/types/methodSemantics';

import imagegyroid from 'src/assets/icons/gyroid.png';
import imagemandelbrot from 'src/assets/icons/mandelbrot.png';
import imageneovius from 'src/assets/icons/neovius.png';
import imageperlin from 'src/assets/icons/perlin.png';
import imageschwarzD from 'src/assets/icons/schwarzD.png';
import imageschwarzP from 'src/assets/icons/schwarzP.png';

export interface IconRendererProps {
  name: string;
  type?: DataType;
  noName?: boolean;
  size?: number;
}

export const getIconForKey = (
  name: string,
  type?: DataType,
  size?: number
): {
  mainIcon: ReactNode;
  subscript?: string;
  superscript?: string;
} => {
  if (type !== undefined)
    switch (name) {
      default:
        switch (type) {
          case DataType.INT:
            return { mainIcon: 'i', subscript: name };
          case DataType.FLOAT:
            return { mainIcon: 'f', subscript: name };
          case DataType.BOOLEAN:
            return { mainIcon: 'b', subscript: name };
          case DataType.VERSION:
            return { mainIcon: 'v', subscript: name };
        }
    }
  switch (name) {
    case AttributeNames.Viewport:
      return { mainIcon: <FaArchway size={size} /> };
    case AttributeNames.CanvasFullScreen:
      return { mainIcon: <GiFootprint size={size} /> };
    case AttributeNames.CanvasWidth:
      return { mainIcon: <CiLineHeight size={size} /> };
    case AttributeNames.CanvasHeight:
      return { mainIcon: <FaRegSquareFull size={size} /> };
    case AttributeNames.Version:
    case AttributeNames.Viewport:
    case AttributeNames.Canvas:
    case AttributeNames.CanvasFullScreen:
    case AttributeNames.CanvasWidth:
    case AttributeNames.CanvasHeight:
    case AttributeNames.Rotation:
    case AttributeNames.ZoomLevel:
    case AttributeNames.MousePosition:
    case AttributeNames.PositionX:
    case AttributeNames.PositionY:
    case AttributeNames.Methods:
    case AttributeNames.PreProcessingMethods:
    case AttributeNames.PostProcessingMethods:
    case AttributeNames.MainMethods:
    case AttributeNames.MethodEnum:
    case AttributeNames.MethodScale:
    case 'shapePreProcessing':
    case 'shapePostProcessing':
      return { mainIcon: <PiCubeFocusFill size={size} /> };
    case 'Massive':
      return { mainIcon: <FaSquareFull size={size} /> };
    case '1 Layer':
      return { mainIcon: <FaRegSquare size={size} /> };
    case '2 Layers':
      return { mainIcon: <MdOutlineLayers size={size} /> };
    case '3 Layers':
      return { mainIcon: <FiLayers size={size} /> };
    case VersionNames.Alpha:
      return { mainIcon: 'α' };
    case 'beta':
      return { mainIcon: 'β' };
    case 'gamma':
      return { mainIcon: 'γ' };
    case 'delta':
      return { mainIcon: 'δ' };
    case MethodNames.Gyroid:
      return { mainIcon: <img src={imagegyroid} width={size} /> };
    case MethodNames.SchwarzD:
      return { mainIcon: <img src={imageschwarzD} width={size} /> };
    case MethodNames.SchwarzP:
      return { mainIcon: <img src={imageschwarzP} width={size} /> };
    case MethodNames.Perlin:
      return { mainIcon: <img src={imageperlin} width={size} /> };
    case MethodNames.Neovius:
      return { mainIcon: <img src={imageneovius} width={size} /> };
    case MethodNames.Mandelbrot:
      return { mainIcon: <img src={imagemandelbrot} width={size} /> };
    default:
      return { mainIcon: name };
  }
};

export const IconRenderer: React.FC<IconRendererProps> = ({ name, type, noName = false, size = 20 }) => {
  const { mainIcon, subscript, superscript } = getIconForKey(name, type, size);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: size * 1.3 }}>
      <div style={{ fontSize: size, alignItems: 'center' }}>{mainIcon}</div>
      {superscript || subscript ? (
        <div style={{ fontSize: size * 0.5, display: 'flex', flexDirection: 'column' }}>
          {superscript ? <div key='superscript'>{superscript}</div> : <div style={{ height: '50%' }} />}
          {subscript ? <div key='subscript'>{subscript}</div> : <div style={{ height: '50%' }} />}
        </div>
      ) : noName ? null : (
        <span style={{ marginLeft: 10 }}>{name}</span>
      )}
    </div>
  );
};
