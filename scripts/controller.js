"use strict";

/* ===============================
   HERO Verarbeitung
   =============================== */
function buildHeroSlots(pokemonList = []) {
  const validPokemon = pokemonList.filter((pokemon) => pokemon?.name && (pokemon.image || pokemon.id));
  const seenKeys = new Set();
  const uniquePokemon = [];

  for (const pokemon of validPokemon) {
    const dedupeKey = pokemon.id ?? pokemon.name;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);
    uniquePokemon.push(pokemon);
  }

  return uniquePokemon
    .sort(() => Math.random() - 0.5)
    .slice(0, HERO_SLOT_LIMIT)
    .map((pokemon) => ({
      name: pokemon.name,
      id: pokemon.id,
      types: pokemon.types ?? [],
      image: getPokemonImage(pokemon),
    }));
}

function renderHeroWrap(pokemonList) {
  const heroContentEl = document.getElementById("hero_content");
  if (!heroContentEl) return;

  const heroSlots = buildHeroSlots(pokemonList);
  heroContentEl.innerHTML = templatePkmHeroWrap(heroSlots);
}

async function loadHeroSmallBatch() {
  const heroWrapEl = document.getElementById("hero_wrap");
  toggleSpinner(true);

  try {
    const { small: smallBatch, big: bigBatch } = await fetchPokemonDataHero();
    const smallPokemonList = await getPokemonsData(smallBatch);

    heroDataRef = smallPokemonList;
    renderHeroWrap(heroDataRef);

    return bigBatch;
  } catch (error) {
    if (heroWrapEl) heroWrapEl.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
    console.error(error);
    return null;
  } finally {
    toggleSpinner(false);
  }
}

