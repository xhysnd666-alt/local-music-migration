import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import netease from 'NeteaseCloudMusicApi';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const PORT = Number(process.env.PORT || 8787);
const HOST = '127.0.0.1';
const REDIRECT_URI = `http://${HOST}:${PORT}/callback`;
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-modify-private',
].join(' ');
const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const SPOTIFY_API = 'https://api.spotify.com/v1';

fs.mkdirSync(DATA_DIR, { recursive: true });

const statePath = path.join(DATA_DIR, 'state.json');
const sourcePath = path.join(DATA_DIR, 'source.json');
const planPath = path.join(DATA_DIR, 'plan.json');
const appliedPath = path.join(DATA_DIR, 'applied.json');
const matchProgressPath = path.join(DATA_DIR, 'match-progress.jsonl');

let neteaseCookie = '';
let neteaseAccount = null;
let spotifyAuth = null;
let spotifyUser = null;
let source = null;
let plan = null;
let applied = null;

function loadJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function saveJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(temp, file);
}

function persistState() {
  saveJson(statePath, {
    neteaseCookie,
    neteaseAccount,
    spotifyAuth,
    spotifyUser,
  });
}

function restoreState() {
  const state = loadJson(statePath, {});
  neteaseCookie = state.neteaseCookie || '';
  neteaseAccount = state.neteaseAccount || null;
  spotifyAuth = state.spotifyAuth || null;
  spotifyUser = state.spotifyUser || null;
  source = loadJson(sourcePath);
  plan = loadJson(planPath);
  applied = loadJson(appliedPath);
}

restoreState();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(Object.fromEntries(new URLSearchParams(data)));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendText(res, status, text, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(text);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, pathname) {
  const decoded = decodeURIComponent(pathname);
  const rel = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    sendText(res, 403, 'Forbidden');
    return true;
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return false;
  }
  const ext = path.extname(file).toLowerCase();
  sendText(res, 200, fs.readFileSync(file), MIME[ext] || 'application/octet-stream');
  return true;
}

function neteaseBody(result) {
  return (result && result.body) ?? result ?? {};
}

function cookieOf(result) {
  if (!result) return '';
  if (typeof result.cookie === 'string') return result.cookie;
  if (Array.isArray(result.cookie)) return result.cookie.join('; ');
  if (typeof result.body?.cookie === 'string') return result.body.cookie;
  return '';
}

async function neteaseCall(fn, query = {}) {
  const result = await fn({ ...query, cookie: neteaseCookie });
  const cookie = cookieOf(result);
  if (cookie) {
    neteaseCookie = mergeCookie(neteaseCookie, cookie);
  }
  return neteaseBody(result);
}

