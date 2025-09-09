"use strict";

const DataBase = "https://pokeapi.co/api/v2/pokemon";
const limit = 20;
const offset = 0;

async function loadPokemonData() {
  const response = await fetch(DataBase + "?limit=" + limit + "&offset=" + offset);
  const data = await response.json();

  console.log(data);
}

loadPokemonData();
