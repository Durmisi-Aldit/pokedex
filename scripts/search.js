"use strict";

window.searchCache = window.searchCache || new Map();

const MAX_DROPDOWN_RESULTS = 8;
const PARALLEL_REQUESTS = 8;
const ENRICH_BATCH_SIZE = 40;

let ALL_IDS = [];
let DE_NAME_BY_ID = Object.create(null);
let IMAGE_URL_BY_ID = Object.create(null);
let ENRICH_INDEX = 0;

function showOrHide(el, vis = true) {
  if (el) el.style.display = vis ? "block" : "none";
}

function createDebouncedFunction(fn, delay = 300) {
  let t = null;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), delay);
  };
}

// Dropdownsteuerung
function showDropdownLoading(drop) {
  renderSearchResultsDropdown(drop, [], { loading: true });
}

function showDropdownEmpty(drop) {
  renderSearchResultsDropdown(drop, [], { loading: false });
}

function renderSearchResultsDropdown(drop, results = [], { loading = false } = {}) {
  if (!drop) return;
  if (loading) {
    drop.innerHTML =
      '<div class="search-empty"><p>Daten werden geladen … bitte warten</p><div class="search-loader"></div></div>';
    showOrHide(drop, true);
    return;
  }
  let html = '<div class="search-empty">Keine Treffer</div>';
  const arr = Array.isArray(results) ? results : [];
  if (arr.length) {
    try {
      html = arr.slice(0, MAX_DROPDOWN_RESULTS).map(templateSearchDropdown).join("");
    } catch (e) {
      console.warn("Dropdown-Rendering fehlgeschlagen:", e);
    }
  }
  drop.innerHTML = html;
  showOrHide(drop, true);
}

// Zwischenspeicherung
function loadCacheFromLocalStorage() {
  try {
    const n = localStorage.getItem("pkm_de_name");
    if (n) DE_NAME_BY_ID = JSON.parse(n);
    const i = localStorage.getItem("pkm_img_url");
    if (i) IMAGE_URL_BY_ID = JSON.parse(i);
  } catch (e) {
    console.warn("loadCacheFromLocalStorage:", e);
  }
}

function saveCacheToLocalStorage() {
  try {
    localStorage.setItem("pkm_de_name", JSON.stringify(DE_NAME_BY_ID));
    localStorage.setItem("pkm_img_url", JSON.stringify(IMAGE_URL_BY_ID));
  } catch (e) {
    console.warn("saveCacheToLocalStorage:", e);
  }
}

// Datenanreicherung
function parsePokemonId(any) {
  const n = parseInt(String(any).replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

async function loadPokemonBatch(start, limit) {
  if (!ALL_IDS.length || limit <= 0) return;
  const end = Math.min(start + limit, ALL_IDS.length);
  if (end <= start) return;
  const ids = ALL_IDS.slice(start, end);
  try {
    for (let i = 0; i < ids.length; i += PARALLEL_REQUESTS) {
      const batch = ids.slice(i, i + PARALLEL_REQUESTS);
      const req = { results: batch.map((id) => ({ url: `${BASE_URL}/${id}` })) };
      let list;
      try {
        list = await getPokemonsData(req);
      } catch (err) {
        console.warn("loadPokemonBatch:getPokemonsData", err, batch);
        continue;
      }
      for (const item of list || []) {
        const id = parsePokemonId(item.id);
        if (id == null) continue;
        DE_NAME_BY_ID[id] = typeof item.name === "string" ? item.name : null;
        IMAGE_URL_BY_ID[id] = item.image || "";
      }
    }
  } finally {
    ENRICH_INDEX = Math.max(ENRICH_INDEX, end);
    saveCacheToLocalStorage();
  }
}

// Suchkoordination
function findPokemonNamesByPrefix(q) {
  const L = q.toLowerCase(),
    out = [];
  for (const id of ALL_IDS) {
    const de = DE_NAME_BY_ID[id];
    if (typeof de === "string" && de.toLowerCase().startsWith(L)) out.push({ id, de, img: IMAGE_URL_BY_ID[id] || "" });
  }
  out.sort((a, b) => (a.de || "").localeCompare(b.de || ""));
  return out;
}

function getSearchInput(form) {
  const drop = form._dropdownEl,
    inp = form._inp;
  if (!drop || !inp) return { dropdownEl: null, inputValue: "", q: "" };
  const v = (inp.value || "").trim(),
    q = v.toLowerCase();
  return { dropdownEl: drop, inputValue: v, q };
}

async function findPokemonById(inputValue, dropdownEl) {
  if (!/^\d+$/.test(inputValue)) return false;
  const id = +inputValue;
  if (!(id > 0 && id <= MAX_DEX_ID)) {
    showDropdownEmpty(dropdownEl);
    return true;
  }
  showDropdownLoading(dropdownEl);
  try {
    const payload = { results: [{ url: `${BASE_URL}/${id}` }] };
    const list = await getPokemonsData(payload);
    const p = list && list[0];
    renderSearchResultsDropdown(dropdownEl, p ? [{ id, de: p.name || `#${id}`, img: p.image || "" }] : []);
  } catch (err) {
    console.warn("findPokemonById:", err);
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
  matches.length ? renderSearchResultsDropdown(dropdownEl, matches) : showDropdownEmpty(dropdownEl);
}

async function searchCoordinator(form) {
  const { dropdownEl, inputValue, q } = getSearchInput(form);
  if (!dropdownEl) return;
  const handled = await findPokemonById(inputValue, dropdownEl);
  if (handled) return;
  await findPokemonsByPrefix(q, dropdownEl);
}

// Initialisierung
async function processSearchEvent(form, type) {
  if (type === "input") {
    await searchCoordinator(form);
    return;
  }
  if (type === "submit") {
    const drop = form._dropdownEl;
    if (!drop) return;
    const links = drop.querySelectorAll("a[data-id]");
    const ids = [...links].map((a) => a.getAttribute("data-id")).filter(Boolean);
    if (ids.length > 0) location.href = "search-results.html?ids=" + encodeURIComponent(ids.join(","));
    else showDropdownEmpty(drop);
  }
}

function setupSearchUI() {
  const f = document.getElementById("search");
  if (!f) return;
  const inp = document.getElementById("q") || f.querySelector("input");
  const drop = document.getElementById("searchDropdown") || f.querySelector(".search-dropdown");
  f._inp = inp;
  f._dropdownEl = drop;
  loadCacheFromLocalStorage();
  ALL_IDS = Array.from({ length: MAX_DEX_ID }, (_, i) => i + 1);
  const debounced = createDebouncedFunction(() => processSearchEvent(f, "input"), 150);
  inp && inp.addEventListener("input", debounced);
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    processSearchEvent(f, "submit");
  });
}

setupSearchUI();
