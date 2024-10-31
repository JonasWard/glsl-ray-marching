import { StateDataType } from 'url-safe-bitpacking';
import { create } from 'zustand';
import { parserObjects } from './modelDefinition/model';

type DataStore = {
  data: StateDataType;
  setData: (s: StateDataType) => void;
};

export const useData = create<DataStore>((set) => ({
  data: parserObjects.parser(),
  setData: (data) => set((state) => ({ ...state, data })),
}));
