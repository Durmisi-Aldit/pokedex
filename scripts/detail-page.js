"use strict";

/* ===============================
   UI-Helper
   =============================== */

function getNumIdForURL(pokemon) {
  if (!pokemon) return null;
  if (Number.isFinite(pokemon.numId)) return pokemon.numId;
  return parseInt(String(pokemon.id || "").replace(/\D/g, ""), 10);
}

function openTab(contentId, clickedTab) {
  const allTabs = document.getElementsByClassName("tab");
  for (let i = 0; i < allTabs.length; i++) {
    allTabs[i].classList.remove("active");
  }

  const allContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < allContents.length; i++) {
    allContents[i].classList.remove("active");
  }

  clickedTab.classList.add("active");

  const selectedContent = document.getElementById(contentId);
  selectedContent.classList.add("active");
}

function padDex(id) {
  return `#${String(id).padStart(3, "0")}`;
}

/* ===============================
   TemplateBauen Helper
   =============================== */
function buildTypeBadgesHtml(types = []) {
  const labelOf = (t) => (typeof typeLabelDe === "function" ? typeLabelDe(t) : t);
  const iconOf = (t) => (typeof getTypeIconPath === "function" ? getTypeIconPath(t) : `./img/icon/${t}.svg`);
  return (types || [])
    .slice(0, 2)
    .map(
      (t) => `
      <div class="type-badge color_${t}">
        <span class="type-icon color_${t}">
          <img src="${iconOf(t)}" alt="Icon" />
        </span>
        ${escapeHtml(labelOf(t))}
      </div>
    `
    )
    .join("");
}

function buildStatsBarsHtml(statsMap = {}) {
  const rows = [
    ["hp", "HP", "stat-hp"],
    ["attack", "Angriff", "stat-attack"],
    ["defense", "Verteidigung", "stat-defense"],
    ["special-attack", "Spez.-Ang.", "stat-sp-atk"],
    ["special-defense", "Spez.-Vert.", "stat-sp-def"],
    ["speed", "Initiative", "stat-speed"],
  ];
  return rows
    .map(([key, label, cls]) => {
      const v = Number(statsMap?.[key]) || 0;
      const pct = Math.min(100, Math.round((v / 110) * 100));
      return `
      <div class="stat">
        <span class="stat-name">${label}</span>
        <div class="stat-bar-container">
          <div class="stat-bar ${cls}" style="width: ${pct}%"></div>
        </div>
        <span class="stat-bar-value">${v}</span>
      </div>
    `;
    })
    .join("");
}

function buildMovesGridHtml(moves = [], color = "normal") {
  return (moves || [])
    .slice(0, 10)
    .map((m) => {
      const label = (typeof cap === "function" ? cap(m) : m).replace(/-/g, " ");
      return `<div class="move-item color_${color}">${escapeHtml(label)}</div>`;
    })
    .join("");
}

function buildEvolutionChainHtml(evolution = []) {
  if (!Array.isArray(evolution) || !evolution.length) return "";

  const getArt = (e) => e.artwork || e.image || e.sprite || "";

  const one = (e) => {
    const numId = (typeof getNumIdForURL === "function" ? getNumIdForURL(e) : null) ?? e.id ?? null;
    const href = numId ? `pokemon-details.html?id=${numId}` : "#";
    return `
      <a href="${href}">
        <div class="evolution-stage">
          <div class="evolution-name"><h2>${escapeHtml(e.name)}</h2></div>
          <div class="evolution-image">
            <img src="${getArt(e)}" alt="${escapeHtml(e.name)}" />
          </div>
        </div>
      </a>
    `;
  };

  return evolution
    .map(
      (e, i) =>
        one(e) +
        (i < evolution.length - 1
          ? `<div class="evolution-arrow"><i class="fas fa-angle-double-right evo-icon"></i></div>`
          : "")
    )
    .join("");
}

/* ===============================
   Template Pokemon Detail Page
   =============================== */
