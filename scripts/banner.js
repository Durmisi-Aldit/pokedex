"use strict";

// POKEMON-BANNER
function renderPokemonBanner(pokemonData, mountId = "pokemon_banner") {
  const bannerContainer = document.getElementById(mountId);
  if (!bannerContainer || !pokemonData) return;
  bannerContainer.innerHTML = templatePkmBanner(pokemonData);
}

function parseBannerArgs(arg) {
  const defaultMount = "pokemon_banner";
  if (typeof arg === "number") return { id: arg, mountId: defaultMount };
  if (arg && typeof arg === "object") return { id: Number(arg.id) || null, mountId: arg.mountId || defaultMount };
  return { id: null, mountId: defaultMount };
}

function ensurePokemonId(id) {
  return Number.isFinite(id) ? id : Math.floor(Math.random() * MAX_DEX_ID) + 1;
}

function renderBannerError(mountId, err) {
  console.error("loadPokemonBanner:", err);
  const el = document.getElementById(mountId || "pokemon_banner");
  if (el) el.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
}

async function loadPokemonBanner(arg) {
  toggleSpinner(true);
  const { id: rawId, mountId } = parseBannerArgs(arg);
  const id = ensurePokemonId(rawId);
  try {
    const payload = { results: [{ url: `${BASE_URL}/${id}` }] };
    const list = await getPokemonsData(payload, { includeEvolution: false });
    renderPokemonBanner(list?.[0] || null, mountId);
  } catch (e) {
    renderBannerError(mountId, e);
  } finally {
    toggleSpinner(false);
  }
}

async function loadRandomPokemonBanner(mountId = "pokemon_banner") {
  return loadPokemonBanner({ mountId });
}

loadPokemonBanner();
