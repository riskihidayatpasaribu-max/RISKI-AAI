import { useState } from 'react';
import { fetchGeminiModelIds } from '../services/geminiModels.js';

/* Cek model Gemini mana yang benar-benar tersedia di akun pengguna */
export function useGeminiSync(apiKey) {
  const [state, setState] = useState({ status: 'idle', ids: null, error: '' });

  const sync = async () => {
    setState({ status: 'loading', ids: null, error: '' });
    try {
      const ids = await fetchGeminiModelIds(apiKey);
      setState({ status: 'done', ids, error: '' });
    } catch (e) {
      setState({ status: 'error', ids: null, error: e.message });
    }
  };

  return { ...state, sync };
}
