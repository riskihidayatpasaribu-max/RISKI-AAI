import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
import { copyText } from './clipboard.js';

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

marked.use({
  renderer: {
    // marked v12 memakai (code, lang); versi baru memakai objek token
    code(a, b) {
      const isObj = typeof a === 'object' && a !== null;
      const text = isObj ? a.text : a;
      const lang = ((isObj ? a.lang : b) || '').split(/\s/)[0];
      let html;
      try {
        html = lang && hljs.getLanguage(lang)
          ? hljs.highlight(text, { language: lang }).value
          : hljs.highlightAuto(text).value;
      } catch (e) { html = escapeHtml(text); }
      const lines = text.replace(/\n$/, '').split('\n').length;
      const fold = lines > 24 ? '<button type="button" class="cb-btn" data-act="fold">Ciutkan</button>' : '';
      return '<div class="cb"><div class="cb-head"><span class="cb-lang">' + escapeHtml(lang || 'teks') +
        '</span><span class="cb-meta">' + lines + ' baris</span><span class="cb-spacer"></span>' + fold +
        '<button type="button" class="cb-btn" data-act="copy">Salin</button></div><pre><code class="hljs">' + html + '</code></pre></div>';
    }
  }
});

export const renderMarkdown = (text) =>
  DOMPurify.sanitize(marked.parse(text || ''), { ADD_ATTR: ['data-act'] });

/* satu handler klik untuk semua blok kode di area chat */
export const handleCodeClick = (e) => {
  const btn = e.target.closest('[data-act]');
  const block = btn?.closest('.cb');
  if (!btn || !block) return;
  if (btn.dataset.act === 'copy') {
    const code = block.querySelector('code')?.innerText || '';
    copyText(code).then(() => {
      btn.textContent = 'Tersalin';
      btn.classList.add('done');
      setTimeout(() => { btn.textContent = 'Salin'; btn.classList.remove('done'); }, 1600);
    });
  } else if (btn.dataset.act === 'fold') {
    const folded = block.classList.toggle('folded');
    btn.textContent = folded ? 'Buka' : 'Ciutkan';
  }
};
