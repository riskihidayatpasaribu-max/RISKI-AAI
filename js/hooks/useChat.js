import { useState } from 'react';
import { fullName } from '../config/models.js';
import { PROVIDERS } from '../config/providers.js';
import { readAttachment, supportsKind } from '../utils/files.js';
import { sendToModel } from '../services/chat.js';

/* Input, lampiran, dan pengiriman pesan ke model aktif */
export function useChat({ store, model, apiKeys, blocked, onNeedKey }) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addFiles = async (fileList) => {
    const read = [];
    for (const f of Array.from(fileList || [])) read.push(await readAttachment(f));
    setAttachments((prev) => [...prev, ...read]);
  };
  const removeAttachment = (i) => setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  const appendInput = (text) => setInput((prev) => prev + (prev ? ' ' : '') + text);

  const canSend = (input.trim() !== '' || attachments.length > 0) && !isLoading && !blocked;

  const send = async () => {
    if (!canSend) return;
    const apiKey = apiKeys[model.provider];
    if (!apiKey) { onNeedKey(model.provider); return; }

    const sid = store.activeId;
    const usable = attachments.filter((a) => supportsKind(model, a.kind));
    const skipped = attachments.filter((a) => !supportsKind(model, a.kind));

    let apiText = input;
    usable.filter((a) => a.kind === 'text').forEach((a) => {
      apiText += '\n\n[Lampiran: ' + a.name + (a.truncated ? ' (dipotong 200.000 karakter)' : '') + ']\n```\n' + a.text + '\n```';
    });
    skipped.forEach((a) => {
      apiText += '\n\n[Lampiran "' + a.name + '" tidak dapat dibaca oleh model ini dan tidak dikirim. Beri tahu pengguna.]';
    });
    const mediaParts = usable
      .filter((a) => a.kind === 'image' || a.kind === 'pdf')
      .map((a) => ({ inlineData: { mimeType: a.mimeType, data: a.base64 } }));

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      apiText,
      attachments: attachments.map((a) => ({ name: a.name, kind: a.kind, previewUrl: a.previewUrl, skipped: !supportsKind(model, a.kind) })),
      timestamp: new Date().toISOString()
    };
    const updated = [...store.messages, userMsg];
    store.setMessages(sid, updated);

    const firstInput = input || attachments[0]?.name || '';
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const base = { role: 'model', modelName: fullName(model), providerId: model.provider };
    try {
      const history = updated.filter((m) => m.type !== 'error').slice(-12);
      while (history.length > 1 && history[0].role !== 'user') history.shift(); // riwayat harus diawali pesan user
      const text = await sendToModel({ model, history, mediaParts, apiKey });
      const aiMsg = { ...base, id: (Date.now() + 1).toString(), type: 'text', text, timestamp: new Date().toISOString() };
      const final = [...updated, aiMsg];
      store.setMessages(sid, final);
      if (final.length === 2) store.rename(sid, firstInput);
    } catch (error) {
      console.error('API Error:', error);
      const errMsg = { ...base, id: (Date.now() + 1).toString(), type: 'error', text: `**Gagal:** ${error.message}`, timestamp: new Date().toISOString() };
      store.setMessages(sid, [...updated, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDraft = () => { setInput(''); setAttachments([]); };

  return { input, setInput, appendInput, attachments, addFiles, removeAttachment, isLoading, canSend, send, resetDraft, providerLabel: PROVIDERS[model.provider].label };
}
