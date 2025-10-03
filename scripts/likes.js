"use strict";

const LIKES_STORAGE_KEY = "LIKS";

/* ===============================
   Like-Verwaltung (lesen, zählen, prüfen, toggeln)
=============================== */
function likesManager(action, rawId) {
  let likedIds;
  try {
    likedIds = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) || "[]");
  } catch {
    likedIds = [];
  }

  const numericId = parseInt((String(rawId ?? "").match(/\d+/) || [])[0], 10);

  if (action === "get") return likedIds;
  if (action === "count") return likedIds.length;
  if (action === "has") return Number.isFinite(numericId) && likedIds.includes(numericId);

  if (action === "toggle") {
    if (!Number.isFinite(numericId)) return likedIds;
    const index = likedIds.indexOf(numericId);
    index > -1 ? likedIds.splice(index, 1) : likedIds.push(numericId);
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likedIds));
    return likedIds;
  }

  return likedIds;
}

/* ===============================
   Aktualisiert UI-Zustand für Like-Buttons
   =============================== */
function updateClickedLikes() {
  const likeContainerIds = ["pokedex", "pokedex_index", "likesGrid", "detailRoot", "detail-site"];
  const shouldBindClickEvents = true;

  for (const containerId of likeContainerIds) {
    const containerEl = document.getElementById(containerId);
    if (!containerEl) continue;

    const likeButtons = containerEl.getElementsByClassName("pkm_like");
    for (const button of likeButtons) {
      const isLiked = likesManager("has", button.dataset.id);
      button.setAttribute("aria-pressed", isLiked ? "true" : "false");
      button.classList.toggle("is-liked", isLiked);

      if (shouldBindClickEvents && !button._likeBound) {
        button._likeBound = true;
        button.onclick = function () {
          likesManager("toggle", this.dataset.id);
          updateClickedLikes(likeContainerIds);
          if (typeof updateLikesView === "function") updateLikesView();
        };
      }
    }
  }

  const likesBadgeEl = document.getElementById("favCount");
  const likesBadgeElMobile = document.getElementById("favCountMobile");
  const count = String(likesManager("count"));

  [likesBadgeEl, likesBadgeElMobile].forEach((el) => {
    if (el) el.textContent = count;
  });
}

/* ===============================
   Rendert und aktualisiert die Likes-Ansicht
   =============================== */
async function updateLikesView() {
  if (!updateLikesView.isInitialized) {
    window.onstorage = (storageEvent) => {
      if (storageEvent?.key === LIKES_STORAGE_KEY) {
        updateClickedLikes("pokedex");
        updateClickedLikes("pokedex_index", true);
        updateClickedLikes("detailRoot");
        updateLikesView();
      }
    };
    updateLikesView.isInitialized = true;
  }

  const likesContainer = document.getElementById("likesGrid");
  const emptyMessage = document.getElementById("likesEmpty");
  const likesCounter = document.getElementById("favCount");
  if (!likesContainer || !emptyMessage || !likesCounter) return;

  const ids = likesManager("get");

  if (!ids.length) {
    likesContainer.innerHTML = "";
    emptyMessage.style.display = "block";
    likesCounter.textContent = "0";
    return;
  }
  emptyMessage.style.display = "none";

  const pokemonRequest = { results: ids.map((pokemonId) => ({ url: `${BASE_URL}/${pokemonId}` })) };
  const pokemonList = await getPokemonsData(pokemonRequest);

  likesContainer.innerHTML = templatePkmCard(pokemonList);

  updateClickedLikes();
}

/* ===============================
   BOOTSTRAP
   =============================== */
updateClickedLikes();
updateLikesView();
