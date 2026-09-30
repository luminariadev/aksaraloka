import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const sqlitePath = path.join(dataDir, 'mylibrary_local.db');

let activeEngine = 'sqlite'; // 'postgres' | 'sqlite'
let pgPool = null;
let sqliteDb = null;

// Initialize SQLite database & tables
const initSqlite = () => {
  if (sqliteDb) return sqliteDb;

  sqliteDb = new DatabaseSync(sqlitePath);
  sqliteDb.exec('PRAGMA foreign_keys = ON;');

  // Schema creation
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT UNIQUE,
      description TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      cover_url TEXT,
      published_year INTEGER,
      pages INTEGER,
      language TEXT DEFAULT 'Indonesia',
      stock INTEGER DEFAULT 1,
      is_physical INTEGER DEFAULT 1,
      rack_location TEXT DEFAULT 'Rak A-1',
      is_digital INTEGER DEFAULT 0,
      ebook_url TEXT,
      ebook_format TEXT DEFAULT 'PDF',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_code TEXT UNIQUE,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      phone TEXT,
      role TEXT DEFAULT 'MEMBER',
      avatar_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_code TEXT UNIQUE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
      borrow_date TEXT,
      due_date TEXT,
      return_date TEXT,
      status TEXT DEFAULT 'ACTIVE',
      fine_amount INTEGER DEFAULT 0,
      fine_paid INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reading_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      book_id INTEGER,
      last_page INTEGER DEFAULT 1,
      progress_percent REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure default settings exist
  const countSettings = sqliteDb.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (countSettings.count === 0) {
    const sStmt = sqliteDb.prepare('INSERT INTO settings (key, value, description) VALUES (?, ?, ?)');
    sStmt.run('fine_per_day', '1000', 'Besaran denda keterlambatan pengembalian buku per hari (Rp)');
    sStmt.run('max_borrow_limit', '3', 'Batas maksimal buku fisik yang dapat dipinjam secara bersamaan');
    sStmt.run('loan_duration_days', '14', 'Durasi masa peminjaman standar (hari)');
    sStmt.run('library_name', 'AksaraLoka Pustaka & Arsip', 'Nama resmi instansi perpustakaan');
  }

  // Ensure 3 distinct roles exist in users table
  const libUser = sqliteDb.prepare("SELECT id FROM users WHERE email = 'pustakawan@mylibrary.local'").get();
  if (!libUser) {
    sqliteDb.prepare(`
      INSERT INTO users (member_code, name, email, password_hash, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('LIB-001', 'Siti Rahmah, S.I.Pust', 'pustakawan@mylibrary.local', 'password123', '081298765432', 'LIBRARIAN', 1);
  }

  // Update admin name for clarity
  sqliteDb.prepare("UPDATE users SET name = 'Budi Santoso (Admin Sistem)', role = 'ADMIN' WHERE email = 'admin@mylibrary.local'").run();

  // Add columns for Gutenberg full-text direct web reading if not present
  try { sqliteDb.exec("ALTER TABLE books ADD COLUMN gutenberg_id INTEGER;"); } catch (e) {}
  try { sqliteDb.exec("ALTER TABLE books ADD COLUMN readable_content TEXT;"); } catch (e) {}

  // Add columns for Physical Book Condition Tracking & Stock Opname if not present
  try { sqliteDb.exec("ALTER TABLE books ADD COLUMN physical_condition TEXT DEFAULT 'BAIK';"); } catch (e) {}
  try { sqliteDb.exec("ALTER TABLE books ADD COLUMN condition_notes TEXT;"); } catch (e) {}
  try { sqliteDb.exec("ALTER TABLE books ADD COLUMN last_inspected_at TEXT;"); } catch (e) {}

  // Auto seed if empty
  const countRow = sqliteDb.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (countRow.count === 0) {
    seedSqliteDefaults();
  }

  // Seed Gutenberg open-source books if not present
  ensureGutenbergClassicsSeeded();

  return sqliteDb;
};

// Default seed data for local offline usage
const seedSqliteDefaults = () => {
  console.log('[Database] Seeding initial data for local SQLite database...');

  const categories = [
    'Fiksi', 'Non-Fiksi', 'Teknologi', 'Sains',
    'Sejarah', 'Biografi', 'Pendidikan', 'Novel', 'Komik', 'Referensi'
  ];

  const catStmt = sqliteDb.prepare('INSERT INTO categories (name) VALUES (?)');
  for (const name of categories) {
    catStmt.run(name);
  }

  const sampleBooks = [
    {
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      isbn: '978-979-20-5969-4',
      description: 'Novel tentang perjuangan sepuluh anak di Belitong dalam meraih impian melalui pendidikan.',
      category_id: 1,
      published_year: 2005,
      pages: 529,
      language: 'Indonesia',
      stock: 5,
      is_physical: 1,
      rack_location: 'Rak Sastra A-01',
      is_digital: 1,
      ebook_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ebook_format: 'PDF',
      cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      isbn: '978-979-42-0364-9',
      description: 'Karya agung Tetralogi Buru yang merekam pergulatan batin Minke di era kolonial Hindia Belanda.',
      category_id: 1,
      published_year: 1980,
      pages: 432,
      language: 'Indonesia',
      stock: 3,
      is_physical: 1,
      rack_location: 'Rak Sastra A-02',
      is_digital: 1,
      ebook_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ebook_format: 'PDF',
      cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Pemrograman Web Modern dengan React',
      author: 'Joko Susilo',
      isbn: '978-602-00-0000-1',
      description: 'Panduan tuntas membangun aplikasi web berskala enterprise dengan React, Vite, dan Tailwind CSS.',
      category_id: 3,
      published_year: 2024,
      pages: 380,
      language: 'Indonesia',
      stock: 6,
      is_physical: 1,
      rack_location: 'Rak IT C-05',
      is_digital: 1,
      ebook_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ebook_format: 'PDF',
      cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Sapiens: Riwayat Singkat Umat Manusia',
      author: 'Yuval Noah Harari',
      isbn: '978-0-06-231609-7',
      description: 'Eksplorasi mendalam bagaimana biologi dan sejarah membentuk definisi kemanusiaan modern.',
      category_id: 2,
      published_year: 2014,
      pages: 512,
      language: 'Indonesia',
      stock: 4,
      is_physical: 1,
      rack_location: 'Rak Sains B-01',
      is_digital: 0,
      ebook_url: null,
      ebook_format: 'PDF',
      cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Steve Jobs',
      author: 'Walter Isaacson',
      isbn: '978-1-4516-4853-9',
      description: 'Biografi eksklusif tentang kehidupan inovator legendaris di balik revolusi Apple Inc.',
      category_id: 6,
      published_year: 2011,
      pages: 656,
      language: 'Inggris',
      stock: 2,
      is_physical: 1,
      rack_location: 'Rak Bio B-04',
      is_digital: 1,
      ebook_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ebook_format: 'PDF',
      cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Ensiklopedia Sains Modern',
      author: 'Dr. Ahmad Fauzi',
      isbn: '978-602-00-0000-2',
      description: 'Referensi komprehensif penemuan fisika, kimia, dan astronomi abad ke-21.',
      category_id: 4,
      published_year: 2023,
      pages: 820,
      language: 'Indonesia',
      stock: 3,
      is_physical: 1,
      rack_location: 'Rak Referensi D-01',
      is_digital: 0,
      ebook_url: null,
      ebook_format: 'PDF',
      cover_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'Buku Panduan E-Library & Riset Digital',
      author: 'Tim Pustakawan AksaraLoka',
      isbn: '978-602-99-9999-9',
      description: 'Panduan eksklusif anggota untuk mengakses jurnal digital dan repositori e-book perpustakaan.',
      category_id: 7,
      published_year: 2026,
      pages: 140,
      language: 'Indonesia',
      stock: 0,
      is_physical: 0,
      rack_location: 'Repositori Digital',
      is_digital: 1,
      ebook_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      ebook_format: 'PDF',
      cover_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const bookStmt = sqliteDb.prepare(`
    INSERT INTO books (
      title, author, isbn, description, category_id, cover_url,
      published_year, pages, language, stock, is_physical, rack_location,
      is_digital, ebook_url, ebook_format
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of sampleBooks) {
    bookStmt.run(
      b.title, b.author, b.isbn, b.description, b.category_id, b.cover_url,
      b.published_year, b.pages, b.language, b.stock, b.is_physical, b.rack_location,
      b.is_digital, b.ebook_url, b.ebook_format
    );
  }

  // Sample users (Admin & Members)
  const userStmt = sqliteDb.prepare(`
    INSERT INTO users (member_code, name, email, password_hash, phone, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  userStmt.run('ADM-001', 'Budi Santoso (Admin Sistem)', 'admin@mylibrary.local', 'password123', '08123456789', 'ADMIN', 1);
  userStmt.run('LIB-001', 'Siti Rahmah, S.I.Pust (Pustakawan)', 'pustakawan@mylibrary.local', 'password123', '081298765432', 'LIBRARIAN', 1);
  userStmt.run('MBR-2026-001', 'Rizkia Nuari (Anggota)', 'rizkia@example.com', 'password123', '08987654321', 'MEMBER', 1);

  // Sample active loan
  const loanStmt = sqliteDb.prepare(`
    INSERT INTO loans (loan_code, user_id, book_id, borrow_date, due_date, status, fine_amount, fine_paid, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  loanStmt.run(
    'TR-2603001', 2, 1,
    new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    'ACTIVE', 0, 0, 'Peminjaman di Meja Sirkulasi 1'
  );

  console.log('[Database] Local SQLite database initialized and seeded successfully.');
};

// Seed Gutenberg open-source books with direct in-browser reading capability
const ensureGutenbergClassicsSeeded = () => {
  if (!sqliteDb) return;

  // 1. Update Indonesian classics & catalog books with rich, full-length readable chapters
  const laskarPelangiChapters = JSON.stringify({
    chapters: [
      {
        chapter_number: 1,
        title: "Bab 1: Sepuluh Murid Baru di Tepian Gantong",
        paragraphs: [
          "Pagi itu, waktu masih amat pagi. Matahari baru saja mengirimkan semburat kemerahan di ufuk timur Belitong, menyinari kabut tipis yang menyelimuti dedaunan pohon filicium tua di pekarangan sekolah.",
          "Pak Harfan dan Bu Muslimah berdiri cemas di depan pintu reot SD Muhammadiyah Gantong. Hari itu adalah hari pertama pendaftaran murid baru tahun ajaran baru. Jika jumlah murid yang mendaftar tidak mencapai sepuluh orang, sekolah sederhana beratap seng berkarat dan bertiang kayu miring itu terancam ditutup selamanya oleh pengawas sekolah dari Departemen Pendidikan.",
          "Sembilan anak telah duduk gemetar di bangku-bangku kayu yang berderit. Di antara mereka ada Ikal, Lintang si anak nelayan pesisir yang menempuh perjalanan sepeda puluhan kilometer melintasi rawa buaya, Sahara satu-satunya murid perempuan berwatak keras, A Kiong anak Tionghoa yang selalu tersenyum tulus, Trapani yang tampan dan lekat pada ibunya, Kucai sang calon politisi cilik, Syahdan, Mahar yang eksentrik, dan Borek.",
          "Waktu terus bergulir hingga jarum jam dinding tua menunjukkan pukul sebelas siang. Ketegangan memuncak di wajah Bu Muslimah yang baru berusia lima belas tahun namun berhati seluas samudra.",
          "Tiba-tiba dari kejauhan, di ujung jalan setapak berpasir putih, seorang pria tua bertubuh ringkih menuntun seorang anak laki-laki dengan langkah gontai. Anak itu adalah Harun, seorang anak istimewa yang tersenyum riang membawa sebungkus daun pisang.",
          "\"Genap sepuluh! Murid kita genap sepuluh!\" seru Pak Harfan dengan suara bergetar dan pelupuk mata yang berkaca-kaca penuh rasa syukur.",
          "Maka dari bilik sekolah bersahaja itulah, kisah sepuluh anak yang kelak dinamai Laskar Pelangi resmi dimulai, mengukir janji suci untuk tidak pernah menyerah pada keterbatasan demi menyongsong masa depan."
        ]
      },
      {
        chapter_number: 2,
        title: "Bab 2: Lentera Cita-Cita di Tengah Kemiskinan Timah",
        paragraphs: [
          "Pulau Belitong adalah pulau terkaya di Indonesia dalam hal timah, namun sebagian besar warganya hidup dalam kemiskinan bersahaja.",
          "Perbedaan mencolok terlihat jelas antara kompleks perumahan Gedong milik PN Timah yang megah berpagar kawat rapi dengan perkampungan kuli tambang kami di Gantong. Di Gedong, anak-anak bersekolah di gedung megah dengan guru-guru lulusan universitas bergengsi, kolam renang, dan laboratorium lengkap. Di sekolah kami, kapur tulis adalah barang langka yang harus dihemat, dan papan tulis kami berlubang.",
          "Ketika musim hujan tiba, air menetes deras dari seng-seng atap yang bolong. Kami terpaksa menggeser bangku-bangku ke sudut ruangan yang kering sambil mengenakan jas hujan plastik atau memegang payung robek di dalam kelas.",
          "Namun Bu Muslimah selalu menatap mata kami dengan kehangatan luar biasa: \"Anak-anakku, hiduplah untuk memberi sebanyak-banyaknya, bukan untuk menerima sebanyak-banyaknya.\"",
          "Pesan itu tertanam lekat di sanubari kami, menjadi lentera yang membakar semangat belajar anak-anak Belitong melampaui segala keterbatasan ekonomi dan sosial."
        ]
      },
      {
        chapter_number: 3,
        title: "Bab 3: Jenius dari Pesisir Rawa Batang",
        paragraphs: [
          "Di antara kami semua, Lintang adalah keajaiban yang nyata. Anak seorang nelayan miskin dari pesisir Tanjong Pandan itu harus mengayuh sepeda berkarat tanpa rem sejauh empat puluh kilometer setiap hari, pergi dan pulang, hanya untuk belajar di sekolah reyot kami.",
          "Jalur yang dilaluinya bukanlah jalan aspal mulus, melainkan jalan setapak berpasir yang membelah lebatnya hutan karet dan rawa-rawa Batang yang dihuni buaya ganas. Suatu hari rantai sepedanya putus berkali-kali dan disambung dengan kawat jemuran, namun wajahnya tak pernah menyiratkan keluhan.",
          "Di dalam kelas, ketajaman otak Lintang mencengangkan siapa saja. Soal-soal matematika paling rumit dari buku tebal Pak Harfan diselesaikannya dalam sekejap mata dengan metode yang bahkan tidak pernah terpikirkan oleh orang dewasa.",
          "Ketika lomba cerdas cermat antarsekolah diadakan di kota kabupaten, tim SD Muhammadiyah yang dipimpin Lintang berhadapan dengan sekolah elite PN Timah yang selama puluhan tahun tak terkalahkan.",
          "Dengan ketenangan seorang pertapa dan kecepatan kilat seorang jenius, Lintang menuntaskan pertanyaan demi pertanyaan fisika dan matematika, mengantarkan sekolah kami meraih piala kejuaraan dan mematahkan arogansi sekolah feodal di pulau itu."
        ]
      },
      {
        chapter_number: 4,
        title: "Bab 4: Nyanyian Mahar dan Keajaiban Seni",
        paragraphs: [
          "Jika Lintang adalah perwujudan akal budi, maka Mahar adalah denyut jiwa seni kami.",
          "Mahar adalah anak kurus berambut ikal yang tak pernah lepas dari radio transistor tua pemberian kakeknya. Ia memuja seni pertunjukan dan ritme musik tradisional Afrika serta Melayu kuno.",
          "Ketika karnaval tujuh belas Agustus tiba di kota, sekolah kami yang miskin selalu menjadi bahan tertawaan karena tidak mampu menyewa kostum drum band atau baju adat yang mahal.",
          "Namun Mahar memiliki gagasan gila: ia mengumpulkan buah bintaro kering dari tepi hutan, menumbuk arang untuk cat tubuh, dan menyusun koreografi tarian perang suku Masai yang spektakuler. Sepuluh anak Laskar Pelangi menari dengan gairah purba di sepanjang jalan raya kota, menghipnotis ribuan pasang mata penonton dan dewan juri.",
          "Hari itu, sekolah termiskin di Belitong membawa pulang piala terindah karnaval budaya, membuktikan bahwa imajinasi dan ketulusan selalu lebih berharga daripada kemewahan materi."
        ]
      }
    ]
  });

  const bumiManusiaChapters = JSON.stringify({
    chapters: [
      {
        chapter_number: 1,
        title: "Bab 1: Suatu Masa di Wonokromo",
        paragraphs: [
          "Minke—nama yang diberikan oleh seorang guru Belanda—adalah seorang pemuda pribumi terpelajar di H.B.S. Surabaya pada pengujung abad ke-19.",
          "Dunia kolonial menempatkan kaum pribumi sebagai warga kelas bawah yang dipandang sebelah mata, namun pena dan pemikiran Minke menolak untuk tunduk begitu saja pada nasib yang dipaksakan.",
          "Hari itu, Robert Suurhof, seorang kawan sekolah yang sombong, mengajaknya bertandang ke Boerderij Buitenzorg di Wonokromo, sebuah perkebunan luas yang dipimpin oleh seorang wanita pribumi yang disegani dan dibicarakan banyak orang: Nyai Ontosoroh.",
          "Di rumah megah berdinding kayu jati berarsitektur perpaduan Jawa dan Eropa itulah, untuk pertama kalinya Minke bersitatap dengan Annelies Mellema, seorang gadis berdarah campuran Indo-Eropa dengan mata teduh laksana telaga yang kelak mengubah garis hidupnya selamanya.",
          "Kecantikan Annelies yang rapuh berpadu dengan ketegasan ibunya menghadirkan pesona yang belum pernah Minke jumpai di dunia salon-salon priyayi manapun."
        ]
      },
      {
        chapter_number: 2,
        title: "Bab 2: Pribumi Berhati Merdeka",
        paragraphs: [
          "Pertemuannya dengan Nyai Ontosoroh membongkar segala prasangka dan doktrin kolonial yang selama ini dicekokkan pada Minke tentang kedudukan kaum gundik.",
          "Wanita pribumi itu berbicara dalam bahasa Belanda yang fasih, menguasai pembukuan modern, memimpin ratusan pekerja perkebunan besar dengan wibawa dan keteguhan yang melampaui kebanyakan tuan-tuan kulit putih.",
          "Minke duduk terpukau menyimak kisah hidup Nyai: bagaimana ia dijual oleh ayah kandungnya sendiri demi selembar jabatan juru tulis, lalu bangkit dari kehinaan dan belajar membaca, menulis, serta berdagang secara otodidak dari Herman Mellema.",
          "\"Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran, apalagi dalam perbuatan,\" ujar Nyai Ontosoroh dengan nada suara yang tenang namun menghunjam sanubari.",
          "Kata-kata itu membakar jiwa Minke, meneguhkan tekadnya untuk menulis dan mengangkat suara penderitaan bangsanya di hadapan hukum kolonial yang congkak."
        ]
      },
      {
        chapter_number: 3,
        title: "Bab 3: Goresan Pena Melawan Arus",
        paragraphs: [
          "Minke mulai menulis artikel-artikel kritis di koran-koran berbahasa Belanda dengan nama samaran Max Tollenaar.",
          "Tulisannya membedah ketimpangan perlakuan hukum antara warga berkulit putih dengan kaum bumi putera. Artikel-artikelnya mengguncang kalangan elit Surabaya dan Hindia Belanda, memicu perdebatan sengit tentang hak-hak kemanusiaan.",
          "Di saat yang sama, ancaman hukum kolonial mulai membayangi keluarga Wonokromo menyusul kematian misterius Herman Mellema di rumah bordil Babah Ah Tjong.",
          "Minke menyadari bahwa kecerdasan dan statusnya sebagai siswa H.B.S. tidak serta-merta melindunginya dari arogansi hukum kolonial yang dirancang untuk membela kepentingan penguasa kulit putih semata."
        ]
      },
      {
        chapter_number: 4,
        title: "Bab 4: Kita Telah Melawan, Sehormat-hormatnya",
        paragraphs: [
          "Pengadilan putih akhirnya menjatuhkan putusan kejam: perkawinan Minke dan Annelies dianggap tidak sah menurut hukum Hindia Belanda karena Annelies masih di bawah umur dan di bawah perwalian keluarga Mellema di Belanda.",
          "Annelies dipaksa berlayar ke negeri Belanda yang dingin, direnggut paksa dari pelukan ibu kandung dan suaminya oleh aparat kolonial bersenjata lengkap.",
          "Minke berdiri terpaku di dermaga Tanjung Perak, merasakan kepedihan yang menyayat kalbu melihat kapal uap perlahan menjauh membawa separuh jiwanya.",
          "Namun di sampingnya, Nyai Ontosoroh menggenggam tangannya erat-erat, menatap cakrawala dengan kepala tegak tanpa setetes pun air mata cengeng:",
          "\"Kita telah melawan, Minke. Kita telah melawan sebaik-baiknya, sehormat-hormatnya!\"",
          "Kalimat pamungkas itu menutup babak awal perjuangan Minke, melahirkan seorang pejuang pena yang pantang menyerah menegakkan martabat bangsanya."
        ]
      }
    ]
  });

  const webModernChapters = JSON.stringify({
    chapters: [
      {
        chapter_number: 1,
        title: "Bab 1: Evolusi Arsitektur Web Modern",
        paragraphs: [
          "Pengembangan aplikasi web telah mengalami pergeseran paradigma yang luar biasa selama satu dekade terakhir.",
          "Dari era laman statis berbasis server-rendered HTML tradisional menuju Single Page Applications (SPA), arsitektur modern menuntut keandalan tinggi, performa kilat, dan pengalaman pengguna (UX) yang mendekati aplikasi desktop asli.",
          "Ekosistem React yang dikembangkan oleh Meta telah menjadi standar industri berkat pendekatan komponen deklaratif dan arsitektur uni-directional data flow yang mudah diprediksi.",
          "Dalam bab ini, kita akan membedah fondasi siklus hidup rendering web modern, peranan Virtual DOM, dan bagaimana build tooling seperti Vite mengubah efisiensi pengembangan perangkat lunak."
        ]
      },
      {
        chapter_number: 2,
        title: "Bab 2: Manajemen State dan Pola Komponen",
        paragraphs: [
          "Jantung dari setiap aplikasi web yang kompleks adalah bagaimana state dikelola dan disinkronkan antar komponen.",
          "React Hooks seperti useState, useEffect, useCallback, dan useMemo memungkinkan kita memisahkan logika bisnis dari lapisan tampilan visual secara bersih dan modular.",
          "Kita juga akan mengkaji kapan harus menggunakan Context API lokal versus solusi state global seperti Redux Toolkit atau Zustand untuk menghindari masalah prop drilling yang merepotkan.",
          "Penerapan prinsip Single Responsibility Principle (SRP) pada pembuatan komponen UI memastikan basis kode tetap mudah diuji dan dikembangkan dalam jangka panjang."
        ]
      },
      {
        chapter_number: 3,
        title: "Bab 3: Desain Sistem dan Tipografi Editorial",
        paragraphs: [
          "Desain antarmuka bukan sekadar mempercantik tampilan luar, melainkan tentang menciptakan kejelasan hierarki informasi dan kenyamanan interaksi pengguna.",
          "Dalam buku ini, kita mengintegrasikan Tailwind CSS dengan prinsip-prinsip tipografi editorial klasik: rasio kontras warna yang nyaman di mata, proporsi font serif dan sans-serif yang terukur, serta ruang negatif (whitespace) yang lega.",
          "Penerapan tema ganda (Light, Sepia, Dark) memberikan fleksibilitas kepada pengguna untuk memilih kenyamanan membaca sesuai dengan kondisi pencahayaan lingkungan sekitar.",
          "Setiap tombol, form input, dan kartu informasi dirancang dengan transisi mikro yang halus sehingga interaksi terasa responsif dan berbobot."
        ]
      }
    ]
  });

  const filosofiTerasChapters = JSON.stringify({
    chapters: [
      {
        chapter_number: 1,
        title: "Bab 1: Menemukan Ketenangan di Tengah Hiruk Pikuk",
        paragraphs: [
          "Pernahkah Anda merasa cemas berlebihan memikirkan masa depan, atau merasa sakit hati karena komentar orang lain di media sosial?",
          "Kecemasan, kekhawatiran, dan amarah adalah emosi-emosi purba yang sering kali membajak kewarasan manusia modern. Namun, lebih dari dua ribu tahun yang lalu di Yunani Kuno dan Kekaisaran Romawi, sekelompok filsuf telah menemukan panduan praktis untuk mencapai kedamaian batin.",
          "Filosofi Stoisisme—atau yang dalam bahasa Indonesia kita sebut sebagai Filosofi Teras—bukanlah sekadar teori abstrak di menara gading. Ini adalah 'kotak perkakas mental' yang dirancang untuk membantu manusia tangguh menghadapi cobaan hidup sehari-hari.",
          "Tokoh-tokoh utamanya berasal dari latar belakang yang sangat kontras: Epictetus adalah seorang budak yang pincang, Seneca adalah seorang penasihat kaisar dan penulis kaya, sementara Marcus Aurelius adalah seorang kaisar penguasa peradaban terbesar dunia."
        ]
      },
      {
        chapter_number: 2,
        title: "Bab 2: Dikotomi Kendali: Kunci Kemerdekaan Batin",
        paragraphs: [
          "Fondasi utama dari Filosofi Teras berpijak pada satu prinsip sederhana namun revolusioner: Dikotomi Kendali (The Dichotomy of Control).",
          "Menurut Epictetus, segala hal di alam semesta ini terbagi menjadi dua kategori: hal-hal yang berada di bawah kendali kita, dan hal-hal yang berada di luar kendali kita.",
          "Yang berada di bawah kendali kita secara mutlak hanyalah: pikiran kita sendiri, opini kita, tindakan kita, dan bagaimana kita merespons peristiwa.",
          "Sebaliknya, opini orang lain, reputasi, cuaca, kemacetan, kondisi ekonomi, dan hasil akhir dari suatu ikhtiar berada di luar kendali langsung kita.",
          "Penderitaan batin manusia modern hampir selalu berakar pada satu kekeliruan fatal: kita menggantungkan kebahagiaan kita pada hal-hal yang tidak bisa kita kendalikan, sambil mengabaikan satu-satunya hal yang sepenuhnya ada dalam kekuasaan kita, yaitu respons batin kita sendiri."
        ]
      },
      {
        chapter_number: 3,
        title: "Bab 3: Mengelola Persepsi dan Amor Fati",
        paragraphs: [
          "Marcus Aurelius menulis dalam catatannya: \"Bukan hal-hal di luar diri kita yang menyakiti kita, melainkan pertimbangan dan penilaian yang kita buat sendiri atas hal-hal tersebut.\"",
          "Ketika sebuah musibah menimpa kita, peristiwa itu sendiri bersifat netral secara moral. Rasa sakit atau amarah lahir dari narasi internal yang kita ciptakan dalam pikiran kita.",
          "Stoisisme mengajarkan kita untuk mempraktikkan 'Amor Fati'—mencintai takdir apa pun yang datang menghampiri. Bukan sekadar pasrah atau menyerah secara fatalis, melainkan memeluk setiap rintangan sebagai bahan bakar untuk melatih ketabahan, kejujuran, dan kebajikan.",
          "Sebagaimana api membakar kayu yang dilemparkan kepadanya dan mengubahnya menjadi nyala api yang kian benderang, demikian pula jiwa yang terlatih mengubah setiap kesulitan menjadi peluang untuk tumbuh."
        ]
      }
    ]
  });

  try {
    sqliteDb.prepare("UPDATE books SET readable_content = ? WHERE id = 1").run(laskarPelangiChapters);
    sqliteDb.prepare("UPDATE books SET readable_content = ? WHERE id = 2").run(bumiManusiaChapters);
    sqliteDb.prepare("UPDATE books SET readable_content = ? WHERE id = 3").run(webModernChapters);
    const checkFilosofi = sqliteDb.prepare("SELECT id FROM books WHERE title LIKE '%Filosofi Teras%'").get();
    if (checkFilosofi) {
      sqliteDb.prepare("UPDATE books SET readable_content = ? WHERE id = ?").run(filosofiTerasChapters, checkFilosofi.id);
    }
    // Seed realistic physical book conditions for stock opname audit
    sqliteDb.prepare(`
      UPDATE books 
      SET physical_condition = 'BAIK', 
          condition_notes = 'Kondisi jilidan rapi, kertas bersih, barcode fisik terbaca jelas.',
          last_inspected_at = '2026-09-28' 
      WHERE id = 1
    `).run();

    sqliteDb.prepare(`
      UPDATE books 
      SET physical_condition = 'RUSAK_RINGAN', 
          condition_notes = 'Sudut sampul kanan bawah sedikit terlipat, seluruh halaman lengkap terbaca.',
          last_inspected_at = '2026-09-29' 
      WHERE id = 2
    `).run();

    sqliteDb.prepare(`
      UPDATE books 
      SET physical_condition = 'BAIK', 
          condition_notes = 'Eksemplar baru tahun 2024, dalam kondisi prima di Rak IT.',
          last_inspected_at = '2026-10-01' 
      WHERE id = 3
    `).run();

    sqliteDb.prepare(`
      UPDATE books 
      SET physical_condition = 'PERBAIKAN', 
          condition_notes = 'Punggung buku sedikit renggang, sedang dalam perbaikan lem di meja konservasi.',
          last_inspected_at = '2026-10-02' 
      WHERE id = 4
    `).run();
  } catch (e) {
    // ignore
  }

  // 2. Insert Gutenberg classics if not present
  const checkPride = sqliteDb.prepare("SELECT id FROM books WHERE gutenberg_id = 1342").get();
  if (!checkPride) {
    const insertStmt = sqliteDb.prepare(`
      INSERT INTO books (
        title, author, isbn, description, category_id, cover_url,
        published_year, pages, language, stock, is_physical, rack_location,
        is_digital, ebook_url, ebook_format, gutenberg_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      'Pride and Prejudice',
      'Jane Austen',
      'PG-1342',
      'Karya sastra klasik dunia tentang cinta, kedudukan sosial, dan pergulatan antara prasangka dan keangkuhan di Inggris era Victoria. Naskah lengkap tersedia langsung di peramban web.',
      1,
      'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
      1813,
      432,
      'English',
      3,
      1,
      'Rak Klasik Gutenberg G-01',
      1,
      'https://www.gutenberg.org/ebooks/1342.html.images',
      'HTML/TEXT',
      1342
    );

    insertStmt.run(
      'Frankenstein; or, The Modern Prometheus',
      'Mary Wollstonecraft Shelley',
      'PG-84',
      'Fiksi ilmiah pertama di dunia tentang ambisi Victor Frankenstein yang melahirkan makhluk ciptaan bernasib tragis. Naskah lengkap dapat dibaca langsung di E-Reader.',
      4,
      'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
      1818,
      280,
      'English',
      2,
      1,
      'Rak Sains & Fiksi G-02',
      1,
      'https://www.gutenberg.org/ebooks/84.html.images',
      'HTML/TEXT',
      84
    );

    insertStmt.run(
      "Alice's Adventures in Wonderland",
      'Lewis Carroll',
      'PG-11',
      'Petualangan surealis Alice yang jatuh ke dalam lubang kelinci dan menjelajahi negeri ajaib penuh teka-teki logika. Lengkap dan siap dibaca online.',
      1,
      'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',
      1865,
      192,
      'English',
      4,
      1,
      'Rak Sastra Anak G-03',
      1,
      'https://www.gutenberg.org/ebooks/11.html.images',
      'HTML/TEXT',
      11
    );

    insertStmt.run(
      'The Adventures of Sherlock Holmes',
      'Arthur Conan Doyle',
      'PG-1661',
      'Koleksi dua belas kisah investigasi detektif paling terkenal di dunia bersama Sherlock Holmes dan Dr. Watson di 221B Baker Street. Dapat dibaca langsung di browser.',
      1,
      'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
      1892,
      350,
      'English',
      5,
      1,
      'Rak Misteri G-04',
      1,
      'https://www.gutenberg.org/ebooks/1661.html.images',
      'HTML/TEXT',
      1661
    );

    console.log('[Gutenberg] Project Gutenberg open-source classics seeded into database with full direct web reading.');
  }
};

// Check PostgreSQL if requested
// Auto-create & verify PostgreSQL / Supabase schema
const ensurePostgresSchema = async (pool) => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(50) UNIQUE,
        description TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        cover_url TEXT,
        published_year INTEGER,
        pages INTEGER,
        language VARCHAR(50) DEFAULT 'Indonesia',
        stock INTEGER DEFAULT 1,
        is_physical SMALLINT DEFAULT 1,
        rack_location VARCHAR(100) DEFAULT 'Rak A-01',
        is_digital SMALLINT DEFAULT 0,
        ebook_url TEXT,
        ebook_format VARCHAR(20) DEFAULT 'PDF',
        gutenberg_id INTEGER,
        readable_content TEXT,
        physical_condition VARCHAR(30) DEFAULT 'BAIK',
        condition_notes TEXT,
        last_inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        member_code VARCHAR(50) UNIQUE,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        role VARCHAR(30) DEFAULT 'MEMBER',
        avatar_url TEXT,
        is_active SMALLINT DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        loan_code VARCHAR(50) UNIQUE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        borrow_date DATE NOT NULL,
        due_date DATE NOT NULL,
        return_date DATE,
        status VARCHAR(30) DEFAULT 'ACTIVE',
        fine_amount INTEGER DEFAULT 0,
        fine_paid INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reading_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        last_page INTEGER DEFAULT 1,
        progress_percent NUMERIC(5,2) DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure columns exist on books if table was pre-existing
    const colsToAdd = [
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS gutenberg_id INTEGER;',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS readable_content TEXT;',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS physical_condition VARCHAR(30) DEFAULT \'BAIK\';',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS condition_notes TEXT;',
      'ALTER TABLE books ADD COLUMN IF NOT EXISTS last_inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;'
    ];
    for (const alterSql of colsToAdd) {
      try { await client.query(alterSql); } catch (e) {}
    }

    // Default settings
    await client.query(`
      INSERT INTO settings (key, value, description) VALUES
        ('fine_per_day', '1000', 'Besaran denda keterlambatan pengembalian buku per hari (Rp)'),
        ('max_borrow_limit', '3', 'Batas maksimal buku fisik yang dapat dipinjam secara bersamaan'),
        ('loan_duration_days', '14', 'Durasi masa peminjaman standar (hari)'),
        ('library_name', 'AksaraLoka Pustaka & Arsip', 'Nama resmi instansi perpustakaan')
      ON CONFLICT (key) DO NOTHING;
    `);

    // Ensure default users exist
    await client.query(`
      INSERT INTO users (member_code, name, email, password_hash, phone, role, is_active) VALUES
        ('ADM-001', 'Budi Santoso (Admin Sistem)', 'admin@mylibrary.local', 'password123', '08123456789', 'ADMIN', 1),
        ('LIB-001', 'Siti Rahmah, S.I.Pust (Pustakawan)', 'pustakawan@mylibrary.local', 'password123', '081298765432', 'LIBRARIAN', 1),
        ('MBR-2026-001', 'Rizkia Nuari (Anggota)', 'rizkia@example.com', 'password123', '08987654321', 'MEMBER', 1)
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('[Database] PostgreSQL/Supabase schema & default accounts verified.');
  } finally {
    client.release();
  }
};

// Check PostgreSQL if requested
const tryConnectPostgres = async () => {
  const isPostgresPreferred = process.env.DB_ENGINE === 'postgres' || !!process.env.DATABASE_URL;
  if (!isPostgresPreferred) {
    activeEngine = 'sqlite';
    initSqlite();
    return;
  }

  try {
    const isCloudUrl = process.env.DATABASE_URL && (
      process.env.DATABASE_URL.includes('supabase') ||
      process.env.DATABASE_URL.includes('aws') ||
      process.env.DATABASE_URL.includes('render') ||
      process.env.DATABASE_URL.includes('pooler')
    );

    const config = process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          connectionTimeoutMillis: 8000,
          ssl: isCloudUrl || process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME || 'mylibrary',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          connectionTimeoutMillis: 8000,
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        };

    const testPool = new pg.Pool(config);
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();

    pgPool = testPool;
    activeEngine = 'postgres';
    console.log('[Database] Connected to PostgreSQL/Supabase database engine successfully.');

    // Ensure schema exists on connected database
    await ensurePostgresSchema(testPool);
  } catch (err) {
    console.warn(`[Database] PostgreSQL unavailable (${err.message}). Falling back to local SQLite engine.`);
    activeEngine = 'sqlite';
    initSqlite();
  }
};

// Start default initialization
await tryConnectPostgres();

/**
 * Universal Query Adapter:
 * Seamlessly handles PostgreSQL and SQLite queries with uniform response format
 * { rows: [...], rowCount: number }
 */
export const query = async (sqlText, params = []) => {
  const start = Date.now();
  const sanitizedParams = (params || []).map(p => p === undefined ? null : p);

  if (activeEngine === 'postgres' && pgPool) {
    const res = await pgPool.query(sqlText, sanitizedParams);
    return res;
  }

  // SQLite execution
  const db = initSqlite();

  // Convert $1, $2, ... to ? and ILIKE to LIKE
  let sqliteSql = sqlText
    .replace(/\$\d+/g, '?')
    .replace(/\bILIKE\b/gi, 'LIKE');

  const trimmed = sqliteSql.trim();
  const isSelect = /^SELECT\b/i.test(trimmed);
  const hasReturning = /\bRETURNING\b/i.test(trimmed);

  try {
    const stmt = db.prepare(sqliteSql);

    if (isSelect || hasReturning) {
      const rows = stmt.all(...sanitizedParams);
      return {
        rows,
        rowCount: rows.length,
        duration: Date.now() - start,
      };
    } else {
      const info = stmt.run(...sanitizedParams);
      return {
        rows: [],
        rowCount: info.changes || 0,
        lastInsertRowid: info.lastInsertRowid,
        duration: Date.now() - start,
      };
    }
  } catch (err) {
    console.error('SQLite execution error on query:', sqliteSql, 'Params:', sanitizedParams, 'Error:', err.message);
    throw err;
  }
};

export const getClient = async () => {
  if (activeEngine === 'postgres' && pgPool) {
    return await pgPool.connect();
  }
  return {
    query: (text, params) => query(text, params),
    release: () => {},
  };
};

export const getEngineStatus = () => {
  return {
    activeEngine,
    mode: activeEngine === 'sqlite' ? 'offline_local' : 'online_cloud',
    sqlitePath: activeEngine === 'sqlite' ? sqlitePath : null,
    isPostgresConnected: activeEngine === 'postgres',
    timestamp: new Date().toISOString(),
  };
};

export default {
  query,
  getClient,
  getEngineStatus,
};
