"use strict";

//  Fetch Utils
async function fetchJsonOrThrow(requestUrl, contextLabel) {
  const response = await fetch(requestUrl);

  if (response.ok === false) {
    const errorMessage = `${contextLabel} fehlgeschlagen: ${response.status} ${response.statusText}`;
    console.error("Fehler beim Abrufen der Daten:", errorMessage);
    throw new Error(errorMessage);
  }
  const data = await response.json();

  return data;
}

async function fetchJsonSafe(requestUrl, contextLabel) {
  try {
    const response = await fetch(requestUrl);
    if (response.ok === false) {
      console.error(`${contextLabel} fehlgeschlagen: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`${contextLabel} hat einen Fehler verursacht:`, error);
    return null;
  }
}

//  API: Listen/Hero
async function loadPokemonList() {
  const requestUrl = `${BASE_URL}?limit=${LIMIT}&offset=${offset}`;
  return fetchJsonOrThrow(requestUrl, "loadPokemonList");
}

async function loadPokemonHeroData() {
  const smallListUrl = `${BASE_URL}?limit=${LIMIT}&offset=${offset}`;
  const bigListUrl = `${BASE_URL}?limit=${MAX_DEX_ID}&offset=${offset}`;

  const smallPromise = fetchJsonSafe(smallListUrl, "Hero: kleine Liste laden");
  const bigPromise = fetchJsonSafe(bigListUrl, "Hero: große Liste laden");

  const smallData = await smallPromise;
  const safeSmall = smallData ?? { results: [] };

  return { small: safeSmall, big: bigPromise };
}

//  Evolution-Stage
async function getEvolutionStage(pokemonSpeciesUrl) {
  const speciesData = await fetchJsonOrThrow(pokemonSpeciesUrl, "getEvolutionStage: species");

  if (!speciesData.evolves_from_species) return "Basis";

  const previousSpeciesData = await fetchJsonOrThrow(
    `${SPECIES_URL}${speciesData.evolves_from_species.name}/`,
    "getEvolutionStage: pre-species"
  );

  return previousSpeciesData.evolves_from_species ? "Stufe 2" : "Stufe 1";
}

//  Detailaufbau (kleine Helfer)
function buildId(details) {
  const numId = Number(details.id);
  return { numId, id: padDex(numId) };
}

function extractHP(details) {
  const hp = details.stats?.find((s) => s.stat?.name === "hp");
  return { title: (hp?.stat?.name || "HP").toUpperCase(), value: hp?.base_stat ?? 0 };
}

function extractTypes(details) {
  const types = (details.types || []).map((t) => t.type?.name).filter(Boolean);
  return { types, mainType: types[0] || "normal" };
}

function extractArtwork(details) {
  const d = details.sprites?.other?.dream_world?.front_default;
  const o = details.sprites?.other?.["official-artwork"]?.front_default;
  const f = details.sprites?.front_default;
  const artwork = o || d || f;
  return { artwork, image: getPokemonImage({ image: artwork }) };
}

function getPokemonGifUrl(pokemonDetails) {
  const gifUrl = pokemonDetails?.sprites?.other?.showdown?.front_default;
  return gifUrl || "";
}

async function loadSpecies(details) {
  return (await fetchJsonSafe(details.species?.url, "species")) || null;
}

function extractNameDesc(details, species) {
  let name = cap(details.name),
    desc = "";
  if (!species) return { name, desc };
  const chosen = langPick(species.flavor_text_entries || [], "de", "en");
  if (chosen.length) {
    const txt = String(chosen[Math.floor(Math.random() * chosen.length)]?.flavor_text || "");
    desc = cap(txt.replace(/\s+/g, " ").replace(/\f/g, " ").trim());
  }
  const de = species.names?.find((n) => n.language?.name === "de")?.name;
  if (de) name = cap(de);
  return { name, desc };
}

function createPokemonStatsMap(pokemonDetails) {
  const statsArray = pokemonDetails.stats || [];
  const statsMap = {};

  for (const statEntry of statsArray) {
    const statName = statEntry.stat?.name;
    const baseValue = statEntry.base_stat;

    if (statName) {
      statsMap[statName] = baseValue;
    }
  }

  return statsMap;
}

//  Übersetzungen
async function fetchCachedJson(url, cache, label) {
  if (!url) return null;
  let memo = cache.get(url);
  if (!memo) {
    memo = await fetchJsonSafe(url, label);
    if (memo) cache.set(url, memo);
  }
  return memo;
}

function extractGermanName(memo, fallback) {
  return memo?.names?.find((n) => n?.language?.name === "de")?.name || fallback || "";
}

function toPrettyList(items, badgeClass) {
  const list = items.filter(Boolean).map(pretty);
  const text = list.length ? list.join(", ") : "–";
  const html = list.length ? list.map((n) => `<span class="${badgeClass}">${escapeHtml(n)}</span>`).join(" ") : "";
  return { list, text, html };
}

async function translateAbilities(details) {
  const src = (details.abilities || []).slice(0, 2),
    names = [];
  for (const a of src) {
    const url = a?.ability?.url,
      fallback = a?.ability?.name || "";
    const memo = await fetchCachedJson(url, abilityCache, "translateAbilities: ability");
    names.push(extractGermanName(memo, fallback));
  }
  const { list, text, html } = toPrettyList(names, "ability-badge");
  return { abilities: list, abilitiesText: text, abilitiesHtml: html, abilityPrimary: list[0] || "–" };
}

async function translateEggGroups(species) {
  const src = species?.egg_groups || [];
  if (!src.length) return { eggGroups: [], eggGroupsText: "–", eggGroupsHtml: "" };
  const names = [];
  for (const eg of src) {
    const url = eg?.url,
      fallback = eg?.name || "";
    const memo = await fetchCachedJson(url, eggGroupCache, "translateEggGroups: group");
    names.push(extractGermanName(memo, fallback));
  }
  const { list, text, html } = toPrettyList(names, "egg-badge");
  return { eggGroups: list, eggGroupsText: text, eggGroupsHtml: html };
}

async function translateMoves(details) {
  const src = (details.moves || []).slice(0, 10),
    out = [];
  for (const m of src) {
    const url = m?.move?.url,
      fallback = m?.move?.name || "";
    const memo = await fetchCachedJson(url, moveCache, "translateMoves: move");
    out.push(extractGermanName(memo, fallback));
  }
  return out.filter(Boolean).map(pretty);
}

//  Meta/Misc
function speciesMeta(species, stage) {
  if (!species) return { speciesTitle: stage, genderRate: "–", catchRateStr: "–" };
  const de = species.genera?.find((g) => g.language?.name === "de")?.genus;
  const en = species.genera?.find((g) => g.language?.name === "en")?.genus;
  const speciesTitle = de || en || stage;
  let genderRate = "–";
  if (typeof species.gender_rate === "number") {
    if (species.gender_rate < 0) genderRate = "Geschlechtslos";
    else {
      const female = species.gender_rate * 12.5,
        male = 100 - female;
      genderRate = `♂️ ${male.toFixed(1)}% / ♀️ ${female.toFixed(1)}%`;
    }
  }
  const cr = Number(species.capture_rate ?? NaN);
  const catchRateStr = Number.isFinite(cr) ? String(cr) : "–";
  return { speciesTitle, genderRate, catchRateStr };
}

function miscBits(details, species) {
  const friendship = typeof species?.base_happiness === "number" ? species.base_happiness : null;
  const cry = details.cries?.latest || details.cries?.legacy || "";
  return { friendship, cry, height: formatHeight(details.height), weight: formatWeight(details.weight) };
}

//  Evolutions/Neighbor
async function buildEvolution(species, includeEvolution) {
  if (!includeEvolution || !species?.evolution_chain?.url) return [];
  const chain = await fetchJsonSafe(species.evolution_chain.url, "evo");
  let cur = chain?.chain,
    seq = [];
  while (cur) {
    const sid = parseInt((cur.species?.url || "").match(/\/(\d+)\/?$/)?.[1] || "", 10);
    seq.push({
      id: sid,
      name: cap(cur.species?.name || ""),
      artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${sid}.png`,
      condition: cur?.evolution_details?.[0]?.min_level ? `Level ${cur.evolution_details[0].min_level}` : "",
    });
    cur = (cur.evolves_to && cur.evolves_to[0]) || null;
  }
  return seq;
}

