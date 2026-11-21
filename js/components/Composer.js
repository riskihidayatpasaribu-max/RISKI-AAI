import { useLayoutEffect, useRef } from 'react';
import { html } from '../utils/html.js';
import { acceptAttr, supportsKind } from '../utils/files.js';
import { fullName } from '../config/models.js';
import { ModelChip } from './ModelChip.js';

export const Composer = function Composer({ model, chat, dictation, orbState, level, onPickModel, focusRef }) {
  const { input, setInput, attachments, addFiles, removeAttachment, canSend, send } = chat;
  const fileRef = useRef(null);
  const taRef = useRef(null);
  if (focusRef) focusRef.current = () => taRef.current?.focus();

  // tinggi textarea mengikuti isi, termasuk saat dikosongkan setelah kirim
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 176) + 'px';
  }, [input]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };
  const onFiles = async (e) => {
    await addFiles(e.target.files);
    e.target.value = '';
  };

  const micIcon = dictation.isRecording ? 'ph-stop-circle' : dictation.isTranscribing ? 'ph-circle-notch ph-spin' : 'ph-microphone';
  const canAttach = model.provider === 'gemini' && model.input?.length ? 'Lampirkan gambar, PDF, atau file teks' : 'Lampirkan file teks atau kode';

  return html`
    <div>
      ${attachments.length > 0 && html`
        <div className="chips">
          ${attachments.map((a, i) => {
            const ok = supportsKind(model, a.kind);
            return html`
              <span key=${i} className=${`chip ${ok ? '' : 'is-bad'}`} title=${ok ? a.name : 'Model ini tidak bisa membaca jenis file ini. File tidak akan dikirim.'}>
                ${a.previewUrl ? html`<img src=${a.previewUrl} alt="" />` : html`<i className=${`ph ${a.kind === 'pdf' ? 'ph-file-pdf' : 'ph-file-text'}`}></i>`}
                <span className="chip__name truncate">${a.name}</span>
                ${!ok && html`<span>tidak didukung</span>`}
                <button onClick=${() => removeAttachment(i)} aria-label="Hapus lampiran"><i className="ph ph-x"></i></button>
              </span>`;
          })}
        </div>`}

      <div className="composer">
        <input ref=${fileRef} type="file" multiple className="hidden" accept=${acceptAttr(model)} onChange=${onFiles} />
        <textarea ref=${taRef} rows="1" value=${input}
          placeholder=${`Tulis pesan ke ${fullName(model)}`}
          onChange=${(e) => setInput(e.target.value)} onKeyDown=${onKeyDown}></textarea>
        <div className="composer__bar">
          <${ModelChip} model=${model} orbState=${orbState} level=${level} onClick=${onPickModel} />
          <button className="icon-btn" onClick=${() => fileRef.current.click()} title=${canAttach} aria-label="Lampirkan file"><i className="ph ph-paperclip"></i></button>
          <button className=${`icon-btn ${dictation.isRecording ? 'is-rec' : ''}`} onClick=${dictation.toggle} disabled=${dictation.isTranscribing}
            title=${dictation.isTranscribing ? 'Mentranskripsi...' : 'Dikte suara (Whisper via Groq)'} aria-label="Dikte suara">
            <i className=${`ph ${micIcon}`}></i>
          </button>
          <span className="composer__spacer"></span>
          <button className="send-btn" onClick=${send} disabled=${!canSend} aria-label="Kirim"><i className="ph-bold ph-arrow-up"></i></button>
        </div>
      </div>
    </div>`;
};
