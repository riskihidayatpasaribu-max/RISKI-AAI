import { html } from '../utils/html.js';
import { PROVIDERS } from '../config/providers.js';
import { fullName } from '../config/models.js';
import { Orb } from './Orb.js';

export function Topbar({ model, hasKey, orbState, level, onMenu, onPickModel, onOpenKeys }) {
  return html`
    <header className="topbar">
      <button className="topbar__menu" onClick=${onMenu} aria-label="Buka menu"><i className="ph ph-list" style=${{ fontSize: 22 }}></i></button>
      <button className="model-btn" onClick=${onPickModel}>
        <${Orb} provider=${model.provider} state=${orbState} level=${level} size=${28} />
        <span className="model-btn__name truncate">${fullName(model)}</span>
        <i className="ph ph-caret-down"></i>
      </button>
      <div className="topbar__spacer"></div>
      ${!hasKey && html`
        <button className="key-warn" onClick=${() => onOpenKeys(model.provider)}>
          <i className="ph ph-key"></i>Isi key ${PROVIDERS[model.provider].label}
        </button>`}
    </header>`;
}
