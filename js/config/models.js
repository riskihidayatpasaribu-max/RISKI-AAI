import { PROVIDERS } from './providers.js';

/* kind: chat | live | tts
   verified: false = ID model berasal dari artikel pihak ketiga, belum terlihat di halaman harga resmi Google.
   Kuota & daftar gratis Gemini mengikuti halaman Rate limit proyek pengguna (21 Nov 2026). */
export const MODELS = [
  // ---------------- GROQ ----------------
  { id: 'llama-3.3-70b-versatile', provider: 'groq', group: 'Umum', name: 'Llama 3.3 70B', kind: 'chat',
    tagline: 'Serba bisa, andalan harian', can: ['chat', 'code', 'ctx'],
    strengths: 'Paling seimbang di Groq. Bagus untuk ngobrol, menulis, dan coding, dengan konteks besar (sekitar 128K token).' },
  { id: 'llama-3.1-8b-instant', provider: 'groq', group: 'Umum', name: 'Llama 3.1 8B Instant', kind: 'chat',
    tagline: 'Paling kencang dan ringan', can: ['chat', 'fast'],
    strengths: 'Respons nyaris instan dan hemat kuota. Cocok untuk tanya-jawab singkat, ringkasan, dan terjemahan. Kurang kuat untuk logika atau kode rumit.' },
  { id: 'qwen/qwen3.6-27b', provider: 'groq', group: 'Umum', name: 'Qwen3.6 27B', kind: 'chat',
    tagline: 'Alternatif model umum', can: ['chat', 'code'],
    strengths: 'Pembanding untuk Llama. Coba saat jawaban model lain kurang pas. Kualitasnya bervariasi per tugas, jadi uji sendiri.' },
  { id: 'openai/gpt-oss-120b', provider: 'groq', group: 'Reasoning', name: 'GPT-OSS 120B', kind: 'chat',
    tagline: 'Penalaran berat', can: ['reason', 'code', 'chat'],
    strengths: 'Model terbesar di Groq untuk masalah kompleks: analisis bertahap, matematika, debugging sulit. Lebih lambat dari model kecil.' },
  { id: 'openai/gpt-oss-20b', provider: 'groq', group: 'Reasoning', name: 'GPT-OSS 20B', kind: 'chat',
    tagline: 'Penalaran ringan', can: ['reason', 'chat', 'fast'],
    strengths: 'Tetap berpikir bertahap, tapi lebih cepat dan hemat kuota dibanding versi 120B.' },
  { id: 'groq/compound', provider: 'groq', group: 'Agent', name: 'Compound', kind: 'chat',
    tagline: 'Agent dengan alat bawaan', can: ['agent', 'search', 'code'],
    strengths: 'Bisa mencari di web dan menjalankan kode sendiri sebelum menjawab. Cocok untuk info terkini dan perhitungan. Jawaban lebih lama karena ada proses alat.' },
  { id: 'groq/compound-mini', provider: 'groq', group: 'Agent', name: 'Compound Mini', kind: 'chat',
    tagline: 'Agent versi ringan', can: ['agent', 'search', 'code', 'fast'],
    strengths: 'Kemampuan sama dengan Compound (web search dan eksekusi kode), tapi lebih cepat dan ringan.' },

  // ---------------- DEEPSEEK ----------------
  { id: 'deepseek-flash', provider: 'deepseek', group: 'DeepSeek V4', name: 'V4.1 Flash', kind: 'chat',
    tagline: 'Cepat, murah, konteks 1M', can: ['chat', 'code', 'fast', 'ctx'],
    strengths: 'Konteks 1 juta token (muat dokumen atau kode yang sangat panjang), output sampai 384K. Di app ini mode thinking dimatikan supaya langsung menjawab. API-nya mendukung gambar, tapi belum disambungkan di sini.',
    extra: { thinking: { type: 'disabled' } } },
  { id: 'deepseek-v4-pro', provider: 'deepseek', group: 'DeepSeek V4', name: 'V4 Pro', kind: 'chat',
    tagline: 'Terpintar di DeepSeek', can: ['reason', 'code', 'chat', 'ctx'],
    strengths: 'Mode thinking aktif: kuat untuk coding berat, analisis, dan masalah multi-langkah, konteks 1M. Berpikir dulu sebelum menjawab, jadi lebih lama. Tanpa gambar.' },

  // ---------------- GEMINI: chat ----------------
  { id: 'gemini-4-hydrogen', provider: 'gemini', group: 'Gemini 4', name: '4 Hydrogen', kind: 'chat', verified: false,
    tagline: 'Satu-satunya Gemini 4 yang gratis', can: ['chat', 'code', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '5 permintaan/menit, 20/hari, 250K token/menit',
    strengths: 'Di proyek Anda, hanya varian Hydrogen dari seri Gemini 4 yang punya kuota gratis (Argon, Carbon, Neon bernilai 0). Kemampuan detailnya belum hamba ketahui, uji sendiri.' },
  { id: 'gemini-3.8-flash', provider: 'gemini', group: 'Flash (kuota kecil)', name: '3.8 Flash', kind: 'chat', verified: false,
    tagline: 'Flash paling baru', can: ['chat', 'code', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '5 permintaan/menit, 20/hari, 250K token/menit',
    strengths: 'Generasi Flash terbaru, menerima teks, gambar, dan PDF. Kuota harian kecil, simpan untuk pertanyaan yang butuh kualitas.' },
  { id: 'gemini-3.6-flash', provider: 'gemini', group: 'Flash (kuota kecil)', name: '3.6 Flash', kind: 'chat', verified: false,
    tagline: 'Flash generasi sebelumnya', can: ['chat', 'code', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '5 permintaan/menit, 20/hari, 250K token/menit',
    strengths: 'Mirip 3.8 Flash. Kuota dihitung per model, jadi bisa jadi cadangan saat kuota 3.8 habis.' },
  { id: 'gemini-3-flash-preview', provider: 'gemini', group: 'Flash (kuota kecil)', name: '3 Flash Preview', kind: 'chat',
    tagline: 'Versi preview generasi 3', can: ['chat', 'code', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '5 permintaan/menit, 20/hari, 250K token/menit',
    strengths: 'Model preview, perilakunya bisa berubah atau dihentikan sewaktu-waktu.' },
  { id: 'gemini-2.5-flash', provider: 'gemini', group: 'Flash (kuota kecil)', name: '2.5 Flash', kind: 'chat',
    tagline: 'Flash generasi 2.5', can: ['chat', 'code', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '5 permintaan/menit, 20/hari, 250K token/menit',
    strengths: 'Generasi paling lama yang masih gratis. Grounding Google Search gratis sampai 1.5K/hari untuk seri 2.5 (belum dipakai di app ini).' },
  { id: 'gemini-3.5-flash-lite', provider: 'gemini', group: 'Lite (kuota lebih longgar)', name: '3.5 Flash-Lite', kind: 'chat', verified: false,
    tagline: 'Ringan, 500 permintaan per hari', can: ['chat', 'fast', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '15 permintaan/menit, 500/hari, 250K token/menit',
    strengths: 'Pilihan harian untuk pemakaian banyak: kuota 25 kali lipat Flash biasa. Kualitas lebih sederhana.' },
  { id: 'gemini-3.1-flash-lite', provider: 'gemini', group: 'Lite (kuota lebih longgar)', name: '3.1 Flash-Lite', kind: 'chat',
    tagline: 'Lite yang sudah stabil', can: ['chat', 'fast', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '15 permintaan/menit, 500/hari, 250K token/menit',
    strengths: 'Kuota harian besar. Cocok untuk ringkasan dan tanya-jawab cepat.' },
  { id: 'gemini-2.5-flash-lite', provider: 'gemini', group: 'Lite (kuota lebih longgar)', name: '2.5 Flash-Lite', kind: 'chat',
    tagline: 'Paling ringan, tapi hanya 20 per hari', can: ['chat', 'fast', 'image', 'pdf'], input: ['image', 'pdf'],
    quota: '10 permintaan/menit, 20/hari, 250K token/menit',
    strengths: 'Berbeda dari Lite lain, kuota hariannya hanya 20. Lebih cocok untuk cadangan.' },
  { id: 'gemma-4-31b-it', provider: 'gemini', group: 'Gemma (kuota terbesar)', name: 'Gemma 4 31B', kind: 'chat', verified: false,
    tagline: 'Model open Google, 14.400 per hari', can: ['chat', 'code'], input: [],
    quota: '30 permintaan/menit, 14.400/hari, tapi hanya 16K token/menit',
    strengths: 'Kuota permintaan terbesar, cocok untuk percakapan panjang dan banyak percobaan. Batas 16K token per menit membuat file atau konteks besar akan ditolak. Hanya teks di app ini.' },
  { id: 'gemma-4-26b-a4b-it', provider: 'gemini', group: 'Gemma (kuota terbesar)', name: 'Gemma 4 26B A4B', kind: 'chat', verified: false,
    tagline: 'Gemma versi lebih ringan', can: ['chat', 'code', 'fast'], input: [],
    quota: '30 permintaan/menit, 14.400/hari, tapi hanya 16K token/menit',
    strengths: 'Varian Gemma lebih hemat komputasi, kuota sama. Batas 16K token per menit berlaku juga. Hanya teks.' },

  // ---------------- GEMINI: suara dua arah (Live) ----------------
  { id: 'gemini-3.8-live', provider: 'gemini', group: 'Suara dua arah (Live)', name: '3.8 Live', kind: 'live', verified: false,
    tagline: 'Live terbaru, tanpa batas permintaan', can: ['live', 'fast'],
    quota: 'permintaan tanpa batas, 65K token/menit',
    strengths: 'Bicara langsung lewat mikrofon, dijawab dengan suara. Di proyek Anda permintaan tidak dibatasi. Fitur ini belum teruji dengan key sungguhan, jadi anggap eksperimental.' },
  { id: 'gemini-3.8-live-extended-thinking', provider: 'gemini', group: 'Suara dua arah (Live)', name: '3.8 Live Extended Thinking', kind: 'live', verified: false,
    tagline: 'Live yang berpikir dulu', can: ['live', 'reason'],
    quota: 'permintaan tanpa batas, 65K token/menit',
    strengths: 'Varian Live untuk pertanyaan yang butuh penalaran bertahap. Jawaban bisa sedikit lebih lambat. Eksperimental.' },
  { id: 'gemini-2.5-flash-native-audio-preview-12-2025', provider: 'gemini', group: 'Suara dua arah (Live)', name: '2.5 Native Audio', kind: 'live',
    tagline: 'Suara native, 1M token per menit', can: ['live'],
    quota: 'permintaan tanpa batas, 1M token/menit',
    strengths: 'Model audio langsung (tidak lewat teks dulu), kuota token terbesar di grup Live. Preview. Eksperimental.' },

  // ---------------- GEMINI: teks ke suara (TTS) ----------------
  { id: 'gemini-3.1-flash-tts-preview', provider: 'gemini', group: 'Suara baca (tombol Dengarkan)', name: '3.1 Flash TTS', kind: 'tts',
    tagline: 'Membacakan jawaban', can: ['tts'],
    quota: '3 permintaan/menit, hanya 10 per hari',
    strengths: 'Dipakai tombol Dengarkan di bawah jawaban. Karena kuotanya 10 per hari, tombol hanya bisa dipakai sekitar 10 kali sehari per model.' },
  { id: 'gemini-2.5-flash-preview-tts', provider: 'gemini', group: 'Suara baca (tombol Dengarkan)', name: '2.5 Flash TTS', kind: 'tts',
    tagline: 'Membacakan jawaban', can: ['tts'],
    quota: '3 permintaan/menit, hanya 10 per hari',
    strengths: 'Cadangan untuk tombol Dengarkan. Kuota dihitung per model, jadi bergantian dengan 3.1 TTS memberi sekitar 20 kali sehari.' }
];

export const getModel = (id) => MODELS.find((m) => m.id === id);
export const getProviderId = (id) => getModel(id)?.provider || null;

const BARE_GROQ_NAME = /^(Llama|Qwen|GPT|Compound)/;
export const fullName = (m) => {
  if (!m) return '';
  if (m.id.startsWith('gemma')) return m.name;
  if (m.provider === 'groq' && BARE_GROQ_NAME.test(m.name)) return m.name;
  return `${PROVIDERS[m.provider].label} ${m.name}`;
};
