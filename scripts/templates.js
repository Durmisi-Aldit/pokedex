"use strict";

//  HERO
function templatePkmHeroWrap(slots = []) {
  const getSlot = (i) => slots[i] || null;
  const [s0, s1, s2, s3, s4, s5, s6] = [0, 1, 2, 3, 4, 5, 6].map(getSlot);
  const circle = (p, sz, side) => {
    const empty = !p || (!p.name && !p.image),
      cls = p ? getMainTypeClass(p) : "",
      id = getNumIdForURL(p);
    return `
      <div class="colum ${side}">
        <div class="inner_colum circle ${sz} ${cls} ${empty ? "is-empty" : ""}">
          ${
            empty
              ? ""
              : `<a href="pokemon-details.html?id=${id}">
            <img class="circle_img fadein" src="${p.image}" alt="${p.name || "Pokemon"}" loading="lazy"/>
            <span class="pokemon_main_name ${cls}">${p.name || ""}</span>
          </a>`
          }
        </div>
      </div>`;
  };
  const middle = (p) => {
    const empty = !p || (!p.name && !p.image),
      cls = p ? getMainTypeClass(p) : "",
      id = getNumIdForURL(p);
    return `<div class="pokemon_row_container_center"><div class="colum middle">
      <div class="inner_colum extra_large ${empty ? "is-empty" : ""}">
        ${
          empty
            ? ""
            : `<a href="pokemon-details.html?id=${id}">
          <img class="middle_circle_img fadein" src="${p.image}" alt="${p.name || ""}" loading="lazy"/>
          <span class="pokemon_main_name ${cls}">${p.name || ""}</span>
        </a>`
        }
      </div></div></div>`;
  };
  return `<div class="pokemon_content_main">
    <div class="pokemon_row_container hidden">
      ${circle(s0, "large", "left")}${circle(s1, "medium", "middle")}${circle(s2, "small", "right")}
    </div>
    ${middle(s3)}
    <div class="pokemon_row_container hidden">
      ${circle(s4, "large", "right")}${circle(s5, "medium", "middle")}${circle(s6, "small", "left")}
    </div>
  </div>`;
}

//  TYPE SLIDER
function templatePkmTypeSlider(t) {
  return `<div class="pokemon_typname type_slide">
    <div class="pokemon_typname__avatar color_${t}">
      <img src="${getTypeIconPath(t)}" alt="${t}">
    </div>
    <span class="pokemon_typname__name color_${t}">${typeLabelDe(t)}</span>
  </div>`;
}

//  CARD GRID
function templatePkmCard(list = []) {
  return list
    .map((p) => {
      const numId = getNumIdForURL(p);
      return `
      <article class="pkm_card type_${p.types?.[0] || "normal"}" data-id="${p.id}">
        <div class="pkm_header">
          <div class="pkm_header_left">
            <div class="pkm_stage"><span>${p.stage}</span></div>
            <h2 class="pkm_name">${p.name}</h2>
          </div>
          <div class="pkm_header_right">
            <div class="pkm_hit_points">
              <span class="pkm_hit_points_title">${p.hp.title}</span>
              <span class="pkm_hit_points_value">${p.hp.value}</span>
            </div>
            <ul class="pkm_types" aria-label="Typen">${templateTypeListe(p.types || [])}</ul>
          </div>
        </div>
        <div class="pkm_container">
          <a href="pokemon-details.html?id=${numId}">
            <figure class="pkm_image_container">
              <div class="pkm_image"><img class="fadein" src="${p.image}" alt="Illustration von ${p.name}" /></div>
            </figure>
          </a>
          <section class="pkm_id_container">
            <dd>${p.id}</dd>
            <button class="pkm_like" type="button" data-action="like" data-id="${
              p.id
            }" aria-label="Als Favorit speichern" aria-pressed="false">❤︎</button>
          </section>
          <section class="pkm_meta_container">
            <dl class="pkm_meta_list">
              <div class="pkm_size"><dt><i class="card-icon fa-solid fa-ruler-vertical"></i></dt><dd><data>${
                p.height
              }</data></dd></div>
              <div class="pkm_weight"><dt><i class="card-icon fa-solid fa-weight-hanging"></i></dt><dd><data>${
                p.weight
              }</data></dd></div>
            </dl>
          </section>
        </div>
      </article>`;
    })
    .join("");
}

