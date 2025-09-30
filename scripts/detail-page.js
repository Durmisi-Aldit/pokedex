"use strict";

function getNumIdForURL(pokemon) {
  if (!pokemon) return null;
  if (Number.isFinite(pokemon.numId)) return pokemon.numId;
  return parseInt(String(pokemon.id || "").replace(/\D/g, ""), 10);
}
