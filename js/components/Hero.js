import { html } from '../utils/html.js';
import { SUGGESTIONS } from '../config/constants.js';
import { fullName } from '../config/models.js';
import { PROVIDERS } from '../config/providers.js';
import { Orb } from './Orb.js';

/* Layar kosong: orb, sapaan, kolom input (composer), lalu pilihan cepat */
export function Hero({ model, hasKey, orbState, level, composer, onPick, onKeys }) {
  return html`
    <div className="hero">
      <div className="hero__orb"><${Orb} provider=${model.provider} state=${orbState} level=${level} size=${180} /></div>
      <h1 className="hero__title">Mau mengerjakan apa hari ini?</h1>
      <p className="hero__sub"><b>${fullName(model)}</b> siap membantu: ${model.tagline.toLowerCase()}.</p>
      ${!hasKey && html`
        <button className="key-hint" onClick=${() => onKeys(model.provider)}>
          <i className="ph ph-key"></i>Isi API key ${PROVIDERS[model.provider].label} untuk mulai
        </button>`}
      <div className="hero__composer">${composer}</div>
      <div className="pills">
        ${SUGGESTIONS.map((s, i) => html`
          <button key=${i} className="pill" onClick=${() => onPick(s.text)}>
            <i className=${`ph ${s.icon}`}></i>${s.short}
          </button>`)}
      </div>
    </div>`;
}
