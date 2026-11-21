import { html } from '../utils/html.js';
import { fullName } from '../config/models.js';
import { Orb } from './Orb.js';

/* Tombol model aktif: orb kecil yang hidup + nama model. Membuka pemilih model. */
export function ModelChip({ model, orbState, level, onClick }) {
  return html`
    <button className="model-chip" onClick=${onClick} title="Ganti model">
      <${Orb} provider=${model.provider} state=${orbState} level=${level} size=${24} />
      <span className="truncate">${fullName(model)}</span>
      <i className="ph ph-caret-up-down"></i>
    </button>`;
}
