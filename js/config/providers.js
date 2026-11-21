/* Satu provider = satu API key.
   orb: [warna utama, warna dasar, warna terang] untuk orb dan aksen UI. */
export const PROVIDERS = {
  groq: {
    label: 'Groq', color: '#e9a04b', orb: ['#f2a04a', '#d9502b', '#ffd9a0'],
    tagline: 'Inferensi sangat cepat untuk model open-source',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    storageKey: 'groq_api_key', placeholder: 'gsk_...', console: 'console.groq.com', maxTokens: 2048
  },
  deepseek: {
    label: 'DeepSeek', color: '#8b87f5', orb: ['#8b87f5', '#4a4fd6', '#cfc6ff'],
    tagline: 'Konteks 1 juta token, kuat di kode dan penalaran',
    url: 'https://api.deepseek.com/chat/completions',
    storageKey: 'deepseek_api_key', placeholder: 'sk-...', console: 'platform.deepseek.com', maxTokens: 16384
  },
  gemini: {
    label: 'Gemini', color: '#4fb8a8', orb: ['#3fc7b3', '#2f6fe0', '#a6f0e2'],
    tagline: 'Model gratis dari Google. Bisa baca gambar dan PDF, plus suara',
    storageKey: 'gemini_api_key', placeholder: 'AIza...', console: 'aistudio.google.com/apikey', maxTokens: 8192
  }
};

export const CAPS = {
  chat:   { label: 'Chat',          icon: 'ph-chat-circle' },
  code:   { label: 'Kode',          icon: 'ph-code' },
  reason: { label: 'Reasoning',     icon: 'ph-brain' },
  search: { label: 'Web search',    icon: 'ph-globe' },
  agent:  { label: 'Agent',         icon: 'ph-robot' },
  fast:   { label: 'Cepat',         icon: 'ph-lightning' },
  ctx:    { label: 'Konteks besar', icon: 'ph-stack' },
  image:  { label: 'Baca gambar',   icon: 'ph-image' },
  pdf:    { label: 'Baca PDF',      icon: 'ph-file-pdf' },
  live:   { label: 'Suara dua arah', icon: 'ph-waveform' },
  tts:    { label: 'Teks ke suara', icon: 'ph-speaker-high' }
};
