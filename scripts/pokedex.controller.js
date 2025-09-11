"use strict";

async function loadPokemonData() {
  toggleSpinner(true);
  const pokemonCard = document.getElementById("pokedex");

  try {
    const data = await fetchPokemonData();
    const pokemons = await getPokemons(data);
    pokemonCard.innerHTML = template(pokemons);

    loadMorePokemon._currentLimit = limit;
  } catch (error) {
    pokemonCard.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
    console.error(error);
  }
  toggleSpinner(false);
}

loadPokemonData();

async function loadMorePokemon() {
  const container = document.getElementById("pokedex");
  const loadMoreButton = document.getElementById("load-more-btn");

  const prev = loadMorePokemon._currentLimit ?? limit;
  const next = prev + limit;
  loadMorePokemon._currentLimit = next;

  const minDelay = new Promise((r) => setTimeout(r, 1500));
  toggleSpinner(true);

  try {
    const data = await Promise.all([
      fetch(`${BASE_URL}?limit=${next}&offset=${offset}`).then((r) => r.json()),
      minDelay,
    ]).then(([d]) => d);

    const all = await getPokemons(data);
    const newly = all.slice(prev, next);
    container.innerHTML += template(newly);
  } catch (e) {
    console.error("Fehler in loadMorePokemon:", e);
  } finally {
    toggleSpinner(false);
  }
}

function toggleSpinner(show = true) {
  const spinnerOverlay = document.getElementById("spinnerOverlay");
  if (!spinnerOverlay) return;
  spinnerOverlay.style.display = show ? "flex" : "none";
}
