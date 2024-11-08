import { DataEntry, StateDataType } from 'url-safe-bitpacking';
import { create } from 'zustand';
import { parserObjects } from './modelDefinition/model';

type DataStore = {
  data: StateDataType;
  setData: (s: StateDataType) => void;
  updateDataEntry: (data: DataEntry | DataEntry[]) => void;
  updateDataEntryNonThrottled: (data: DataEntry | DataEntry[]) => void;
};

export const useData = create<DataStore>((set) => ({
  data: parserObjects.parser(),
  setData: (data) => set((state) => ({ ...state, data })),
  updateDataEntry: (data: DataEntry | DataEntry[]) => {},
  updateDataEntryNonThrottled: (update: DataEntry | DataEntry[]) => useData.getState().setData(parserObjects.updater(useData.getState().data, update)),
}));
