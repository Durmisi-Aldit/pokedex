"use strict";

function templatePkmHeroWrap(slots = []) {
  const get = (i) => slots[i] || { name: "", image: "", types: [] };
  const [p0, p1, p2, p3, p4, p5, p6] = [0, 1, 2, 3, 4, 5, 6].map(get);

  return `
      <div class="main-container main_content">
        <div class="pokemon_content_main">
          <div class="pokemon_row_container">
            <div class="colum left">
              <div class="inner_colum circle fadein large ${getMainTypeClass(p0)}">
                <img class="circle_img fadein" src="${p0.image}" alt="${p0.name}" loading="lazy"/>
                <span class="pokemon_main_name ${getMainTypeClass(p0)}">${p0.name}</span>
              </div>
            </div>
            <div class="colum middle">
              <div class="inner_colum circle medium ${getMainTypeClass(p1)}">
                <img class="circle_img fadein" src="${p1.image}" alt="${p1.name}" loading="lazy"/>
                <span class="pokemon_main_name ${getMainTypeClass(p1)}">${p1.name}</span>
              </div>
            </div>
            <div class="colum right">
              <div class="inner_colum circle small ${getMainTypeClass(p2)}">
                <img class="circle_img fadein" src="${p2.image}" alt="${p2.name}" loading="lazy"/>
                <span class="pokemon_main_name ${getMainTypeClass(p2)}">${p2.name}</span>
              </div>
            </div>
          </div>

          <div class="pokemon_row_container_center">
            <div class="colum middle">
              <div class="inner_colum extra_large ">
              <img class="middle_circle_img fadein" src="${p3.image}" alt="${p3.name || ""}" loading="lazy"/>
                <span class="pokemon_main_name ${getMainTypeClass(p3)}">${p3.name}</span>
              </div>
            </div>
          </div>

          <div class="pokemon_row_container">
            <div class="colum right">
              <div class="inner_colum circle large ${getMainTypeClass(p4)}">
                <img class="circle_img fadein" src="${p4.image}" alt="${p4.name}" loading="lazy"/>
                <span class="pokemon_main_name ${getMainTypeClass(p4)}">${p4.name}</span>
              </div>
            </div>
            <div class="colum middle">
              <div class="inner_colum circle medium ${getMainTypeClass(p5)}">
                <img class="circle_img fadein" src="${p5.image}" alt="${p5.name}" loading="lazy"/>
                <span class="pokemon_main_name ${getMainTypeClass(p5)}">${p5.name}</span>
              </div>
            </div>
            <div class="colum left">
              <div class="inner_colum circle small ${getMainTypeClass(p6)}">
                <img class="circle_img fadein" src="${p6.image}" alt="${p6.name}" loading="lazy"/>
                <span class="pokemon_main_name ${getMainTypeClass(p6)}">${p6.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  `;
}

function templatePkmTypeSlider(t) {
  return `
    <div class="pokemon_typname type_slide">
      <div class="pokemon_typname__avatar color_${t}">
        <img src="${getTypeIconPath(t)}" alt="${t}">
      </div>
      <span class="pokemon_typname__name">${cap(t)}</span>
    </div>
  `;
}

function templateTypeLi(t) {
  return `
    <li class="pkm_type color_${t}">
      <img src="${getTypeIconPath(t)}" alt="${t}">
    </li>
  `;
}

function templatePkmCard(list = []) {
  return list
    .map(
      (p) => `
    <article class="pkm_card type_${p.types?.[0] || "normal"}" data-id="${p.id}">
                <div class="pkm_header">
                    <div class="pkm_header_left">
                      <div class="pkm_stage"><span>${p.stage}</span></div>
                      <h2 class="pkm_name">${p.name}</h2>
                    </div>
                    <div class="pkm_header_right">
                      <div class="pkm_hit_points">
                        <span class="pkm_hit_points_title">${p.hp.title}</span>
                        <data class="pkm_hit_points_value">${p.hp.value}</data>
                      </div>
                      <ul class="pkm_types" aria-label="Typen">${templateTypeLis(p.types || [])}</ul>
                    </div>
                    
                </div> 
          <div class="pkm_container">
            

            <figure class="pkm_image_container">
              <div class="pkm_image">
                <img class="fadein" src="${p.image}" alt="Illustration von ${p.name}" />
              </div>
            </figure>

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
                  <dt><img src="./img/icon/ruler.png" alt="Grösse" class="pkm_icon_size" /></dt>
                  <dd><data>${p.height}</data></dd>
                </div>
                <div class="pkm_weight">
                  <dt><img src="./img/icon/weight.png" alt="Gewicht" class="pkm_icon_weight" /></dt>
                  <dd><data>${p.weight}</data></dd>
                </div>
              </dl>
            </section>
          </div>
     </article>
  `
    )
    .join("");
}