function templatePokemonDetailPage(p) {
  // ---- Top-Bereich ----
  const id = p.numId;
  const prevId = Math.max(1, p.prevId || id - 1);
  const nextId = p.nextId || id + 1;

  const prevName = p.prevName || "–";
  const nextName = p.nextName || "–";

  const animBase = (ANIMATION_IMAGE || "").replace(/\/$/, "");
  const prevSprite = animBase ? `${animBase}/${prevId}.gif` : "";
  const nextSprite = animBase ? `${animBase}/${nextId}.gif` : "";

  // ---- Desc-Bereich  ----
  const art = p.artwork || p.image;

  // ---- Tabs ----
  const typeBadgesHtml = p.typeBadgesHtml || "";
  const statsBarsHtml = p.statsBarsHtml || "";
  const movesHtml = buildMovesGridHtml(p.moves || [], (p.types && p.types[0]) || "normal");
  const evolutionHtml = p.evolutionHtml || "";

  return `
    <!-- TOP -->
    <div class="detail-site-top">
      <div class="row">
        <div class="col">
          <div class="poke-nav">
            <div class="poke-nav-side poke-nav-side--prev">
              <a class="nav-btn" aria-label="Vorheriges" href="pokemon-details.html?id=${prevId}">
                <button class="poke-nav-arrow-btn" aria-label="Vorheriges Pokémon">
                  <img src="./img/info-icon/prev.svg" alt="" class="poke-nav-arrow-icon" />
                </button>
              </a>
              <div class="poke-nav-label">
                <div class="poke-nav-name text-left">${escapeHtml(prevName)}</div>
                <div class="poke-nav-id text-left">${padDex(prevId)}</div>
              </div>
              ${
                prevSprite
                  ? `
                    <img class="poke-nav-sprite nomobile"
                    alt="${escapeHtml(prevName)}"
                    src="${prevSprite}"
                    onerror="this.remove()" />`
                  : ""
              }
            </div>

            <div class="poke-nav-center">
              <div class="poke-nav-current-name">
                <div class="title"><h1>${escapeHtml(p.name)}</h1></div>
              </div>
              <div class="poke-nav-current-id">${padDex(id)}</div>
            </div>

            <div class="poke-nav-side poke-nav-side--next">
              ${
                nextSprite
                  ? `
                    <img class="poke-nav-sprite nomobile"
                    alt="${escapeHtml(nextName)}"
                    src="${nextSprite}"
                    onerror="this.remove()" />`
                  : ""
              }
              <div class="poke-nav-label">
                <div class="poke-nav-name text-right">${escapeHtml(nextName)}</div>
                <div class="poke-nav-id text-right">${padDex(nextId)}</div>
              </div>
              <a class="nav-btn" aria-label="Nächstes" href="pokemon-details.html?id=${nextId}">
                <button class="poke-nav-arrow-btn" aria-label="Nächstes Pokémon">
                  <img src="./img/info-icon/next.svg" alt="" class="poke-nav-arrow-icon" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DESC -->
    <div class="detail-site-desc">
      <div class="row">
        <div class="col">
          <div class="pokemon-image">
            <div class="pkm-image-wrap">
              <button class="fav pkm_like" type="button" data-id="${
                p.id
              }" aria-label="Als Favorit speichern" aria-pressed="false">❤︎</button>
              <img class="pkm-big-image" alt="${escapeHtml(p.name)}" src="${art}" />
            </div>
            <div class="pkm-img-typ">${typeBadgesHtml}</div>
          </div>
        </div>

        <div class="col">
          <div class="pokemon-info">
            <div class="pokemon-info-desc">
              <div class="title">
                <h4 class="info-top-title">${escapeHtml(p.name)} ist als - ${escapeHtml(
    p.speciesTitle || p.stage || "–"
  )}- 
                bekannt.
                </h4>
              </div>
              <p class="info-top-desc">${escapeHtml(p.desc || "-")}</p>
            </div>

            <div class="pokemon-info-basic">
              <div class="basic-info">
                <div class="info-item">
                  <span class="info-label">ID</span>
                  <span class="info-value">${p.id}</span>
                </div>
                 <div class="info-item">
                  <span class="info-label">Fangrate</span>
                  <span class="info-value">${escapeHtml(p.catchRateStr || "–")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Grösse</span>
                  <span class="info-value">${escapeHtml(p.height || "–")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gewicht</span>
                  <span class="info-value">${escapeHtml(p.weight || "–")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Fähigkeiten</span>
                  <span class="info-value">
                    ${p.abilitiesHtml || escapeHtml(p.abilitiesText || "–")}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">Geschlecht</span>
                  <span class="info-value">${escapeHtml(p.genderRate || "–")}</span>
                </div>
              </div>
            </div>

            <div class="sound-grid">
              <button class="sound-btn color_${(p.types && p.types[0]) || "normal"}" id="cry-btn"><span></span></button>
            </div>
          </div>
        </div>
      </div>  
    </div>

    <!-- TABS -->
    <div class="detail-site-tab">  
      <div class="row">
        <div class="col">
          <div class="pokemon-tab-box tab-layout">
            <ul class="tabs">
              <li class="tab active" data-tab="tab-1" onclick="openTab('tab-1', this)">
                <i class="fas fa-file-alt"></i><span class="nomobile">Info</span>
              </li>
              <li class="tab" data-tab="tab-2" onclick="openTab('tab-2', this)">
                <i class="fas fa-chart-simple"></i><span class="nomobile">Statistiken</span>
              </li>
              <li class="tab" data-tab="tab-3" onclick="openTab('tab-3', this)">
                <i class="fas fa-crosshairs"></i><span class="nomobile">Attacken</span>
              </li>
              <li class="tab" data-tab="tab-4" onclick="openTab('tab-4', this)">
                <i class="fas fa-dragon"></i><span class="nomobile">Evoulution</span>
              </li>
            </ul>

            <div class="tab-content active" id="tab-1">
              <h3>Die wichtigsten Fakten über ${escapeHtml(p.name)} im Überblick:</h3>
              <div class="info-tab">
                <div class="info-cards">
                  <div class="info-card">
                    <i class="info-icon fa-solid fa-layer-group font_color_${(p.types && p.types[0]) || "normal"}"></i>
                    <div class="info-card-content"><h4>Kategorie</h4><p>${escapeHtml(
                      p.speciesTitle || p.stage || "–"
                    )}</p></div>
                  </div>                

                  <div class="info-card">
                    <i class="info-icon fa-solid fa-ruler-vertical font_color_${
                      (p.types && p.types[0]) || "normal"
                    }"></i>
                    <div class="info-card-content"><h4>Grösse</h4><p>${escapeHtml(p.height || "–")}</p></div>
                  </div>

                  <div class="info-card">
                    <i class="info-icon fa-solid fa-weight-hanging font_color_${
                      (p.types && p.types[0]) || "normal"
                    }"></i>
                    <div class="info-card-content"><h4>Gewicht</h4><p>${escapeHtml(p.weight || "–")}</p></div>
                  </div>

                  <div class="info-card">
                    <i class="info-icon fa-solid fa-wand-magic-sparkles font_color_${
                      (p.types && p.types[0]) || "normal"
                    }"></i>
                    <div class="info-card-content"><h4>Fähigkeiten</h4><p>${
                      p.abilitiesHtml || escapeHtml(p.abilitiesText || "–")
                    }</p></div>
                  </div>

                  <div class="info-card">
                    <i class="info-icon fa-solid fa-venus-mars font_color_${(p.types && p.types[0]) || "normal"}"></i>
                    <div class="info-card-content"><h4>Geschlecht</h4><p>${escapeHtml(p.genderRate || "–")}</p></div>
                  </div>

                  <div class="info-card">
                    <i class="info-icon fa-solid fa-egg font_color_${(p.types && p.types[0]) || "normal"}"></i>
                    <div class="info-card-content"><h4>Ei-Gruppen</h4><p> ${
                      p.eggGroupsHtml || escapeHtml(p.eggGroupsText || "–")
                    }</p></div>
                  </div>

                  <div class="info-card">
                    <i class="info-icon fa-solid fa-bullseye font_color_${(p.types && p.types[0]) || "normal"}"></i>
                    <div class="info-card-content"><h4>Fangrate</h4><p>${escapeHtml(p.catchRateStr || "–")}</p></div>
                  </div>

                  <div class="info-card">
                    <i class="info-icon fa-solid fa-hand-holding-heart font_color_${
                      (p.types && p.types[0]) || "normal"
                    }"></i>
                    <div class="info-card-content"><h4>Freundschaft</h4><p>${
                      typeof p.friendship === "number" ? p.friendship : "–"
                    }</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="tab-content" id="tab-2">
              <div class="stats-bars">${statsBarsHtml}</div>
            </div>

            <div class="tab-content" id="tab-3">
              <div class="moves-grid">${movesHtml}</div>
            </div>

            <div class="tab-content" id="tab-4">
              <div class="evolution-chain">${evolutionHtml}</div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  `;
}

