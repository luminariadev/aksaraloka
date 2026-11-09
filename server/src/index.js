import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import categoriesRouter from './routes/categories.js';
import loansRouter from './routes/loans.js';
import usersRouter from './routes/users.js';
import adminRouter from './routes/admin.js';
import openLibraryRouter from './routes/openLibrary.js';
import readerRouter from './routes/reader.js';
import comicsRouter from './routes/comics.js';
import { authenticate } from './middleware/auth.js';
import { getEngineStatus } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global authentication parser (extracts user if Bearer token present)
app.use(authenticate);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/open-library', openLibraryRouter);
app.use('/api/reader', readerRouter);
app.use('/api/comics', comicsRouter);
app.use('/api/books', booksRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/loans', loansRouter);
app.use('/api/users', usersRouter);

// System status & health check
app.get('/', (req, res) => {
  res.json({
    name: 'AksaraLoka API',
    version: '1.0.0',
    description: 'Semesta Aksara & Arsip Pengetahuan Terbuka',
    status: 'online',
    system: getEngineStatus(),
    documentation: 'https://github.com/luminariadev/aksaraloka',
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'AksaraLoka REST API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      books: '/api/books',
      categories: '/api/categories',
      loans: '/api/loans',
      users: '/api/users',
      admin: '/api/admin',
      comics: '/api/comics',
      reader: '/api/reader',
      openLibrary: '/api/open-library',
      health: '/api/health',
      systemStatus: '/api/system/status',
    },
  });
});

app.get('/api/system/status', (req, res) => {
  res.json({
    success: true,
    data: getEngineStatus(),
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    system: getEngineStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  const status = getEngineStatus();
  console.log(`[AksaraLoka] Server running on http://localhost:${PORT}`);
  console.log(`[Database] Active Engine: [${status.activeEngine.toUpperCase()}] (Mode: ${status.mode})`);
});

export default app;
