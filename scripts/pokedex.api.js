"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";
const limit = 15;
const offset = 0;

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

function typeIconPath(typeName) {
  return `./img/icon/${typeName}.svg`;
}

function renderTypeIcons(types) {
  let html = "";
  const max = Math.min(types.length, 2);
  for (let i = 0; i < max; i++) {
    const t = types[i];
    html += `
      <li class="pkm_type color_${t}">
        <img src="${typeIconPath(t)}" alt="${t}" />
      </li>`;
  }
  return html;
}

async function getPokemons(data) {
  const pokemons = [];
  for (const item of data.results) {
    const details = await (await fetch(item.url)).json();

    const stage = await getStage(details.species.url);
    const id = "#" + String(details.id).padStart(3, "0");
    const hpStat = details.stats.find((s) => s.stat?.name === "hp");

    const types = [];
    for (const t of details.types) {
      types.push(t.type.name);
    }

    pokemons.push({
      stage: stage,
      name: cap(details.name),
      hp: {
        title: hpStat.stat.name.toUpperCase(),
        value: hpStat.base_stat,
      },
      types: types,
      image: details.sprites.other.dream_world.front_default,
      id: id,
      height: formatHeight(details.height),
      weight: formatWeight(details.weight),
    });
  }

  return pokemons;
}
