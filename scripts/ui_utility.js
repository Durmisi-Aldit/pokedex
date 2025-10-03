"use strict";
/* ===============================
   UI-Helper
   =============================== */

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
  if (searchForm.classList) searchForm.classList.add("in-overlay");
  overlayCard.appendChild(searchForm);
}

function moveFormBack() {
  if (!searchForm || !originalParent) return;
  if (searchForm.classList) searchForm.classList.remove("in-overlay");
  if (originalNext && originalNext.parentNode === originalParent) {
    originalParent.insertBefore(searchForm, originalNext);
  } else {
    originalParent.appendChild(searchForm);
  }
}

function openSearch() {
  if (!searchOverlay) return;
  moveFormToOverlay();
  searchOverlay.classList.add("active");
  searchOverlay.setAttribute("aria-hidden", "false");
  lockScroll();
  if (searchForm && searchForm.elements && searchForm.elements.length) {
    const firstElm = searchForm.elements[0];
    if (firstElm && firstElm.focus) {
      setTimeout(function () {
        firstElm.focus();
      }, 50);
    }
  }
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
  if (openMenuBtn) openMenuBtn.setAttribute("aria-expanded", "true");
  lockScroll();
}

function closeMenu() {
  if (!offcanvas || !backdrop) return;
  offcanvas.classList.remove("active");
  offcanvas.setAttribute("aria-hidden", "true");
  backdrop.classList.remove("active");
  backdrop.setAttribute("aria-hidden", "true");
  if (openMenuBtn) openMenuBtn.setAttribute("aria-expanded", "false");
  unlockScroll();
}

function initMobileEvents() {
  if (openSearchBtn) openSearchBtn.onclick = openSearch;
  if (closeSearchBtn) closeSearchBtn.onclick = closeSearch;
  if (openMenuBtn) openMenuBtn.onclick = openMenu;
  if (closeMenuBtn) closeMenuBtn.onclick = closeMenu;
  if (backdrop) backdrop.onclick = closeMenu;

  if (searchOverlay) {
    searchOverlay.onclick = function (e) {
      if (e && e.target === searchOverlay) closeSearch();
    };
  }
}

document.onkeydown = function (e) {
  e = e || window.event;
  const key = e.key || e.keyCode;
  if (key === "Escape" || key === 27) {
    if (searchOverlay && searchOverlay.classList.contains("active")) closeSearch();
    if (offcanvas && offcanvas.classList.contains("active")) closeMenu();
  }
};

initMobileEvents();

function cap(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
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
  return `./img/type-icon/${typeName}.svg`;
}

function getPokemonImage(p) {
  if (p?.image) return p.image;
  return "./img/placeholder/placeholder.png";
}

function templateTypeListe(types = [], max = 2) {
  return (Array.isArray(types) ? types : []).slice(0, max).map(templateTypeLi).join("");
}

function typeLabelDe(t) {
  return TYPE_LABEL_DE[t] || cap(t);
}
