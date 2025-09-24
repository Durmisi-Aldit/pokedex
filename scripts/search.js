"use strict";

window.searchCache = window.searchCache || new Map();

/* ===============================
   Konfiguration
   =============================== */
const MAX_DROPDOWN_RESULTS = 8;
const PARALLEL_REQUESTS = 8;
const ENRICH_BATCH_SIZE = 40;

/* ===============================
   Globale Daten
   =============================== */
let ALL_IDS = [];
let DE_NAME_BY_ID = Object.create(null);
let IMAGE_URL_BY_ID = Object.create(null);
let ENRICH_INDEX = 0;

/* ===============================
   UI-Helper SEARCH
   =============================== */
function showOrHide(containerEl, isVisible = true) {
  if (containerEl) containerEl.style.display = isVisible ? "block" : "none";
}

function createDebouncedFunction(action, delay = 300) {
  let timeoutId = null;
  return (...params) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => action(...params), delay);
  };
}

/* ===============================
   Dropdown Rendering
   =============================== */
function showDropdownLoading(dropdownContainer) {
  renderSearchResultsDropdown(dropdownContainer, [], { loading: true });
}

function showDropdownEmpty(dropdownContainer) {
  renderSearchResultsDropdown(dropdownContainer, [], { loading: false });
}

function renderSearchResultsDropdown(dropdownEl, searchResults = [], { loading = false } = {}) {
  if (!dropdownEl) return;

  if (loading) {
    dropdownEl.innerHTML = '<div class="search-empty">Daten werden geladen … bitte warten</div>';
    showOrHide(dropdownEl, true);
    return;
  }

  const resultsArray = Array.isArray(searchResults) ? searchResults : [];
  let dropdownHtml = '<div class="search-empty">Keine Treffer</div>';
  if (resultsArray.length) {
    try {
      dropdownHtml = resultsArray.slice(0, MAX_DROPDOWN_RESULTS).map(templateSearchDropdown).join("");
    } catch (err) {
      console.warn("Dropdown-Rendering fehlgeschlagen:", err);
      dropdownHtml = '<div class="search-empty">Keine Treffer</div>';
    }
  }

  dropdownEl.innerHTML = dropdownHtml;
  showOrHide(dropdownEl, true);
}

/* ===============================
   Cache-Handling LocalStorage
   =============================== */
function loadCacheFromLocalStorage() {
  try {
    const savedNamesJson = localStorage.getItem("pkm_de_name");
    if (savedNamesJson) DE_NAME_BY_ID = JSON.parse(savedNamesJson);

    const savedImagesJson = localStorage.getItem("pkm_img_url");
    if (savedImagesJson) IMAGE_URL_BY_ID = JSON.parse(savedImagesJson);
  } catch (err) {
    console.warn("loadCacheFromLocalStorage: Konnte localStorage nicht lesen:", err);
  }
}

function saveCacheToLocalStorage() {
  try {
    localStorage.setItem("pkm_de_name", JSON.stringify(DE_NAME_BY_ID));
    localStorage.setItem("pkm_img_url", JSON.stringify(IMAGE_URL_BY_ID));
  } catch (err) {
    console.warn("saveCacheToLocalStorage: Konnte localStorage nicht schreiben:", err);
  }
}

/* ===============================
   Daten-Laden & Anreichern
   =============================== */
