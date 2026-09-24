'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import {
  getProspectPipelineViewFromPath,
  type ProspectPipelineView,
} from '@/lib/crm/prospect-pipeline-view';

interface ProspectPipelineViewContextValue {
  view: ProspectPipelineView;
  setView: (view: ProspectPipelineView) => void;
  isViewMounted: (view: ProspectPipelineView) => boolean;
}

const ProspectPipelineViewContext =
  createContext<ProspectPipelineViewContextValue | null>(null);

interface ProspectPipelineViewProviderProps {
  children: ReactNode;
  defaultView?: ProspectPipelineView;
}

export function ProspectPipelineViewProvider({
  children,
  defaultView,
}: ProspectPipelineViewProviderProps) {
  const pathname = usePathname();
  const routeView = getProspectPipelineViewFromPath(pathname);
  const initialView = defaultView ?? routeView;

  const [view, setViewState] = useState<ProspectPipelineView>(initialView);
  const [mountedViews, setMountedViews] = useState<Set<ProspectPipelineView>>(
    () => new Set([initialView]),
  );

  const setView = useCallback((nextView: ProspectPipelineView) => {
    setViewState(nextView);
    setMountedViews((current) => new Set(current).add(nextView));
  }, []);

  const isViewMounted = useCallback(
    (candidate: ProspectPipelineView) => mountedViews.has(candidate),
    [mountedViews],
  );

  const value = useMemo(
    () => ({
      view,
      setView,
      isViewMounted,
    }),
    [view, setView, isViewMounted],
  );

  return (
    <ProspectPipelineViewContext.Provider value={value}>
      {children}
    </ProspectPipelineViewContext.Provider>
  );
}

export function useProspectPipelineView(): ProspectPipelineViewContextValue {
  const context = useContext(ProspectPipelineViewContext);

  if (!context) {
    throw new Error(
      'useProspectPipelineView must be used within ProspectPipelineViewProvider',
    );
  }

  return context;
}

export function useProspectPipelineViewOptional():
  | ProspectPipelineViewContextValue
  | null {
  return useContext(ProspectPipelineViewContext);
}
