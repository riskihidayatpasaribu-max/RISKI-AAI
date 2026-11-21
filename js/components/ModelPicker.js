import { useEffect, useState } from 'react';
import { html } from '../utils/html.js';
import { PROVIDERS, CAPS } from '../config/providers.js';
import { MODELS, getModel, getProviderId } from '../config/models.js';
import { ProviderDot } from './ProviderDot.js';

function AvailabilityTag({ model, sync }) {
  if (model.provider === 'gemini' && sync.ids) {
    return sync.ids.has(model.id)
      ? html`<span className="tag tag--ok">tersedia</span>`
      : html`<span className="tag tag--bad" title="ID ini tidak ada di daftar model akun Anda">tidak ditemukan</span>`;
  }
  return model.verified === false
    ? html`<span className="tag" title="ID model belum dicek. Tekan Cek ketersediaan.">ID belum dicek</span>`
    : null;
}

export function ModelPicker({ selectedModel, ttsModel, apiKeys, sync, onSelect, onSync, onOpenKeys, onClose }) {
  const [tab, setTab] = useState(getProviderId(selectedModel) || 'groq');
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const list = MODELS.filter((m) => m.provider === tab);
  const groups = [...new Set(list.map((m) => m.group))];
  const isSelected = (m) => (m.kind === 'tts' ? ttsModel === m.id : selectedModel === m.id);
  const detail = getModel(hover) || list.find(isSelected) || list[0];
  const hasKey = !!apiKeys[tab];

  const syncText = sync.status === 'done'
    ? `${sync.ids.size} model ditemukan di akun Anda. Label di bawah menunjukkan mana yang tersedia.`
    : sync.status === 'error'
      ? html`<span className="is-error">Gagal mengecek: ${sync.error}</span>`
      : 'Cek model mana yang benar-benar tersedia di akun Anda.';

  return html`
    <div className="overlay" onClick=${onClose}>
      <div className="sheet sheet--lg" onClick=${(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <h2 className="sheet__title">Pilih model</h2>
          <button className="icon-btn" onClick=${onClose} aria-label="Tutup"><i className="ph ph-x"></i></button>
        </div>

        <div className="picker">
          <div className="picker__rail">
            ${Object.entries(PROVIDERS).map(([pid, p]) => html`
              <button key=${pid} className=${`rail-btn ${tab === pid ? 'is-active' : ''}`} onClick=${() => setTab(pid)}>
                <div className="rail-btn__name"><${ProviderDot} pid=${pid} />${p.label}</div>
                <div className=${`rail-btn__state ${apiKeys[pid] ? 'is-on' : ''}`}>${apiKeys[pid] ? 'Key terpasang' : 'Belum ada key'}</div>
              </button>`)}
          </div>

          <div className="picker__list">
            ${!hasKey && html`
              <div className="notice notice--warn">
                <span>Isi API key ${PROVIDERS[tab].label} untuk memakai model di sini.</span>
                <button onClick=${() => onOpenKeys(tab)}>Isi key</button>
              </div>`}
            ${tab === 'gemini' && hasKey && html`
              <div className="notice">
                <span>${syncText}</span>
                <button onClick=${onSync} disabled=${sync.status === 'loading'}>
                  ${sync.status === 'loading' ? 'Mengecek...' : sync.status === 'done' ? 'Cek ulang' : 'Cek ketersediaan'}
                </button>
              </div>`}
            ${groups.map((g) => html`
              <div key=${g} className="picker__group">
                <div className="picker__group-name">${g}</div>
                ${list.filter((m) => m.group === g).map((m) => {
                  const sel = isSelected(m);
                  return html`
                    <button key=${m.id} className=${`model-row ${sel ? 'is-selected' : ''}`}
                      onClick=${() => onSelect(m)}
                      onMouseEnter=${() => setHover(m.id)} onFocus=${() => setHover(m.id)} onMouseLeave=${() => setHover(null)}>
                      <span className=${`radio ${sel ? 'is-on' : ''}`}></span>
                      <span className="model-row__main">
                        <span className="model-row__title">
                          <span className="model-row__name truncate">${m.name}</span>
                          ${m.kind === 'live' && html`<span className="tag tag--warn">eksperimental</span>`}
                          <${AvailabilityTag} model=${m} sync=${sync} />
                        </span>
                        <span className="model-row__tagline truncate">${m.tagline}</span>
                      </span>
                      <span className="model-row__caps">
                        ${m.can.slice(0, 4).map((c) => html`<i key=${c} className=${`ph ${CAPS[c].icon}`} title=${CAPS[c].label}></i>`)}
                      </span>
                    </button>`;
                })}
              </div>`)}
          </div>
        </div>

        ${detail && html`
          <div className="picker__detail">
            <div className="picker__detail-head">
              <span className="picker__detail-name">${detail.name}</span>
              ${detail.can.map((c) => html`<span key=${c} className="cap"><i className=${`ph ${CAPS[c].icon}`}></i>${CAPS[c].label}</span>`)}
            </div>
            <p>${detail.strengths}</p>
            ${detail.quota && html`<p className="quota">Kuota gratis (dari halaman Rate limit proyek Anda, 21 Nov 2026): ${detail.quota}.</p>`}
          </div>`}
      </div>
    </div>`;
}
