export const b64ToInt16 = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
};

export const int16ToB64 = (i16) => {
  const bytes = new Uint8Array(i16.buffer, i16.byteOffset, i16.byteLength);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

export const int16ToFloat32 = (i16) => {
  const f32 = new Float32Array(i16.length);
  for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
  return f32;
};

export const rateFromMime = (mime, fallback = 24000) =>
  parseInt(((mime || '').match(/rate=(\d+)/) || [])[1] || String(fallback), 10);

/* ----- pemutar suara baca (TTS): satu suara pada satu waktu ----- */
let speechCtx = null;
let speechSrc = null;
let speechToken = 0;

export const stopSpeech = () => {
  speechToken++;
  try { speechSrc && speechSrc.stop(); } catch (e) { /* sudah berhenti */ }
  speechSrc = null;
};

export const playPcm = async (b64, rate, onEnded) => {
  stopSpeech();
  const token = speechToken;
  if (!speechCtx) speechCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (speechCtx.state === 'suspended') await speechCtx.resume();
  const f32 = int16ToFloat32(b64ToInt16(b64));
  const buf = speechCtx.createBuffer(1, f32.length, rate);
  buf.copyToChannel(f32, 0);
  const src = speechCtx.createBufferSource();
  src.buffer = buf;
  src.connect(speechCtx.destination);
  src.onended = () => {
    if (token === speechToken) { speechSrc = null; onEnded && onEnded(); }
  };
  speechSrc = src;
  src.start();
};

export const cleanForSpeech = (t) =>
  t.replace(/```[\s\S]*?```/g, ' (blok kode dilewati) ')
    .replace(/[`*_#>|]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .slice(0, 4000);
