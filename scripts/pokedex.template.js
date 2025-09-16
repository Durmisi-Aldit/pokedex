"use strict";

function templatePkmHeroWrap(slots = []) {
  const get = (i) => slots[i] || { name: "", image: "", types: [] };
  const [p0, p1, p2, p3, p4, p5, p6] = [0, 1, 2, 3, 4, 5, 6].map(get);

  return `
      <div class="main-container main_content">
        <div class="pokemon_content_main">
          <div class="pokemon_row_container">
            <div class="colum left">
              <div class="inner_colum circle fadein large ${mainTypeClass(p0)}">
                <img class="circle_img fadein" src="${p0.image}" alt="${p0.name}" loading="lazy"/>
                <span class="pokemon_main_name ${mainTypeClass(p0)}">${p0.name}</span>
              </div>
            </div>
            <div class="colum middle">
              <div class="inner_colum circle medium ${mainTypeClass(p1)}">
                <img class="circle_img fadein" src="${p1.image}" alt="${p1.name}" loading="lazy"/>
                <span class="pokemon_main_name ${mainTypeClass(p1)}">${p1.name}</span>
              </div>
            </div>
            <div class="colum right">
              <div class="inner_colum circle small ${mainTypeClass(p2)}">
                <img class="circle_img fadein" src="${p2.image}" alt="${p2.name}" loading="lazy"/>
                <span class="pokemon_main_name ${mainTypeClass(p2)}">${p2.name}</span>
              </div>
            </div>
          </div>

          <div class="pokemon_row_container_center">
            <div class="colum middle">
              <div class="inner_colum extra_large ">
              <img class="middle_circle_img fadein" src="${p3.image}" alt="${p3.name || ""}" loading="lazy"/>
                <span class="pokemon_main_name ${mainTypeClass(p3)}">${p3.name}</span>
              </div>
            </div>
          </div>

          <div class="pokemon_row_container">
            <div class="colum right">
              <div class="inner_colum circle large ${mainTypeClass(p4)}">
                <img class="circle_img fadein" src="${p4.image}" alt="${p4.name}" loading="lazy"/>
                <span class="pokemon_main_name ${mainTypeClass(p4)}">${p4.name}</span>
              </div>
            </div>
            <div class="colum middle">
              <div class="inner_colum circle medium ${mainTypeClass(p5)}">
                <img class="circle_img fadein" src="${p5.image}" alt="${p5.name}" loading="lazy"/>
                <span class="pokemon_main_name ${mainTypeClass(p5)}">${p5.name}</span>
              </div>
            </div>
            <div class="colum left">
              <div class="inner_colum circle small ${mainTypeClass(p6)}">
                <img class="circle_img fadein" src="${p6.image}" alt="${p6.name}" loading="lazy"/>
                <span class="pokemon_main_name ${mainTypeClass(p6)}">${p6.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  `;
}

function templateTypeIcon(t) {
  return `
    <li class="pkm_type color_${t}">
      <img src="${typeIconPath(t)}" alt="${t}" />
    </li>
  `;
}

function templateTypeIcons(types = []) {
  const list = Array.isArray(types) ? types : [];
  return list
    .slice(0, 2)
    .map((t) => templateTypeIcon(t))
    .join("");
}

function templatePkmTypeSlider(t) {
  return `
    <div class="pokemon_typname type_slide">
      <div class="pokemon_typname__avatar color_${t}">
        <img src="./img/icon/${t}.svg" alt="${t}" />
      </div>
      <span class="pokemon_typname__name">${cap(t)}</span>
    </div>
  `;
}

function templatePkmCard(pokemons = []) {
  return pokemons
    .map(
      (pokemon) => `
 <article 
  class="pkm_card type_${pokemon.types?.[0] || "normal"}"
  aria-labelledby="Pokemon Karte von ${pokemon.name} mit"
  aria-describedby="Pokemon Karte von ${pokemon.name}"
>
  <div class="pkm_container">
    <div class="pkm_header">
      <div class="pkm_header_left">
        <div class="pkm_stage">
          <span>${pokemon.stage}</span>
        </div>
        <h2 class="pkm_name">${pokemon.name}</h2>
      </div>

      <div class="pkm_header_right">
        <div class="pkm_hit_points">
          <span class="pkm_hit_points_title">${pokemon.hp.title}</span>
          <data class="pkm_hit_points_value">${pokemon.hp.value}</data>
        </div>

        <ul class="pkm_types" aria-label="Typen">
          ${templateTypeIcons(pokemon.types)}
        </ul>
      </div>
    </div>

    <figure class="pkm_image_container">
      <div class="pkm_image">
        <img src="${pokemon.image}" alt="Illustration von ${pokemon.name}" />
      </div>
    </figure>

    <section class="pkm_id_container">
      <dd>${pokemon.id}</dd>
    </section>

    <section class="pkm_meta_container">
      <dl class="pkm_meta_list">
        <div class="pkm_size">
          <dt><img src="./img/icon/ruler.png" alt="Grösse" class="pkm_icon_size" /></dt>
          <dd><data value="${pokemon.height}"> ${pokemon.height}</data></dd>
        </div>
        <div class="pkm_weight">
          <dt><img src="./img/icon/weight.png" alt="Gewicht" class="pkm_icon_weight" /></dt>
          <dd><data value="${pokemon.weight}"> ${pokemon.weight}</data></dd>
        </div>
      </dl>
    </section>
  </div>
</article> 
`
    )
    .join("");
}
