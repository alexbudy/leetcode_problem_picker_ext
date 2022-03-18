var difficultySelect = document.querySelectorAll(".difficulty-select");

difficultySelect.forEach((el) => {
  el.addEventListener("click", (ev) => {
    el.classList.toggle("selected");
  });
});
