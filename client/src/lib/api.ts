const API_BASE_URL = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data as T;
}

export async function registerUser(payload: { username: string; email: string; password: string }) {
  return request<{ token: string; user: { id: string; username: string; email: string } }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request<{ token: string; user: { id: string; username: string; email: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutUser() {
  return request<{ message: string }>('/auth/logout', { method: 'POST' });
}

export async function getMovies(page: number = 1) {
  return request<{ results: any[], page: number, total_pages: number }>(`/movies?page=${page}`);
}

export async function getTrendingMovies() {
  return request<any[]>('/movies/trending');
}

export async function getMovieById(id: string) {
  return request<any>(`/movies/${id}`);
}

export async function searchMovies(query: string, page: number = 1) {
  return request<{ results: any[], page: number, total_pages: number }>(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`);
}

export async function getGenres() {
  return request<{ name: string }[]>('/genres');
}

export async function getWatchlist() {
  return request<{ items: string[] }>('/watchlist');
}

export async function addToWatchlist(movieId: string) {
  return request<{ items: string[] }>('/watchlist', {
    method: 'POST',
    body: JSON.stringify({ movieId }),
  });
}

export async function removeFromWatchlist(movieId: string) {
  return request<{ items: string[] }>(`/watchlist/${movieId}`, { method: 'DELETE' });
}

export async function getRating(movieId: string) {
  return request<{ average: number; userRating: number | null }>(`/ratings/${movieId}`);
}

export async function submitRating(movieId: string, score: number) {
  return request<{ average: number; userRating: number }>('/ratings', {
    method: 'POST',
    body: JSON.stringify({ movieId, score }),
  });
}

export async function getCurrentUser() {
  return request<{ user: { id: string; email: string } }>('/users/me');
}

// ─── Series ──────────────────────────────────────────────────────────────────
export async function getSeries(page: number = 1) {
  return request<{ results: any[], page: number, total_pages: number }>(`/series?page=${page}`);
}

export async function getTrendingSeries() {
  return request<any[]>('/series/trending');
}

export async function getSeriesById(id: string) {
  return request<any>(`/series/${id}`);
}

export async function searchSeries(query: string, page: number = 1) {
  return request<{ results: any[], page: number, total_pages: number }>(`/series/search?q=${encodeURIComponent(query)}&page=${page}`);
}
