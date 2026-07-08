// js/api.js
import { TMDB_KEY, FREETOGAME_API, CORS_PROXY } from './config.js';

// Generic CORS proxy wrapper, used as a safety net for APIs with inconsistent
// browser CORS support (routes through a proxy that allows github.io origins).
function corsFetch(url) {
  return fetch(CORS_PROXY + encodeURIComponent(url));
}

let gameListCache = null;
let gameListCacheAt = 0;
const GAME_LIST_TTL = 10 * 60 * 1000; // 10 minutes

async function getFullGameList() {
  if (gameListCache && Date.now() - gameListCacheAt < GAME_LIST_TTL) return gameListCache;
  try {
    const r = await corsFetch(`${FREETOGAME_API}/games`);
    const list = await r.json();
    if (Array.isArray(list) && list.length) {
      gameListCache = list;
      gameListCacheAt = Date.now();
      return list;
    }
  } catch (e) { console.error('FreeToGame list fetch failed', e); }
  return gameListCache || [];
}

export async function getCandidates(type = 'movie') {
  if (type === 'game') return getGameCandidates();
  return getMovieOrTvCandidates(type);
}

async function getMovieOrTvCandidates(type) {
  const p1 = Math.floor(Math.random() * 20) + 1;
  const p2 = Math.floor(Math.random() * 200) + 1;
  if (type === 'tv') {
    const [r1, r2] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_KEY}&language=ru&page=${p1}`),
      fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_KEY}&language=ru&page=${p2}`)
    ]);
    const d1 = await r1.json();
    const d2 = await r2.json();
    let items = [
      ...(d1.results || []).map(i => ({ ...i, media_type: 'tv' })),
      ...(d2.results || []).map(i => ({ ...i, media_type: 'tv' }))
    ];
    return [...new Map(items.map(i => [i.id, i])).values()].slice(0, 30);
  }
  // default: movies
  const [r1, r2] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}&language=ru&page=${p1}`),
    fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_KEY}&language=ru&page=${p2}`)
  ]);
  const d1 = await r1.json();
  const d2 = await r2.json();
  let items = [
    ...(d1.results || []).map(i => ({ ...i, media_type: 'movie' })),
    ...(d2.results || []).map(i => ({ ...i, media_type: 'movie' }))
  ];
  return [...new Map(items.map(i => [i.id, i])).values()].slice(0, 30);
}

async function getGameCandidates() {
  const list = await getFullGameList();
  if (!list.length) return [];
  const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 30);
  return shuffled
    .filter(g => g.thumbnail)
    .map(g => ({ id: g.id, title: g.title, poster_path: g.thumbnail, media_type: 'game' }));
}

export async function fetchMovieDetails(mediaType, movieId) {
  if (mediaType === 'game') return fetchGameDetails(movieId);
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

export async function fetchGameDetails(gameId) {
  try {
    const r = await corsFetch(`${FREETOGAME_API}/game?id=${gameId}`);
    const d = await r.json();
    if (!d || !d.id) return null;
    return {
      overview: d.short_description || (d.description || '').slice(0, 400),
      genres: [d.genre, d.platform].filter(Boolean),
      released: (d.release_date || '').slice(0, 4),
      rating: null
    };
  } catch (e) {
    console.error('FreeToGame details fetch failed', e);
    return null;
  }
}
