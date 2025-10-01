"use strict";

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
