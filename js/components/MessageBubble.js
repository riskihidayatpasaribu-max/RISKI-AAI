import React, { useMemo, useState } from 'react';
import { html } from '../utils/html.js';
import { renderMarkdown } from '../utils/markdown.js';
import { copyText } from '../utils/clipboard.js';
import { stopSpeech } from '../utils/audio.js';
import { speak } from '../services/speech.js';
import { MiniOrb } from './Orb.js';

function CopyAll({ text }) {
  const [done, setDone] = useState(false);
  const click = async () => {
    await copyText(text);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  };
  return html`
    <button className="action-btn" onClick=${click}>
      <i className=${`ph ${done ? 'ph-check' : 'ph-copy'}`}></i>${done ? 'Tersalin' : 'Salin jawaban'}
    </button>`;
}

function SpeakButton({ text, apiKey, ttsModel, onNeedKey }) {
  const [state, setState] = useState('idle');
  const click = async () => {
    if (state !== 'idle') { stopSpeech(); setState('idle'); return; }
    if (!apiKey) { onNeedKey(); return; }
    setState('loading');
    try {
      await speak({ text, apiKey, ttsModel, onStart: () => setState('playing'), onEnded: () => setState('idle') });
    } catch (e) {
      console.error('TTS error:', e);
      setState('idle');
      alert('Gagal memutar suara: ' + e.message);
    }
  };
  const icon = state === 'loading' ? 'ph-circle-notch ph-spin' : state === 'playing' ? 'ph-stop-circle' : 'ph-speaker-high';
  const label = state === 'loading' ? 'Menyiapkan' : state === 'playing' ? 'Berhenti' : 'Dengarkan';
  return html`<button className="action-btn" onClick=${click}><i className=${`ph ${icon}`}></i>${label}</button>`;
}

const clock = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function UserMessage({ msg }) {
  return html`
    <div className="msg-user">
      <div className="msg-user__col">
        ${msg.attachments?.length > 0 && html`
          <div className="msg-user__files">
            ${msg.attachments.map((a, i) => a.previewUrl
              ? html`<img key=${i} src=${a.previewUrl} alt=${a.name} />`
              : html`<span key=${i} className=${`file-pill ${a.skipped ? 'is-skipped' : ''}`}>
                  <i className=${`ph ${a.kind === 'pdf' ? 'ph-file-pdf' : 'ph-file-text'}`}></i>${a.name}${a.skipped ? ' (tidak terkirim)' : ''}
                </span>`)}
          </div>`}
        ${msg.text && html`<div className="msg-user__bubble">${msg.text}</div>`}
        <div className="msg-time">${clock(msg.timestamp)}</div>
      </div>
    </div>`;
}

function ModelMessage({ msg, geminiKey, ttsModel, onNeedGeminiKey }) {
  const body = useMemo(() => (msg.text ? renderMarkdown(msg.text) : ''), [msg.text]);
  const isErr = msg.type === 'error';
  return html`
    <div className="msg-ai">
      <div className="msg-ai__meta">
        ${msg.providerId && html`<${MiniOrb} provider=${msg.providerId} size=${20} />`}
        <span className="msg-ai__name">${msg.modelName}</span>
        <span className="msg-time">${clock(msg.timestamp)}</span>
      </div>
      ${isErr
        ? html`<div className="msg-ai__error" dangerouslySetInnerHTML=${{ __html: body }} />`
        : html`<div className="md" dangerouslySetInnerHTML=${{ __html: body }} />`}
      ${!isErr && msg.text && html`
        <div className="msg-ai__actions">
          <${CopyAll} text=${msg.text} />
          <${SpeakButton} text=${msg.text} apiKey=${geminiKey} ttsModel=${ttsModel} onNeedKey=${onNeedGeminiKey} />
        </div>`}
    </div>`;
}

export const MessageBubble = React.memo(function MessageBubble(props) {
  return props.msg.role === 'user' ? html`<${UserMessage} msg=${props.msg} />` : html`<${ModelMessage} ...${props} />`;
});
