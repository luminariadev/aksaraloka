# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MyLibrary** adalah website perpustakaan digital dengan tema **claymorphism** yang menampilkan:
- Halaman utama dengan daftar buku terbaru
- Halaman pencarian dan filter buku
- Detail buku lengkap
- Dashboard admin untuk CRUD buku
- Desain responsif yang optimal pada semua perangkat
- Backend REST API dengan Express.js + PostgreSQL
- Frontend React + Tailwind CSS dengan custom claymorphism theme

## Architecture Overview

### Client (Frontend)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS dengan custom claymorphism design system
- **Routing**: React Router DOM
- **State Management**: React hooks + Context API
- **API Client**: Axios with interceptors
- **Theme**: Custom claymorphism colors and shadows
- **Build Tool**: Vite (bundler + dev server)

### Server (Backend)
- **Framework**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Raw queries (managed by `pg` client)
- **Validation**: express-validator middleware
- **Error Handling**: Custom error handler with structured responses
- **Security**: Helmet, CORS, Morgan
- **Environment Variables**: dotenv with .env files
- **Testing**: Not implemented yet

### Database
- **Schema**: PostgreSQL with `database/schema.sql`
- **Tables**: `books`, `categories`
- **Features**: UUID primary keys, timestamps, indexes for search

## Development Workflow

### Getting Started

1. **Clone the repository**
2. **Install dependencies** (after Node 18 is installed):
   - Backend: `cd server && npm install`
   - Frontend: `cd client && npm install`

3. **Initialize database**:
   - Make sure PostgreSQL is running
   - Run SQL schema: `psql -f database/schema.sql`
   - Seed data: `npm run db:seed` (from server directory)

4. **Start development servers**:
   ```bash
   # In one terminal (server):
   cd server
   npm run dev

   # In another terminal (client):
   cd client
   npm run dev

   # Or use tmux sessions:
   tmux new-session "cd server && npm run dev" \\
                      "cd client && npm run dev"
   ```

### Available Scripts

#### Backend (server/)
- `npm run dev`: Run with watch mode
- `npm start`: Start production server
- `npm run db:seed`: Load sample data

#### Frontend (client/)
- `npm run dev`: Start Vite dev server (localhost:5173)
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm lint`: Lint code (ESLint)

#### Project-wide
- Run tests with Jest/Mocha (to be set up)
- Lint code with Prettier/ESLint
- Type check with TypeScript (if added)

### Code Conventions

#### Backend (server/src/)
- **File structure**:
  - `config/`: Database configuration
  - `controllers/`: Express controller logic
  - `models/`: Database models and queries
  - `middleware/`: Validation, error handling
  - `routes/`: Express router definitions

- **Coding style**:
  - Use ES6+ features (import/export, arrow functions)
  - Follow StandardJS/ESLint
  - Use async/await for database operations
  - Implement proper error handling and validation

#### Frontend (client/src/)
- **Component structure**:
  - `components/`: Reusable UI components (BookCard, SearchBar, BookForm, etc.)
  - `hooks/`: Custom React hooks (useBooks, useBook)
  - `services/`: API client
  - `pages/`: Page components
  - `layouts/`: Page layouts (if needed)
  - `styles/`: Global styles, claymorphism system

- **Component patterns**:
  - Use descriptive PascalCase for component names
  - Functional components with hooks
  - TypeScript interfaces (to be added)
  - Tailwind CSS classes
  - Responsive design classes
  - Accessibility features

#### Design System
- **Color system**: Claymorphism theme (clay-* palettes)
- **Radius**: Extra rounder corners (`rounded-2xl`, `rounded-3xl`, `rounded-full`)
- **Shadows**: Soft clay shadows (`shadow-clay`, `shadow-clay-hover`)
- **Typography**: Inter font for UI, Poppins for headings

### Testing Strategy

#### Backend Testing
- Use Jest + Supertest
- Test routes with validation middleware
- Test database queries with integration tests
- Mock PostgreSQL connections

#### Frontend Testing
- React Testing Library + Jest
- Component unit tests
- Integration tests for page flows
- Accessibility tests

### Deployment

#### Environment Variables
Backend (.env/server/.env):
```bash
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mylibrary
DB_USER=postgres
DB_PASSWORD=postgres
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Production Build
```bash
cd server && npm install  # backend dependencies
docker build -t mylibrary-server .
docker run -p 5000:5000 mylibrary-server

cd client && npm install && npm run build
docker build -t mylibrary-client .
docker run -p 5173:80 mylibrary-client
```

#### Docker
Dockerfile untuk masing-masing service (belum dibuat)

### Common Tasks

#### 1. Memulai project baru
```bash
# Clone dan setup
git clone <repo-url>
cd MyLibrary
cd server && npm install
cd ../client && npm install

# Initialize database
cd server
psql -f database/schema.sql
npm run db:seed

# Jalankan development
cd server && npm run dev
docker-compose up -d  # Jika docker-compose digunakan
```

#### 2. Menambahkan buku baru (admin)
1. Kunjungi `/admin`
2. Klik "Tambah Buku"
3. Isi form BookForm
4. Simpan

#### 3. Menyesuaikan tema claymorphism
Edit `client/tailwind.config.js`:
- Sesuaikan warna clay (clay-50...clay-900)
- Ubah radius (borderRadius)
- Sesuaikan shadow (clay shadows)

#### 4. Menjalankan single test (belum ada tests)
```bash
# Example when tests are set up
cd server
npm test -- --watch AllBooks.test.js
```

#### 5. Membersihkan caches
tailwindcss: `npm run build` (akan meng-generate CSS)
React: `rm -rf node_modules && npm install`
Database: Reset schema.sql

### Tips & Tricks

#### Frontend Performance
- Gunakan React.lazy dan Suspense untuk code splitting
- Optimize images (next/image atau local via vite
- Gunakan Debounced search untuk mencegah API call berulang

#### Backend Performance
- Tambahkan index untuk kolom pencarian yang sering digunakan
- Gunakan pagination (default 12 item per halaman)
- Gunakan connection pooling

#### Debugging
Backend:
```javascript
// Tambahkan logging
app.use(morgan('dev'));
database.query dengan console.log waktu eksekusi
```

Frontend:
```javascript
// Tambahkan error boundary
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Project-Specific Notes

1. **Tema claymorphism**:
   - Menggunakan warna pastel dan soft shadows
   - Border radius besar dan minimalis
   - Fokus pada kenyamanan visual dan estetika

2. **Database considerations**:
   - Search menggunakan ILIKE untuk case-insensitive
   - Index untuk title, author, isbn
   - Trigger auto-update untuk timestamp

3. **Security considerations**:
   - Validasi input di backend (express-validator)
   - Rate limiting (akan ditambahkan)
   - CORS configuration

4. **Responsive Design**:
   - Menggunakan Tailwind responsive prefixes (md:, lg:)
   - Mobile-first approach
   - Flexible grid system

### Resources
- Dokumentasi Tailwind CSS: https://tailwindcss.com/docs
- React Router: https://reactrouter.com/
- PostgreSQL Dokumentasi: https://www.postgresql.org/docs/

### Getting Help
Jika Anda mengalami kendala:
1. Jalankan `npm run lint` di client dan server
2. Cek console browser dan server
3. Lihat bagian error pada database query
4. Gunakan /help command untuk bantuan lebih lanjut

---

Terus dikembangkan dan disempurnakan! 🚀

**Version**: 1.0.0
**Created**: 2026-06-17
**Last Updated**: 2026-06-17