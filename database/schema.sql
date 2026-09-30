-- ====================================================================
-- AksaraLoka — Skema Database PostgreSQL / Supabase Resmi
-- "Semesta Aksara & Arsip Pengetahuan Terbuka"
-- ====================================================================

-- 1. Tabel Kategori Buku
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Koleksi Buku & Naskah Digital
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

CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_condition ON books(physical_condition);

-- 3. Tabel Pengguna Sistem (3 Peran: ADMIN, LIBRARIAN, MEMBER)
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 4. Tabel Sirkulasi Peminjaman & Pengembalian
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

CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- 5. Tabel Catatan Pembacaan Digital
CREATE TABLE IF NOT EXISTS reading_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    last_page INTEGER DEFAULT 1,
    progress_percent NUMERIC(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Pengaturan Sistem Perpustakaan
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Trigger Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_books_updated_at ON books;
CREATE TRIGGER trg_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- SEED DATA AWAL (Opsional / Default AksaraLoka)
-- ====================================================================

-- Kategori Default
INSERT INTO categories (name) VALUES
    ('Fiksi'), ('Non-Fiksi'), ('Teknologi'), ('Sains'),
    ('Sejarah'), ('Biografi'), ('Pendidikan'), ('Novel'),
    ('Komik'), ('Referensi')
ON CONFLICT (name) DO NOTHING;

-- Pengaturan Default Instansi
INSERT INTO settings (key, value, description) VALUES
    ('fine_per_day', '1000', 'Besaran denda keterlambatan pengembalian buku per hari (Rp)'),
    ('max_borrow_limit', '3', 'Batas maksimal buku fisik yang dapat dipinjam secara bersamaan'),
    ('loan_duration_days', '14', 'Durasi masa peminjaman standar (hari)'),
    ('library_name', 'AksaraLoka Pustaka & Arsip', 'Nama resmi instansi perpustakaan')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Akun Preset Awal (Password: password123)
INSERT INTO users (member_code, name, email, password_hash, phone, role, is_active) VALUES
    ('ADM-001', 'Budi Santoso (Admin Sistem)', 'admin@mylibrary.local', 'password123', '08123456789', 'ADMIN', 1),
    ('LIB-001', 'Siti Rahmah, S.I.Pust (Pustakawan)', 'pustakawan@mylibrary.local', 'password123', '081298765432', 'LIBRARIAN', 1),
    ('MBR-2026-001', 'Rizkia Nuari (Anggota)', 'rizkia@example.com', 'password123', '08987654321', 'MEMBER', 1)
ON CONFLICT (email) DO NOTHING;
