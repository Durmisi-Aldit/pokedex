"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const limit = 5;
const offset = 0;
const pokemons = [];

async function fetchPokemonData() {
  const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
  return await response.json();
}

async function getPokemons(data) {
  for (const item of data.results) {
    const res = await fetch(item.url);
    const details = await res.json();

    pokemons.push({
      name: details.name,
      image: details.sprites.front_default,
    });
  }

  return pokemons;
}
