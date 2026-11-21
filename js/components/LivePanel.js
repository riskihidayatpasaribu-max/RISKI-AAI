import { html } from '../utils/html.js';
import { Orb } from './Orb.js';

/* Panel suara dua arah: orb jadi pusat, berdenyut mengikuti suara */
export function LivePanel({ model, live, orbState, onPickModel }) {
  const { state, caption, error, level, start, stop } = live;
  const title = state === 'live' ? (live.speaking ? 'Sedang menjawab' : 'Mendengarkan. Silakan bicara.')
    : state === 'connecting' ? 'Menyambung...'
    : 'Bicara langsung dengan ' + model.name;

  return html`
    <div className="livepanel">
      <${Orb} provider=${model.provider} state=${orbState} level=${level} size=${132} />
      <div className="livepanel__title">${title}</div>
      <div className="livepanel__hint">Eksperimental. Pakai headset agar suara model tidak terdengar kembali oleh mikrofon.</div>
      <div style=${{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="model-chip" onClick=${onPickModel} title="Ganti model" disabled=${state !== 'idle'}>
          <span className="truncate">${model.name}</span><i className="ph ph-caret-up-down"></i>
        </button>
        ${state === 'idle'
          ? html`<button className="btn btn--primary" onClick=${start}><i className="ph-fill ph-microphone"></i>Mulai</button>`
          : html`<button className=${`btn btn--danger ${state === 'live' ? 'is-live' : ''}`} onClick=${stop}><i className="ph-fill ph-stop"></i>Akhiri</button>`}
      </div>
      ${(caption.user || caption.model) && html`
        <div className="livepanel__caption">
          ${caption.user && html`<p><span>Anda: </span>${caption.user}</p>`}
          ${caption.model && html`<p><span>Model: </span>${caption.model}</p>`}
        </div>`}
      ${error && html`<p className="livepanel__err">${error}</p>`}
    </div>`;
}
