import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PanelType } from '../utils/panelContext';
import { currentPanel, isMaster, isApp } from '../utils/panelContext';

interface PanelContextValue {
  currentPanel: PanelType;
  isMaster: boolean;
  isApp: boolean;
}

const PanelContext = createContext<PanelContextValue | undefined>(undefined);

interface PanelProviderProps {
  children: ReactNode;
}

export function PanelProvider({ children }: PanelProviderProps): React.ReactElement {
  const value: PanelContextValue = {
    currentPanel,
    isMaster,
    isApp,
  };

  return (
    <PanelContext.Provider value={value}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanel(): PanelContextValue {
  const context = useContext(PanelContext);
  if (context === undefined) {
    throw new Error('usePanel must be used within a PanelProvider');
  }
  return context;
}