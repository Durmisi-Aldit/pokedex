"use strict";

const LIKES_STORAGE_KEY = "LIKS";

function likesManager(action, rawId) {
  let liked;
  try {
    liked = JSON.parse(localStorage.getItem(LIKES_STORAGE_KEY) || "[]");
  } catch {
    liked = [];
  }
  const id = parseInt((String(rawId ?? "").match(/\d+/) || [])[0], 10);
  if (action === "get") return liked;
  if (action === "count") return liked.length;
  if (action === "has") return Number.isFinite(id) && liked.includes(id);
  if (action === "toggle") {
    if (!Number.isFinite(id)) return liked;
    const i = liked.indexOf(id);
    i > -1 ? liked.splice(i, 1) : liked.push(id);
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(liked));
    return liked;
  }
  return liked;
}

function updateClickedLikes() {
  const containers = ["pokedex", "pokedex_index", "likesGrid", "detailRoot", "detail-site"],
    bind = true;
  for (const cid of containers) {
    const root = document.getElementById(cid);
    if (!root) continue;
    const btns = root.getElementsByClassName("pkm_like");
    for (const b of btns) {
      const liked = likesManager("has", b.dataset.id);
      b.setAttribute("aria-pressed", liked ? "true" : "false");
      b.classList.toggle("is-liked", liked);
      if (bind && !b._likeBound) {
        b._likeBound = true;
        b.onclick = function () {
          likesManager("toggle", this.dataset.id);
          updateClickedLikes(containers);
          typeof updateLikesView === "function" && updateLikesView();
        };
      }
    }
  }
  const el = document.getElementById("favCount"),
    elM = document.getElementById("favCountMobile"),
    c = String(likesManager("count"));
  [el, elM].forEach((e) => {
    if (e) e.textContent = c;
  });
}

async function updateLikesView() {
  if (!updateLikesView.isInitialized) {
    window.onstorage = (ev) => {
      if (ev?.key === LIKES_STORAGE_KEY) {
        updateClickedLikes("pokedex");
        updateClickedLikes("pokedex_index", true);
        updateClickedLikes("detailRoot");
        updateLikesView();
      }
    };
    updateLikesView.isInitialized = true;
  }
  const grid = document.getElementById("likesGrid"),
    empty = document.getElementById("likesEmpty"),
    badge = document.getElementById("favCount");
  if (!grid || !empty || !badge) return;
  const ids = likesManager("get");
  if (!ids.length) {
    grid.innerHTML = "";
    empty.style.display = "block";
    badge.textContent = "0";
    return;
  }
  empty.style.display = "none";
  const req = { results: ids.map((id) => ({ url: `${BASE_URL}/${id}` })) };
  const list = await getPokemonsData(req);
  grid.innerHTML = templatePkmCard(list);
  updateClickedLikes();
}

updateClickedLikes();
updateLikesView();
