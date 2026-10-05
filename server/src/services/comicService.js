import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.resolve(__dirname, '../../data/comic_cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

class ComicService {
  /**
   * Pre-curated list of famous manga & webcomics with guaranteed open-access readable pages
   * via MangaDex API (public-apis/public-apis) & XKCD
   */
  getCuratedComics() {
    return [
      {
        id: 'd90ea6cb-7bc3-4d80-8af0-28557e6c4e17',
        title: 'Dungeon Meshi (Delicious in Dungeon)',
        author: 'Ryoko Kui',
        category: 'Komik & Manga',
        genre: 'Fantasi, Petualangan & Kuliner',
        year: 2014,
        language: 'Bahasa Indonesia & Multilingual',
        cover_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
        description: 'Petualangan Laios dan rekannya menjelajahi kedalaman dungeon labirin berbahaya, sambil memasak monster-monster ajaib untuk bertahan hidup demi menyelamatkan adik perempuannya.',
        default_chapter_id: '50e137b0-8800-4731-9f9f-09e0a05a8d4d',
        total_pages: 24,
        is_manga: true,
      },
      {
        id: 'ea47525d-99df-45b5-9103-dd853f49f8c3',
        title: 'Mairimashita! Iruma-kun (If Mafia)',
        author: 'Osamu Nishi',
        category: 'Komik & Manga',
        genre: 'Aksi, Komedi & Shounen',
        year: 2023,
        language: 'Bahasa Indonesia',
        cover_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600',
        description: 'Spin-off resmi bernuansa aksi mafia alternatif dari kisah Iruma Suzuki yang diadopsi oleh klan iblis Babyls dengan gaya visual penuh karisma.',
        default_chapter_id: '15408a04-58a3-4903-b09e-7360216bbaf5',
        total_pages: 63,
        is_manga: true,
      },
      {
        id: '58be6aa6-06cb-4ca5-bd20-f1392ce451fb',
        title: 'Yotsuba to! (Yotsuba&!)',
        author: 'Kiyohiko Azuma',
        category: 'Komik & Manga',
        genre: 'Slice of Life & Komedi Hangat',
        year: 2003,
        language: 'Multilingual (English/Visual)',
        cover_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=600',
        description: 'Kisah harian gadis cilik berambut hijau Yotsuba Koiwai yang memandang dunia sekitar dengan penuh rasa takjub, keluguan, dan kegembiraan murni.',
        default_chapter_id: '7eb4a4d9-83bc-448f-8461-8255b9a79fa4',
        total_pages: 53,
        is_manga: true,
      },
      {
        id: '0d4b349e-b7a2-4d63-9ce0-f864e790c4a2',
        title: 'Veil',
        author: 'Kotteri!',
        category: 'Komik & Manga',
        genre: 'Seni Visual, Romansa & Estetika',
        year: 2019,
        language: 'English',
        cover_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
        description: 'Komik ilustrasi dengan estetika mode haute couture Eropa, mengisahkan dinamika seorang polisi kota dan wanita muda tuna netra dalam goresan seni yang memesona.',
        default_chapter_id: '06f6e812-70b1-4f95-a1c2-3e2b260f89ee',
        total_pages: 25,
        is_manga: true,
      },
      {
        id: 'a9dd451c-3c45-4d66-a818-4e1b78855838',
        title: 'Uma Musume - Cinderella Gray',
        author: 'Taiyou Kusumi',
        category: 'Komik & Manga',
        genre: 'Olahraga, Semangat & Perjuangan',
        year: 2020,
        language: 'Multilingual',
        cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
        description: 'Kisah inspiratif perjalanan Oguri Cap dari pedesaan Kasamatsu merintis jalan menuju panggung balap nasional dengan tekad baja.',
        default_chapter_id: 'ba65ae16-8326-4448-b4b6-e2a22be26df0',
        total_pages: 60,
        is_manga: true,
      },
      {
        id: 'b30dfee3-9d1d-4e8d-bfbe-8fcabc3c96f6',
        title: "JoJo's Bizarre Adventure: Steel Ball Run",
        author: 'Hirohiko Araki',
        category: 'Komik & Manga',
        genre: 'Aksi, Western & Fiksi Ilmiah',
        year: 2004,
        language: 'Multilingual',
        cover_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=600',
        description: 'Perlombaan berkuda lintas benua Amerika Serikat pada abad ke-19 dengan taruhan uang lima puluh juta dolar dan konspirasi mistis relik suci.',
        default_chapter_id: '4b049d5a-832d-4ff5-827c-0c1564ea4c6a',
        total_pages: 46,
        is_manga: true,
      },
      // === XKCD SCIENCE & TECH WEBCOMICS ===
      {
        id: 'xkcd-science',
        title: 'XKCD: Webcomic Sains & Komputer',
        author: 'Randall Munroe (NASA Ex-Roboticist)',
        category: 'Komik & Manga',
        genre: 'Sains, Matematika & Pemrograman',
        year: 2026,
        language: 'English',
        cover_url: 'https://imgs.xkcd.com/comics/standards.png',
        description: 'Komik strip sains, matematika, logika algoritma, dan lelucon teknologi paling tersohor di dunia karya mantan fisikawan robotik NASA Randall Munroe.',
        default_chapter_id: 'xkcd-latest',
        total_pages: 1,
        is_xkcd: true,
      },
    ];
  }

  /**
   * Fetch comic details and available chapters
   */
  async getComicDetail(comicId) {
    const curated = this.getCuratedComics().find(c => c.id === comicId);
    if (!curated) {
      throw new Error(`Komik #${comicId} tidak ditemukan.`);
    }

    // If XKCD
    if (curated.is_xkcd) {
      return {
        ...curated,
        chapters: [
          { id: 'xkcd-327', chapter_number: 1, title: 'Exploits of a Mom (Little Bobby Tables)', pages_count: 1 },
          { id: 'xkcd-927', chapter_number: 2, title: 'Standards (Universal Standard)', pages_count: 1 },
          { id: 'xkcd-149', chapter_number: 3, title: 'Sandwich (Sudo Make Me a Sandwich)', pages_count: 1 },
          { id: 'xkcd-303', chapter_number: 4, title: 'Compiling (Why Code Takes Time)', pages_count: 1 },
          { id: 'xkcd-latest', chapter_number: 5, title: 'Edisi Terkini (Latest Science Strip)', pages_count: 1 },
        ],
      };
    }

    // If MangaDex, fetch chapters from MangaDex feed
    try {
      const feedUrl = `https://api.mangadex.org/manga/${comicId}/feed?limit=20&order[chapter]=asc`;
      const res = await fetch(feedUrl, { headers: { 'User-Agent': 'AksaraLoka/2.0' } });
      const data = await res.json();

      const chapters = (data.data || [])
        .filter(c => c.attributes.pages > 0)
        .map((c, idx) => ({
          id: c.id,
          chapter_number: c.attributes.chapter || String(idx + 1),
          title: c.attributes.title ? `Bab ${c.attributes.chapter}: ${c.attributes.title}` : `Bab ${c.attributes.chapter || idx + 1}`,
          pages_count: c.attributes.pages,
          language: c.attributes.translatedLanguage,
        }));

      return {
        ...curated,
        chapters: chapters.length > 0 ? chapters : [
          {
            id: curated.default_chapter_id,
            chapter_number: '1',
            title: 'Bab 1 (Edisi Pembuka)',
            pages_count: curated.total_pages,
            language: curated.language,
          }
        ],
      };
    } catch (e) {
      return {
        ...curated,
        chapters: [
          {
            id: curated.default_chapter_id,
            chapter_number: '1',
            title: 'Bab 1 (Edisi Pembuka)',
            pages_count: curated.total_pages,
            language: curated.language,
          }
        ],
      };
    }
  }

  /**
   * Fetch chapter pages list (images URLs) for in-browser visual reading
   */
  async getChapterPages(chapterId) {
    if (!chapterId) throw new Error('ID bab komik wajib disertakan.');

    // Case 1: XKCD Special Webcomics
    if (chapterId.startsWith('xkcd-')) {
      const xkcdNum = chapterId === 'xkcd-latest' ? '' : chapterId.replace('xkcd-', '');
      const url = xkcdNum ? `https://xkcd.com/${xkcdNum}/info.0.json` : 'https://xkcd.com/info.0.json';
      try {
        const res = await fetch(url);
        const data = await res.json();
        return {
          chapter_id: chapterId,
          title: `XKCD #${data.num}: ${data.title}`,
          total_pages: 1,
          pages: [
            {
              page: 1,
              url: data.img,
              title: data.title,
              caption: data.alt,
              year: data.year,
            }
          ],
        };
      } catch (e) {
        // Fallback for offline/timeout
        return {
          chapter_id: chapterId,
          title: 'XKCD: Standar Teknologi',
          total_pages: 1,
          pages: [
            {
              page: 1,
              url: 'https://imgs.xkcd.com/comics/standards.png',
              title: 'Standards',
              caption: 'Now there are 15 competing standards.',
            }
          ],
        };
      }
    }

    // Case 2: MangaDex Chapter Pages
    let actualChapterId = chapterId;
    const isManga = this.getCuratedComics().find(c => c.id === chapterId);
    if (isManga) {
      try {
        const feedUrl = `https://api.mangadex.org/manga/${chapterId}/feed?limit=10&order[chapter]=asc`;
        const fRes = await fetch(feedUrl, { headers: { 'User-Agent': 'AksaraLoka/2.0' } });
        const fData = await fRes.json();
        const valid = (fData.data || []).find(c => c.attributes.pages > 0);
        if (valid) {
          actualChapterId = valid.id;
        }
      } catch (e) {}
    }

    const cacheFile = path.join(CACHE_DIR, `${actualChapterId}.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      } catch (e) {
        // ignore
      }
    }

    let atHomeUrl = `https://api.mangadex.org/at-home/server/${actualChapterId}`;
    let controller = new AbortController();
    let timeout = setTimeout(() => controller.abort(), 10000);

    let res = await fetch(atHomeUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AksaraLoka-Comic-Reader/2.0' },
    });
    clearTimeout(timeout);

    // If 404 and isManga wasn't checked, try to find matching manga and grab first valid chapter
    if (!res.ok && !isManga) {
      const matchManga = this.getCuratedComics().find(c => c.default_chapter_id === chapterId);
      if (matchManga) {
        try {
          const feedUrl = `https://api.mangadex.org/manga/${matchManga.id}/feed?limit=10&order[chapter]=asc`;
          const fRes = await fetch(feedUrl, { headers: { 'User-Agent': 'AksaraLoka/2.0' } });
          const fData = await fRes.json();
          const valid = (fData.data || []).find(c => c.attributes.pages > 0);
          if (valid) {
            actualChapterId = valid.id;
            atHomeUrl = `https://api.mangadex.org/at-home/server/${actualChapterId}`;
            res = await fetch(atHomeUrl, { headers: { 'User-Agent': 'AksaraLoka/2.0' } });
          }
        } catch (e) {}
      }
    }

    if (!res.ok) {
      throw new Error(`Server komik merespons status ${res.status}`);
    }

    const atHomeData = await res.json();
    const baseUrl = atHomeData.baseUrl;
    const hash = atHomeData.chapter.hash;
    const filenames = atHomeData.chapter.data || [];

    const pages = filenames.map((fn, idx) => ({
      page: idx + 1,
      url: `${baseUrl}/data/${hash}/${fn}`,
    }));

    const result = {
      chapter_id: chapterId,
      total_pages: pages.length,
      pages,
      source: 'MangaDex Open API (public-apis/public-apis)',
    };

    try {
      fs.writeFileSync(cacheFile, JSON.stringify(result), 'utf-8');
    } catch (e) {}

    return result;
  }
}

export default new ComicService();