/* ===============================
  Bilden und Rendern Pokemon Detail Page
   =============================== */
function buildDetailPage(p) {
  return templatePokemonDetailPage(p);
}

function renderDetailPage(rootEl, html) {
  rootEl.innerHTML = html;
}

/* ===============================
  Init Pokemon Detail Page
   =============================== */
function initDetailPage() {
  const root = document.getElementById("detail-site");
  if (!root) return;

  const id = +new URLSearchParams(location.search).get("id");
  if (!Number.isFinite(id) || id <= 0) {
    return renderDetailPage(root, `<p style="color:red">Ungültige oder fehlende ID.</p>`);
  }

  renderDetailPage(root, `<p>Lade…</p>`);

  const payload = { results: [{ url: `${BASE_URL}/${id}` }] };

  getPokemonsData(payload, { includeEvolution: true })
    .then(([p]) => {
      if (!p) return renderDetailPage(root, `<p style="color:red">Nicht gefunden.</p>`);
      if (!p.numId) {
        const n = parseInt(String(p.id).replace(/\D/g, ""), 10);
        p.numId = Number.isFinite(n) ? n : id;
      }

      renderDetailPage(root, buildDetailPage(p));

      const cryBtn = document.getElementById("cry-btn");
      if (cryBtn && p.cry) cryBtn.onclick = () => new Audio(p.cry).play().catch(() => {});

      if (typeof updateClickedLikes === "function") updateClickedLikes();
    })
    .catch(() => renderDetailPage(root, `<p style="color:red">Fehler beim Laden.</p>`));
}

/* ===============================
   BOOTSTRAP 
   =============================== */
initDetailPage();
