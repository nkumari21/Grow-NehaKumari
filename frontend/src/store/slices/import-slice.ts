import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BatchProgress, CsvRow } from '@/types/lead';

export type Step = 'upload' | 'preview' | 'results';

export interface PreviewData {
  fileName: string;
  fileSize: number;
  headers: string[];
  rows: CsvRow[];
}

interface ImportFlowState {
  step: Step;
  preview: PreviewData | null;
  progress: BatchProgress | null;
}

const initialState: ImportFlowState = {
  step: 'upload',
  preview: null,
  progress: null,
};

const importSlice = createSlice({
  name: 'importFlow',
  initialState,
  reducers: {
    filePrepared(state, action: PayloadAction<PreviewData>) {
      state.preview = action.payload;
      state.step = 'preview';
    },
    importStarted(state, action: PayloadAction<{ totalRows: number; totalBatches: number }>) {
      state.progress = {
        processedRows: 0,
        totalRows: action.payload.totalRows,
        completedBatches: 0,
        totalBatches: action.payload.totalBatches,
        imported: 0,
        skipped: 0,
      };
    },
    progressUpdated(state, action: PayloadAction<BatchProgress>) {
      state.progress = action.payload;
    },
    importFinished(state) {
      state.step = 'results';
      state.progress = null;
    },
    flowReset() {
      return initialState;
    },
  },
});

export const { filePrepared, importStarted, progressUpdated, importFinished, flowReset } =
  importSlice.actions;
export const importReducer = importSlice.reducer;
