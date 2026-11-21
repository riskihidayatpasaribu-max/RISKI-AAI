import { html } from '../utils/html.js';
import { PROVIDERS } from '../config/providers.js';

export function Sidebar({ sessions, activeId, apiKeys, drawer, onSelect, onNew, onDelete, onOpenKeys, onClose }) {
  return html`
    <aside className=${`sidebar ${drawer ? 'sidebar--drawer' : ''}`}>
      <div className="sidebar__top">
        <div className="brand">
          <div className="brand__name">Riski<i>.</i>ai</div>
          <button className="sidebar__close" onClick=${onClose} aria-label="Tutup menu"><i className="ph ph-x" style=${{ fontSize: 20 }}></i></button>
        </div>
        <button className="btn-new" onClick=${onNew}><i className="ph ph-plus"></i>Percakapan baru</button>
      </div>

      <div className="history">
        <div className="history__label">Riwayat</div>
        ${sessions.map((s) => html`
          <div key=${s.id} className=${`history__item ${s.id === activeId ? 'is-active' : ''}`}>
            <button className="history__pick truncate" onClick=${() => onSelect(s.id)}>${s.title}</button>
            <button className="history__del" onClick=${() => onDelete(s.id)} aria-label="Hapus percakapan"><i className="ph ph-trash"></i></button>
          </div>`)}
      </div>

      <div className="sidebar__foot">
        <button className="keys-btn" onClick=${() => onOpenKeys()}>
          <span><i className="ph ph-key"></i>API key</span>
          <span className="keys-dots">
            ${Object.keys(PROVIDERS).map((pid) => html`
              <i key=${pid} title=${`${PROVIDERS[pid].label}: ${apiKeys[pid] ? 'terpasang' : 'belum ada'}`}
                style=${apiKeys[pid] ? { background: PROVIDERS[pid].color, borderColor: PROVIDERS[pid].color } : {}}></i>`)}
          </span>
        </button>
      </div>
    </aside>`;
}