//  BANNER
function templatePkmBanner(p) {
  const typesHtml = (p.types || [])
    .slice(0, 2)
    .map(
      (t) => `
    <div class="pokemon_typname">
      <div class="pokemon_typname__avatar color_${t}">
        <img src="${getTypeIconPath(t)}" alt="${t}" />
      </div>
      <span class="pokemon_typname__name color_${t}">${typeLabelDe(t)}</span>
    </div>`
    )
    .join("");
  const numId = getNumIdForURL(p);
  return `<div class="pkm_banner_content">
    <div class="pkm_banner_content_left">
      ${
        p.gif
          ? `<img class="pkm_bgimg_animation" src="${p.gif}" alt="Pokemon Animation von ${escapeHtml(p.name)}"/>`
          : ""
      }
      <div class="pkm_banner_name_desc"><div class="pkm_banner_name">${p.name}</div><div class="pkm_banner_desc">${
    p.desc || ""
  }</div></div>
      <div class="pkm_banner_btn"><a href="pokemon-details.html?id=${numId}"><button class="btn" data-id="${
    p.id
  }">Zum Details</button></a></div>
    </div>
    <div class="pkm_banner_content_right">
      <div class="pkm_bg_rotation"></div>
      <div class="pkm_fg">
        <div class="pkm_row pkm_row_top"><img class="pkm_img_header" src="./img/logo/logo.png" alt="oben" /></div>
        <div class="pkm_row pkm_row_mid"><img class="pkm_img" src="${p.artwork}" alt="${p.name}" /></div>
        <div class="pkm_row pkm_row_bottom"><div class="pkm_circles">${typesHtml}</div></div>
      </div>
    </div>
  </div>`;
}

//  DETAIL: BUILDING BLOCKS
function buildTypeBadgesHtml(types = []) {
  const labelOf = (t) => typeLabelDe(t);
  const iconOf = (t) => getTypeIconPath(t);
  return (types || [])
    .slice(0, 2)
    .map(
      (t) => `
    <div class="type-badge color_${t}">
      <span class="type-icon color_${t}"><img src="${iconOf(t)}" alt="Icon" /></span>
      ${escapeHtml(labelOf(t))}
    </div>`
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
      const v = Number(statsMap?.[key]) || 0,
        pct = Math.min(100, Math.round((v / 110) * 100));
      return `<div class="stat"><span class="stat-name">${label}</span><div class="stat-bar-container"><div class="stat-bar ${cls}" style="width:${pct}%"></div></div><span class="stat-bar-value">${v}</span></div>`;
    })
    .join("");
}

function buildMovesGridHtml(moves = [], color = "normal") {
  return (moves || [])
    .slice(0, 10)
    .map((m) => `<div class="move-item color_${color}">${escapeHtml(pretty(m))}</div>`)
    .join("");
}

