'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface SequenceStepContextValue {
  canContinue: boolean;
  setCanContinue: (value: boolean) => void;
}

const SequenceStepContext = createContext<SequenceStepContextValue | null>(null);

export function SequenceStepProvider({ children }: { children: ReactNode }) {
  const [canContinue, setCanContinueState] = useState(true);
  const setCanContinue = useCallback((value: boolean) => {
    setCanContinueState(value);
  }, []);

  const value = useMemo(
    () => ({ canContinue, setCanContinue }),
    [canContinue, setCanContinue],
  );

  return (
    <SequenceStepContext.Provider value={value}>
      {children}
    </SequenceStepContext.Provider>
  );
}

export function useSequenceStepContext(): SequenceStepContextValue {
  const context = useContext(SequenceStepContext);

  if (!context) {
    throw new Error('useSequenceStepContext must be used within SequenceStepProvider');
  }

  return context;
}
