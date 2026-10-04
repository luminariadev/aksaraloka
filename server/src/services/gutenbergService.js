import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.resolve(__dirname, '../../data/gutenberg_cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

class GutenbergService {
  /**
   * Pre-curated list of famous open-source classics with full-text reading available
   * across diverse categories (Science, Education, Philosophy, Literature)
   * (Project Gutenberg via public-apis)
   */
  getCuratedBooks(category = '') {
    const allBooks = [
      // === SAINS & PENGETAHUAN ===
      {
        gutenberg_id: 30155,
        title: 'Relativity: The Special and General Theory',
        author: 'Albert Einstein',
        published_year: 1920,
        category: 'Sains & Pengetahuan',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/30155/pg30155.cover.medium.jpg',
        description: 'Penjelasan orisinal karya Albert Einstein mengenai konsep relativitas khusus dan umum, ruang-waktu empat dimensi, dan gravitasi yang mengubah fondasi fisika modern.',
        pages: 180,
        total_chapters: 32,
        can_read_online: true,
      },
      {
        gutenberg_id: 1228,
        title: 'On the Origin of Species',
        author: 'Charles Darwin',
        published_year: 1859,
        category: 'Sains & Pengetahuan',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/1228/pg1228.cover.medium.jpg',
        description: 'Karya monumental dalam biologi evolusi yang memaparkan teori seleksi alam dan keberagaman makhluk hidup di muka bumi.',
        pages: 502,
        total_chapters: 15,
        can_read_online: true,
      },
      {
        gutenberg_id: 14474,
        title: 'The Chemical History of a Candle',
        author: 'Michael Faraday',
        published_year: 1861,
        category: 'Sains & Pengetahuan',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/14474/pg14474.cover.medium.jpg',
        description: 'Seri kuliah sains eksperimental populer karya penemu induksi elektromagnetik Michael Faraday, menjelaskan prinsip pembakaran, gas, dan energi melalui nyala sebatang lilin.',
        pages: 140,
        total_chapters: 6,
        can_read_online: true,
      },
      {
        gutenberg_id: 18857,
        title: 'A Journey to the Centre of the Earth',
        author: 'Jules Verne',
        published_year: 1864,
        category: 'Sains & Pengetahuan',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/18857/pg18857.cover.medium.jpg',
        description: 'Kisah fiksi ilmiah legendaris tentang ekspedisi geologis Profesor Lidenbrock dan keponakannya Axel menembus lapisan vulkanik menuju perut bumi.',
        pages: 320,
        total_chapters: 44,
        can_read_online: true,
      },
      {
        gutenberg_id: 35,
        title: 'The Time Machine',
        author: 'H. G. Wells',
        published_year: 1895,
        category: 'Sains & Pengetahuan',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/35/pg35.cover.medium.jpg',
        description: 'Karya fiksi ilmiah pelopor konsep penjelajahan waktu mekanis menuju masa depan bumi tahun 802.701 Masehi.',
        pages: 140,
        total_chapters: 12,
        can_read_online: true,
      },

      // === PENDIDIKAN & BELAJAR ===
      {
        gutenberg_id: 39863,
        title: 'The Montessori Method',
        author: 'Maria Montessori',
        published_year: 1912,
        category: 'Pendidikan & Belajar',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/39863/pg39863.cover.medium.jpg',
        description: 'Buku rujukan pedagogi dunia tentang metode pendidikan anak usia dini berbasis kemandirian, kebebasan terarah, dan stimulasi sensorik alami.',
        pages: 380,
        total_chapters: 22,
        can_read_online: true,
      },
      {
        gutenberg_id: 852,
        title: 'Democracy and Education',
        author: 'John Dewey',
        published_year: 1916,
        category: 'Pendidikan & Belajar',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/852/pg852.cover.medium.jpg',
        description: 'Filsafat pendidikan progresif yang menekankan pentingnya pembelajaran berbasis pengalaman (learning by doing) dan perannya dalam masyarakat demokratis.',
        pages: 430,
        total_chapters: 26,
        can_read_online: true,
      },
      {
        gutenberg_id: 54298,
        title: 'Emile: Or, Concerning Education',
        author: 'Jean-Jacques Rousseau',
        published_year: 1762,
        category: 'Pendidikan & Belajar',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/54298/pg54298.cover.medium.jpg',
        description: 'Risalah klasik tentang hakikat manusia dan pendidikan alami yang bebas dari kungkungan kepalsuan institusi sosial konvensional.',
        pages: 460,
        total_chapters: 5,
        can_read_online: true,
      },
      {
        gutenberg_id: 16643,
        title: 'Self-Reliance and Other Essays',
        author: 'Ralph Waldo Emerson',
        published_year: 1841,
        category: 'Pendidikan & Belajar',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/16643/pg16643.cover.medium.jpg',
        description: 'Esai filosofis tentang kemandirian berpikir, integritas pribadi, dan keberanian mengikuti nurani serta pemikiran autentik sendiri.',
        pages: 220,
        total_chapters: 8,
        can_read_online: true,
      },

      // === SEJARAH & FILSAFAT ===
      {
        gutenberg_id: 132,
        title: 'The Art of War',
        author: 'Sun Tzu',
        published_year: -500,
        category: 'Sejarah & Filsafat',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/132/pg132.cover.medium.jpg',
        description: 'Karya strategi militer dan filsafat pengambilan keputusan tertua di dunia yang diaplikasikan dalam kepemimpinan, taktik, dan dinamika persaingan.',
        pages: 110,
        total_chapters: 13,
        can_read_online: true,
      },
      {
        gutenberg_id: 2680,
        title: 'Meditations',
        author: 'Marcus Aurelius',
        published_year: 180,
        category: 'Sejarah & Filsafat',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/2680/pg2680.cover.medium.jpg',
        description: 'Catatan harian kaisar filsuf Romawi mengenai keteguhan batin, kedisiplinan diri, ketenangan menghadapi kesulitan, dan etika Stoisisme.',
        pages: 200,
        total_chapters: 12,
        can_read_online: true,
      },
      {
        gutenberg_id: 1497,
        title: 'The Republic',
        author: 'Plato',
        published_year: -375,
        category: 'Sejarah & Filsafat',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/1497/pg1497.cover.medium.jpg',
        description: 'Dialog filsafat Socrates dan Plato mengenai keadilan, negara ideal, hakikat jiwa manusia, serta perumpamaan Gua (Allegory of the Cave).',
        pages: 420,
        total_chapters: 10,
        can_read_online: true,
      },
      {
        gutenberg_id: 1232,
        title: 'The Prince',
        author: 'Niccolò Machiavelli',
        published_year: 1532,
        category: 'Sejarah & Filsafat',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/1232/pg1232.cover.medium.jpg',
        description: 'Analisis politik realis era Renaisans mengenai seni memerintah, kekuasaan, dan strategi mempertahankan stabilitas kepemimpinan.',
        pages: 160,
        total_chapters: 26,
        can_read_online: true,
      },

      // === SASTRA & KLASIK DUNIA ===
      {
        gutenberg_id: 1342,
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        published_year: 1813,
        category: 'Sastra & Klasik Dunia',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
        description: 'Kisah klasik tentang prasangka dan keangkuhan sosial dalam masyarakat Inggris era Victoria, menampilkan kecerdasan Elizabeth Bennet dan Mr. Darcy.',
        pages: 432,
        total_chapters: 61,
        can_read_online: true,
      },
      {
        gutenberg_id: 84,
        title: 'Frankenstein; or, The Modern Prometheus',
        author: 'Mary Wollstonecraft Shelley',
        published_year: 1818,
        category: 'Sastra & Klasik Dunia',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
        description: 'Karya fiksi ilmiah legendaris tentang Victor Frankenstein yang berhasil menciptakan makhluk hidup, namun berakhir dengan tragedi moral dan kesepian.',
        pages: 280,
        total_chapters: 28,
        can_read_online: true,
      },
      {
        gutenberg_id: 1661,
        title: 'The Adventures of Sherlock Holmes',
        author: 'Arthur Conan Doyle',
        published_year: 1892,
        category: 'Sastra & Klasik Dunia',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
        description: 'Dua belas cerita detektif legendaris Sherlock Holmes bersama Dr. John Watson dalam memecahkan misteri di jalanan London.',
        pages: 350,
        total_chapters: 12,
        can_read_online: true,
      },
      {
        gutenberg_id: 345,
        title: 'Dracula',
        author: 'Bram Stoker',
        published_year: 1897,
        category: 'Sastra & Klasik Dunia',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg',
        description: 'Novel gotik legendaris berbentuk jurnal dan surat yang memperkenalkan sosok bangsawan vampir Transylvania, Count Dracula.',
        pages: 410,
        total_chapters: 27,
        can_read_online: true,
      },
      {
        gutenberg_id: 11,
        title: "Alice's Adventures in Wonderland",
        author: 'Lewis Carroll',
        published_year: 1865,
        category: 'Sastra & Klasik Dunia',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',
        description: 'Petualangan surealis Alice yang jatuh ke dalam lubang kelinci dan bertemu dengan karakter-karakter aneh seperti Mad Hatter dan Cheshire Cat.',
        pages: 192,
        total_chapters: 12,
        can_read_online: true,
      },
      {
        gutenberg_id: 64317,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        published_year: 1925,
        category: 'Sastra & Klasik Dunia',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/64317/pg64317.cover.medium.jpg',
        description: 'Potret era Jazz di Long Island dan obsesi tragis Jay Gatsby terhadap Daisy Buchanan.',
        pages: 208,
        total_chapters: 9,
        can_read_online: true,
      },
      {
        gutenberg_id: 5200,
        title: 'Metamorphosis',
        author: 'Franz Kafka',
        published_year: 1915,
        category: 'Sastra & Klasik Dunia',
        language: 'English (Terjemahan)',
        cover_url: 'https://www.gutenberg.org/cache/epub/5200/pg5200.cover.medium.jpg',
        description: 'Kisah Gregor Samsa yang terbangun di suatu pagi dan mendapati dirinya telah bermutasi menjadi serangga raksasa.',
        pages: 120,
        total_chapters: 3,
        can_read_online: true,
      },
      {
        gutenberg_id: 174,
        title: 'The Picture of Dorian Gray',
        author: 'Oscar Wilde',
        published_year: 1890,
        category: 'Sastra & Klasik Dunia',
        language: 'English',
        cover_url: 'https://www.gutenberg.org/cache/epub/174/pg174.cover.medium.jpg',
        description: 'Kisah pemuda yang menukar jiwanya agar tetap awet muda, sementara lukisan potret dirinya yang menua menanggung noda dosa moralnya.',
        pages: 250,
        total_chapters: 21,
        can_read_online: true,
      },
    ];

    if (!category || category === 'Semua') {
      return allBooks;
    }

    return allBooks.filter(b => b.category.toLowerCase().includes(category.toLowerCase()));
  }

  /**
   * Search books from Gutendex REST API (Listed in public-apis/public-apis)
   */
  async searchGutendex(query = '') {
    try {
      const url = query && query.trim()
        ? `https://gutendex.com/books?search=${encodeURIComponent(query.trim())}`
        : `https://gutendex.com/books?languages=en&sort=popular`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AksaraLoka-Reader/2.0 (open-source-project)' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gutendex returned status ${response.status}`);
      }

      const data = await response.json();
      const results = (data.results || []).map((b) => {
        const cover = b.formats['image/jpeg'] || `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.cover.medium.jpg`;
        const textUrl = b.formats['text/plain; charset=utf-8'] || b.formats['text/plain; charset=us-ascii'];
        const htmlUrl = b.formats['text/html'] || b.formats['text/html; charset=utf-8'];

        return {
          gutenberg_id: b.id,
          title: b.title,
          author: b.authors && b.authors.length > 0 ? b.authors[0].name.replace(/(.*),\s*(.*)/, '$2 $1') : 'Penulis Klasik',
          subjects: b.subjects || [],
          cover_url: cover,
          download_count: b.download_count,
          can_read_online: true,
          text_url: textUrl,
          html_url: htmlUrl,
        };
      });

      return {
        total: data.count || results.length,
        books: results,
      };
    } catch (err) {
      console.warn('Gutendex network search failed or timed out, using curated list:', err.message);
      return {
        total: this.getCuratedBooks().length,
        books: this.getCuratedBooks(),
      };
    }
  }

  /**
   * Clean raw HTML text, restore drop-caps, strip tags and decode HTML entities
   */
  cleanText(rawHtml) {
    if (!rawHtml) return '';
    let raw = rawHtml;
    // Replace drop-cap image with alt text (e.g. <img alt="M" ...> -> "M")
    raw = raw.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*>/gi, '$1');
    // Remove page numbers {12}, {ix}, etc.
    raw = raw.replace(/<span[^>]*class=["'][^"']*pagenum[^"']*["'][\s\S]*?<\/span>/gi, '');
    raw = raw.replace(/\{[0-9ivxlcdm]+\}/gi, '');
    // Strip HTML tags
    let text = raw.replace(/<[^>]+>/g, '');
    // Decode HTML entities
    text = text
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&ldquo;|&rdquo;/g, '"')
      .replace(/&lsquo;|&rsquo;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8212;/g, '—')
      .replace(/&#8211;/g, '–')
      .replace(/&#8220;|&#8221;/g, '"')
      .replace(/&#8216;|&#8217;/g, "'");
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Parse book chapters from Gutenberg HTML format
   */
  parseHtmlBook(html, id) {
    let chapters = [];

    // 1. Try matching explicit <div class="chapter"> or <section class="chapter">
    const chapterDivMatches = [...html.matchAll(/<(?:div|section)[^>]*class=["'][^"']*\bchapter\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi)];
    if (chapterDivMatches.length > 1) {
      let chapNum = 1;
      for (const m of chapterDivMatches) {
        const cHtml = m[1];
        const hMatch = cHtml.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
        let title = hMatch ? this.cleanText(hMatch[1]) : `Bab ${chapNum}`;
        // Skip Table of Contents
        if (/contents|table of contents|illustrations/i.test(title)) continue;

        const pMatches = [...cHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
        const paragraphs = pMatches
          .map(p => this.cleanText(p[1]))
          .filter(p => p.length > 5 && !p.startsWith('{') && !p.startsWith('[Illustration'));

        if (paragraphs.length === 0) continue;

        const wordCount = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
        chapters.push({
          chapter_number: chapNum++,
          title: title || `Bab ${chapNum - 1}`,
          paragraphs,
          word_count: wordCount,
        });
      }
    }

    // 2. If div.chapter did not yield sufficient chapters, parse using heading tags (h1, h2, h3)
    if (chapters.length <= 1) {
      chapters = [];
      const headings = [...html.matchAll(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi)];
      const chaptersMeta = [];

      headings.forEach(h => {
        const raw = this.cleanText(h[2]);
        if (!raw) return;
        if (/the full project gutenberg|contents|table of contents|preface|illustrations|title|ebook|license|transcriber/i.test(raw)) return;

        // Match Chapter X, Letter X, Part X, Act X, Stave X, Roman Numerals
        const chapMatch = raw.match(/^(?:chapter|letter|act|scene|stave|part|story)\s*([ivxlcdm\d]+.*)/i) ||
                          raw.match(/(?:chapter|letter|act|scene|stave|part|story)\s*([ivxlcdm\d]+.*)/i) ||
                          raw.match(/^([ivxlcdm]+)[.:\s]?$/i) ||
                          raw.match(/^([ivxlcdm]+)\.\s+[A-Za-z]/i);

        if (chapMatch) {
          let title = raw;
          const chapIdx = raw.search(/(?:CHAPTER|Chapter|Letter|Part|Act|Scene)\s*[IVXLCDM\d]+/i);
          if (chapIdx > 0) {
            title = raw.substring(chapIdx).trim();
          }
          chaptersMeta.push({
            title,
            index: h.index,
            endIndex: h.index + h[0].length,
          });
        }
      });

      let chapNum = 1;
      for (let i = 0; i < chaptersMeta.length; i++) {
        const current = chaptersMeta[i];
        const next = chaptersMeta[i + 1];
        const startIndex = current.endIndex;
        const endIndex = next ? next.index : html.indexOf('*** END OF THE PROJECT GUTENBERG', startIndex);
        const chunkHtml = html.substring(startIndex, endIndex !== -1 ? endIndex : html.length);

        const pMatches = [...chunkHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
        const paragraphs = pMatches
          .map(p => this.cleanText(p[1]))
          .filter(p => p.length > 5 && !p.startsWith('{') && !p.startsWith('[Illustration'));

        if (paragraphs.length === 0) continue;

        const wordCount = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
        chapters.push({
          chapter_number: chapNum++,
          title: current.title,
          paragraphs,
          word_count: wordCount,
        });
      }
    }

    // 3. Fallback: chunk paragraphs if no chapter markers found
    if (chapters.length === 0) {
      const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
      const allParagraphs = pMatches.map(p => this.cleanText(p[1])).filter(p => p.length > 25);
      const chunkSize = 25;
      let chapNum = 1;
      for (let i = 0; i < allParagraphs.length; i += chunkSize) {
        const chunk = allParagraphs.slice(i, i + chunkSize);
        chapters.push({
          chapter_number: chapNum++,
          title: `Bagian ${chapNum - 1}`,
          paragraphs: chunk,
          word_count: chunk.join(' ').split(/\s+/).filter(Boolean).length,
        });
      }
    }

    return chapters;
  }

  /**
   * Parse book chapters from raw plain text format (robust fallback)
   */
  parsePlainTextBook(plainText) {
    let body = plainText;
    const startMarkers = [
      '*** START OF THE PROJECT GUTENBERG EBOOK',
      '*** START OF THIS PROJECT GUTENBERG EBOOK',
      '***START OF THE PROJECT GUTENBERG EBOOK',
    ];
    const endMarkers = [
      '*** END OF THE PROJECT GUTENBERG EBOOK',
      '*** END OF THIS PROJECT GUTENBERG EBOOK',
      '***END OF THE PROJECT GUTENBERG EBOOK',
    ];

    for (const sm of startMarkers) {
      const idx = body.indexOf(sm);
      if (idx !== -1) {
        const lineEnd = body.indexOf('\n', idx);
        body = body.substring(lineEnd !== -1 ? lineEnd + 1 : idx + sm.length);
        break;
      }
    }

    for (const em of endMarkers) {
      const idx = body.indexOf(em);
      if (idx !== -1) {
        body = body.substring(0, idx);
        break;
      }
    }

    body = body.trim();

    // Split paragraphs by two or more newlines, joining single newline wrapped lines
    const rawBlocks = body.split(/\r?\n\s*\r?\n/).map(b => b.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);

    // Group into readable chapters of ~1500 words
    const chapters = [];
    const chunkSize = 20;
    let chapNum = 1;

    for (let i = 0; i < rawBlocks.length; i += chunkSize) {
      const chunk = rawBlocks.slice(i, i + chunkSize);
      chapters.push({
        chapter_number: chapNum++,
        title: `Bagian ${chapNum - 1}`,
        paragraphs: chunk,
        word_count: chunk.join(' ').split(/\s+/).filter(Boolean).length,
      });
    }

    return chapters;
  }

  /**
   * Fetch, clean, and parse book chapters for direct in-browser reading
   */
  async getBookContent(gutenbergId) {
    const id = parseInt(gutenbergId);
    if (!id || isNaN(id)) {
      throw new Error('ID buku Gutenberg tidak valid.');
    }

    const cacheFile = path.join(CACHE_DIR, `${id}.json`);

    // 1. Check local disk cache (verify that it has actual content and not empty chapters)
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        const hasValidChapters = cached.chapters && cached.chapters.length > 0 &&
          cached.chapters.every(c => c.paragraphs && c.paragraphs.length > 0 && c.word_count > 30);
        if (hasValidChapters) {
          return cached;
        }
        console.warn(`Cache for #${id} was incomplete or fragmented. Re-parsing fresh copy.`);
      } catch (e) {
        console.warn(`Failed reading cache for Gutenberg ID ${id}:`, e.message);
      }
    }

    // 2. Fetch HTML version first (most structured and complete)
    let chapters = [];
    const curatedMeta = this.getCuratedBooks().find(b => b.gutenberg_id === id);
    let bookTitle = curatedMeta?.title || `Karya Klasik #${id}`;
    let authorName = curatedMeta?.author || 'Penulis Project Gutenberg';

    const htmlUrls = [
      `https://www.gutenberg.org/cache/epub/${id}/pg${id}-images.html`,
      `https://www.gutenberg.org/cache/epub/${id}/pg${id}.html.utf8`,
      `https://www.gutenberg.org/files/${id}/${id}-h/${id}-h.htm`,
    ];

    for (const url of htmlUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AksaraLoka/2.0' },
        });
        clearTimeout(timeout);

        if (res.ok) {
          const html = await res.text();
          // Extract metadata from HTML if not in curated
          if (!curatedMeta) {
            const titleMatch = html.match(/<meta[^>]*name=["']dc\.title["'][^>]*content=["']([^"']*)["']/i) ||
                               html.match(/<span[^>]*id=["']pg-title-no-subtitle["'][^>]*>([\s\S]*?)<\/span>/i) ||
                               html.match(/<title>([\s\S]*?)<\/title>/i);
            const authorMatch = html.match(/<meta[^>]*name=["']dc\.creator["'][^>]*content=["']([^"']*)["']/i) ||
                                html.match(/<p class=["']author["']>([\s\S]*?)<\/p>/i);
            if (titleMatch) bookTitle = this.cleanText(titleMatch[1]);
            if (authorMatch) authorName = this.cleanText(authorMatch[1]).replace(/(.*),\s*(.*)/, '$2 $1');
          }

          chapters = this.parseHtmlBook(html, id);
          if (chapters.length > 0) {
            break;
          }
        }
      } catch (err) {
        // try next html URL
      }
    }

    // 3. Fallback: If HTML failed, fetch plain text
    if (chapters.length === 0) {
      const textUrls = [
        `https://www.gutenberg.org/ebooks/${id}.txt.utf-8`,
        `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
        `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
      ];

      for (const url of textUrls) {
        try {
          const res = await fetch(url, {
            headers: { 'User-Agent': 'AksaraLoka/2.0' },
          });
          if (res.ok) {
            const rawText = await res.text();
            chapters = this.parsePlainTextBook(rawText);
            if (chapters.length > 0) break;
          }
        } catch (err) {
          // try next
        }
      }
    }

    if (chapters.length === 0) {
      throw new Error(`Tidak dapat memuat naskah buku Gutenberg #${id}. Silakan periksa koneksi internet.`);
    }

    const result = {
      gutenberg_id: id,
      title: bookTitle,
      author: authorName,
      language: curatedMeta?.language || 'English',
      cover_url: curatedMeta?.cover_url || `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
      total_chapters: chapters.length,
      chapters,
      source: 'Project Gutenberg (Open Access, public-apis/public-apis)',
    };

    // 4. Save to disk cache
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(result), 'utf-8');
      console.log(`[Gutenberg] Cached book #${id} to disk (${chapters.length} chapters, complete text).`);
    } catch (e) {
      console.warn('Failed saving cache:', e.message);
    }

    return result;
  }
}

export default new GutenbergService();
