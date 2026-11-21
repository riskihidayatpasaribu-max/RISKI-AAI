import { TEXT_EXT, MAX_TEXT } from '../config/constants.js';

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

export const readAttachment = async (file) => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (file.type.startsWith('image/')) {
    const url = await fileToDataUrl(file);
    return { name: file.name, kind: 'image', mimeType: file.type, base64: url.split(',')[1], previewUrl: url };
  }
  if (file.type === 'application/pdf' || ext === 'pdf') {
    const url = await fileToDataUrl(file);
    return { name: file.name, kind: 'pdf', mimeType: 'application/pdf', base64: url.split(',')[1] };
  }
  if (file.type.startsWith('text/') || TEXT_EXT.includes(ext)) {
    let text = await file.text();
    let truncated = false;
    if (text.length > MAX_TEXT) { text = text.slice(0, MAX_TEXT); truncated = true; }
    return { name: file.name, kind: 'text', text, truncated };
  }
  return { name: file.name, kind: 'unsupported' };
};

/* gambar dan PDF hanya untuk model Gemini yang mendukung; teks bisa untuk semua */
export const supportsKind = (model, kind) => {
  if (kind === 'text') return true;
  if (kind === 'image' || kind === 'pdf') return !!model?.input?.includes(kind);
  return false;
};

export const acceptAttr = (model) =>
  model.provider === 'gemini' && model.input?.length
    ? 'image/*,application/pdf,.pdf,' + TEXT_EXT.map((e) => '.' + e).join(',')
    : TEXT_EXT.map((e) => '.' + e).join(',');
