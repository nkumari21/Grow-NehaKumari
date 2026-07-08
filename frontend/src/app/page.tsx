'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { flowReset } from '@/store/slices/import-slice';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { UploadStep } from '@/components/upload/UploadStep';
import { PreviewStep } from '@/components/preview/PreviewStep';
import { ResultsStep } from '@/components/results/ResultsStep';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.importFlow.step);
  const [file, setFile] = useState<File | null>(null);

  const backToUpload = () => {
    setFile(null);
    dispatch(flowReset());
  };

  return (
    <>
      <StepIndicator current={step} />
      {step === 'upload' && <UploadStep onFileReady={setFile} />}
      {step === 'preview' && file && <PreviewStep file={file} onCancel={backToUpload} />}
      {step === 'results' && <ResultsStep onReset={backToUpload} />}
    </>
  );
}