async function loadHeroLargeBatch(bigDataPromise, { shouldRerenderImmediately = false } = {}) {
  if (!bigDataPromise) return;
  try {
    const bigData = await bigDataPromise;
    if (!bigData) return;
    const bigPokemonList = await getPokemonsData(bigData);
    if (Array.isArray(bigPokemonList) && bigPokemonList.length) {
      heroDataRef = bigPokemonList;
      if (shouldRerenderImmediately) renderHeroWrap(heroDataRef);
    }
  } catch (error) {
    console.error("Hero big load:", error);
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

/* ===============================
   TYPEN-SLIDER Verarbeitung
   =============================== */
function renderPkmTypes() {
  const typesContainerEl = document.getElementById("allTypes");
  if (!typesContainerEl) return;

  const typeIconsHtml = loadPkmTypes().map(templatePkmTypeSlider).join("");
  typesContainerEl.innerHTML = `<div class="type_track">${typeIconsHtml}${typeIconsHtml}</div>`;
}

function loadPkmTypes() {
  if (cachedTypes) return cachedTypes;

  cachedTypes = availableTypeIcons.filter((typeName) => typeName !== "shadow" && typeName !== "unknown");
  return cachedTypes;
}

/* ==================================
   POKEMON-CARD-INDEX Verarbeitung
   ================================== */
function extractIdFromUrl(pokemonUrl) {
  const matchResult = (pokemonUrl || "").match(/\/pokemon\/(\d+)\/?$/);
  return matchResult ? parseInt(matchResult[1], 10) : NaN;
}

async function fetchDexIndexSubset(lastCount) {
  const indexResponse = await (await fetch(`${BASE_URL}?limit=${MAX_DEX_ID}&offset=0`)).json();

  const allEntries = (indexResponse.results || []).filter((entry) => {
    const pokemonId = extractIdFromUrl(entry.url);
    return Number.isFinite(pokemonId) && pokemonId <= MAX_DEX_ID;
  });

  const sliceStart = Math.max(0, allEntries.length - lastCount);
  return { results: allEntries.slice(sliceStart) };
}

function pickRandom(items = [], count) {
  return items
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

async function buildIndexMons(candidates, { requireImage, excludeForms } = {}) {
  let pokemonList = await getPokemonsData({ results: candidates }, { skipForms: !!excludeForms });

  if (requireImage) {
    pokemonList = pokemonList.filter((p) => p?.image && !p.image.includes("placeholder"));
  }

  return pokemonList.slice(0, INDEX_CARD_LIMIT);
}

function renderPokemonCardIndex(pokemonList) {
  const indexContainerEl = document.getElementById("pokedex_index");
  if (indexContainerEl) {
    indexContainerEl.innerHTML = templatePkmCard(pokemonList);
  }

  updateClickedLikes();
}

async function renderDexIndexSection(options = {}) {
  const { fetchCountFromEnd = 40, candidateSampleSize = 20, requireImage = true, excludeForms = true } = options;

  toggleSpinner(true);

  const indexContainerEl = document.getElementById("pokedex_index");

  try {
    const fetchedIndexSubset = await fetchDexIndexSubset(fetchCountFromEnd);
    const candidateEntries = pickRandom(fetchedIndexSubset.results, candidateSampleSize);
    const pokemonList = await buildIndexMons(candidateEntries, {
      requireImage,
      excludeForms,
    });

    if (pokemonList.length >= INDEX_CARD_LIMIT) {
      renderPokemonCardIndex(pokemonList.slice(0, INDEX_CARD_LIMIT));
    } else if (indexContainerEl) {
      indexContainerEl.innerHTML = "<p style='color:red'>Zu wenige passende Pokémon gefunden.</p>";
    }
  } catch (error) {
    if (indexContainerEl) {
      indexContainerEl.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
    }
    console.error("renderDexIndexSection:", error);
  } finally {
    toggleSpinner(false);
  }
}

/* ===============================
   POKEMON-CARD Verarbeitung
   =============================== */
function renderPokemonCard(pokemonList) {
  const dexCardContainerEl = document.getElementById("pokedex");
  if (!dexCardContainerEl) return;

  dexCardContainerEl.innerHTML = templatePkmCard(pokemonList);

  updateClickedLikes();

  if (typeof renderLikes === "function") {
    renderLikes();
  }
}

async function loadPokemonCard() {
  toggleSpinner(true);
  const dexCardContainerEl = document.getElementById("pokedex");
  try {
    const pokemonIndexData = await fetchPokemonData();
    pokemonIndexData.results = (pokemonIndexData.results || []).filter((entry) => {
      const pokemonId = extractIdFromUrl(entry.url);
      return Number.isFinite(pokemonId) && pokemonId <= MAX_DEX_ID;
    });
    const pokemonList = await getPokemonsData(pokemonIndexData);
    renderPokemonCard(pokemonList);
    loadMorePokemon.currentLimit = LIMIT;
  } catch (err) {
    if (dexCardContainerEl) {
      dexCardContainerEl.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
    }
    updateClickedLikes();
    if (typeof renderLikes === "function") renderLikes();
    console.error(err);
  } finally {
    toggleSpinner(false);
  }
}

/* ===============================
   MEHR POKEMON-LADEN 
   =============================== */
async function loadMorePokemon() {
  if (loadingMorePkm) return;
  loadingMorePkm = true;

  const loadMoreBtn = document.getElementById("loadMoreBtn"),
    cardContainer = document.getElementById("pokedex");
  if (loadMoreBtn) loadMoreBtn.disabled = true;
  if (!cardContainer) return endMorePokemon(loadMoreBtn);
  const prevLimit = loadMorePokemon.currentLimit ?? LIMIT,
    nextLimit = Math.min(prevLimit + LIMIT, MAX_DEX_ID);

  loadMorePokemon.currentLimit = nextLimit;

  toggleSpinner(true);

  try {
    const all = await fetchMorePokemon(nextLimit);
    loadMoreAppendPokemon(cardContainer, all, prevLimit, nextLimit);
    if (loadMoreBtn && nextLimit >= MAX_DEX_ID) loadMoreBtn.style.display = "none";
  } catch (e) {
    console.error("loadMorePokemon:", e);
  } finally {
    endMorePokemon(loadMoreBtn);
  }
}

async function fetchMorePokemon(nextLimit) {
  const [{ results }] = await Promise.all([
    fetch(`${BASE_URL}?limit=${nextLimit}&offset=${offset}`).then((r) => r.json()),
    new Promise((r) => setTimeout(r, 800)),
  ]);
  const filtered = (results || []).filter((entry) => {
    const pokemonId = extractIdFromUrl(entry.url);
    return Number.isFinite(pokemonId) && pokemonId <= MAX_DEX_ID;
  });
  return getPokemonsData({ results: filtered });
}

function loadMoreAppendPokemon(cardContainer, pokemonList, prevLimit, nextLimit) {
  cardContainer.innerHTML += templatePkmCard(pokemonList.slice(prevLimit, nextLimit));
  updateClickedLikes();
}

function endMorePokemon(loadMoreBtn) {
  toggleSpinner(false);
  loadingMorePkm = false;
  if (loadMoreBtn) loadMoreBtn.disabled = false;
}

/* ===============================
   POKEMON-BANNER Verarbeitung
   =============================== */
function renderPokemonBanner(pokemonData) {
  const bannerContainer = document.getElementById("pokemon_banner");
  if (!bannerContainer || !pokemonData) return;
  bannerContainer.innerHTML = templatePkmBanner(pokemonData);
}

async function loadPokemonBanner() {
  toggleSpinner(true);
  try {
    const randomPokemonId = Math.floor(Math.random() * MAX_DEX_ID) + 1;
    const pokemonRequestData = { results: [{ url: `${BASE_URL}/${randomPokemonId}` }] };
    const pokemonList = await getPokemonsData(pokemonRequestData);
    if (pokemonList && pokemonList.length) renderPokemonBanner(pokemonList[0]);
  } catch (e) {
    console.error("loadPokemonBanner:", e);
    const bannerContainer = document.getElementById("pokemon_banner");
    if (bannerContainer) bannerContainer.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
  } finally {
    toggleSpinner(false);
  }
}

/* ===============================
   BOOTSTRAP 
   =============================== */
function initializePokedex() {
  loadHeroWrap();
  renderDexIndexSection();
  renderPkmTypes();
  loadPokemonBanner();
  loadPokemonCard();
}
initializePokedex();
