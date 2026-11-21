import { html } from '../utils/html.js';
import { PROVIDERS } from '../config/providers.js';

const SPEED = { idle: 1, thinking: 0.38, live: 0.6, speaking: 0.45 };

const colorVars = (provider) => {
  const [o1, o2, o3] = PROVIDERS[provider].orb;
  return { '--o1': o1, '--o2': o2, '--o3': o3 };
};

/* Orb animasi. state: idle | thinking | live | speaking.
   level (0..1) membuat orb berdenyut mengikuti suara.
   ambient: versi besar dan lembut untuk latar. */
export function Orb({ provider = 'gemini', state = 'idle', level = 0, size = 160, ambient = false }) {
  const style = { '--size': size + 'px', '--spd': SPEED[state] ?? 1, '--lvl': level.toFixed(2), ...colorVars(provider) };
  const cls = `orb ${size <= 40 ? 'orb--sm' : ''} ${ambient ? 'orb--ambient' : ''} is-${state}`;
  return html`
    <span className=${cls} style=${style} aria-hidden="true">
      <span className="orb__glow"></span>
      <span className="orb__ring"></span>
      <span className="orb__body">
        <span className="orb__blob orb__blob--a"></span>
        <span className="orb__blob orb__blob--b"></span>
        <span className="orb__blob orb__blob--c"></span>
        <span className="orb__shine"></span>
      </span>
    </span>
  `;
}

/* Bola kecil statis (tanpa animasi) untuk merek dan avatar jawaban */
export function MiniOrb({ provider = 'gemini', size = 18 }) {
  return html`<span className="mini-orb" style=${{ width: size, height: size, ...colorVars(provider) }}></span>`;
}
