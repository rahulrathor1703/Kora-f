'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import ConfirmDialog, {
  type ConfirmDialogVariant,
} from '@/components/ui/ConfirmDialog';

export interface ConfirmOptions {
  title: string;
  description: ReactNode;
  variant?: ConfirmDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

interface ActiveConfirmState extends ConfirmOptions {
  open: boolean;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [activeConfirm, setActiveConfirm] = useState<ActiveConfirmState | null>(
    null,
  );
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const closeDialog = useCallback((result: boolean) => {
    setActiveConfirm(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setActiveConfirm({
        ...options,
        open: true,
      });
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      confirm,
    }),
    [confirm],
  );

  return (
    <ConfirmDialogContext.Provider value={contextValue}>
      {children}
      {activeConfirm ? (
        <ConfirmDialog
          open={activeConfirm.open}
          title={activeConfirm.title}
          description={activeConfirm.description}
          variant={activeConfirm.variant}
          confirmLabel={activeConfirm.confirmLabel}
          cancelLabel={activeConfirm.cancelLabel}
          onClose={() => closeDialog(false)}
          onConfirm={() => closeDialog(true)}
        />
      ) : null}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialogContext(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }

  return context;
}
