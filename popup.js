var difficultySelect = document.querySelectorAll(".difficulty-select");
var statusSelect = document.querySelectorAll(".status-select");
var inputAcceptances = document.querySelectorAll(".input-acceptance");
var minMaxRatioSliders = document.querySelectorAll(".ratio-slider");

minMaxRatioSliders.forEach((el) => {
  var ratio = el.id;

  chrome.storage.sync.get([ratio], function (items) {
    if (items[ratio]) {
      el.value = items[ratio];
      document.getElementById(ratio + "-val").innerText = el.value;
    }
  });

  el.addEventListener("change", (ev) => {
    chrome.storage.sync.set({ [ratio]: el.value });
    document.getElementById(ratio + "-val").innerText = el.value;
  });
});

difficultySelect.forEach((el) => {
  var difficulty = el.id.split("-")[0];
  chrome.storage.sync.get([difficulty], function (items) {
    if (items[difficulty]) {
      el.classList.toggle("selected");
    }
  });

  el.addEventListener("click", (ev) => {
    el.classList.toggle("selected");
    chrome.storage.sync.set(
      { [difficulty]: el.classList.contains("selected") },
      () => {
        console.log(
          "Settings saved",
          difficulty,
          el.classList.contains("selected")
        );
      }
    );
  });
});

statusSelect.forEach((el) => {
  var status = el.id.split("-")[0];

  chrome.storage.sync.get([status], function (items) {
    if (items[status]) {
      el.classList.toggle("selected");
    }
  });

  el.addEventListener("click", (ev) => {
    el.classList.toggle("selected");
    chrome.storage.sync.set({ [status]: el.classList.contains("selected") });
  });
});

inputAcceptances.forEach((el) => {
  var acceptances = el.id;

  chrome.storage.sync.get([acceptances], function (items) {
    if (items[acceptances]) {
      el.value = items[acceptances];
    }
  });

  el.addEventListener("change", (ev) => {
    console.log("changing", ev);
    chrome.storage.sync.set({ [acceptances]: el.value });
  });
});
