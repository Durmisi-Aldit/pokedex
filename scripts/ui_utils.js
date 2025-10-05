"use strict";

//  Scroll/Overlays/Mobile
const openSearchBtn = document.getElementById("openSearch");
const closeSearchBtn = document.getElementById("closeSearch");
const searchOverlay = document.getElementById("searchOverlay");
const openMenuBtn = document.getElementById("openMenu");
const closeMenuBtn = document.getElementById("closeMenu");
const offcanvas = document.getElementById("offcanvas");
const backdrop = document.getElementById("offcanvasBackdrop");
const searchForm = document.getElementById("search");
const originalParent = searchForm ? searchForm.parentNode : null;
const originalNext = searchForm ? searchForm.nextSibling : null;

function lockScroll() {
  document.documentElement.style.overflow = "hidden";
}

function unlockScroll() {
  document.documentElement.style.overflow = "";
}

function moveFormToOverlay() {
  if (!searchOverlay || !searchForm) return;
  const overlayCard = searchOverlay.firstElementChild || searchOverlay;
  searchForm.classList && searchForm.classList.add("in-overlay");
  overlayCard.appendChild(searchForm);
}

function moveFormBack() {
  if (!searchForm || !originalParent) return;
  searchForm.classList && searchForm.classList.remove("in-overlay");
  if (originalNext && originalNext.parentNode === originalParent) originalParent.insertBefore(searchForm, originalNext);
  else originalParent.appendChild(searchForm);
}

function openSearch() {
  if (!searchOverlay) return;
  moveFormToOverlay();
  searchOverlay.classList.add("active");
  searchOverlay.setAttribute("aria-hidden", "false");
  lockScroll();
  const firstElm = searchForm?.elements?.[0];
  firstElm?.focus?.();
}

function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove("active");
  searchOverlay.setAttribute("aria-hidden", "true");
  moveFormBack();
  unlockScroll();
}

function openMenu() {
  if (!offcanvas || !backdrop) return;
  offcanvas.classList.add("active");
  offcanvas.setAttribute("aria-hidden", "false");
  backdrop.classList.add("active");
  backdrop.setAttribute("aria-hidden", "false");
  openMenuBtn?.setAttribute("aria-expanded", "true");
  lockScroll();
}

function closeMenu() {
  if (!offcanvas || !backdrop) return;
  offcanvas.classList.remove("active");
  offcanvas.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("active");
  backdrop.setAttribute("aria-hidden", "true");
  openMenuBtn?.setAttribute("aria-expanded", "false");
  unlockScroll();
}

function initMobileEvents() {
  openSearchBtn && (openSearchBtn.onclick = openSearch);
  closeSearchBtn && (closeSearchBtn.onclick = closeSearch);
  openMenuBtn && (openMenuBtn.onclick = openMenu);
  closeMenuBtn && (closeMenuBtn.onclick = closeMenu);
  backdrop && (backdrop.onclick = closeMenu);
  searchOverlay &&
    (searchOverlay.onclick = (e) => {
      if (e?.target === searchOverlay) closeSearch();
    });
}

document.onkeydown = function (e) {
  const k = e?.key || e?.keyCode;
  if (k === "Escape" || k === 27) {
    if (searchOverlay?.classList.contains("active")) closeSearch();
    if (offcanvas?.classList.contains("active")) closeMenu();
  }
};

initMobileEvents();

//  Text/Number Utils
function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatHeight(h) {
  return (h / 10).toFixed(1) + " m";
}

function formatWeight(w) {
  return (w / 10).toFixed(1) + " kg";
}

function padDex(n) {
  return "#" + String(n).padStart(3, "0");
}

function langPick(arr, a, b) {
  const A = (arr || []).filter((e) => e?.language?.name === a);
  return A.length ? A : (arr || []).filter((e) => e?.language?.name === b);
}

function pretty(s) {
  return cap(String(s).replace(/-/g, " "));
}

function onlyDigits(s) {
  return parseInt(String(s).replace(/\D/g, ""), 10);
}

//  Type/Images
function getMainTypeClass(p) {
  const t = p?.types?.[0] || "normal";
  return `color_${t}`;
}

function getTypeIconPath(typeName) {
  return `./img/type-icon/${typeName}.svg`;
}

function typeLabelDe(t) {
  return TYPE_LABEL_DE?.[t] || cap(t);
}

function getPokemonImage(p) {
  return p?.image ? p.image : "./img/placeholder/placeholder.png";
}

//  Misc/UI
function toggleSpinner(show = true) {
  const spinner = document.getElementById("spinnerOverlay");
  if (!spinner) return;
  spinnerCount = show ? spinnerCount + 1 : Math.max(0, spinnerCount - 1);
  spinner.style.display = spinnerCount > 0 ? "flex" : "none";
}

//  Shared small templates
function templateTypeLi(t) {
  return `<li class="pkm_type color_${t}"><img src="${getTypeIconPath(t)}" alt="${t}"></li>`;
}

function templateTypeListe(types = [], max = 2) {
  return (Array.isArray(types) ? types : []).slice(0, max).map(templateTypeLi).join("");
}

function getNumIdForURL(pokemon) {
  if (!pokemon) return null;
  if (Number.isFinite(pokemon.numId)) return pokemon.numId;
  return onlyDigits(pokemon.id || "");
}
