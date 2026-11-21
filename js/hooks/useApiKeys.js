import { useState } from 'react';
import { PROVIDERS } from '../config/providers.js';

/* API key tersimpan di localStorage dan hanya dikirim ke provider masing-masing */
export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState(() => {
    const o = {};
    Object.keys(PROVIDERS).forEach((pid) => { o[pid] = localStorage.getItem(PROVIDERS[pid].storageKey) || ''; });
    return o;
  });

  const saveKeys = (drafts) => {
    const next = { ...apiKeys };
    Object.keys(PROVIDERS).forEach((pid) => {
      const v = (drafts[pid] || '').trim();
      if (v) { localStorage.setItem(PROVIDERS[pid].storageKey, v); next[pid] = v; }
    });
    setApiKeys(next);
  };

  const clearKey = (pid) => {
    localStorage.removeItem(PROVIDERS[pid].storageKey);
    setApiKeys((prev) => ({ ...prev, [pid]: '' }));
  };

  return { apiKeys, saveKeys, clearKey };
}