function buildEvolutionChainHtml(evolution = []) {
  if (!Array.isArray(evolution) || !evolution.length) return "";
  const art = (e) => e.artwork || e.image || e.sprite || "";
  const one = (e) => {
    const id = getNumIdForURL(e) ?? e.id ?? null;
    const href = id ? `pokemon-details.html?id=${id}` : "#";
    return `<a href="${href}"><div class="evolution-stage"><div class="evolution-name"><h2>${escapeHtml(
      e.name
    )}</h2></div><div class="evolution-image"><img src="${art(e)}" alt="${escapeHtml(e.name)}" /></div></div></a>`;
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

//  SEARCH DROPDOWN
function templateSearchDropdown(r) {
  return `<a class="search-item" href="pokemon-details.html?id=${r.id}" role="option" data-id="${r.id}">
    <img class="search-item_img" src="${r.img || getPokemonImage({})}" alt="${r.de || ""}">
    <div class="search-item_texts">
      <span class="search-item_name">${r.de || ""}</span>
      <span class="search-item_id">${padDex(r.id)}</span>
    </div>
  </a>`;
}

//  DETAIL TEMPLATE
function templatePokemonDetailPage(p) {
  const id = p.numId,
    prevId = Math.max(1, p.prevId || id - 1),
    nextId = p.nextId || id + 1;
  const prevName = p.prevName || "–",
    nextName = p.nextName || "–";
  const animBase = (ANIMATION_IMAGE || "").replace(/\/$/, "");
  const prevSprite = animBase ? `${animBase}/${prevId}.gif` : "",
    nextSprite = animBase ? `${animBase}/${nextId}.gif` : "";
  const art = p.artwork || p.image;
  const typeBadgesHtml = p.typeBadgesHtml || "",
    statsBarsHtml = p.statsBarsHtml || "";
  const movesHtml = buildMovesGridHtml(p.moves || [], (p.types && p.types[0]) || "normal");
  const evolutionHtml = p.evolutionHtml || "";

  return `
  <div class="detail-site-top"><div class="row"><div class="col">
    <div class="poke-nav">
      <div class="poke-nav-side poke-nav-side--prev">
        <a class="nav-btn" aria-label="Vorheriges" href="pokemon-details.html?id=${prevId}">
          <button class="poke-nav-arrow-btn" aria-label="Vorheriges Pokémon"><img src="./img/info-icon/prev.svg" alt="" class="poke-nav-arrow-icon"/></button>
        </a>
        <div class="poke-nav-label"><div class="poke-nav-name text-left">${escapeHtml(
          prevName
        )}</div><div class="poke-nav-id text-left">${padDex(prevId)}</div></div>
        ${
          prevSprite
            ? `<img class="poke-nav-sprite nomobile" alt="${escapeHtml(
                prevName
              )}" src="${prevSprite}" onerror="this.remove()" />`
            : ""
        }
      </div>
      <div class="poke-nav-center"><div class="poke-nav-current-name"><div class="title"><h1>${escapeHtml(
        p.name
      )}</h1></div></div><div class="poke-nav-current-id">${padDex(id)}</div></div>
      <div class="poke-nav-side poke-nav-side--next">
        ${
          nextSprite
            ? `<img class="poke-nav-sprite nomobile" alt="${escapeHtml(
                nextName
              )}" src="${nextSprite}" onerror="this.remove()" />`
            : ""
        }
        <div class="poke-nav-label"><div class="poke-nav-name text-right">${escapeHtml(
          nextName
        )}</div><div class="poke-nav-id text-right">${padDex(nextId)}</div></div>
        <a class="nav-btn" aria-label="Nächstes" href="pokemon-details.html?id=${nextId}">
          <button class="poke-nav-arrow-btn" aria-label="Nächstes Pokémon"><img src="./img/info-icon/next.svg" alt="" class="poke-nav-arrow-icon"/></button>
        </a>
      </div>
    </div>
  </div></div></div>

  <div class="detail-site-desc"><div class="row">
    <div class="col"><div class="pokemon-image">
      <div class="pkm-image-wrap">
        <button class="fav pkm_like" type="button" data-id="${
          p.id
        }" aria-label="Als Favorit speichern" aria-pressed="false">❤︎</button>
        <img class="pkm-big-image" alt="${escapeHtml(p.name)}" src="${art}" />
      </div>
      <div class="pkm-img-typ">${typeBadgesHtml}</div>
    </div></div>
    <div class="col"><div class="pokemon-info">
      <div class="pokemon-info-desc">
        <div class="title"><h4 class="info-top-title">${escapeHtml(p.name)} ist als - ${escapeHtml(
    p.speciesTitle || p.stage || "–"
  )}- bekannt.</h4></div>
        <p class="info-top-desc">${escapeHtml(p.desc || "-")}</p>
      </div>
      <div class="pokemon-info-basic"><div class="basic-info">
        <div class="info-item"><span class="info-label">ID</span><span class="info-value">${p.id}</span></div>
        <div class="info-item"><span class="info-label">Fangrate</span><span class="info-value">${escapeHtml(
          p.catchRateStr || "–"
        )}</span></div>
        <div class="info-item"><span class="info-label">Grösse</span><span class="info-value">${escapeHtml(
          p.height || "–"
        )}</span></div>
        <div class="info-item"><span class="info-label">Gewicht</span><span class="info-value">${escapeHtml(
          p.weight || "–"
        )}</span></div>
        <div class="info-item"><span class="info-label">Fähigkeiten</span><span class="info-value">${
          p.abilitiesHtml || escapeHtml(p.abilitiesText || "–")
        }</span></div>
        <div class="info-item"><span class="info-label">Geschlecht</span><span class="info-value">${escapeHtml(
          p.genderRate || "–"
        )}</span></div>
      </div></div>
      <div class="sound-grid"><button class="sound-btn color_${
        (p.types && p.types[0]) || "normal"
      }" id="cry-btn"><span></span></button></div>
    </div></div>
  </div></div>

  <div class="detail-site-tab"><div class="row"><div class="col">
    <div class="pokemon-tab-box tab-layout">
      <ul class="tabs">
        <li class="tab active" data-tab="tab-1" onclick="openTab('tab-1', this)"><i class="fas fa-file-alt"></i><span class="nomobile">Info</span></li>
        <li class="tab" data-tab="tab-2" onclick="openTab('tab-2', this)"><i class="fas fa-chart-simple"></i><span class="nomobile">Statistiken</span></li>
        <li class="tab" data-tab="tab-3" onclick="openTab('tab-3', this)"><i class="fas fa-crosshairs"></i><span class="nomobile">Attacken</span></li>
        <li class="tab" data-tab="tab-4" onclick="openTab('tab-4', this)"><i class="fas fa-dragon"></i><span class="nomobile">Evoulution</span></li>
      </ul>
      <div class="tab-content active" id="tab-1">
        <h3>Die wichtigsten Fakten über ${escapeHtml(p.name)} im Überblick:</h3>
        <div class="info-tab"><div class="info-cards">
          <div class="info-card"><i class="info-icon fa-solid fa-layer-group font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Kategorie</h4><p>${escapeHtml(
    p.speciesTitle || p.stage || "–"
  )}</p></div></div>
          <div class="info-card"><i class="info-icon fa-solid fa-ruler-vertical font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Grösse</h4><p>${escapeHtml(p.height || "–")}</p></div></div>
          <div class="info-card"><i class="info-icon fa-solid fa-weight-hanging font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Gewicht</h4><p>${escapeHtml(p.weight || "–")}</p></div></div>
          <div class="info-card"><i class="info-icon fa-solid fa-wand-magic-sparkles font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Fähigkeiten</h4><p>${
    p.abilitiesHtml || escapeHtml(p.abilitiesText || "–")
  }</p></div></div>
          <div class="info-card"><i class="info-icon fa-solid fa-venus-mars font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Geschlecht</h4><p>${escapeHtml(p.genderRate || "–")}</p></div></div>
          <div class="info-card"><i class="info-icon fa-solid fa-egg font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Ei-Gruppen</h4><p>${
    p.eggGroupsHtml || escapeHtml(p.eggGroupsText || "–")
  }</p></div></div>
          <div class="info-card"><i class="info-icon fa-solid fa-bullseye font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Fangrate</h4><p>${escapeHtml(p.catchRateStr || "–")}</p></div></div>
          <div class="info-card"><i class="info-icon fa-solid fa-hand-holding-heart font_color_${
            (p.types && p.types[0]) || "normal"
          }"></i><div class="info-card-content"><h4>Freundschaft</h4><p>${
    typeof p.friendship === "number" ? p.friendship : "–"
  }</p></div></div>
        </div></div>
      </div>
      <div class="tab-content" id="tab-2"><div class="stats-bars">${statsBarsHtml}</div></div>
      <div class="tab-content" id="tab-3"><div class="moves-grid">${movesHtml}</div></div>
      <div class="tab-content" id="tab-4"><div class="evolution-chain">${evolutionHtml}</div></div>
    </div>
  </div></div></div>`;
}
