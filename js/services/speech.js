import { GEMINI_BASE, GROQ_WHISPER_URL } from '../config/constants.js';
import { cleanForSpeech, playPcm, rateFromMime } from '../utils/audio.js';

/* Dikte suara: Whisper lewat Groq */
export async function transcribe({ blob, apiKey }) {
  const fd = new FormData();
  fd.append('file', blob, 'recording.webm');
  fd.append('model', 'whisper-large-v3-turbo');
  fd.append('language', 'id');
  const res = await fetch(GROQ_WHISPER_URL, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: fd });
  const r = await res.json();
  if (r.error) throw new Error(r.error.message || 'Gagal transkripsi.');
  return (r.text || '').trim();
}

/* Tombol Dengarkan: Gemini TTS, lalu diputar. onStart dipanggil saat audio mulai. */
export async function speak({ text, apiKey, ttsModel, onStart, onEnded }) {
  const res = await fetch(`${GEMINI_BASE}/models/${ttsModel}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: cleanForSpeech(text) }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('Model tidak mengembalikan audio.');
  onStart && onStart();
  await playPcm(part.inlineData.data, rateFromMime(part.inlineData.mimeType), onEnded);
}
