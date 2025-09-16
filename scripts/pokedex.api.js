"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";
const TYPES_URL = "https://pokeapi.co/api/v2/type/";
const limit = 20;
const heroLimit = 500;
const offset = 0;

let heroDataRef = [];
let heroInterval = null;
let allTypesCache = null;

const localIcons = Object.freeze([
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

async function fetchPokemonData() {
  const url = `${BASE_URL}?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("fetchPokemonData() failed:", response.status, response.statusText);
    throw new Error(`fetchPokemonData: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function fetchPokemonDataHero() {
  try {
    const smallRes = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
    if (!smallRes.ok) throw new Error(`Hero small fetch failed: ${smallRes.status}`);
    const smallData = await smallRes.json();

    const bigPromise = fetch(`${BASE_URL}?limit=${heroLimit}&offset=${offset}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Hero big fetch failed: ${r.status}`);
        return r.json();
      })
      .catch((err) => {
        console.error("Fehler beim Hero-Fetch (heroLimit):", err);
        return null;
      });

    return { small: smallData, big: bigPromise };
  } catch (err) {
    console.error("Fehler in fetchPokemonDataHero:", err);
    return { small: { results: [] }, big: Promise.resolve(null) };
  }
}

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
