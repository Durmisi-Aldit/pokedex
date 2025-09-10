"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";
const limit = 20;
const offset = 0;
const pokemons = [];

async function fetchPokemonData() {
  const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
  return await response.json();
}

function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatHeight(h) {
  return (h / 10).toFixed(1) + " m";
}

function formatWeight(w) {
  return (w / 10).toFixed(1) + " kg";
}

async function getStage(speciesUrl) {
  const species = await (await fetch(speciesUrl)).json();
  if (!species.evolves_from_species) return "Basis";

  const preSpecies = await (await fetch(`${SPECIES_URL}${species.evolves_from_species.name}/`)).json();
  return preSpecies.evolves_from_species ? "Stufe 2" : "Stufe 1";
}

async function getPokemons(data) {
  for (const item of data.results) {
    const details = await (await fetch(item.url)).json();
    const stage = await getStage(details.species.url);

    pokemons.push({
      id: details.id,
      name: cap(details.name),
      image: details.sprites.front_default,
      height: formatHeight(details.height),
      weight: formatWeight(details.weight),
      stage: stage,
    });
  }

  return pokemons;
}
