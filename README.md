# Riski AI

Chat multi-provider (Groq, DeepSeek, Gemini) tanpa build step. React + htm lewat ES modules native.

## Menjalankan

ES modules tidak bisa dibuka lewat klik dua kali (file://). Jalankan server lokal dari folder ini:

```bash
python -m http.server 8080
# lalu buka http://localhost:8080
```

Mikrofon (dikte dan suara dua arah) butuh `localhost` atau HTTPS.

## Struktur

```
index.html            pintu masuk, import map, font, stylesheet
css/
  tokens.css          warna, font, radius
  base.css            reset, latar, scrollbar
  orb.css             orb animasi (idle, thinking, live, speaking)
  layout.css          rel ikon, panel riwayat, panggung chat, layar sambutan, dock
  components.css      pesan, tombol, modal, pemilih model
  composer.css       kolom input, chip model, panel suara dua arah
  markdown.css        jawaban AI dan blok kode
js/
  app.js              perakit: state tingkat atas dan layout
  config/             providers.js, models.js, constants.js
  services/           chat.js (Groq/DeepSeek/Gemini), speech.js (Whisper, TTS), geminiModels.js
  hooks/              useApiKeys, useSessions, useChat, useDictation, useGeminiSync, useLive
  utils/              audio, clipboard, files, markdown, html
  components/         Orb (+MiniOrb), Hero, Rail (+MobileBar), HistoryPanel, ModelChip, Composer, LivePanel, MessageBubble, ModelPicker, SettingsModal
```

## Mengubah sesuatu

- Tambah model: edit `js/config/models.js`.
- Tambah provider: `js/config/providers.js` (termasuk 3 warna orb), lalu `services/chat.js` bila formatnya bukan OpenAI-compatible.
- Orb: `js/components/Orb.js` dan `css/orb.css`. Warna diambil dari provider aktif.
