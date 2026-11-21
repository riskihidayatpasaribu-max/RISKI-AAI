import { html } from '../utils/html.js';
import { PROVIDERS } from '../config/providers.js';
import { MiniOrb } from './Orb.js';

/* Rel ikon di kiri (desktop). Di ponsel diganti MobileBar. */
export function Rail({ provider, apiKeys, onNew, onHistory, onKeys }) {
  return html`
    <nav className="rail" aria-label="Navigasi utama">
      <div className="rail__brand" title="Riski AI"><${MiniOrb} provider=${provider} size=${30} /></div>
      <button className="rail__btn rail__btn--primary" onClick=${onNew} title="Percakapan baru" aria-label="Percakapan baru"><i className="ph ph-plus"></i></button>
      <button className="rail__btn" onClick=${onHistory} title="Riwayat" aria-label="Riwayat"><i className="ph ph-clock-counter-clockwise"></i></button>
      <div className="rail__spacer"></div>
      <button className="rail__btn" onClick=${() => onKeys()} title="API key" aria-label="API key">
        <i className="ph ph-key"></i>
        <span className="rail__dots">
          ${Object.keys(PROVIDERS).map((pid) => html`
            <i key=${pid} style=${apiKeys[pid] ? { background: PROVIDERS[pid].color } : {}}></i>`)}
        </span>
      </button>
    </nav>`;
}

export function MobileBar({ onHistory, onNew, onKeys }) {
  return html`
    <div className="mobilebar">
      <button className="icon-btn" onClick=${onHistory} aria-label="Riwayat"><i className="ph ph-list"></i></button>
      <div>
        <button className="icon-btn" onClick=${() => onKeys()} aria-label="API key"><i className="ph ph-key"></i></button>
        <button className="icon-btn" onClick=${onNew} aria-label="Percakapan baru"><i className="ph ph-plus"></i></button>
      </div>
    </div>`;
}
