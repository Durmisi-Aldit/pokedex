"use strict";

/* ===============================
   Holt IDs aus der URL 
   =============================== */
function getPokemonIdsFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  const idsParamValue = searchParams.get("ids");

  if (idsParamValue) {
    const idNumbers = idsParamValue
      .split(/[,\s]+/)
      .map((x) => parseInt(x, 10))
      .filter(Number.isFinite);
    return Array.from(new Set(idNumbers));
  }

  const singlePokemonId = parseInt(searchParams.get("id"), 10);

  if (Number.isFinite(singlePokemonId)) return [singlePokemonId];

  return [];
}

/* ===============================
   Lädt Pokémon über IDs 
   =============================== */
async function fetchPokemonsByIds(ids) {
  const pokemonRequest = { results: ids.map((id) => ({ url: `${BASE_URL}/${id}` })) };
  return await getPokemonsData(pokemonRequest);
}

/* ===============================
   Rendert Karten-Grid im Search-Result.
   =============================== */
function renderSearchCardGrid(detailContainer, detailPokemons) {
  if (!detailPokemons?.length) {
    detailContainer.innerHTML = '<p style="color:red">Keine gültigen IDs übergeben.</p>';
    return;
  }

  detailContainer.innerHTML = `
    <div class="search_grid">
      ${templatePkmCard(detailPokemons)}
    </div>
  `;

  if (typeof updateClickedLikes === "function") {
    updateClickedLikes("detailRoot", true);
  }
  if (typeof renderLikes === "function") renderLikes();
}

/* ===============================
   Bereitet die Seite für Search-Result vor 
   =============================== */
function initializeSearchResultsPage() {
  const detailContainer = document.getElementById("detailRoot");
  if (!detailContainer) return;

  const pokemonIds = getPokemonIdsFromUrl();
  if (!pokemonIds.length) {
    detailContainer.innerHTML = '<p style="color:red">Keine gültige ID/IDs in der URL.</p>';
    return;
  }

  (async function () {
    toggleSpinner(true);
    try {
      const pokemonDetails = await fetchPokemonsByIds(pokemonIds);
      renderSearchCardGrid(detailContainer, pokemonDetails);
    } catch (e) {
      console.error(e);
      detailContainer.innerHTML = '<p style="color:red">Fehler beim Laden.</p>';
    } finally {
      toggleSpinner(false);
    }
  })();
}

/* ===============================
   BOOTSTRAP 
   =============================== */
initializeSearchResultsPage();
