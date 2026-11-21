import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { html } from './utils/html.js';
import { handleCodeClick } from './utils/markdown.js';
import { STORAGE } from './config/constants.js';
import { PROVIDERS } from './config/providers.js';
import { MODELS, getModel, fullName } from './config/models.js';

import { useApiKeys } from './hooks/useApiKeys.js';
import { useSessions } from './hooks/useSessions.js';
import { useChat } from './hooks/useChat.js';
import { useDictation } from './hooks/useDictation.js';
import { useGeminiSync } from './hooks/useGeminiSync.js';
import { useLive } from './hooks/useLive.js';

import { Rail, MobileBar } from './components/Rail.js';
import { HistoryPanel } from './components/HistoryPanel.js';
import { Hero } from './components/Hero.js';
import { MessageBubble } from './components/MessageBubble.js';
import { Composer } from './components/Composer.js';
import { LivePanel } from './components/LivePanel.js';
import { ModelPicker } from './components/ModelPicker.js';
import { SettingsModal } from './components/SettingsModal.js';
import { Orb } from './components/Orb.js';

function App() {
  const { apiKeys, saveKeys, clearKey } = useApiKeys();
  const store = useSessions();

  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem(STORAGE.model);
    const m = getModel(saved);
    return m && m.kind !== 'tts' ? saved : MODELS[0].id;
  });
  const [ttsModel, setTtsModel] = useState(() => {
    const saved = localStorage.getItem(STORAGE.ttsModel);
    return getModel(saved)?.kind === 'tts' ? saved : 'gemini-3.1-flash-tts-preview';
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settings, setSettings] = useState({ open: false, focus: null });

  const model = getModel(selectedModel);
  const isLive = model.kind === 'live';
  const hasKey = !!apiKeys[model.provider];

  const openSettings = (pid = null) => { setPickerOpen(false); setHistoryOpen(false); setSettings({ open: true, focus: pid }); };

  const live = useLive({
    apiKey: apiKeys.gemini, model, sessionId: store.activeId,
    onTurn: (sid, msgs) => store.appendMessages(sid, msgs),
    onNeedKey: openSettings
  });
  const chat = useChat({ store, model, apiKeys, blocked: isLive, onNeedKey: openSettings });
  const dictation = useDictation({ groqKey: apiKeys.groq, onText: chat.appendInput, onNeedKey: openSettings });
  const gemini = useGeminiSync(apiKeys.gemini);

  const focusComposer = useRef(null);
  const chatRef = useRef(null);

  // warna orb dan aksen UI mengikuti provider aktif
  useEffect(() => {
    const [o1, o2, o3] = PROVIDERS[model.provider].orb;
    const s = document.documentElement.style;
    s.setProperty('--accent', PROVIDERS[model.provider].color);
    s.setProperty('--o1', o1); s.setProperty('--o2', o2); s.setProperty('--o3', o3);
  }, [model.provider]);

  useEffect(() => { localStorage.setItem(STORAGE.model, selectedModel); }, [selectedModel]);
  useEffect(() => { localStorage.setItem(STORAGE.ttsModel, ttsModel); }, [ttsModel]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [store.messages, chat.isLoading]);

  const selectModel = (m) => {
    if (m.kind === 'tts') { setTtsModel(m.id); return; }
    if (live.state !== 'idle') live.stop();
    setSelectedModel(m.id);
    setPickerOpen(false);
  };

  const syncGemini = () => (apiKeys.gemini ? gemini.sync() : openSettings('gemini'));
  const newChat = () => { store.create(); chat.resetDraft(); setHistoryOpen(false); };

  const orbState = chat.isLoading ? 'thinking'
    : live.state === 'idle' ? 'idle'
    : live.speaking ? 'speaking' : live.state === 'connecting' ? 'thinking' : 'live';

  const isEmpty = store.messages.length === 0;
  const openPicker = () => setPickerOpen(true);

  const composer = isLive
    ? html`<${LivePanel} model=${model} live=${live} orbState=${orbState} onPickModel=${openPicker} />`
    : html`<${Composer} model=${model} chat=${chat} dictation=${dictation} orbState=${orbState} level=${live.level}
        onPickModel=${openPicker} focusRef=${focusComposer} />`;
  const note = html`<div className="note">Jawaban AI bisa keliru. Periksa kembali informasi penting.</div>`;

  return html`
    <div className="app">
      <${Rail} provider=${model.provider} apiKeys=${apiKeys} onNew=${newChat} onHistory=${() => setHistoryOpen(true)} onKeys=${openSettings} />

      ${historyOpen && html`
        <${HistoryPanel} sessions=${store.sessions} activeId=${store.activeId}
          onSelect=${(id) => { store.setActiveId(id); setHistoryOpen(false); }}
          onDelete=${store.remove} onClose=${() => setHistoryOpen(false)} />`}
      ${settings.open && html`
        <${SettingsModal} apiKeys=${apiKeys} focusProvider=${settings.focus}
          onSave=${saveKeys} onClear=${clearKey} onClose=${() => setSettings({ open: false, focus: null })} />`}
      ${pickerOpen && html`
        <${ModelPicker} selectedModel=${selectedModel} ttsModel=${ttsModel} apiKeys=${apiKeys} sync=${gemini}
          onSelect=${selectModel} onSync=${syncGemini} onOpenKeys=${openSettings} onClose=${() => setPickerOpen(false)} />`}

      <main className="main">
        <div className="ambient"><${Orb} provider=${model.provider} state=${orbState} level=${live.level} size=${700} ambient=${true} /></div>
        <${MobileBar} onHistory=${() => setHistoryOpen(true)} onNew=${newChat} onKeys=${openSettings} />

        <div className=${`chat ${isEmpty ? 'chat--empty' : ''}`} ref=${chatRef} onClick=${handleCodeClick}>
          ${isEmpty
            ? html`
              <${Hero} model=${model} hasKey=${hasKey} orbState=${orbState} level=${live.level}
                composer=${html`<div>${composer}${note}</div>`}
                onPick=${(t) => { chat.setInput(t); focusComposer.current && focusComposer.current(); }}
                onKeys=${openSettings} />`
            : html`
              <div className="chat__inner">
                ${store.messages.map((m) => html`
                  <${MessageBubble} key=${m.id} msg=${m} geminiKey=${apiKeys.gemini} ttsModel=${ttsModel}
                    onNeedGeminiKey=${() => openSettings('gemini')} />`)}
                ${chat.isLoading && html`
                  <div className="thinking">
                    <${Orb} provider=${model.provider} state="thinking" size=${34} />
                    ${fullName(model)} sedang menjawab
                  </div>`}
              </div>`}
        </div>

        ${!isEmpty && html`
          <div className="dock"><div className="dock__inner">${composer}${note}</div></div>`}
      </main>
    </div>`;
}

createRoot(document.getElementById('root')).render(html`<${App} />`);
