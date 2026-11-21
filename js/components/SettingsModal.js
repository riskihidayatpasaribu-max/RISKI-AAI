import { useState } from 'react';
import { html } from '../utils/html.js';
import { PROVIDERS } from '../config/providers.js';
import { MODELS } from '../config/models.js';
import { ProviderDot } from './ProviderDot.js';

export function SettingsModal({ apiKeys, focusProvider, onSave, onClear, onClose }) {
  const [drafts, setDrafts] = useState({ ...apiKeys });

  return html`
    <div className="overlay" onClick=${onClose}>
      <div className="sheet sheet--sm" onClick=${(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <h3 className="sheet__title">API key</h3>
          <button className="icon-btn" onClick=${onClose} aria-label="Tutup"><i className="ph ph-x"></i></button>
        </div>
        <div className="sheet__body">
          <p className="sheet__lead">Tersimpan di browser ini (localStorage) dan hanya dikirim ke provider masing-masing.</p>
          ${Object.entries(PROVIDERS).map(([pid, p]) => html`
            <div key=${pid} className=${`key-card ${focusProvider === pid ? 'is-focus' : ''}`}>
              <div className="key-card__row">
                <span className="key-card__name">
                  <${ProviderDot} pid=${pid} />${p.label}
                  <span className=${`key-card__state ${apiKeys[pid] ? 'is-on' : ''}`}>${apiKeys[pid] ? 'terpasang' : 'belum ada'}</span>
                </span>
                ${apiKeys[pid] && html`<button className="link-danger" onClick=${() => { onClear(pid); setDrafts((d) => ({ ...d, [pid]: '' })); }}>Hapus</button>`}
              </div>
              <div className="key-card__meta">${MODELS.filter((m) => m.provider === pid && m.kind === 'chat').length} model chat. Ambil key di ${p.console}</div>
              <input className="field" type="password" autoFocus=${focusProvider === pid}
                value=${drafts[pid] || ''} placeholder=${p.placeholder}
                onChange=${(e) => setDrafts((d) => ({ ...d, [pid]: e.target.value }))} />
              ${pid === 'groq' && html`<p className="key-card__note">Key Groq juga dipakai untuk dikte suara (Whisper).</p>`}
              ${pid === 'gemini' && html`<p className="key-card__note">Dipakai untuk model Gemini, suara dua arah, dan tombol Dengarkan. Di tier gratis, data Anda dapat dipakai Google untuk meningkatkan produk.</p>`}
            </div>`)}
          <div className="sheet__foot">
            <button className="btn btn--ghost" onClick=${onClose}>Batal</button>
            <button className="btn btn--primary" onClick=${() => { onSave(drafts); onClose(); }}>Simpan</button>
          </div>
        </div>
      </div>
    </div>`;
}