async function neighborNames(numId) {
  let prevName = "",
    nextName = "";
  if (numId > 1) {
    const s = await fetchJsonSafe(`${SPECIES_URL}${numId - 1}/`, "prev");
    prevName = s?.names?.find((n) => n.language?.name === "de")?.name || (s ? cap(s.name) : "");
  }
  if (numId < MAX_DEX_ID) {
    const s = await fetchJsonSafe(`${SPECIES_URL}${numId + 1}/`, "next");
    nextName = s?.names?.find((n) => n.language?.name === "de")?.name || (s ? cap(s.name) : "");
  }
  return { prevName, nextName };
}

//  Compose + Public API
function buildHtmlFragments(types, statsMap, moves, mainType, evolution) {
  return {
    typeBadgesHtml: typeof buildTypeBadgesHtml === "function" ? buildTypeBadgesHtml(types) : "",
    statsBarsHtml: typeof buildStatsBarsHtml === "function" ? buildStatsBarsHtml(statsMap) : "",
    movesGridHtml: typeof buildMovesGridHtml === "function" ? buildMovesGridHtml(moves, mainType) : "",
    evolutionHtml: typeof buildEvolutionChainHtml === "function" ? buildEvolutionChainHtml(evolution) : "",
  };
}

function composePokemon(p) {
  return { ...p, prevId: Math.max(1, p.numId - 1), nextId: p.numId + 1 };
}

