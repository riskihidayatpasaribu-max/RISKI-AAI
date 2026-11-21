import { useRef, useState } from 'react';
import { transcribe } from '../services/speech.js';

/* Dikte suara ke kotak input (Whisper via Groq) */
export function useDictation({ groqKey, onText, onNeedKey }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  const toggle = async () => {
    if (isRecording) { recRef.current?.stop(); setIsRecording(false); return; }
    if (!groqKey) { onNeedKey('groq'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsTranscribing(true);
        try {
          const text = await transcribe({ blob: new Blob(chunksRef.current, { type: 'audio/webm' }), apiKey: groqKey });
          if (text) onText(text);
        } catch (err) {
          console.error('Whisper error:', err);
          alert('Gagal transkripsi suara: ' + err.message);
        } finally { setIsTranscribing(false); }
      };
      rec.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
      alert('Mikrofon tidak bisa diakses. Periksa izin browser.');
    }
  };

  return { isRecording, isTranscribing, toggle };
}
