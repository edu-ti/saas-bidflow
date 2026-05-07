export type PanelType = 'master' | 'app' | 'unknown';

export function detectPanel(): PanelType {
  const hostname = window.location.hostname;
  const masterDomain = import.meta.env.VITE_MASTER_DOMAIN || 'master.localhost';
  const appDomain = import.meta.env.VITE_APP_DOMAIN || 'app.localhost';

  if (hostname === masterDomain || hostname.startsWith('master.')) {
    return 'master';
  }
  if (hostname === appDomain || hostname.includes(appDomain)) {
    return 'app';
  }
  return 'unknown';
}

export const currentPanel = detectPanel();
export const isMaster = currentPanel === 'master';
export const isApp = currentPanel === 'app';