function parsePokemonId(anyId) {
  const n = parseInt(String(anyId).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

async function loadPokemonBatch(startIndex, limit) {
  if (!ALL_IDS.length || limit <= 0) return;

  const endIndex = Math.min(startIndex + limit, ALL_IDS.length);
  if (endIndex <= startIndex) return;

  const idRange = ALL_IDS.slice(startIndex, endIndex);

  try {
    for (let i = 0; i < idRange.length; i += PARALLEL_REQUESTS) {
      const batch = idRange.slice(i, i + PARALLEL_REQUESTS);
      const batchRequest = { results: batch.map((id) => ({ url: `${BASE_URL}/${id}` })) };

      let responseList;
      try {
        responseList = await getPokemonsData(batchRequest);
      } catch (err) {
        console.warn("loadPokemonBatch: getPokemonsData fehlgeschlagen:", err, batch);
        continue;
      }

      for (const item of responseList || []) {
        const id = parsePokemonId(item.id);
        if (id == null) continue;

        DE_NAME_BY_ID[id] = typeof item.name === "string" ? item.name : null;
        IMAGE_URL_BY_ID[id] = item.image || "";
      }
    }
  } finally {
    ENRICH_INDEX = Math.max(ENRICH_INDEX, endIndex);
    saveCacheToLocalStorage();
  }
}

/* ===============================
   Suche im Cache
   =============================== */
function findPokemonNamesByPrefix(query) {
  const queryLower = query.toLowerCase();
  const results = [];
  for (const id of ALL_IDS) {
    const de = DE_NAME_BY_ID[id];
    if (typeof de === "string" && de.toLowerCase().startsWith(queryLower)) {
      results.push({ id, de, img: IMAGE_URL_BY_ID[id] || "" });
    }
  }
  results.sort((a, b) => (a.de || "").localeCompare(b.de || ""));
  return results;
}

/* ===============================
   Input-Aufbereitung
   =============================== */
function getSearchInput(form) {
  const dropdownEl = form._dropdownEl;
  const inp = form._inp;
  if (!dropdownEl || !inp) {
    return { dropdownEl: null, inputValue: "", q: "" };
  }

  const inputValue = (inp.value || "").trim();
  const q = inputValue.toLowerCase();
  return { dropdownEl, inputValue, q };
}

/* ===============================
   Suchstrategien nach ID & Prefix
   =============================== */
async function findPokemonById(inputValue, dropdownEl) {
  if (!/^\d+$/.test(inputValue)) return false;
  const id = +inputValue;
  if (!(id > 0 && id <= MAX_DEX_ID)) {
    showDropdownEmpty(dropdownEl);
    return true;
  }

  showDropdownLoading(dropdownEl);

  try {
    const requestPayload = { results: [{ url: `${BASE_URL}/${id}` }] };
    const list = await getPokemonsData(requestPayload);
    const p = list && list[0];
    renderSearchResultsDropdown(dropdownEl, p ? [{ id, de: p.name || `#${id}`, img: p.image || "" }] : []);
  } catch (err) {
    console.warn("findPokemonById: ID-Fetch fehlgeschlagen:", err);
    showDropdownEmpty(dropdownEl);
  }
  return true;
}

async function findPokemonsByPrefix(inputValue, dropdownEl) {
  if (inputValue.length < 3) {
    showOrHide(dropdownEl, false);
    return;
  }

  const prefix = inputValue.slice(0, 3);
  let matches = findPokemonNamesByPrefix(prefix);

  let attempts = 0;
  while (matches.length < MAX_DROPDOWN_RESULTS && ENRICH_INDEX < ALL_IDS.length && attempts < 3) {
    showDropdownLoading(dropdownEl);
    await loadPokemonBatch(ENRICH_INDEX, ENRICH_BATCH_SIZE);
    matches = findPokemonNamesByPrefix(prefix);
    attempts++;
  }

  if (matches.length) renderSearchResultsDropdown(dropdownEl, matches);
  else showDropdownEmpty(dropdownEl);
}

/* ===============================
   Such-Koordinator
   =============================== */
async function searchCoordinator(form) {
  const { dropdownEl, inputValue, q } = getSearchInput(form);
  if (!dropdownEl) return;

  const handled = await findPokemonById(inputValue, dropdownEl);
  if (handled) return;

  await findPokemonsByPrefix(q, dropdownEl);
}

/* ===============================
   Event-Verarbeitung
   =============================== */
async function processSearchEvent(searchForm, eventType) {
  if (eventType === "input") {
    await searchCoordinator(searchForm);
    return;
  }

  if (eventType === "submit") {
    const dropdownEl = searchForm._dropdownEl;
    if (!dropdownEl) return;

    const resultLinks = dropdownEl.querySelectorAll("a[data-id]");
    const selectedIds = Array.from(resultLinks)
      .map((link) => link.getAttribute("data-id"))
      .filter(Boolean);

    if (selectedIds.length > 0) {
      location.href = "search-results.html?ids=" + encodeURIComponent(selectedIds.join(","));
    } else {
      showDropdownEmpty(dropdownEl);
    }
  }
}

/* ===============================
   Setup UI
   =============================== */
function setupSearchUI() {
  const f = document.getElementById("search");
  if (!f) return;

  const inp = document.getElementById("q") || f.querySelector("input");
  let dropdownEl = document.getElementById("dropdownEl");

  if (!dropdownEl) {
    dropdownEl = document.createElement("div");
    dropdownEl.id = "dropdownEl";
    dropdownEl.className = "search-dropdown";
    dropdownEl.setAttribute("role", "listbox");
    dropdownEl.style.display = "none";
    f.appendChild(dropdownEl);
  }

  f._dropdownEl = dropdownEl;
  f._inp = inp;

  const debouncedInput = createDebouncedFunction(() => processSearchEvent(f, "input"), 300);
  if (inp) inp.oninput = debouncedInput;

  f.onsubmit = (e) => {
    e.preventDefault();
    processSearchEvent(f, "submit");
  };
}

/* ===============================
   Initial-Ansicht
   =============================== */
function showInitialDropdownLoading() {
  const dropdownEl = document.getElementById("dd");
  if (dropdownEl) showDropdownLoading(dropdownEl);
}

/* ===============================
   IDs initialisieren
   =============================== */
function initializePokemonIds() {
  if (!ALL_IDS.length) {
    ALL_IDS = Array.from({ length: MAX_DEX_ID }, (_, i) => i + 1);
  }
}

/* ===============================
   BOOTSTRAP
   =============================== */
loadCacheFromLocalStorage();
initializePokemonIds();
setupSearchUI();
window.onload = showInitialDropdownLoading;
