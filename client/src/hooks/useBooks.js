import { useState, useEffect, useCallback, useRef } from 'react';
import { booksAPI, categoriesAPI } from '../services/api';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category_id: '',
    format: 'all',
    sort_by: 'created_at',
    sort_order: 'DESC',
  });

  const isMountedRef = useRef(true);

  const fetchBooks = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
      const res = await booksAPI.getAll(params);
      if (isMountedRef.current) {
        setBooks(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || 'Gagal mengambil data buku');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.getAll();
      if (isMountedRef.current) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchBooks();
    return () => { isMountedRef.current = false; };
  }, [fetchBooks]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { books, categories, pagination, loading, error, filters, setFilters, refetch: fetchBooks };
}

export function useBook(id) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!id) return;

    isMountedRef.current = true;
    let cancelled = false;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await booksAPI.getById(id);
        if (!cancelled && isMountedRef.current) {
          setBook(res.data.data);
        }
      } catch (err) {
        if (!cancelled && isMountedRef.current) {
          setError(err.response?.data?.message || 'Gagal mengambil detail buku');
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false);
        }
      }
    };
    fetchBook();

    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [id]);

  return { book, loading, error };
}
