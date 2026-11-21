import { PROVIDERS } from '../config/providers.js';
import { GEMINI_BASE } from '../config/constants.js';

/* Groq dan DeepSeek memakai format OpenAI-compatible */
export async function callOpenAICompat({ model, history, apiKey }) {
  const cfg = PROVIDERS[model.provider];
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model.id,
      messages: history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.apiText ?? m.text ?? '' })),
      temperature: 0.7,
      max_tokens: cfg.maxTokens,
      ...(model.extra || {})
    })
  });
  const result = await res.json();
  if (result.error) throw new Error(result.error.message || `Terjadi kesalahan pada ${cfg.label}.`);
  const choice = result.choices?.[0];
  const text = choice?.message?.content;
  if (text) return text;
  if (choice?.finish_reason === 'length') throw new Error('Jawaban terpotong karena token habis (kemungkinan dipakai untuk thinking). Coba model lain.');
  console.error('Respons kosong:', result);
  throw new Error(`Respons kosong dari model (finish_reason: ${choice?.finish_reason || 'tidak ada'}). Detail ada di console (F12).`);
}

export async function callGemini({ model, history, mediaParts, apiKey }) {
  const contents = history.map((m, idx) => {
    const parts = [];
    const t = m.apiText ?? m.text ?? '';
    if (t) parts.push({ text: t });
    if (idx === history.length - 1 && m.role === 'user') mediaParts.forEach((p) => parts.push(p));
    if (parts.length === 0) parts.push({ text: ' ' });
    return { role: m.role === 'user' ? 'user' : 'model', parts };
  });
  const res = await fetch(`${GEMINI_BASE}/models/${model.id}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: PROVIDERS.gemini.maxTokens } })
  });
  const result = await res.json();
  if (result.error) throw new Error(result.error.message || 'Terjadi kesalahan pada Gemini.');
  const cand = result.candidates?.[0];
  const text = (cand?.content?.parts || []).filter((p) => p.text && !p.thought).map((p) => p.text).join('');
  if (text) return text;
  if (result.promptFeedback?.blockReason) throw new Error(`Permintaan diblokir Gemini (${result.promptFeedback.blockReason}).`);
  console.error('Respons kosong:', result);
  throw new Error(`Respons kosong dari Gemini (finishReason: ${cand?.finishReason || 'tidak ada'}). Detail ada di console (F12).`);
}

export const sendToModel = ({ model, history, mediaParts, apiKey }) =>
  model.provider === 'gemini'
    ? callGemini({ model, history, mediaParts, apiKey })
    : callOpenAICompat({ model, history, apiKey });
