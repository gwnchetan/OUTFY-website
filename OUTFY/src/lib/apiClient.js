const CACHE_PREFIX = 'outfy:api:';
const memoryCache = new Map();
const inFlightRequests = new Map();

function cacheKey(url) {
  return `${CACHE_PREFIX}${url}`;
}

function readStored(url) {
  try {
    const raw = sessionStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(cacheKey(url));
      return null;
    }
    memoryCache.set(url, entry);
    return entry;
  } catch {
    return null;
  }
}

function writeCache(url, data, ttl) {
  const entry = { data, expiresAt: Date.now() + ttl };
  memoryCache.set(url, entry);
  try {
    sessionStorage.setItem(cacheKey(url), JSON.stringify(entry));
  } catch {
    // Storage can be unavailable or full. The in-memory cache still works.
  }
  return data;
}

export function peekJson(url) {
  const entry = memoryCache.get(url) || readStored(url);
  return entry && Date.now() <= entry.expiresAt ? entry.data : null;
}

function abortable(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('Request aborted', 'AbortError'));

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Request aborted', 'AbortError'));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

/** Fetch public JSON with request de-duplication and a short session cache. */
export function fetchJson(url, { signal, ttl = 90_000, force = false } = {}) {
  const cached = !force && peekJson(url);
  if (cached) return abortable(Promise.resolve(cached), signal);

  let request = inFlightRequests.get(url);
  if (!request) {
    request = fetch(url, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Unable to load this information.');
        return writeCache(url, data, ttl);
      })
      .finally(() => inFlightRequests.delete(url));
    inFlightRequests.set(url, request);
  }

  return abortable(request, signal);
}

export function invalidateJson(urlPrefix) {
  for (const url of memoryCache.keys()) {
    if (url.startsWith(urlPrefix)) memoryCache.delete(url);
  }
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX) && key.slice(CACHE_PREFIX.length).startsWith(urlPrefix))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Best effort: the next request can always be forced.
  }
}
