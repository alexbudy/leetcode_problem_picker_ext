var difficultySelect = document.querySelectorAll(".difficulty-select");
var statusSelect = document.querySelectorAll(".status-select");
var inputAcceptances = document.querySelectorAll(".input-acceptance");
var minMaxRatioSliders = document.querySelectorAll(".ratio-slider");

var minRatioSlider = document.getElementById("min-ratio");
var maxRatioSlider = document.getElementById("max-ratio");

function setRatioText(sliderEl, val = null) {
  let sliderVal = val ? val : sliderEl.value;
  let sliderId = sliderEl.id;
  let txt;
  // Slider range from 0 to 9, so call 3 -> 1:1
  if (sliderVal == 3) {
    txt = "1:1";
  } else if (sliderVal < 3) {
    txt = `1:${4 - sliderVal}`;
  } else {
    txt = `${sliderVal - 2}:1`;
  }
  document.getElementById(sliderId + "-val").innerText = txt;
}

chrome.storage.sync.get(
  [minRatioSlider.id, maxRatioSlider.id],
  function (sliderValues) {
    for (const id in sliderValues) {
      let slider = document.getElementById(id);
      slider.value = sliderValues[id];
      setRatioText(slider, sliderValues[id]);
    }
  }
);

[minRatioSlider, maxRatioSlider].forEach((slider) => {
  slider.addEventListener("change", (ev) => {
    if (slider == minRatioSlider) {
      slider.value = Math.min(minRatioSlider.value, maxRatioSlider.value);
    } else {
      slider.value = Math.max(maxRatioSlider.value, minRatioSlider.value);
    }

    chrome.storage.sync.set({ [slider]: slider.value });
    setRatioText(slider);
  });
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
