import { useEffect, useRef, useState } from 'react';
import { GEMINI_WS } from '../config/constants.js';
import { fullName } from '../config/models.js';
import { b64ToInt16, int16ToB64, int16ToFloat32, rateFromMime, stopSpeech } from '../utils/audio.js';

/* Suara dua arah lewat Gemini Live API (WebSocket). Eksperimental.
   state: idle | connecting | live
   level: 0..1, dipakai orb untuk berdenyut mengikuti suara (mikrofon atau jawaban model). */
export function useLive({ apiKey, model, sessionId, onTurn, onNeedKey }) {
  const [state, setStateRaw] = useState('idle');
  const stateRef = useRef('idle');
  const [caption, setCaption] = useState({ user: '', model: '' });
  const [error, setError] = useState('');
  const [level, setLevel] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const L = useRef({ ws: null, micCtx: null, stream: null, proc: null, playCtx: null, next: 0, srcs: new Set(), uTxt: '', mTxt: '', sid: null, model: null });
  const onTurnRef = useRef(onTurn);
  onTurnRef.current = onTurn;

  const setState = (s) => { stateRef.current = s; setStateRaw(s); };

  const cleanup = () => {
    const l = L.current;
    try { l.proc && l.proc.disconnect(); } catch (e) { /* abaikan */ }
    try { l.stream && l.stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* abaikan */ }
    try { l.micCtx && l.micCtx.close(); } catch (e) { /* abaikan */ }
    try { l.srcs.forEach((s) => { try { s.stop(); } catch (e) { /* abaikan */ } }); l.srcs.clear(); l.playCtx && l.playCtx.close(); } catch (e) { /* abaikan */ }
    l.proc = l.stream = l.micCtx = l.playCtx = null;
    l.next = 0;
    setLevel(0);
    setSpeaking(false);
  };

  const stop = () => {
    const l = L.current;
    try { l.ws && l.ws.close(); } catch (e) { /* abaikan */ }
    l.ws = null;
    cleanup();
    setState('idle');
  };

  useEffect(() => () => { stop(); stopSpeech(); }, []); // eslint-disable-line

  const pushTurn = () => {
    const l = L.current;
    const msgs = [];
    const now = new Date().toISOString();
    if (l.uTxt.trim()) msgs.push({ id: Date.now().toString() + 'u', role: 'user', text: l.uTxt.trim(), timestamp: now });
    if (l.mTxt.trim()) msgs.push({ id: Date.now().toString() + 'm', role: 'model', type: 'text', text: l.mTxt.trim(), modelName: fullName(l.model), providerId: 'gemini', timestamp: now });
    l.uTxt = '';
    l.mTxt = '';
    setCaption({ user: '', model: '' });
    if (msgs.length) onTurnRef.current(l.sid, msgs);
  };

  const playChunk = (b64, rate) => {
    const l = L.current;
    if (!l.playCtx) return;
    const f32 = int16ToFloat32(b64ToInt16(b64));
    const buf = l.playCtx.createBuffer(1, f32.length, rate);
    buf.copyToChannel(f32, 0);
    const src = l.playCtx.createBufferSource();
    src.buffer = buf;
    src.connect(l.playCtx.destination);
    const t = Math.max(l.playCtx.currentTime, l.next);
    src.start(t);
    l.next = t + buf.duration;
    l.srcs.add(src);
    setSpeaking(true);
    // level jawaban model: dihitung dari amplitudo potongan ini
    let sum = 0;
    for (let i = 0; i < f32.length; i += 16) sum += f32[i] * f32[i];
    setLevel(Math.min(1, Math.sqrt(sum / (f32.length / 16)) * 4));
    src.onended = () => {
      l.srcs.delete(src);
      if (l.srcs.size === 0) { setSpeaking(false); setLevel(0); }
    };
  };

  const startMic = async () => {
    const l = L.current;
    l.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    l.micCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const src = l.micCtx.createMediaStreamSource(l.stream);
    l.proc = l.micCtx.createScriptProcessor(4096, 1, 1);
    l.proc.onaudioprocess = (e) => {
      if (!l.ws || l.ws.readyState !== 1) return;
      const f = e.inputBuffer.getChannelData(0);
      const i16 = new Int16Array(f.length);
      let sum = 0;
      for (let i = 0; i < f.length; i++) {
        const s = Math.max(-1, Math.min(1, f[i]));
        i16[i] = s < 0 ? s * 32768 : s * 32767;
        sum += s * s;
      }
      if (l.srcs.size === 0) setLevel(Math.min(1, Math.sqrt(sum / f.length) * 6));
      l.ws.send(JSON.stringify({ realtimeInput: { audio: { data: int16ToB64(i16), mimeType: 'audio/pcm;rate=16000' } } }));
    };
    const mute = l.micCtx.createGain();
    mute.gain.value = 0;
    src.connect(l.proc);
    l.proc.connect(mute);
    mute.connect(l.micCtx.destination);
  };

  const start = async () => {
    if (!apiKey) { onNeedKey('gemini'); return; }
    setError('');
    setState('connecting');
    const l = L.current;
    l.sid = sessionId;
    l.model = model;
    l.uTxt = '';
    l.mTxt = '';
    try {
      l.playCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      await l.playCtx.resume();
      const ws = new WebSocket(`${GEMINI_WS}?key=${apiKey}`);
      l.ws = ws;
      ws.onopen = () => ws.send(JSON.stringify({ setup: {
        model: `models/${model.id}`,
        generationConfig: { responseModalities: ['AUDIO'] },
        inputAudioTranscription: {}, outputAudioTranscription: {}
      } }));
      ws.onmessage = async (ev) => {
        let raw = ev.data;
        if (raw instanceof Blob) raw = await raw.text();
        let msg;
        try { msg = JSON.parse(raw); } catch (e) { return; }
        if (msg.setupComplete) {
          try { await startMic(); setState('live'); }
          catch (err) { setError('Mikrofon tidak bisa diakses: ' + err.message); stop(); }
          return;
        }
        const sc = msg.serverContent;
        if (!sc) return;
        if (sc.interrupted) { l.srcs.forEach((s) => { try { s.stop(); } catch (e) { /* abaikan */ } }); l.srcs.clear(); l.next = 0; setSpeaking(false); }
        (sc.modelTurn?.parts || []).forEach((p) => {
          if (p.inlineData?.data) playChunk(p.inlineData.data, rateFromMime(p.inlineData.mimeType));
        });
        if (sc.inputTranscription?.text) { l.uTxt += sc.inputTranscription.text; setCaption((c) => ({ ...c, user: l.uTxt })); }
        if (sc.outputTranscription?.text) { l.mTxt += sc.outputTranscription.text; setCaption((c) => ({ ...c, model: l.mTxt })); }
        if (sc.turnComplete) pushTurn();
      };
      ws.onerror = () => setError('Koneksi gagal. Periksa key, kuota, atau apakah model ini tersedia untuk akun Anda.');
      ws.onclose = (ev) => {
        if (stateRef.current !== 'idle') {
          if (ev.reason) setError(`Sesi ditutup: ${ev.reason}`);
          else if (ev.code && ev.code !== 1000 && ev.code !== 1005) setError(`Sesi ditutup (kode ${ev.code}).`);
        }
        cleanup();
        setState('idle');
      };
    } catch (err) {
      setError(err.message);
      stop();
    }
  };

  return { state, caption, error, level, speaking, start, stop };
}
