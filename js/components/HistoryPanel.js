import { useEffect } from 'react';
import { html } from '../utils/html.js';

/* Riwayat percakapan, geser dari kiri */
export function HistoryPanel({ sessions, activeId, onSelect, onDelete, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return html`
    <div>
      <div className="scrim" onClick=${onClose}></div>
      <aside className="hpanel" aria-label="Riwayat percakapan">
        <div className="hpanel__head">
          <h2 className="hpanel__title">Riwayat</h2>
          <button className="icon-btn" onClick=${onClose} aria-label="Tutup"><i className="ph ph-x"></i></button>
        </div>
        <div className="hpanel__list">
          ${sessions.map((s) => html`
            <div key=${s.id} className=${`hitem ${s.id === activeId ? 'is-active' : ''}`}>
              <button className="hitem__pick truncate" onClick=${() => onSelect(s.id)}>${s.title}</button>
              <button className="hitem__del" onClick=${() => onDelete(s.id)} aria-label="Hapus percakapan"><i className="ph ph-trash"></i></button>
            </div>`)}
        </div>
      </aside>
    </div>`;
}
