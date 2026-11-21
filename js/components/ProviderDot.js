import { html } from '../utils/html.js';
import { PROVIDERS } from '../config/providers.js';

export function ProviderDot({ pid, size = 8 }) {
  return html`<span className="provider-dot" style=${{ width: size, height: size, background: PROVIDERS[pid].color }}></span>`;
}
