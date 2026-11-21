import { GEMINI_BASE } from '../config/constants.js';
import { MODELS } from '../config/models.js';

const SKIP = /embed|tts|image|imagen|live|audio|veo|aqa|robotics|computer-use|transcribe|translate/i;

/* Ambil daftar model asli dari akun Gemini. Model chat yang belum ada di daftar bawaan ditambahkan ke MODELS. */
export async function fetchGeminiModelIds(apiKey) {
  const res = await fetch(`${GEMINI_BASE}/models?pageSize=1000`, { headers: { 'x-goog-api-key': apiKey } });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const all = data.models || [];
  const ids = new Set(all.map((m) => m.name.replace(/^models\//, '')));

  all.forEach((m) => {
    const id = m.name.replace(/^models\//, '');
    if (!(m.supportedGenerationMethods || []).includes('generateContent')) return;
    if (SKIP.test(id)) return;
    if (MODELS.some((x) => x.id === id)) return;
    MODELS.push({
      id, provider: 'gemini', group: 'Lainnya di akun Anda', name: m.displayName || id, kind: 'chat', verified: true,
      tagline: 'Ditemukan di akun Anda', can: ['chat'], input: [],
      strengths: 'Tidak ada di daftar bawaan, jadi kemampuan dan kuota gratisnya tidak diketahui. Cek di halaman Rate limit AI Studio. Di app ini hanya menerima teks.'
    });
  });
  return ids;
}
