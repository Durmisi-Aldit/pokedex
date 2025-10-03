"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";
const TYPES_URL = "https://pokeapi.co/api/v2/type/";
const ANIMATION_IMAGE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";

const LIMIT = 20;
const MAX_DEX_ID = 1025;
const offset = 0;
const HERO_SLOT_LIMIT = 7;
const HERO_RENDER_INTERVAL_MS = 100000;
const INDEX_CARD_LIMIT = 5;

const abilityCache = new Map();
const eggGroupCache = new Map();
const moveCache = new Map();

let heroDataRef = [];
let heroRenderIntervalId = null;
let cachedTypes = null;
let loadingMorePkm = false;
let spinnerCount = 0;

const availableTypeIcons = Object.freeze([
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
]);

const TYPE_LABEL_DE = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  grass: "Pflanze",
  electric: "Elektro",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
  fairy: "Fee",
};

/* ===============================
   FETCH API 
  =============================== */
async function fetchPokemonData() {
  const url = `${BASE_URL}?limit=${LIMIT}&offset=${offset}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("fetchPokemonData() failed:", response.status, response.statusText);
    throw new Error(`fetchPokemonData: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function fetchPokemonDataHero() {
  try {
    const smallRes = await fetch(`${BASE_URL}?limit=${LIMIT}&offset=${offset}`);
    if (!smallRes.ok) throw new Error(`Hero small fetch failed: ${smallRes.status}`);
    const smallData = await smallRes.json();

    const bigPromise = fetch(`${BASE_URL}?limit=${MAX_DEX_ID}&offset=${offset}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Hero big fetch failed: ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        console.error("Fehler beim Hero-Fetch (MAX_DEX_ID):", err);
        return null;
      });

    return { small: smallData, big: bigPromise };
  } catch (err) {
    console.error("Fehler in fetchPokemonDataHero:", err);
    return { small: { results: [] }, big: Promise.resolve(null) };
  }
}

/* ===============================
   FETCH STAGE 
  =============================== */
async function getStage(speciesUrl) {
  const speciesRes = await fetch(speciesUrl);
  if (!speciesRes.ok) throw new Error(`getStage species failed: ${speciesRes.status}`);
  const species = await speciesRes.json();

  if (!species.evolves_from_species) return "Basis";

  const preSpeciesRes = await fetch(`${SPECIES_URL}${species.evolves_from_species.name}/`);
  if (!preSpeciesRes.ok) throw new Error(`getStage pre-species failed: ${preSpeciesRes.status}`);
  const preSpecies = await preSpeciesRes.json();

  return preSpecies.evolves_from_species ? "Stufe 2" : "Stufe 1";
}

/* ===============================
   ALLE API DATEN HOLEN
   =============================== */
async function safeFetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getPokemonsData(data, options = {}) {
  const { includeEvolution = true } = options;
  const results = data?.results || [];
  const pokemons = [];

  for (const item of results) {
    const details = await safeFetchJson(item.url);
    if (!details) continue;

    // ---- Stage
    let stage = "Basis";
    try {
      stage = await getStage(details.species?.url);
    } catch {
      stage = "Basis";
    }

    // ---- IDs
    const numId = Number(details.id);
    const id = "#" + String(numId).padStart(3, "0");

    // ---- HP
    const hpObj = details.stats?.find((s) => s.stat?.name === "hp");
    const hp = { title: (hpObj?.stat?.name || "HP").toUpperCase(), value: hpObj?.base_stat ?? 0 };

    // ---- Typen
    const types = (details.types || []).map((t) => t.type?.name).filter(Boolean);
    const mainType = types[0] || "normal";

    // ---- Bilder
    const dream = details.sprites?.other?.dream_world?.front_default;
    const official = details.sprites?.other?.["official-artwork"]?.front_default;
    const front = details.sprites?.front_default;
    const artwork = official || dream || front;
    const image = getPokemonImage({ image: artwork });

    // ---- GIF

    const gif = details.sprites?.other?.showdown?.front_default || "";

    // ---- Name & Beschreibung (DE bevorzugt)
    let name = cap(details.name);
    let desc = "";
    const species = await safeFetchJson(details.species?.url);
    if (species) {
      const entries = species.flavor_text_entries || [];
      const poolDe = entries.filter((e) => e.language?.name === "de");
      const poolEn = entries.filter((e) => e.language?.name === "en");
      const chosen = poolDe.length ? poolDe : poolEn;
      if (chosen.length) {
        const rand = chosen[Math.floor(Math.random() * chosen.length)];
        desc = cap(
          String(rand.flavor_text || "")
            .replace(/\s+/g, " ")
            .replace(/\f/g, " ")
            .trim()
        );
      }
      const deNameRec = (species.names || []).find((n) => n.language?.name === "de");
      if (deNameRec?.name) name = cap(deNameRec.name);
    }

    // ---- Stats Map
    const statsMap = Object.fromEntries((details.stats || []).map((s) => [s.stat?.name, s.base_stat]));

    // ---- Fähigkeiten (DE, max. 2)
    let abilities = [];
    let abilitiesText = "–";
    let abilitiesHtml = "";

    if (Array.isArray(details.abilities) && details.abilities.length) {
      const limited = details.abilities.slice(0, 2);
      for (const a of limited) {
        const abilityUrl = a?.ability?.url;
        const fallbackEn = a?.ability?.name || "";
        if (!abilityUrl && fallbackEn) {
          abilities.push(fallbackEn);
          continue;
        }
        if (!abilityUrl) continue;

        let abilityDetails = abilityCache.get(abilityUrl);
        if (!abilityDetails) {
          abilityDetails = await safeFetchJson(abilityUrl).catch(() => null);
          if (abilityDetails) abilityCache.set(abilityUrl, abilityDetails);
        }
        const deName = abilityDetails?.names?.find((n) => n?.language?.name === "de")?.name || fallbackEn;
        abilities.push(deName);
      }

      const pretty = (s) =>
        typeof cap === "function" ? cap(String(s).replace(/-/g, " ")) : String(s).replace(/-/g, " ");
      abilities = abilities.filter(Boolean).map(pretty);

      if (abilities.length) {
        abilitiesText = abilities.join(", ");
        abilitiesHtml = abilities.map((n) => `<span class="ability-badge">${escapeHtml(n)}</span>`).join(" ");
      }
    }
    const abilityPrimary = abilities[0] || "–";

    // ----  Ei-Gruppen (DE)
    let eggGroups = [];
    let eggGroupsText = "–";
    let eggGroupsHtml = "";

    if (species?.egg_groups && species.egg_groups.length) {
      for (const eg of species.egg_groups) {
        const url = eg?.url;
        const fallbackEn = eg?.name || "";
        if (!url && fallbackEn) {
          eggGroups.push(fallbackEn);
          continue;
        }
        if (!url) continue;

        let egDetails = eggGroupCache.get(url);
        if (!egDetails) {
          egDetails = await safeFetchJson(url).catch(() => null);
          if (egDetails) eggGroupCache.set(url, egDetails);
        }
        const deName = egDetails?.names?.find((n) => n?.language?.name === "de")?.name || fallbackEn;
        eggGroups.push(deName);
      }
      const pretty = (s) =>
        typeof cap === "function" ? cap(String(s).replace(/-/g, " ")) : String(s).replace(/-/g, " ");
      eggGroups = eggGroups.filter(Boolean).map(pretty);
      if (eggGroups.length) {
        eggGroupsText = eggGroups.join(", ");
        eggGroupsHtml = eggGroups.map((n) => `<span class="egg-badge">${escapeHtml(n)}</span>`).join(" ");
      }
    }

    // ----  Freundschaft
    const friendship = typeof species?.base_happiness === "number" ? species.base_happiness : null;

    // ---- Cry
    const cry = details.cries?.latest || details.cries?.legacy || "";

    // Moves (DE)
    const rawMoves = (details.moves || []).slice(0, 10);
    const movesDe = [];

    for (const m of rawMoves) {
      const url = m?.move?.url;
      const en = m?.move?.name || "";
      let de = en;
      if (url) {
        let data = moveCache.get(url);
        if (!data) {
          data = await safeFetchJson(url).catch(() => null);
          moveCache.set(url, data);
        }
        de = data?.names?.find((n) => n.language?.name === "de")?.name || en;
      }
      movesDe.push(de);
    }
    const moves = movesDe.map((n) =>
      typeof cap === "function" ? cap(String(n).replace(/-/g, " ")) : String(n).replace(/-/g, " ")
    );

    // ---- Species Extras
    let speciesTitle = stage;
    let genderRate = "–";
    let catchRateStr = "–";
    if (species) {
      speciesTitle =
        (species.genera || []).find((g) => g.language?.name === "de")?.genus ||
        (species.genera || []).find((g) => g.language?.name === "en")?.genus ||
        stage;

      if (typeof species.gender_rate === "number") {
        if (species.gender_rate < 0) genderRate = "Geschlechtslos";
        else {
          const female = species.gender_rate * 12.5;
          const male = 100 - female;
          genderRate = `♂️ ${male.toFixed(1)}% / ♀️ ${female.toFixed(1)}%`;
        }
      }
      const cr = Number(species.capture_rate ?? NaN);
      catchRateStr = Number.isFinite(cr) ? String(cr) : "–";
    }

    // ---- Evolution
    let evolution = [];
    if (includeEvolution && species?.evolution_chain?.url) {
      try {
        const chain = await safeFetchJson(species.evolution_chain.url);
        let cur = chain?.chain;
        const seq = [];
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
        evolution = seq;
      } catch {}
    }

    // ---- Prev/Nächste Namen
    let prevName = "",
      nextName = "";
    if (numId > 1) {
      const prevSpecies = await safeFetchJson(`${SPECIES_URL}${numId - 1}/`);
      if (prevSpecies) {
        const prevDe = prevSpecies.names?.find((n) => n.language?.name === "de");
        prevName = prevDe?.name || cap(prevSpecies.name);
      }
    }
    if (numId < MAX_DEX_ID) {
      const nextSpecies = await safeFetchJson(`${SPECIES_URL}${numId + 1}/`);
      if (nextSpecies) {
        const nextDe = nextSpecies.names?.find((n) => n.language?.name === "de");
        nextName = nextDe?.name || cap(nextSpecies.name);
      }
    }

    // ---- HTML-Snippets
    const typeBadgesHtml = buildTypeBadgesHtml ? buildTypeBadgesHtml(types) : "";
    const statsBarsHtml = buildStatsBarsHtml ? buildStatsBarsHtml(statsMap) : "";
    const movesGridHtml = buildMovesGridHtml ? buildMovesGridHtml(moves, mainType) : "";
    const evolutionHtml = buildEvolutionChainHtml ? buildEvolutionChainHtml(evolution) : "";

    // ---- ALLE Objekt pushen
    pokemons.push({
      stage,
      id,
      name,
      hp,
      types,
      image,
      artwork,
      gif,
      height: formatHeight(details.height),
      weight: formatWeight(details.weight),
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
      prevId: Math.max(1, numId - 1),
      nextId: numId + 1,
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

  for (const p of pokemons) {
    const num = parseInt(String(p.id).replace(/\D/g, ""), 10);
    if (Number.isFinite(num)) searchCache.set(num, p);
  }

  return pokemons;
}
