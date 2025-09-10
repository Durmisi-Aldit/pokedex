"use strict";

async function loadPokemonData() {
  const pokemonCard = document.getElementById("pokedex");
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

loadPokemonData();
