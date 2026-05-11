const FALLBACK_API_BASE = '/api';

export function getApiBase() {
  return (import.meta as any).env?.VITE_API_BASE_URL || FALLBACK_API_BASE;
}

export function buildApiUrl(path: string) {
  const apiBase = getApiBase().replace(/\/$/, '');
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${apiPath}`;
}