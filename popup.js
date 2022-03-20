var difficultySelect = document.querySelectorAll(".difficulty-select");
var statusSelect = document.querySelectorAll(".status-select");
var inputAcceptances = document.querySelectorAll(".input-acceptance");
var minMaxRatioSliders = document.querySelectorAll(".ratio-slider");

var minRatioSlider = document.getElementById("min-ratio");
var maxRatioSlider = document.getElementById("max-ratio");

chrome.storage.sync.get(
  [minRatioSlider.id, maxRatioSlider.id],
  function (sliderValues) {
    for (const id in sliderValues) {
      document.getElementById(id).value = sliderValues[id];
      document.getElementById(id + "-val").innerText = sliderValues[id];
    }
  }
);

function setRatioText(sliderEl) {
  let val = sliderEl.value;
  let sliderId = sliderEl.id;
  let txt;
  // Slider range from 0 to 10, so call 4 -> 1:1
  if (val == 3) {
    txt = "1:1";
  } else if (val < 3) {
    txt = `1:${4 - val}`;
  } else {
    txt = `${val - 2}:1`;
  }
  document.getElementById(sliderId + "-val").innerText = txt;
}

minRatioSlider.addEventListener("change", (ev) => {
  minRatioSlider.value = Math.min(minRatioSlider.value, maxRatioSlider.value);

  chrome.storage.sync.set({ [minRatioSlider.id]: minRatioSlider.value });
  setRatioText(minRatioSlider);
});

maxRatioSlider.addEventListener("change", (ev) => {
  maxRatioSlider.value = Math.max(maxRatioSlider.value, minRatioSlider.value);

  chrome.storage.sync.set({ [maxRatioSlider.id]: maxRatioSlider.value });
  setRatioText(maxRatioSlider);
});

var includePremiumChk = document.getElementById("include-chk");
chrome.storage.sync.get([includePremiumChk.id], function (items) {
  if (items[includePremiumChk.id]) {
    includePremiumChk.checked = items[includePremiumChk.id];
  }
});

includePremiumChk.addEventListener("change", (ev) => {
  chrome.storage.sync.set({
    [includePremiumChk.id]: includePremiumChk.checked,
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
