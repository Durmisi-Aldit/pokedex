"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";
const TYPES_URL = "https://pokeapi.co/api/v2/type/";

const LIMIT = 20;
const MAX_DEX_ID = 1025;
const offset = 0;
const HERO_SLOT_LIMIT = 7;
const HERO_RENDER_INTERVAL_MS = 100000;
const INDEX_CARD_LIMIT = 15;

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
   ALLE API DATEN 
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

async function getPokemonsData(data) {
  const results = data?.results || [];
  const pokemons = [];

  for (const item of results) {
    const details = await safeFetchJson(item.url);
    if (!details) continue;

    let stage = "Basis";
    try {
      stage = await getStage(details.species?.url);
    } catch {
      stage = "Basis";
    }

    const id = "#" + String(details.id).padStart(3, "0");

    const hpObj = details.stats?.find((s) => s.stat?.name === "hp");
    const hp = {
      title: (hpObj?.stat?.name || "HP").toUpperCase(),
      value: hpObj?.base_stat ?? 0,
    };

    const types = (details.types || []).map((t) => t.type?.name).filter(Boolean);

    const dream = details.sprites?.other?.dream_world?.front_default;
    const official = details.sprites?.other?.["official-artwork"]?.front_default;
    const front = details.sprites?.front_default;
    const artwork = official || dream || front;
    const image = getPokemonImage({ image: artwork });

    const gif =
      details.sprites?.other?.showdown?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${details.id}.gif`;

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
            .trim()
        );
      }

      const deName = (species.names || []).find((n) => n.language?.name === "de");
      if (deName?.name) name = cap(deName.name);
    }

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
    });
  }

  for (const p of pokemons) {
    const num = parseInt(String(p.id).replace(/\D/g, ""), 10);
    if (Number.isFinite(num)) searchCache.set(num, p);
  }

  return pokemons;
}
