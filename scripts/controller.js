"use strict";

// HERO
function buildHeroSlots(list = []) {
  const valid = list.filter((p) => p?.name && (p.image || p.id));
  const seen = new Set(),
    unique = [];
  for (const p of valid) {
    const key = p.id ?? p.name;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }
  return unique
    .sort(() => Math.random() - 0.5)
    .slice(0, HERO_SLOT_LIMIT)
    .map((p) => ({ name: p.name, id: p.id, types: p.types ?? [], image: getPokemonImage(p) }));
}

function renderHeroWrap(list) {
  const el = document.getElementById("hero_content");
  if (!el) return;
  el.innerHTML = templatePkmHeroWrap(buildHeroSlots(list));
}

async function loadHeroSmallBatch() {
  const heroWrapEl = document.getElementById("hero_wrap");
  toggleSpinner(true);
  try {
    const { small, big } = await loadPokemonHeroData();
    const smallList = await getPokemonsData(small);
    heroDataRef = smallList;
    renderHeroWrap(heroDataRef);
    return big;
  } catch (e) {
    heroWrapEl && (heroWrapEl.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>");
    console.error(e);
    return null;
  } finally {
    toggleSpinner(false);
  }
}

async function loadHeroLargeBatch(bigPromise, { shouldRerenderImmediately = false } = {}) {
  if (!bigPromise) return;
  try {
    const big = await bigPromise;
    if (!big) return;
    const bigList = await getPokemonsData(big);
    if (Array.isArray(bigList) && bigList.length) {
      heroDataRef = bigList;
      if (shouldRerenderImmediately) renderHeroWrap(heroDataRef);
    }
  } catch (e) {
    console.error("Hero big load:", e);
  } finally {
    toggleSpinner(false);
  }
}

async function loadHeroWrap() {
  const largeBatchPromise = await loadHeroSmallBatch();
  loadHeroLargeBatch(largeBatchPromise, { shouldRerenderImmediately: false });
  clearInterval(heroRenderIntervalId);
  heroRenderIntervalId = setInterval(() => renderHeroWrap(heroDataRef), HERO_RENDER_INTERVAL_MS);
}

//  TYPE SLIDER
function loadPkmTypes() {
  if (cachedTypes) return cachedTypes;
  cachedTypes = availableTypeIcons.filter((t) => t !== "shadow" && t !== "unknown");
  return cachedTypes;
}

function renderPkmTypes() {
  const el = document.getElementById("allTypes");
  if (!el) return;
  const html = loadPkmTypes().map(templatePkmTypeSlider).join("");
  el.innerHTML = `<div class="type_track">${html}${html}</div>`;
}

//  INDEX-CARD
function extractIdFromUrl(url) {
  const m = (url || "").match(/\/pokemon\/(\d+)\/?$/);
  return m ? parseInt(m[1], 10) : NaN;
}

async function fetchDexIndexSubset(lastCount) {
  const idx = await (await fetch(`${BASE_URL}?limit=${MAX_DEX_ID}&offset=0`)).json();
  const all = (idx.results || []).filter((e) => {
    const id = extractIdFromUrl(e.url);
    return Number.isFinite(id) && id <= MAX_DEX_ID;
  });
  const start = Math.max(0, all.length - lastCount);
  return { results: all.slice(start) };
}

function pickRandom(items = [], count) {
  return items
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

async function buildIndexMons(candidates, { requireImage, excludeForms } = {}) {
  let list = await getPokemonsData({ results: candidates }, { skipForms: !!excludeForms });
  if (requireImage) list = list.filter((p) => p?.image && !p.image.includes("placeholder"));
  return list.slice(0, INDEX_CARD_LIMIT);
}

function renderPokemonCardIndex(list) {
  const el = document.getElementById("pokedex_index");
  if (el) {
    el.innerHTML = templatePkmCard(list);
  }
  updateClickedLikes();
}

async function renderDexIndexSection(opt = {}) {
  const { fetchCountFromEnd = 40, candidateSampleSize = 20, requireImage = true, excludeForms = true } = opt;
  toggleSpinner(true);
  const indexEl = document.getElementById("pokedex_index");
  try {
    const subset = await fetchDexIndexSubset(fetchCountFromEnd);
    const candidates = pickRandom(subset.results, candidateSampleSize);
    const list = await buildIndexMons(candidates, { requireImage, excludeForms });
    if (list.length >= INDEX_CARD_LIMIT) renderPokemonCardIndex(list.slice(0, INDEX_CARD_LIMIT));
    else if (indexEl) indexEl.innerHTML = "<p style='color:red'>Zu wenige passende Pokémon gefunden.</p>";
  } catch (e) {
    indexEl && (indexEl.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>");
    console.error("renderDexIndexSection:", e);
  } finally {
    toggleSpinner(false);
  }
}

//  CARD LIST
function renderPokemonCard(list) {
  const el = document.getElementById("pokedex");
  if (!el) return;
  el.innerHTML = templatePkmCard(list);
  updateClickedLikes();
  typeof renderLikes === "function" && renderLikes();
}

async function loadPokemonCard() {
  toggleSpinner(true);
  const el = document.getElementById("pokedex");
  try {
    const idx = await loadPokemonList();
    idx.results = (idx.results || []).filter((e) => {
      const id = extractIdFromUrl(e.url);
      return Number.isFinite(id) && id <= MAX_DEX_ID;
    });
    const list = await getPokemonsData(idx);
    renderPokemonCard(list);
    loadMorePokemon.currentLimit = LIMIT;
  } catch (err) {
    el && (el.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>");
    updateClickedLikes();
    typeof renderLikes === "function" && renderLikes();
    console.error(err);
  } finally {
    toggleSpinner(false);
  }
}

//  Load More Pokemon
async function loadMorePokemon() {
  if (loadingMorePkm) return;
  loadingMorePkm = true;
  const btn = document.getElementById("loadMoreBtn"),
    container = document.getElementById("pokedex");
  btn && (btn.disabled = true);
  if (!container) return endMorePokemon(btn);
  const prev = loadMorePokemon.currentLimit ?? LIMIT,
    next = Math.min(prev + LIMIT, MAX_DEX_ID);
  loadMorePokemon.currentLimit = next;
  toggleSpinner(true);
  try {
    const all = await fetchMorePokemon(next);
    loadMoreAppendPokemon(container, all, prev, next);
    if (btn && next >= MAX_DEX_ID) btn.style.display = "none";
  } catch (e) {
    console.error("loadMorePokemon:", e);
  } finally {
    endMorePokemon(btn);
  }
}

async function fetchMorePokemon(nextLimit) {
  const [{ results }] = await Promise.all([
    fetch(`${BASE_URL}?limit=${nextLimit}&offset=${offset}`).then((r) => r.json()),
    new Promise((r) => setTimeout(r, 800)),
  ]);
  const filtered = (results || []).filter((e) => {
    const id = extractIdFromUrl(e.url);
    return Number.isFinite(id) && id <= MAX_DEX_ID;
  });
  return getPokemonsData({ results: filtered });
}

function loadMoreAppendPokemon(container, list, prev, next) {
  container.innerHTML += templatePkmCard(list.slice(prev, next));
  updateClickedLikes();
}

function endMorePokemon(btn) {
  toggleSpinner(false);
  loadingMorePkm = false;
  btn && (btn.disabled = false);
}

//  BOOTSTRAP
(async function bootstrapHome() {
  if (document.getElementById("hero_wrap")) loadHeroWrap();
  if (document.getElementById("allTypes")) renderPkmTypes();
  if (document.getElementById("pokedex_index")) renderDexIndexSection();
  if (document.getElementById("pokedex")) loadPokemonCard();
})();
