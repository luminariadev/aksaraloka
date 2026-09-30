import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mylibrary',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const sampleCategories = [
  'Fiksi',
  'Non-Fiksi',
  'Teknologi',
  'Sains',
  'Sejarah',
  'Biografi',
  'Pendidikan',
  'Novel',
  'Komik',
  'Referensi',
];

const sampleBooks = [
  {
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    isbn: '978-979-20-5969-4',
    description: 'Novel tentang perjuangan anak-anak di Belitong untuk mendapatkan pendidikan yang layak.',
    category_id: 1,
    published_year: 2005,
    pages: 529,
    language: 'Indonesia',
    stock: 5,
  },
  {
    title: 'Bumi',
    author: 'Tere Liye',
    isbn: '978-602-08-8149-2',
    description: 'Petualangan Raib, Ali, dan Seli melintasi dimensi untuk menyelamatkan bumi.',
    category_id: 1,
    published_year: 2014,
    pages: 440,
    language: 'Indonesia',
    stock: 3,
  },
  {
    title: 'Filosofi Tutan',
    author: 'Dewi Lestari',
    isbn: '978-602-29-1133-7',
    description: 'Perjalanan spiritual yang menggabungkan sains dan filosofi.',
    category_id: 1,
    published_year: 2018,
    pages: 380,
    language: 'Indonesia',
    stock: 4,
  },
  {
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    isbn: '978-979-42-0364-9',
    description: 'Novel pertama tetralogi Buru yang menceritakan kehidupan Minke.',
    category_id: 1,
    published_year: 1980,
    pages: 432,
    language: 'Indonesia',
    stock: 2,
  },
  {
    title: 'Pemrograman Web dengan React',
    author: 'Joko Susilo',
    isbn: '978-602-00-0000-1',
    description: 'Panduan lengkap belajar React.js dari dasar hingga mahir.',
    category_id: 3,
    published_year: 2022,
    pages: 350,
    language: 'Indonesia',
    stock: 6,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn: '978-0-06-231609-7',
    description: 'Sejarah singkat umat manusia dari zaman batu hingga era digital.',
    category_id: 2,
    published_year: 2014,
    pages: 512,
    language: 'Inggris',
    stock: 4,
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    isbn: '978-1-4516-4853-9',
    description: 'Biografi pendiri Apple Inc., Steve Jobs.',
    category_id: 6,
    published_year: 2011,
    pages: 656,
    language: 'Inggris',
    stock: 2,
  },
  {
    title: 'Ensiklopedia Sains',
    author: 'Dr. Ahmad Fauzi',
    isbn: '978-602-00-0000-2',
    description: 'Ensiklopedia lengkap tentang berbagai ilmu pengetahuan alam.',
    category_id: 4,
    published_year: 2020,
    pages: 800,
    language: 'Indonesia',
    stock: 3,
  },
  {
    title: 'Sejarah Nusantara',
    author: 'Slamet Muljana',
    isbn: '978-602-00-0000-3',
    description: 'Ringkasan sejarah Indonesia dari kerajaan-kerajaan hingga modern.',
    category_id: 5,
    published_year: 2019,
    pages: 600,
    language: 'Indonesia',
    stock: 2,
  },
  {
    title: 'Belajar JavaScript Modern',
    author: 'Eko Kurniawan',
    isbn: '978-602-00-0000-4',
    description: 'Panduan praktis belajar JavaScript ES6+ untuk pemula.',
    category_id: 3,
    published_year: 2023,
    pages: 280,
    language: 'Indonesia',
    stock: 8,
  },
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('[Seed] Starting database seed...');

    // Start transaction
    await client.query('BEGIN');

    // Check if categories already exist
    const catCheck = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(catCheck.rows[0].count) > 0) {
      console.log('[Seed] Categories already exist, skipping category seed');
    } else {
      console.log('[Seed] Seeding categories...');
      for (const name of sampleCategories) {
        await client.query('INSERT INTO categories (name) VALUES ($1)', [name]);
      }
      console.log(`[Seed] ${sampleCategories.length} categories seeded`);
    }

    // Check if books already exist
    const bookCheck = await client.query('SELECT COUNT(*) FROM books');
    if (parseInt(bookCheck.rows[0].count) > 0) {
      console.log('[Seed] Books already exist, skipping book seed');
    } else {
      console.log('[Seed] Seeding books...');
      for (const book of sampleBooks) {
        const query = `
          INSERT INTO books (title, author, isbn, description, category_id, published_year, pages, language, stock)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        const values = [
          book.title,
          book.author,
          book.isbn,
          book.description,
          book.category_id,
          book.published_year,
          book.pages,
          book.language,
          book.stock,
        ];
        await client.query(query, values);
      }
      console.log(`[Seed] ${sampleBooks.length} books seeded`);
    }

    await client.query('COMMIT');
    console.log('[Seed] Database seeding completed successfully.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed] Error seeding database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seed if this file is executed directly
seedDatabase().catch(() => process.exit(1));

export default seedDatabase;