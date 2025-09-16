"use strict";
let _loadingMore = false;

/* ===============================
   3) HERO
   =============================== */

function buildHeroSlots(pokemons = []) {
  const list = pokemons.filter((p) => p && p.name && (p.image || p.id));

  const seen = new Set();
  const uniq = list.filter((p) => {
    const k = p.id || p.name;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  uniq.sort(() => Math.random() - 0.5);
  const seven = uniq.slice(0, 7);

  const slots = seven.map((p) => ({
    name: p.name,
    id: p.id,
    types: p.types || [],
    image: getPokemonImage(p),
  }));

  while (slots.length < 7) {
    slots.push({ name: "", id: "", types: [], image: getPokemonImage({}) });
  }

  return slots;
}

function renderHeroWrap(pokemons) {
  const heroContent = document.getElementById("hero_content");
  if (!heroContent) return;

  const slots = buildHeroSlots(pokemons);
  heroContent.innerHTML = templatePkmHeroWrap(slots);
}

async function loadHeroWrap() {
  const heroWrap = document.getElementById("hero_wrap");
  toggleSpinner(true);
  try {
    const { small, big } = await fetchPokemonDataHero();

    const smallPokemons = await getPokemonsData(small);
    heroDataRef = smallPokemons;
    renderHeroWrap(heroDataRef);
    toggleSpinner(false);

    big
      .then(async (data) => {
        if (!data) return;
        const bigPokemons = await getPokemonsData(data);
        if (Array.isArray(bigPokemons) && bigPokemons.length) {
          heroDataRef = bigPokemons;
        }
      })
      .catch(console.error);

    clearInterval(heroInterval);
    heroInterval = setInterval(() => renderHeroWrap(heroDataRef), 9000);
  } catch (error) {
    toggleSpinner(false);
    if (heroWrap) heroWrap.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
    console.error(error);
  }
}

/* ===============================
   3) TYPEN-SLIDER
   =============================== */

function renderPkmTypes() {
  const typtIcon = document.getElementById("allTypes");
  if (!typtIcon) return;

  const types = loadPkmTypes();
  const icone = types.map(templatePkmTypeSlider).join("");

  typtIcon.innerHTML = `
    <div class="type_track">
      ${icone}
      ${icone}
    </div>
  `;
}

function loadPkmTypes() {
  if (allTypesCache) return allTypesCache;
  allTypesCache = localIcons.filter((n) => n !== "shadow" && n !== "unknown");
  return allTypesCache;
}

/* ===============================
   3) POKEMON-CARD
   =============================== */
function renderPokemonCard(pokemons) {
  const container = document.getElementById("pokedex");
  if (!container) return;
  container.innerHTML = templatePkmCard(pokemons);
}

async function loadPokemonCard() {
  toggleSpinner(true);
  const container = document.getElementById("pokedex");

  try {
    const data = await fetchPokemonData();
    const pokemons = await getPokemonsData(data);
    renderPokemonCard(pokemons);
    loadMorePokemon._currentLimit = limit;
  } catch (error) {
    if (container) container.innerHTML = "<p style='color:red'>Fehler beim Laden!</p>";
    console.error(error);
  } finally {
    toggleSpinner(false);
  }
}

async function getPokemonsData(data) {
  const results = data?.results || [];
  const pokemons = [];

  for (const item of results) {
    try {
      const detailsRes = await fetch(item.url);
      if (!detailsRes.ok) {
        console.warn("Details fetch failed:", detailsRes.status, detailsRes.statusText, "for", item.url);
        continue;
      }
      const details = await detailsRes.json();

      const stage = await getStage(details.species.url);
      const id = "#" + String(details.id).padStart(3, "0");

      const hpStat = details.stats?.find?.((s) => s.stat?.name === "hp") || {
        stat: { name: "HP" },
        base_stat: 0,
      };

      const types = (details.types || []).map((t) => t.type?.name).filter(Boolean);
      const dream = details.sprites?.other?.dream_world?.front_default;
      const official = details.sprites?.other?.["official-artwork"]?.front_default;
      const front = details.sprites?.front_default;

      pokemons.push({
        stage,
        name: cap(details.name),
        hp: {
          title: (hpStat.stat?.name || "HP").toUpperCase(),
          value: hpStat.base_stat ?? 0,
        },
        types,
        image: getPokemonImage({ image: dream || official || front }),
        id,
        height: formatHeight(details.height),
        weight: formatWeight(details.weight),
      });
    } catch (err) {
      console.error("getPokemonsData: Fehler bei Item", item, err);
    }
  }

  return pokemons;
}

async function loadMorePokemon() {
  if (_loadingMore) return;
  _loadingMore = true;

  const container = document.getElementById("pokedex");
  if (!container) {
    _loadingMore = false;
    return;
  }

  const prev = loadMorePokemon._currentLimit ?? limit;
  const next = prev + limit;
  loadMorePokemon._currentLimit = next;

  toggleSpinner(true);
  try {
    const [data] = await Promise.all([
      fetch(`${BASE_URL}?limit=${next}&offset=${offset}`).then((r) => r.json()),
      new Promise((res) => setTimeout(res, 1500)),
    ]);
    const all = await getPokemonsData(data);
    container.innerHTML += templatePkmCard(all.slice(prev, next));
  } catch (e) {
    console.error("Fehler in loadMorePokemon:", e);
  } finally {
    toggleSpinner(false);
    _loadingMore = false;
  }
}

loadHeroWrap();
loadPokemonCard();
renderPkmTypes();
