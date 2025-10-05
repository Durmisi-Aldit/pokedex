"use strict";

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";
const TYPES_URL = "https://pokeapi.co/api/v2/type/";
const ANIMATION_IMAGE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";

const LIMIT = 20;
const MAX_DEX_ID = 1025;
const offset = 0;

const HERO_SLOT_LIMIT = 7;
const HERO_RENDER_INTERVAL_MS = 100000;
const INDEX_CARD_LIMIT = 5;

const abilityCache = new Map();
const eggGroupCache = new Map();
const moveCache = new Map();

let heroDataRef = [];
let heroRenderIntervalId = null;
let cachedTypes = null;
let loadingMorePkm = false;
let spinnerCount = 0;

const availableTypeIcons = Object.freeze([
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

const TYPE_LABEL_DE = Object.freeze({
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  grass: "Pflanze",
  electric: "Elektro",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
  fairy: "Fee",
});
