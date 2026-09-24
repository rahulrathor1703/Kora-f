import { useCallback, useEffect, useRef } from 'react';

export interface FormEditorState {
  hasChanges: boolean;
  discard: () => void;
  save: () => Promise<void>;
}

/** Publishes editor shell state without re-firing when save/discard identities change each render. */
export function useSyncFormEditorState(
  enabled: boolean,
  hasChanges: boolean,
  discard: () => void,
  save: () => Promise<void>,
  onEditorStateChange?: (state: FormEditorState | null) => void,
): void {
  const actionsRef = useRef({ discard, save });

  useEffect(() => {
    actionsRef.current = { discard, save };
  });

  const stableDiscard = useCallback(() => {
    actionsRef.current.discard();
  }, []);

  const stableSave = useCallback(async () => {
    await actionsRef.current.save();
  }, []);

  useEffect(() => {
    if (!enabled || !onEditorStateChange) {
      return;
    }

    onEditorStateChange({
      hasChanges,
      discard: stableDiscard,
      save: stableSave,
    });

    return () => {
      onEditorStateChange(null);
    };
  }, [enabled, hasChanges, onEditorStateChange, stableDiscard, stableSave]);
}
