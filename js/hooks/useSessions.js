import { useState } from 'react';

const makeSession = () => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 5),
  title: 'Percakapan baru',
  created_at: new Date().toISOString(),
  messages: []
});

/* Riwayat percakapan (di memori; hilang saat halaman dimuat ulang) */
export function useSessions() {
  const [sessions, setSessions] = useState(() => [makeSession()]);
  const [activeId, setActiveId] = useState(() => sessions[0].id);

  const messages = sessions.find((s) => s.id === activeId)?.messages || [];

  const create = () => {
    const s = makeSession();
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    return s;
  };

  const remove = (id) => {
    const rest = sessions.filter((s) => s.id !== id);
    if (rest.length === 0) {
      const s = makeSession();
      setSessions([s]);
      setActiveId(s.id);
      return;
    }
    setSessions(rest);
    if (id === activeId) setActiveId(rest[0].id);
  };

  const setMessages = (sid, msgs) =>
    setSessions((prev) => prev.map((s) => (s.id === sid ? { ...s, messages: msgs } : s)));

  const appendMessages = (sid, msgs) =>
    setSessions((prev) => prev.map((s) => (s.id === sid ? { ...s, messages: [...s.messages, ...msgs] } : s)));

  const rename = (sid, text) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    const title = clean.length > 30 ? clean.slice(0, 30) + '...' : clean;
    setSessions((prev) => prev.map((s) => (s.id === sid ? { ...s, title: title || 'Percakapan baru' } : s)));
  };

  return { sessions, activeId, messages, setActiveId, create, remove, setMessages, appendMessages, rename };
}
