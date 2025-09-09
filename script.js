"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const limit = 5;
const offset = 0;
const pokemons = [];
const pokemonCard = document.getElementById("pokedex");

async function fetchPokemonData() {
  const response = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}`);
  return await response.json();
}

async function loadPokemonData() {
  pokemonCard.innerHTML = "<p>Lade Pokéde ...</p>";

  try {
    const data = await fetchPokemonData();
    const pokemons = await getPokemons(data);
    pokemonCard.innerHTML = template(pokemons);
  } catch (error) {
    pokemonCard.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
    console.error(error);
  }
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

function template(pokemons) {
  return `
    <ul>
      ${pokemons
        .map(
          (p) => `
        <li>
          <img src="${p.image}" alt="${p.name}">
          ${p.name}
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

loadPokemonData();
