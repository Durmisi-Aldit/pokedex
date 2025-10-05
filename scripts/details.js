"use strict";

// IDs aus URL holen
function getPokemonIdsFromUrl() {
  const sp = new URLSearchParams(window.location.search);
  const idsParam = sp.get("ids");
  if (idsParam) {
    const nums = idsParam
      .split(/[,\s]+/)
      .map((x) => parseInt(x, 10))
      .filter(Number.isFinite);
    return Array.from(new Set(nums));
  }
  const single = parseInt(sp.get("id"), 10);
  if (Number.isFinite(single)) return [single];
  return [];
}

// Pokémon über IDs laden
async function fetchPokemonsByIds(ids) {
  const request = { results: ids.map((id) => ({ url: `${BASE_URL}/${id}` })) };
  return await getPokemonsData(request);
}

// Search-Grid rendern
function renderSearchCardGrid(root, list) {
  if (!list?.length) {
    root.innerHTML = '<p style="color:red">Keine gültigen IDs übergeben.</p>';
    return;
  }
  root.innerHTML = `<div class="search_grid">${templatePkmCard(list)}</div>`;
  typeof updateClickedLikes === "function" && updateClickedLikes("detailRoot", true);
  typeof renderLikes === "function" && renderLikes();
}

function initializeSearchResultsPage() {
  const root = document.getElementById("detailRoot");
  if (!root) return;
  const ids = getPokemonIdsFromUrl();
  if (!ids.length) {
    root.innerHTML = '<p style="color:red">Keine gültige ID/IDs in der URL.</p>';
    return;
  }
  (async function () {
    toggleSpinner(true);
    try {
      const list = await fetchPokemonsByIds(ids);
      renderSearchCardGrid(root, list);
    } catch (e) {
      console.error(e);
      root.innerHTML = '<p style="color:red">Fehler beim Laden.</p>';
    } finally {
      toggleSpinner(false);
    }
  })();
}

initializeSearchResultsPage();
