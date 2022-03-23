import { is_premium_or_logged_in } from "./modules/lib.js";

var difficultiesAndTopics = document.querySelectorAll(
  ".difficulty-select, .topic-select"
);
var statusSelect = document.querySelectorAll(".status-select");
var inputAcceptances = document.querySelectorAll(".input-acceptance");

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
  if (sliderVal == 0) {
    txt = "<=" + txt;
  } else if (sliderVal == 9) {
    txt += "+";
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

includePremiumChk.addEventListener("change", () => {
  is_premium_or_logged_in().then((ret) => {
    if (includePremiumChk.checked) {
      const [is_signed_in, is_prem] = ret;

      if (!is_signed_in) {
        alert("Must login first to solve premium LeetCode problems.");
        includePremiumChk.checked = false;
        return;
      } else if (!is_prem) {
        alert("Must be a premium member to solve premium LeetCode problems.");
        includePremiumChk.checked = false;
        return;
      }
      chrome.storage.sync.set({
        [includePremiumChk.id]: includePremiumChk.checked,
      });
    }
  });
});

difficultiesAndTopics.forEach((el) => {
  var difficultyOrTopic = el.id.split("-")[0];
  chrome.storage.sync.get([difficultyOrTopic], function (items) {
    console.log(items[difficultyOrTopic]);
    if (difficultyOrTopic in items) {
      if (items[difficultyOrTopic]) {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
    }
  });

  el.addEventListener("click", (ev) => {
    el.classList.toggle("selected");
    chrome.storage.sync.set(
      { [difficultyOrTopic]: el.classList.contains("selected") },
      () => {
        console.log(
          "Settings saved",
          difficultyOrTopic,
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