function mergeCookie(current, incoming) {
  if (!incoming) return current;
  const out = {};
  for (const part of `${current}; ${incoming}`.split(';')) {
    const eq = part.indexOf('=');
    if (eq > 0) out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return Object.entries(out)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

async function neteaseQrKey() {
  const body = await neteaseCall(netease.login_qr_key);
  return body?.data?.unikey;
}

async function neteaseQrCreate(key) {
  const body = await neteaseCall(netease.login_qr_create, { key, qrimg: true });
  return body?.data || {};
}

async function neteaseQrCheck(key) {
  const result = await netease.login_qr_check({ key, cookie: neteaseCookie });
  const cookie = cookieOf(result);
  if (cookie) neteaseCookie = mergeCookie(neteaseCookie, cookie);
  const body = neteaseBody(result);
  return { code: body?.code, body };
}

async function neteaseAccountInfo() {
  const body = await neteaseCall(netease.user_account);
  const profile = body?.profile || {};
  const account = body?.account || {};
  const uid = profile.userId || account.id;
  if (!uid) throw new Error('网易云登录状态已失效，请重新扫码。');
  neteaseAccount = {
    uid: String(uid),
    nickname: profile.nickname || account.userName || String(uid),
  };
  return neteaseAccount;
}

async function neteaseLikedIds(uid) {
  const body = await neteaseCall(netease.likelist, { uid });
  const ids = body?.ids || body?.data?.ids || [];
  return ids.map(String);
}

async function neteasePlaylists(uid) {
  const out = [];
  let offset = 0;
  const limit = 1000;
  for (;;) {
    const body = await neteaseCall(netease.user_playlist, { uid, limit, offset });
    const page = body?.playlist || [];
    out.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }
  return out;
}

async function neteaseSongs(trackIds, job, delay) {
  const ordered = trackIds.map(String);
  const unique = [...new Set(ordered)];
  const map = new Map();
  for (let i = 0; i < unique.length; i += 100) {
    if (job?.cancelled) throw new Error('已取消');
    const chunk = unique.slice(i, i + 100);
    const body = await neteaseCall(netease.song_detail, { ids: chunk.join(',') });
    for (const song of body?.songs || []) {
      if (song?.id != null) map.set(String(song.id), song);
    }
    if (delay > 0) await sleep(delay);
  }
  const tracks = [];
  const unavailable = [];
  for (const id of ordered) {
    const song = map.get(id);
    if (!song?.name) {
      if (!unavailable.includes(id)) unavailable.push(id);
      continue;
    }
    const album = song.al || song.album || {};
    tracks.push({
      id,
      name: song.name || '',
      artists: (song.ar || song.artists || []).map((a) => a.name).filter(Boolean),
      album: album.name || '',
      duration_ms: song.dt || song.duration || 0,
      netease_url: `https://music.163.com/song?id=${id}`,
    });
  }
  return { tracks, unavailable };
}

async function runNeteaseExport(job) {
  job.progress = { done: 0, total: 0, message: '读取网易云账号信息' };
  const account = await neteaseAccountInfo();
  const likedIds = await neteaseLikedIds(account.uid);
  job.progress.message = `读取喜欢歌曲（${likedIds.length} 首）`;
  const liked = await neteaseSongs(likedIds, job, 80);

  const raw = await neteasePlaylists(account.uid);
  const favoriteIds = new Set(
    raw.filter((p) => p.specialType === 5 && p.id != null).map((p) => String(p.id)),
  );
  const playlists = [];
  const failed = [];
  for (let index = 0; index < raw.length; index += 1) {
    if (job?.cancelled) throw new Error('已取消');
    const item = raw[index];
    const id = String(item.id || '');
    if (!id || favoriteIds.has(id)) continue;
    job.progress = {
      done: index + 1,
      total: raw.length,
      message: `导出歌单 ${index + 1}/${raw.length}：${item.name || id}`,
    };
    try {
      const detailBody = await neteaseCall(netease.playlist_detail, { id });
      const detail = detailBody?.playlist;
      if (!detail) throw new Error('歌单不存在');
      const trackIds = (detail.trackIds || [])
        .map((t) => (t?.id != null ? String(t.id) : ''))
        .filter(Boolean);
      const result = await neteaseSongs(trackIds, job, 80);
      const creatorId = String(detail.creator?.userId || '');
      playlists.push({
        id,
        name: item.name || detail.name || `Playlist ${id}`,
        kind: detail.subscribed || (creatorId && creatorId !== account.uid)
          ? 'collected'
          : 'created',
        track_count: trackIds.length,
        tracks: result.tracks,
        unavailable_track_ids: result.unavailable,
      });
    } catch (err) {
      if (String(err?.status || err?.code || '').includes('404')) {
        failed.push({ id, name: item.name || id, reason: String(err?.message || err) });
      } else {
        throw err;
      }
    }
  }
  source = {
    schema_version: 1,
    source: 'netease',
    exported_at: new Date().toISOString(),
    user: account,
    liked: {
      id: [...favoriteIds][0] || 'liked',
      name: '我喜欢的音乐',
      track_count: likedIds.length,
      tracks: liked.tracks,
      unavailable_track_ids: liked.unavailable,
    },
    playlists,
    failed_playlists: failed,
  };
  saveJson(sourcePath, source);
  return sourceSummary();
}

function sourceSummary() {
  if (!source) return null;
  const tracks =
    (source.liked?.tracks?.length || 0) +
    (source.playlists || []).reduce((sum, p) => sum + (p.tracks?.length || 0), 0);
  const unique = new Set();
  for (const t of source.liked?.tracks || []) unique.add(t.id);
  for (const p of source.playlists || []) {
    for (const t of p.tracks || []) unique.add(t.id);
  }
  return {
    liked: source.liked?.tracks?.length || 0,
    playlists: source.playlists?.length || 0,
    total_entries: tracks,
    unique_tracks: unique.size,
    failed_playlists: source.failed_playlists?.length || 0,
  };
}

function loadMatchProgress(sourceKey) {
  const map = new Map();
  if (!fs.existsSync(matchProgressPath)) return map;
  const lines = fs.readFileSync(matchProgressPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.source_key === sourceKey && entry.id && entry.result) {
        map.set(String(entry.id), entry.result);
      }
    } catch {
      // Ignore a partial trailing line after an interrupted write.
    }
  }
  return map;
}

function appendMatchProgress(sourceKey, id, result) {
  const line = JSON.stringify({ source_key: sourceKey, id: String(id), result }) + '\n';
  fs.appendFileSync(matchProgressPath, line, 'utf8');
}

function cacheStatsForTracks(tracks, cache) {
  const ids = new Set((tracks || []).map((track) => String(track.id)));
  const stats = { cached: 0, matched: 0, review: 0, unmatched: 0 };
  for (const id of ids) {
    const result = cache.get(id);
    if (!result) continue;
    stats.cached += 1;
    if (result.status === 'matched') stats.matched += 1;
    else if (result.status === 'review') stats.review += 1;
    else stats.unmatched += 1;
  }
  return stats;
}

function buildSourceTrackIndex() {
  const index = new Map();
  const add = (playlistName, tracks) => {
    for (const track of tracks || []) {
      const id = String(track.id);
      if (!index.has(id)) index.set(id, { track, playlists: new Set() });
      index.get(id).playlists.add(playlistName);
    }
  };
  add(source?.liked?.name || '我喜欢的音乐', source?.liked?.tracks);
  for (const playlist of source?.playlists || []) add(playlist.name, playlist.tracks);
  return index;
}

function base64Url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(bytes = 32) {
  return base64Url(crypto.randomBytes(bytes));
}

const pendingSpotify = new Map();

function spotifyLoginUrl(clientId) {
  const verifier = randomString(64);
  const challenge = base64Url(crypto.createHash('sha256').update(verifier).digest());
  const state = randomString(24);
  pendingSpotify.set(state, { verifier, clientId, createdAt: Date.now() });
  const query = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  return `${SPOTIFY_ACCOUNTS}/authorize?${query.toString()}`;
}

