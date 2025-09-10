"use strict";

function template(pokemons) {
  return pokemons
    .map(
      (pokemon) => `
 <article
  class="pkm_card type_grass"
  aria-labelledby="Pokemon Karte von ${pokemon.name} mit"
  aria-describedby="Pokemon Karte von ${pokemon.name}"
>
  <div class="pkm_container">
    <header class="pkm_header">
      <div class="pkm_header_left">
        <div class="pkm_stage">
          <span>${pokemon.stage}</span>
        </div>
        <h2 class="pkm_name">${pokemon.name}</h2>
      </div>

      <div class="pkm_header_right">
        <div class="pkm_hit_points">
          <span class="pkm_hit_points_title" title="${pokemon.hp.title}">${pokemon.hp.title}</span>
          <data class="pkm_hit_points_value" value="${pokemon.hp.value}">${pokemon.hp.value}</data>
        </div>

        <ul class="pkm_types" aria-label="Typen">
          <li class="pkm_type color_grass">
            <img src="https://dummyimage.com/12" width="12" height="12" alt="Pflanze" />
          </li>
          <li class="pkm_type color_poison">
            <img src="https://dummyimage.com/12" width="12" height="12" alt="Gift" />
          </li>
        </ul>
      </div>
    </header>

    <figure class="pkm_image_container">
        <div class="pkm_image">
            <img src="${pokemon.image}" alt="Illustration von ${pokemon.name}" />
        </div>
    </figure>

    <section class="pkm_id_container">
      <dt>Nr.:</dt>
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
