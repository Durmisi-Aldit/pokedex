"use strict";

const LS_KEY = "pokedex_likes_v1";

function likesManager(action, id) {
  let list;
  try {
    list = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    list = [];
  }
  if (action === "get") return list;
  if (action === "count") return list.length;

  const m = String(id ?? "").match(/\d+/),
    n = m ? parseInt(m[0], 10) : NaN;
  if (action === "has") return Number.isFinite(n) && list.includes(n);

  if (action === "toggle") {
    if (!Number.isFinite(n)) return list;
    const i = list.indexOf(n);
    if (i > -1) list.splice(i, 1);
    else list.push(n);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    return list;
  }
}

function updateClickedLikes(containerId = "pokedex", bindEvents = false) {
  const root = document.getElementById(containerId);
  if (root) {
    const btns = root.getElementsByClassName("pkm_like");
    for (let i = 0; i < btns.length; i++) {
      const btn = btns[i],
        on = likesManager("has", btn.getAttribute("data-id"));
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      if (on) btn.classList.add("is-liked");
      else btn.classList.remove("is-liked");

      if (bindEvents) {
        btn.onclick = function () {
          likesManager("toggle", this.getAttribute("data-id"));

          updateClickedLikes("pokedex");
          renderLikes();
        };
      }
    }
  }
  const badge = document.getElementById("favCount");
  if (badge) badge.textContent = String(likesManager("count"));
}

async function renderLikes() {
  if (!renderLikes._init) {
    window.onstorage = (e) => {
      if (e && e.key === LS_KEY) {
        updateClickedLikes("pokedex");
        renderLikes();
      }
    };
    renderLikes._init = true;
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

  const data = { results: ids.map((n) => ({ url: BASE_URL + "/" + n })) };
  const pokemons = await getPokemonsData(data);
  grid.innerHTML = templatePkmCard(pokemons);

  updateClickedLikes("likesGrid", true);
}

updateClickedLikes("pokedex", true);
renderLikes();