async function spotifyTokenRequest(form) {
  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(form),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Spotify 令牌请求失败（${res.status}）：${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function completeSpotifyLogin(code, state) {
  const pending = pendingSpotify.get(state);
  pendingSpotify.delete(state);
  if (!pending) throw new Error('Spotify 授权状态已过期，请重新发起登录。');
  const token = await spotifyTokenRequest({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: pending.clientId,
    code_verifier: pending.verifier,
  });
  spotifyAuth = {
    clientId: pending.clientId,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + Number(token.expires_in || 3600) * 1000 - 60000,
  };
  await ensureSpotifyToken();
  spotifyUser = await spotifyRequest('GET', '/me');
  persistState();
  return spotifyUser;
}

async function refreshSpotify() {
  if (!spotifyAuth?.refreshToken) throw new Error('Spotify 未登录。');
  const token = await spotifyTokenRequest({
    grant_type: 'refresh_token',
    refresh_token: spotifyAuth.refreshToken,
    client_id: spotifyAuth.clientId,
  });
  spotifyAuth.accessToken = token.access_token;
  spotifyAuth.expiresAt = Date.now() + Number(token.expires_in || 3600) * 1000 - 60000;
  if (token.refresh_token) spotifyAuth.refreshToken = token.refresh_token;
  persistState();
}

async function ensureSpotifyToken() {
  if (!spotifyAuth) throw new Error('Spotify 未登录。');
  if (Date.now() >= spotifyAuth.expiresAt) await refreshSpotify();
}

async function spotifyRequest(method, pathname, params, body, retry = true) {
  await ensureSpotifyToken();
  let url = `${SPOTIFY_API}${pathname}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v != null) qs.set(k, v);
    }
    const s = qs.toString();
    if (s) url += `?${s}`;
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${spotifyAuth.accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && retry) {
    await refreshSpotify();
    return spotifyRequest(method, pathname, params, body, false);
  }
  if (res.status === 429) {
    const ra = Number(res.headers.get('retry-after') || 30);
    if (ra > 600) {
      throw new Error(
        `Spotify 触发长时间限流，需等待约 ${Math.round(ra / 3600)} 小时（Retry-After=${ra} 秒）。`,
      );
    }
    await sleep(Math.max(1, ra) * 1000);
    return spotifyRequest(method, pathname, params, body, retry);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 403 && pathname.startsWith('/search')) {
      throw new Error('Spotify 未授予目录搜索权限（403），请确认 App 已选择 Web API 且账号为 Premium。');
    }
    throw new Error(
      `Spotify ${res.status}（${method} ${pathname}）：${text.slice(0, 300)}`,
    );
  }
  return text ? JSON.parse(text) : null;
}

async function savedTrackUris() {
  const uris = new Set();
  let offset = 0;
  for (;;) {
    const page = await spotifyRequest('GET', '/me/tracks', { limit: 50, offset });
    for (const entry of page?.items || []) {
      if (entry?.track?.uri) uris.add(entry.track.uri);
    }
    if (!page?.next) break;
    offset += (page?.items || []).length;
  }
  return uris;
}

async function userPlaylists() {
  const out = [];
  let offset = 0;
  for (;;) {
    const page = await spotifyRequest('GET', '/me/playlists', { limit: 50, offset });
    out.push(...(page?.items || []));
    if (!page?.next) break;
    offset += (page?.items || []).length;
  }
  return out;
}

async function playlistUris(playlistId) {
  const uris = new Set();
  let offset = 0;
  for (;;) {
    const page = await spotifyRequest(
      'GET',
      `/playlists/${encodeURIComponent(playlistId)}/items`,
      { limit: 100, offset },
    );
    for (const entry of page?.items || []) {
      const track = entry?.item || entry?.track;
      if (track?.uri) uris.add(track.uri);
    }
    if (!page?.next) break;
    offset += (page?.items || []).length;
  }
  return uris;
}

function markerFor(playlistId) {
  return `[netease:${playlistId}]`;
}

function normalizeText(value) {
  const text = String(value || '').normalize('NFKC').toLowerCase().replace(/&/g, ' and ');
  const matches = text.match(/[\w\u3400-\u9fff]+/gu) || [];
  return matches.join(' ');
}

function compactText(value) {
  return normalizeText(value).replace(/[^\p{L}\p{N}]+/gu, '');
}

function versionTags(value) {
  const text = String(value || '').normalize('NFKC').toLowerCase();
  const rules = {
    live: /\blive\b|现场|ライブ/i,
    remix: /\bremix(?:ed)?\b|混音|重新混音/i,
    acoustic: /\bacoustic\b|\bunplugged\b|不插电|原声版/i,
    instrumental: /\binstrumental\b|伴奏|纯音乐|器乐/i,
    karaoke: /\bkaraoke\b|卡拉\s*ok/i,
    cover: /\bcover\b|翻唱/i,
    sped_up: /\bsped\s*up\b|加速/i,
    slowed: /\bslowed\b|\bslowed\s*\+\s*reverb\b|降速/i,
  };
  return Object.entries(rules)
    .filter(([, re]) => re.test(text))
    .map(([k]) => k);
}

function artistNames(track) {
  return (track?.artists || [])
    .map((a) => (typeof a === 'string' ? a : a?.name))
    .filter(Boolean);
}

function artistSimilarity(a, b) {
  const left = new Set(a.map(compactText).filter(Boolean));
  const right = new Set(b.map(compactText).filter(Boolean));
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const item of left) if (right.has(item)) overlap += 1;
  const coverage = overlap / left.size;
  const primary = a[0] && b[0] && compactText(a[0]) === compactText(b[0]) ? 1 : 0;
  return Math.min(1, 0.85 * coverage + 0.15 * primary);
}

function similarity(a, b) {
  const x = compactText(a);
  const y = compactText(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const longer = Math.max(x.length, y.length);
  let matches = 0;
  for (let i = 0; i < x.length && i < y.length; i += 1) {
    if (x[i] === y[i]) matches += 1;
  }
  return matches / longer;
}

function scoreCandidate(src, cand) {
  const title = similarity(src.name, cand.name);
  const artist = artistSimilarity(src.artists, artistNames(cand));
  const sd = Number(src.duration_ms || 0);
  const cd = Number(cand.duration_ms || 0);
  const diff = sd && cd ? Math.abs(sd - cd) : 15000;
  const durationScore = Math.max(0, 1 - diff / 15000);
  const albumMatch =
    compactText(src.album) && compactText(src.album) === compactText(cand.album?.name || '')
      ? 1
      : 0;
  const sv = versionTags(src.name);
  const cv = versionTags(cand.name);
  const mismatch = JSON.stringify(sv) !== JSON.stringify(cv);
  const score = Math.max(
    0,
    Math.min(1, 0.5 * title + 0.3 * artist + 0.15 * durationScore + 0.05 * albumMatch - (mismatch ? 0.28 : 0)),
  );
  return { score, title, artist, diff, albumMatch, mismatch };
}

function candidateBrief(cand, scoring) {
  return {
    id: cand.id,
    uri: cand.uri,
    name: cand.name,
    artists: artistNames(cand),
    album: cand.album?.name || '',
    duration_ms: cand.duration_ms,
    external_url: cand.external_urls?.spotify || '',
    ...scoring,
  };
}

async function searchCandidates(title, artists, market) {
  const safe = (s) => String(s).replace(/"/g, ' ').trim();
  const bits = [`track:"${safe(title)}"`];
  for (const a of artists.slice(0, 2)) {
    if (a) bits.push(`artist:"${safe(a)}"`);
  }
  const params = { q: bits.join(' '), type: 'track', limit: 10 };
  if (market) params.market = market;
  const page = await spotifyRequest('GET', '/search', params);
  return page?.tracks?.items || [];
}

async function matchTrack(track, market) {
  if (!track.name) return { status: 'unmatched', reason: '曲目没有标题' };
  const candidates = await searchCandidates(track.name, track.artists, market);
  const scored = [];
  for (const cand of candidates) {
    if (!cand.uri || cand.type !== 'track' || cand.is_local) continue;
    scored.push(candidateBrief(cand, scoreCandidate(track, cand)));
  }
  scored.sort((a, b) => b.score - a.score);
  if (!scored.length) return { status: 'unmatched', reason: 'Spotify 没有返回候选' };
  const best = scored[0];
  const second = scored[1]?.score || 0;
  const margin = best.score - second;
  const exactish =
    best.title >= 0.995 && best.artist >= 0.84 && best.diff <= 6000 && !best.mismatch;
  const accepted =
    best.title >= 0.78 &&
    best.artist >= 0.5 &&
    best.diff <= 20000 &&
    best.score >= 0.82 &&
    (exactish || margin >= 0.04);
  const status = accepted ? 'matched' : 'review';
  return {
    status,
    reason: accepted ? '已接受最高置信度匹配' : '置信度不足，需要人工确认',
    margin: Number(margin.toFixed(4)),
    match: best,
    candidates: scored.slice(0, 5),
  };
}

function sourceTargets() {
  const targets = [
    {
      key: 'liked',
      type: 'liked',
      source_id: String(source.liked?.id || 'liked'),
      name: source.liked?.name || '我喜欢的音乐',
      tracks: source.liked?.tracks || [],
      unavailable_track_ids: source.liked?.unavailable_track_ids || [],
    },
  ];
  for (const p of source.playlists || []) {
    targets.push({
      key: `playlist:${p.id}`,
      type: 'playlist',
      source_id: String(p.id),
      name: p.name,
      kind: p.kind,
      tracks: p.tracks || [],
      unavailable_track_ids: p.unavailable_track_ids || [],
    });
  }
  return targets;
}

async function runMatch(job, delay, selection = null) {
  if (!source) throw new Error('请先导出网易云歌单。');
  let targets = sourceTargets();
  if (Array.isArray(selection) && selection.length) {
    const selected = new Set(selection.map(String));
    targets = targets.filter((target) => selected.has(target.key));
  }
  if (!targets.length) throw new Error('请先选择要匹配的歌单。');
  const unique = new Map();
  for (const target of targets) {
    for (const t of target.tracks) {
      if (t.id) unique.set(String(t.id), t);
    }
  }
  const me = await spotifyRequest('GET', '/me');
  spotifyUser = me;
  const market = me.country;
  const playlists = await userPlaylists();
  const saved = await savedTrackUris();
  for (const target of targets) {
    if (target.type === 'liked') {
      target.existingUris = saved;
      target.destination_playlist_id = null;
      target.will_create_playlist = false;
    } else {
      const marker = markerFor(target.source_id);
      const existing = playlists.find((p) => String(p.description || '').includes(marker));
      target.destination_playlist_id = existing?.id || null;
      target.will_create_playlist = !existing;
      target.existingUris = existing ? await playlistUris(existing.id) : new Set();
    }
  }
  const ordered = [...unique.values()];
  const total = ordered.length;
  const sourceKey = String(source.exported_at || source.user?.uid || 'source');
  const cache = loadMatchProgress(sourceKey);
  job.progress = { done: 0, total, message: `开始匹配（已有缓存 ${cache.size} 首）` };
  const matches = new Map();
  for (let i = 0; i < total; i += 1) {
    if (job?.cancelled) throw new Error('已取消');
    const track = ordered[i];
    const id = String(track.id);
    let result = cache.get(id);
    if (!result) {
      result = await matchTrack(track, market);
      appendMatchProgress(sourceKey, id, result);
    }
    matches.set(id, result);
    job.progress = {
      done: i + 1,
      total,
      message: `匹配 ${i + 1}/${total}${cache.has(id) ? '（缓存）' : ''}`,
    };
    if (delay > 0 && i < total - 1) await sleep(delay);
  }
  const planTargets = [];
  const counts = {};
  for (const target of targets) {
    const rows = [];
    const seen = new Set();
    let duplicates = 0;
    for (const t of target.tracks) {
      const id = String(t.id);
      if (seen.has(id)) {
        duplicates += 1;
        continue;
      }
      seen.add(id);
      const match = matches.get(id);
      const uri = match?.match?.uri;
      const row = {
        source_track_id: id,
        source_name: t.name,
        source_artists: t.artists || [],
        ...match,
        destination_uri: uri,
        already_present: uri ? target.existingUris.has(uri) : false,
      };
      counts[row.status] = (counts[row.status] || 0) + 1;
      rows.push(row);
    }
    planTargets.push({
      key: target.key,
      type: target.type,
      source_id: target.source_id,
      name: target.name,
      kind: target.kind,
      destination_playlist_id: target.destination_playlist_id,
      will_create_playlist: target.will_create_playlist,
      duplicate_track_count: duplicates,
      unavailable_track_ids: target.unavailable_track_ids || [],
      tracks: rows,
    });
  }
  plan = {
    created_at: new Date().toISOString(),
    market,
    spotify_user: { id: me.id, display_name: me.display_name, country: me.country },
    summary: {
      unique_tracks: total,
      match_status_counts: counts,
      playlists_to_create: planTargets.filter((t) => t.will_create_playlist).length,
      pending_liked: planTargets
        .filter((t) => t.type === 'liked')
        .flatMap((t) => t.tracks)
        .filter((t) => t.status === 'matched' && !t.already_present).length,
      pending_playlist_items: planTargets
        .filter((t) => t.type === 'playlist')
        .flatMap((t) => t.tracks)
        .filter((t) => t.status === 'matched' && !t.already_present).length,
    },
    targets: planTargets,
  };
  saveJson(planPath, plan);
  return plan.summary;
}

async function saveLikedTracks(ids) {
  for (let i = 0; i < ids.length; i += 50) {
    await spotifyRequest('PUT', '/me/tracks', { ids: ids.slice(i, i + 50).join(',') });
  }
}

async function addPlaylistItems(playlistId, uris) {
  for (let i = 0; i < uris.length; i += 100) {
    await spotifyRequest('POST', `/playlists/${encodeURIComponent(playlistId)}/items`, null, {
      uris: uris.slice(i, i + 100),
    });
  }
}

async function runApply(job, allowPartial = false) {
  if (!plan) throw new Error('请先完成匹配预览。');
  const me = await spotifyRequest('GET', '/me');
  if (plan.spotify_user?.id && plan.spotify_user.id !== me.id) {
    throw new Error('匹配计划属于另一个 Spotify 账号，请重新授权后再匹配。');
  }
  const existingPlaylists = await userPlaylists();
  const summary = {
    liked_saved: 0,
    liked_already_present: 0,
    playlists_reused: 0,
    playlists_created: 0,
    playlist_items_added: 0,
    playlist_items_already_present: 0,
    skipped_unmatched: 0,
  };
  const incomplete = plan.targets
    .flatMap((target) => target.tracks)
    .filter((track) => track.status !== 'matched' || !track.destination_uri);
  if (!allowPartial && incomplete.length) {
    throw new Error(
      `本批还有 ${incomplete.length} 首未匹配或需要人工确认。请重新匹配，或勾选“允许部分写入”。`,
    );
  }
  let total = plan.targets.reduce((sum, t) => sum + t.tracks.length, 0);
  let done = 0;
  job.progress = { done: 0, total, message: '开始写入 Spotify' };
  for (const target of plan.targets) {
    if (job?.cancelled) throw new Error('已取消');
    if (target.type === 'liked') {
      const current = await savedTrackUris();
      const pending = [];
      for (const track of target.tracks) {
        track.already_present = track.destination_uri ? current.has(track.destination_uri) : false;
        if (track.status === 'matched') {
          if (track.already_present) summary.liked_already_present += 1;
          else pending.push(track);
        } else {
          summary.skipped_unmatched += 1;
        }
        done += 1;
      }
      const ids = pending.map((t) => t.match.id).filter(Boolean);
      if (ids.length) await saveLikedTracks(ids);
      summary.liked_saved += ids.length;
      for (const t of pending) t.apply_status = 'saved_to_liked';
      job.progress = { done, total, message: `已保存喜欢歌曲 ${summary.liked_saved} 首` };
    } else {
      const matchedInTarget = target.tracks.filter(
        (track) => track.status === 'matched' && track.destination_uri,
      );
      if (!matchedInTarget.length) {
        summary.skipped_unmatched += target.tracks.length;
        done += target.tracks.length;
        job.progress = {
          done,
          total,
          message: `歌单“${target.name}”没有已匹配曲目，已跳过`,
        };
        continue;
      }
      const marker = markerFor(target.source_id);
      let playlist = existingPlaylists.find((p) => p.id === target.destination_playlist_id);
      if (!playlist) playlist = existingPlaylists.find((p) => String(p.description || '').includes(marker));
      if (playlist) {
        summary.playlists_reused += 1;
      } else {
        playlist = await spotifyRequest('POST', '/me/playlists', null, {
          name: String(target.name).slice(0, 100),
          public: false,
          description: `Migrated from NetEase Cloud Music. ${marker}`.slice(0, 300),
        });
        existingPlaylists.push(playlist);
        summary.playlists_created += 1;
      }
      target.destination_playlist_id = playlist.id;
      const current = await playlistUris(playlist.id);
      const pending = [];
      for (const track of target.tracks) {
        track.already_present = track.destination_uri ? current.has(track.destination_uri) : false;
        if (track.status === 'matched') {
          if (track.already_present) summary.playlist_items_already_present += 1;
          else pending.push(track);
        } else {
          summary.skipped_unmatched += 1;
        }
        done += 1;
      }
      const uris = pending.map((t) => t.destination_uri).filter(Boolean);
      if (uris.length) await addPlaylistItems(playlist.id, uris);
      summary.playlist_items_added += uris.length;
      for (const t of pending) t.apply_status = 'added_to_playlist';
      job.progress = {
        done,
        total,
        message: `歌单“${target.name}”已处理，共新增 ${uris.length} 首`,
      };
    }
    saveJson(appliedPath, { ...plan, applied_at: new Date().toISOString(), apply_summary: summary });
  }
  applied = { ...plan, applied_at: new Date().toISOString(), apply_summary: summary };
  saveJson(appliedPath, applied);
  return summary;
}

async function runVerify(job) {
  if (!applied) throw new Error('还没有执行过写入。');
  const saved = await savedTrackUris();
  const summary = { verified: 0, missing: 0, not_applied: 0 };
  let total = applied.targets.reduce((sum, t) => sum + t.tracks.length, 0);
  let done = 0;
  job.progress = { done: 0, total, message: '开始核对' };
  for (const target of applied.targets) {
    if (target.type === 'playlist' && !target.destination_playlist_id) {
      for (const track of target.tracks) {
        track.verify_status = 'not_applicable';
        track.verify_reason = 'No matched tracks were available, so the playlist was not created.';
        summary.not_applied += 1;
        done += 1;
      }
      job.progress = { done, total, message: `核对 ${done}/${total}` };
      continue;
    }
    const uris = target.type === 'liked'
      ? saved
      : await playlistUris(target.destination_playlist_id);
    for (const track of target.tracks) {
      if (track.status !== 'matched') {
        track.verify_status = 'not_applicable';
        summary.not_applied += 1;
      } else if (track.destination_uri && uris.has(track.destination_uri)) {
        track.verify_status = 'verified';
        summary.verified += 1;
      } else {
        track.verify_status = 'missing';
        summary.missing += 1;
      }
      done += 1;
    }
    job.progress = { done, total, message: `核对 ${done}/${total}` };
  }
  return summary;
}

const jobs = new Map();
let jobSeq = 0;

function startJob(type, fn) {
  const id = ++jobSeq;
  const job = { id, type, status: 'running', progress: { done: 0, total: 0, message: '准备中' }, error: null, result: null, cancelled: false };
  jobs.set(id, job);
  (async () => {
    try {
      job.result = await fn(job);
      job.status = 'done';
    } catch (err) {
      job.status = 'error';
      job.error = String(err?.message || err);
    }
  })();
  return id;
}

function jobPublic(job) {
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    error: job.error,
    result: job.result,
  };
}

function publicState() {
  return {
    netease: neteaseAccount,
    spotify: spotifyUser
      ? { id: spotifyUser.id, display_name: spotifyUser.display_name, country: spotifyUser.country }
      : null,
    source: sourceSummary(),
    plan: plan?.summary || null,
    applied: applied?.apply_summary || null,
  };
}

async function routeApi(req, res, pathname, method) {
  if (pathname === '/api/state' && method === 'GET') {
    return sendJson(res, 200, publicState());
  }
  if (pathname === '/api/source/playlists' && method === 'GET') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    const sourceKey = String(source.exported_at || source.user?.uid || 'source');
    const cache = loadMatchProgress(sourceKey);
    const cacheCounts = { matched: 0, review: 0, unmatched: 0 };
    for (const result of cache.values()) {
      if (result.status === 'matched') cacheCounts.matched += 1;
      else if (result.status === 'review') cacheCounts.review += 1;
      else cacheCounts.unmatched += 1;
    }
    return sendJson(res, 200, {
      liked: {
        name: source.liked?.name || '我喜欢的音乐',
        available: source.liked?.tracks?.length || 0,
        unavailable: source.liked?.unavailable_track_ids?.length || 0,
        original: source.liked?.track_count || 0,
        match: cacheStatsForTracks(source.liked?.tracks, cache),
      },
      playlists: (source.playlists || []).map((p) => ({
        id: String(p.id),
        name: p.name,
        kind: p.kind || 'unknown',
        available: p.tracks?.length || 0,
        unavailable: p.unavailable_track_ids?.length || 0,
        original: p.track_count || 0,
        match: cacheStatsForTracks(p.tracks, cache),
      })),
      failed: source.failed_playlists || [],
      match_cache: {
        total: cache.size,
        ...cacheCounts,
      },
    });
  }
  if (pathname === '/api/source/liked' && method === 'GET') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    return sendJson(res, 200, source.liked || {});
  }
  if (pathname === '/api/source/tracks' && method === 'GET') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const query = String(params.get('q') || '').trim().toLowerCase();
    const offset = Math.max(0, Number(params.get('offset') || 0));
    const limit = Math.min(200, Math.max(1, Number(params.get('limit') || 100)));
    const sourceKey = String(source.exported_at || source.user?.uid || 'source');
    const cache = loadMatchProgress(sourceKey);
    const rows = [];
    const addTracks = (playlistName, playlistId, tracks) => {
      for (const track of tracks || []) {
        const id = String(track.id);
        const result = cache.get(id);
        const match = result?.match || {};
        rows.push({
          playlist_name: playlistName,
          playlist_id: String(playlistId),
          track_id: id,
          name: track.name || '',
          artists: track.artists || [],
          album: track.album || '',
          duration_ms: track.duration_ms || 0,
          match_status: result?.status || 'not_matched',
          spotify_uri: match.uri || '',
          spotify_name: match.name || '',
          spotify_artists: match.artists || [],
        });
      }
    };
    addTracks(source.liked?.name || '我喜欢的音乐', 'liked', source.liked?.tracks);
    for (const playlist of source.playlists || []) {
      addTracks(playlist.name, playlist.id, playlist.tracks);
    }
    const filtered = query
      ? rows.filter((row) => {
          const haystack = [
            row.playlist_name,
            row.name,
            row.album,
            ...(row.artists || []),
            ...(row.spotify_artists || []),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        })
      : rows;
    return sendJson(res, 200, {
      total: filtered.length,
      offset,
      limit,
      rows: filtered.slice(offset, offset + limit),
    });
  }
  if (pathname.startsWith('/api/source/playlist/') && method === 'GET') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    const id = decodeURIComponent(pathname.slice('/api/source/playlist/'.length));
    const playlist = (source.playlists || []).find((p) => String(p.id) === id);
    if (!playlist) return sendJson(res, 404, { error: '找不到这个歌单。' });
    return sendJson(res, 200, playlist);
  }
  if (pathname === '/api/review' && method === 'GET') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    const params = new URL(req.url, `http://${req.headers.host}`).searchParams;
    const query = String(params.get('q') || '').trim().toLowerCase();
    const offset = Math.max(0, Number(params.get('offset') || 0));
    const limit = Math.min(50, Math.max(1, Number(params.get('limit') || 20)));
    const minScore = Number(params.get('minScore') || 0);
    const maxScore = Number(params.get('maxScore') || 1);
    const sourceKey = String(source.exported_at || source.user?.uid || 'source');
    const cache = loadMatchProgress(sourceKey);
    const index = buildSourceTrackIndex();
    const rows = [];
    for (const [trackId, result] of cache) {
      if (result.status !== 'review') continue;
      const entry = index.get(trackId);
      if (!entry || !result.candidates?.length) continue;
      const topScore = Number(result.candidates[0]?.score || 0);
      if (topScore < minScore || topScore > maxScore) continue;
      const haystack = [
        entry.track.name,
        entry.track.album,
        ...(entry.track.artists || []),
        ...(result.candidates || []).map((c) => c.name),
      ]
        .join(' ')
        .toLowerCase();
      if (query && !haystack.includes(query)) continue;
      rows.push({
        track_id: trackId,
        source: entry.track,
        playlists: [...entry.playlists],
        candidates: result.candidates.slice(0, 5),
        top_score: topScore,
        current_match: result.match || null,
      });
    }
    rows.sort((a, b) => a.top_score - b.top_score);
    return sendJson(res, 200, {
      total: rows.length,
      offset,
      limit,
      rows: rows.slice(offset, offset + limit),
    });
  }
  if (pathname === '/api/review/bulk-accept' && method === 'POST') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    const body = await readBody(req);
    const minScore = Number(body.minScore ?? 0);
    const maxScore = Number(body.maxScore ?? 1);
    const sourceKey = String(source.exported_at || source.user?.uid || 'source');
    const cache = loadMatchProgress(sourceKey);
    let accepted = 0;
    for (const [trackId, result] of cache) {
      if (result.status !== 'review') continue;
      const candidate = result.candidates?.[0];
      const score = Number(candidate?.score || 0);
      if (!candidate?.uri || score < minScore || score > maxScore) continue;
      appendMatchProgress(sourceKey, trackId, {
        ...result,
        status: 'matched',
        reason: 'Bulk accepted',
        match: candidate,
        reviewed_at: new Date().toISOString(),
      });
      accepted += 1;
    }
    return sendJson(res, 200, { ok: true, accepted });
  }
  if (pathname === '/api/review/accept' && method === 'POST') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    const body = await readBody(req);
    const trackId = String(body.trackId || '');
    const candidateIndex = Math.max(0, Number(body.candidateIndex || 0));
    const sourceKey = String(source.exported_at || source.user?.uid || 'source');
    const cache = loadMatchProgress(sourceKey);
    const result = cache.get(trackId);
    if (!result || result.status !== 'review') {
      return sendJson(res, 404, { error: '这条待确认记录已经处理或不存在。' });
    }
    const candidate = result.candidates?.[candidateIndex];
    if (!candidate?.uri) return sendJson(res, 400, { error: '请选择一个有效的 Spotify 候选。' });
    const updated = {
      ...result,
      status: 'matched',
      reason: 'Manually accepted',
      match: candidate,
      reviewed_at: new Date().toISOString(),
    };
    appendMatchProgress(sourceKey, trackId, updated);
    return sendJson(res, 200, { ok: true, result: updated });
  }
  if (pathname === '/api/review/skip' && method === 'POST') {
    if (!source) return sendJson(res, 404, { error: '还没有导出歌单。' });
    const body = await readBody(req);
    const trackId = String(body.trackId || '');
    const sourceKey = String(source.exported_at || source.user?.uid || 'source');
    const cache = loadMatchProgress(sourceKey);
    const result = cache.get(trackId);
    if (!result || result.status !== 'review') {
      return sendJson(res, 404, { error: '这条待确认记录已经处理或不存在。' });
    }
    const updated = {
      status: 'unmatched',
      reason: 'Manually skipped',
      match: null,
      candidates: [],
      reviewed_at: new Date().toISOString(),
    };
    appendMatchProgress(sourceKey, trackId, updated);
    return sendJson(res, 200, { ok: true, result: updated });
  }
  if (pathname === '/api/netease/qr' && method === 'POST') {
    const key = await neteaseQrKey();
    if (!key) return sendJson(res, 500, { error: '无法创建网易云登录二维码' });
    const data = await neteaseQrCreate(key);
    return sendJson(res, 200, { key, qrUrl: data.qrurl, qrimg: data.qrimg || null });
  }
  if (pathname === '/api/netease/qr/check' && method === 'GET') {
    const key = new URL(req.url, `http://${req.headers.host}`).searchParams.get('key');
    if (!key) return sendJson(res, 400, { error: '缺少 key' });
    const { code, body } = await neteaseQrCheck(key);
    if (code === 803) {
      await neteaseAccountInfo();
      persistState();
    }
    return sendJson(res, 200, { code, message: body?.message || null });
  }
  if (pathname === '/api/netease/export' && method === 'POST') {
    const id = startJob('export', (job) => runNeteaseExport(job));
    return sendJson(res, 202, { jobId: id });
  }
  if (pathname === '/api/spotify/login' && method === 'POST') {
    const body = await readBody(req);
    const clientId = String(body.clientId || '').trim();
    if (!clientId) return sendJson(res, 400, { error: '缺少 Spotify Client ID' });
    const url = spotifyLoginUrl(clientId);
    return sendJson(res, 200, { url });
  }
  if (pathname === '/api/spotify/logout' && method === 'POST') {
    spotifyAuth = null;
    spotifyUser = null;
    persistState();
    return sendJson(res, 200, { ok: true });
  }
  if (pathname === '/api/match' && method === 'POST') {
    const body = await readBody(req);
    const delay = Math.max(3000, Number(body.delay ?? 3000));
    const selection = Array.isArray(body.playlists) ? body.playlists : null;
    const id = startJob('match', (job) => runMatch(job, delay, selection));
    return sendJson(res, 202, { jobId: id });
  }
  if (pathname === '/api/apply' && method === 'POST') {
    const body = await readBody(req);
    const id = startJob('apply', (job) => runApply(job, Boolean(body.allowPartial)));
    return sendJson(res, 202, { jobId: id });
  }
  if (pathname === '/api/verify' && method === 'POST') {
    const id = startJob('verify', (job) => runVerify(job));
    return sendJson(res, 202, { jobId: id });
  }
  if (pathname.startsWith('/api/job/') && method === 'GET') {
    const id = Number(pathname.split('/').pop());
    const job = jobs.get(id);
    if (!job) return sendJson(res, 404, { error: '任务不存在' });
    return sendJson(res, 200, jobPublic(job));
  }
  if (pathname.startsWith('/api/job/') && method === 'POST' && pathname.endsWith('/cancel')) {
    const id = Number(pathname.split('/').slice(-2, -1)[0]);
    const job = jobs.get(id);
    if (!job) return sendJson(res, 404, { error: '任务不存在' });
    job.cancelled = true;
    return sendJson(res, 200, { ok: true });
  }
  return sendJson(res, 404, { error: '接口不存在' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname === '/callback' && req.method === 'GET') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (!code || !state) {
        sendText(res, 400, 'Missing code or state');
        return;
      }
      try {
        await completeSpotifyLogin(code, state);
        sendText(res, 200, '<meta charset="utf-8"><script>window.close();</script>授权成功，请回到原页面。', 'text/html; charset=utf-8');
      } catch (err) {
        sendText(res, 400, `授权失败：${err.message}`, 'text/html; charset=utf-8');
      }
      return;
    }
    if (pathname.startsWith('/api/')) {
      await routeApi(req, res, pathname, req.method);
      return;
    }
    if (serveStatic(req, res, pathname)) return;
    sendText(res, 404, 'Not found');
  } catch (err) {
    sendJson(res, 500, { error: String(err?.message || err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`本地迁移工具已启动：http://${HOST}:${PORT}`);
  console.log(`数据目录：${DATA_DIR}`);
});