function pushPokemon(arr, pokemon) {
  arr.push(pokemon);
  const num = pokemon.numId;
  if (Number.isFinite(num)) {
    window.searchCache = window.searchCache || new Map();
    window.searchCache.set(num, pokemon);
  }
}

async function buildPokemonFromItem(item, includeEvolution) {
  const details = await fetchJsonSafe(item.url, "details");
  if (!details) return null;

  let stage = "Basis";
  try {
    stage = await getEvolutionStage(details.species?.url);
  } catch {
    stage = "Basis";
  }
  const { numId, id } = buildId(details);
  const hp = extractHP(details);
  const { types, mainType } = extractTypes(details);
  const { artwork, image } = extractArtwork(details);
  const gif = getPokemonGifUrl(details);
  const species = await loadSpecies(details);
  const { name, desc } = extractNameDesc(details, species);
  const statsMap = createPokemonStatsMap(details);
  const { abilities, abilitiesText, abilitiesHtml, abilityPrimary } = await translateAbilities(details);
  const { eggGroups, eggGroupsText, eggGroupsHtml } = await translateEggGroups(species);
  const { friendship, cry, height, weight } = miscBits(details, species);
  const moves = await translateMoves(details);
  const { speciesTitle, genderRate, catchRateStr } = speciesMeta(species, stage);
  const evolution = await buildEvolution(species, includeEvolution);
  const { prevName, nextName } = await neighborNames(numId);
  const { typeBadgesHtml, statsBarsHtml, movesGridHtml, evolutionHtml } = buildHtmlFragments(
    types,
    statsMap,
    moves,
    mainType,
    evolution
  );

  return composePokemon({
    stage,
    id,
    name,
    hp,
    types,
    image,
    artwork,
    gif,
    height,
    weight,
    desc,
    numId,
    mainType,
    statsMap,
    cry,
    moves,
    evolution,
    speciesTitle,
    genderRate,
    catchRateStr,
    prevName,
    nextName,
    abilities,
    abilitiesText,
    abilitiesHtml,
    abilityPrimary,
    eggGroups,
    eggGroupsText,
    eggGroupsHtml,
    friendship,
    typeBadgesHtml,
    statsBarsHtml,
    movesGridHtml,
    evolutionHtml,
  });
}

async function getPokemonsData(payload, opt = {}) {
  const includeEvolution = opt.includeEvolution ?? true;
  const results = payload?.results || [];
  const pokemons = [];
  for (const item of results) {
    const p = await buildPokemonFromItem(item, includeEvolution);
    if (p) pushPokemon(pokemons, p);
  }
  return pokemons;
}
