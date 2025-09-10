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
  return pokemons
    .map(
      (pokemon) => `
  <article class="pkm_card type_grass" aria-labelledby="Pokemon Karte von ${pokemon.name} mit" aria-describedby="Pokemon Karte von ${pokemon.name}">
    <div class="pkm_container">
      <header class="pkm_header">
        <div class="pkm_header_left">
          <div class="pkm_stage">
            <span>Level</span>
          </div>
          <h2 class="pkm_name">${pokemon.name}</h2>
        </div>

        <div class="pkm_header_right">
          <div class="pkm_hit_points">
            <abbr class="pkm_hit_points_title" title="Hit Points">HP</abbr>
            <data class="pkm_hit_points_value" value="45">45</data>
          </div>

          <ul class="pkm_types" aria-label="Typen">
            <li class="pkm_type color_grass">
              <img src="https://dummyimage.com/12" width="12" height="12" alt="Pflanze" />
            </li>
            <li class="pkm_type color_poison">
              <img src="https://dummyimage.com/12" width="12" height="12" alt="Gift" />
            </li>
          </ul>
        </div>
      </header>
    </div>
  </article>  
`
    )
    .join("");
}

loadPokemonData();
