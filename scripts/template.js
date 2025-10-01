"use strict";

/* ===============================
   HERO
   =============================== */
function templatePkmHeroWrap(slots = []) {
  const getSlot = (i) => slots[i] || null;
  const [slot0, slot1, slot2, slot3, slot4, slot5, slot6] = [0, 1, 2, 3, 4, 5, 6].map(getSlot);

  const renderCircle = (pokemon, sizeClass, sideClass) => {
    const isEmpty = !pokemon || (!pokemon.name && !pokemon.image);
    const typeClass = pokemon ? getMainTypeClass(pokemon) || "" : "";
    const numId = getNumIdForURL(pokemon);

    return `
      <div class="colum ${sideClass}">
        <div class="inner_colum circle ${sizeClass} ${typeClass} ${isEmpty ? "is-empty" : ""}">
          ${
            isEmpty
              ? ""
              : `<a href="pokemon-details.html?id=${numId}">
                      <img class="circle_img fadein" src="${pokemon.image}" alt="${
                  pokemon.name || "Pokemon"
                }" loading="lazy"/>
                      <span class="pokemon_main_name ${typeClass}">${pokemon.name || ""}</span>
                 </a>`
          }
        </div>
      </div>
    `;
  };

  const renderMiddleXL = (pokemon) => {
    const isEmpty = !pokemon || (!pokemon.name && !pokemon.image);
    const typeClass = pokemon ? getMainTypeClass(pokemon) || "" : "";
    const numId = getNumIdForURL(pokemon);
    return `
      <div class="pokemon_row_container_center">
        <div class="colum middle">
          <div class="inner_colum extra_large ${isEmpty ? "is-empty" : ""}">
            ${
              isEmpty
                ? ""
                : `<a href="pokemon-details.html?id=${numId}">
                     <img class="middle_circle_img fadein" src="${pokemon.image}" alt="${
                    pokemon.name || ""
                  }" loading="lazy"/>
                     <span class="pokemon_main_name ${typeClass}">${pokemon.name || ""}</span>
                  </a>`
            }
          </div>
        </div>
      </div>
    `;
  };

  return `
    <div class="pokemon_content_main">
      <div class="pokemon_row_container hidden">
        ${renderCircle(slot0, "large", "left")}
        ${renderCircle(slot1, "medium", "middle")}
        ${renderCircle(slot2, "small", "right")}
      </div>

      ${renderMiddleXL(slot3)}

      <div class="pokemon_row_container hidden">
        ${renderCircle(slot4, "large", "right")}
        ${renderCircle(slot5, "medium", "middle")}
        ${renderCircle(slot6, "small", "left")}
      </div>
    </div>
  `;
}

/* ===============================
   TYPEN-SLIDER
   =============================== */
function templateTypeLi(t) {
  return `
    <li class="pkm_type color_${t}">
      <img src="${getTypeIconPath(t)}" alt="${t}">
    </li>
  `;
}

function templatePkmTypeSlider(t) {
  return `
    <div class="pokemon_typname type_slide">
      <div class="pokemon_typname__avatar color_${t}">
        <img src="${getTypeIconPath(t)}" alt="${t}">
      </div>
      <span class="pokemon_typname__name color_${t}">${typeLabelDe(t)}</span>
    </div>
  `;
}

/* ===============================
   POKEMON-CARD 
   =============================== */
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
                  <div class="pkm_image">
                    <img class="fadein" src="${p.image}" alt="Illustration von ${p.name}" />
                  </div>
                </figure>
              </a>

            <section class="pkm_id_container">
            <dd>${p.id}</dd>
              <button 
                  class="pkm_like" 
                  type="button"
                  data-action="like" 
                  data-id="${p.id}"
                  aria-label="Als Favorit speichern" 
                  aria-pressed="false">★
              </button>
            </section>
            <section class="pkm_meta_container">
              <dl class="pkm_meta_list">
                <div class="pkm_size">
                  <dt><i class="card-icon fa-solid fa-ruler-vertical"></i></dt>
                  <dd><data>${p.height}</data></dd>
                </div>
                <div class="pkm_weight">
                  <dt><i class="card-icon fa-solid fa-weight-hanging"></i></dt>
                  <dd><data>${p.weight}</data></dd>
                </div>
              </dl>
            </section>
          </div>
          
     </article>
  `;
    })
    .join("");
}

/* ===============================
   POKEMON-BANNER 
   =============================== */
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
      </div>
    `
    )
    .join("");
  const numId = getNumIdForURL(p);

  return `

            <div class="pkm_banner_content">
              <div class="pkm_banner_content_left">
                <img
                  class="pkm_bgimg_animation"
                  src="${p.gif}"
                  alt="Pokemon Animation von ${p.name}"
                />
                <div class="pkm_banner_name_desc">
                  <div class="pkm_banner_name">${p.name}</div>
                  <div class="pkm_banner_desc">${p.desc || ""}</div>
                </div>
                <div class="pkm_banner_btn">
                <a href="pokemon-details.html?id=${numId}">
                  <button class="btn" data-id="${p.id}">Zum Details</button>
                </a>  
                </div>
              </div>

              <div class="pkm_banner_content_right">
                <div class="pkm_bg_rotation"></div>

                <div class="pkm_fg">
                  <div class="pkm_row pkm_row_top">
                    <img class="pkm_img_header" src="./img/logo/logo.png" alt="oben" />
                  </div>

                  <div class="pkm_row pkm_row_mid">
                    <img
                      class="pkm_img"
                      src="${p.artwork}"
                      alt="${p.name}"
                    />
                  </div>

                  <div class="pkm_row pkm_row_bottom">
                    <div class="pkm_circles">
                      ${typesHtml}
                    </div>
                  </div>
                </div>
              </div>
            </div>
   
  `;
}

/* ===============================
   SEARCH-DROPDOWN
   =============================== */
function templateSearchDropdown(r) {
  return `
    <a class="search-item" href="pokemon-details.html?id=${r.id}" role="option" data-id="${r.id}">
      <img class="search-item_img" src="${r.img || getPokemonImage({})}" alt="${r.de || ""}">
      <div class="search-item_texts">
        <span class="search-item_name">${r.de || ""}</span>
        <span class="search-item_id">#${String(r.id).padStart(3, "0")}</span>
      </div>
    </a>
  `;
}
