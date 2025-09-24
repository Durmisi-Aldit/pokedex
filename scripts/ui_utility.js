"use strict";
/* ===============================
   UI-Helper
   =============================== */
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

function toggleSpinner(show = true) {
  const spinner = document.getElementById("spinnerOverlay");
  if (!spinner) return;

  if (show) spinnerCount++;
  else spinnerCount = Math.max(0, spinnerCount - 1);

  spinner.style.display = spinnerCount > 0 ? "flex" : "none";
}

function getMainTypeClass(p) {
  const t = p?.types?.[0] || "normal";
  return `color_${t}`;
}

function getTypeIconPath(typeName) {
  return `./img/icon/${typeName}.svg`;
}

function getPokemonImage(p) {
  if (p?.image) return p.image;
  return "./img/placeholder/placeholder.png";
}

function templateTypeList(types = [], max = 2) {
  return (Array.isArray(types) ? types : []).slice(0, max).map(templateTypeList).join("");
}

function typeLabelDe(t) {
  return TYPE_LABEL_DE[t] || cap(t);
}

function scrollPKMCard(cardId, preornext) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const scroller = document.getElementById("pokedex_index");
  if (!scroller) return;
  scroller.scrollBy({
    left: preornext * scroller.clientWidth,
    behavior: "smooth",
  });
}
