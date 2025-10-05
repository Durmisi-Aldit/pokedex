"use strict";

// Tabs
function openTab(contentId, el) {
  Array.from(document.getElementsByClassName("tab")).forEach((t) => t.classList.remove("active"));
  Array.from(document.getElementsByClassName("tab-content")).forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  document.getElementById(contentId)?.classList.add("active");
}

// Seite aufbauen
function buildDetailPage(p) {
  return templatePokemonDetailPage(p);
}

function renderDetailPage(root, html) {
  root.innerHTML = html;
}

// Detail-Seite init
function initDetailPage() {
  const root = document.getElementById("detail-site");
  if (!root) return;
  const id = +new URLSearchParams(location.search).get("id");
  if (!Number.isFinite(id) || id <= 0)
    return renderDetailPage(root, `<p style="color:red">Ungültige oder fehlende ID.</p>`);
  renderDetailPage(root, `<p>Lade…</p>`);
  const payload = { results: [{ url: `${BASE_URL}/${id}` }] };
  getPokemonsData(payload, { includeEvolution: true })
    .then(([p]) => {
      if (!p) return renderDetailPage(root, `<p style="color:red">Diese Pokemonname oder ID wurde nicht gefunden.</p>`);
      if (!p.numId) {
        const n = parseInt(String(p.id).replace(/\D/g, ""), 10);
        p.numId = Number.isFinite(n) ? n : id;
      }
      renderDetailPage(root, buildDetailPage(p));
      const cryBtn = document.getElementById("cry-btn");
      if (cryBtn && p.cry) cryBtn.onclick = () => new Audio(p.cry).play().catch(() => {});
      typeof updateClickedLikes === "function" && updateClickedLikes();
    })
    .catch(() => renderDetailPage(root, `<p style="color:red">Fehler beim Laden.</p>`));
}

initDetailPage();
