// js/api.js
import { TMDB_KEY } from './config.js';

export async function getCandidates() {
  const p1 = Math.floor(Math.random() * 20) + 1;
  const p2 = Math.floor(Math.random() * 200) + 1;
  const [r1, r2] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_KEY}&language=ru&page=${p1}`),
    fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_KEY}&language=ru&page=${p2}`)
  ]);
  const d1 = await r1.json();
  const d2 = await r2.json();
  let items = [
    ...(d1.results || []).filter(i => i.media_type === 'movie' || i.media_type === 'tv'),
    ...(d2.results || []).map(i => ({ ...i, media_type: 'movie' }))
  ];
  return [...new Map(items.map(i => [i.id, i])).values()].slice(0, 30);
}

export async function fetchMovieDetails(mediaType, movieId) {
  try {
    const r = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${TMDB_KEY}&language=ru`
    );
    const d = await r.json();
    return {
      overview: d.overview,
      genres: (d.genres || []).map(g => g.name),
      released: (d.release_date || d.first_air_date || '').slice(0, 4),
      rating: d.vote_average ? Math.round(d.vote_average * 10) / 10 : null
    };
  } catch {
    return null;
  }
}

// Live search across TMDB's full catalog, used by the collection catalog screen.
export async function searchTitles(query, mediaType) {
  const q = query.trim();
  if (!q) return [];
  const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
  try {
    const r = await fetch(
      `https://api.themoviedb.org/3/search/${endpoint}?api_key=${TMDB_KEY}&language=ru&query=${encodeURIComponent(q)}&page=1`
    );
    const d = await r.json();
    return (d.results || []).slice(0, 24).map(i => ({
      id: i.id,
      title: i.title || i.name || '—',
      poster_path: i.poster_path,
      media_type: endpoint
    }));
  } catch (e) {
    console.error('search failed', e);
    return [];
  }
}
