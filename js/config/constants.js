export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
export const GEMINI_WS = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
export const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

export const TEXT_EXT = ['txt','md','csv','json','js','jsx','ts','tsx','py','ino','cpp','c','h','html','css','yaml','yml','log','sql','xml','sh','ini','toml','env','conf'];
export const MAX_TEXT = 200000;

export const SUGGESTIONS = [
  { icon: 'ph-code', short: 'Buat landing page', text: 'Buatkan struktur HTML dan Tailwind untuk landing page portfolio' },
  { icon: 'ph-bug', short: 'Cari bug di kode', text: 'Cari bug di kode ini dan jelaskan penyebabnya:\n\n' },
  { icon: 'ph-circuitry', short: 'Jelaskan MQTT', text: 'Jelaskan cara kerja MQTT dengan contoh sederhana' },
  { icon: 'ph-note-pencil', short: 'Rapikan tulisan', text: 'Rapikan tulisan ini supaya lebih profesional:\n\n' }
];

export const STORAGE = {
  model: 'riski_selected_model',
  ttsModel: 'riski_tts_model'
};
