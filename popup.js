import { pickProblem, getProblemsForNumbers } from "./modules/lib.js";

var allOptions = document.querySelectorAll(".option-select");
var inputAcceptances = document.querySelectorAll(".input-acceptance");

var minRatioSlider = document.getElementById("min-ratio");
var maxRatioSlider = document.getElementById("max-ratio");

const SCALE = [1, 10, 25, 40, 60, 80];

/* Object to pass to pickProblem */
let filters = {
  difficulties: ["MED"],
  topics: ["ALG"],
  paywall: ["FREE"],
  acceptance_base: 60.0,
  acceptance_range: 5.0,
  ratio_min: 1.0,
  ratio_max: 5.0,
};

/* Helper fn to get the ratios on the likes scale */
function getRatioFromSliderVal(val) {
  val = parseInt(val); // 0 to 6
  return SCALE[val];
}

function setRatioText(sliderEl, val = null) {
  let sliderVal = val ? val : sliderEl.value;
  let sliderId = sliderEl.id;
  let ratio = getRatioFromSliderVal(sliderVal);
  let txt;
  if (ratio >= 1) {
    txt = `${ratio}:1`;
  } else {
    txt = `1:${1 / ratio}`;
  }

  if (ratio == SCALE[0] && sliderId == "min-ratio") {
    txt = "<=" + txt;
  } else if (ratio == SCALE.at(-1) && sliderId == "max-ratio") {
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
      updateFilterWithValue(id, slider.value);
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

    setRatioText(slider);
    setOptionInStorageAndFilter(slider.id, slider.value);
  });
});

allOptions.forEach((el) => {
  var option = el.id.split("-")[0];
  chrome.storage.sync.get([option], function (items) {
    if (option in items) {
      if (items[option]) {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
      updateFilterWithValue(option, items[option]);
    } else {
      updateFilterWithValue(option, false);
    }
  });

  el.addEventListener("click", (ev) => {
    el.classList.toggle("selected");

    setOptionInStorageAndFilter(option, el.classList.contains("selected"));
  });
});

function updateFilterWithValue(option, val) {
  option = option.toUpperCase();
  if (["MED", "EASY", "HARD"].includes(option)) {
    if (val) {
      if (!filters.difficulties.includes(option)) {
        filters.difficulties.push(option);
      }
    } else {
      filters.difficulties = filters.difficulties.filter(function (
        val,
        idx,
        arr
      ) {
        return val != option;
      });
    }
  } else if (["ALG", "DB"].includes(option)) {
    if (val) {
      if (!filters.topics.includes(option)) {
        filters.topics.push(option);
      }
    } else {
      filters.topics = filters.topics.filter(function (val, idx, arr) {
        return val != option;
      });
    }
  } else if (["FREE", "PREM"].includes(option)) {
    if (val) {
      if (!filters.paywall.includes(option)) {
        filters.paywall.push(option);
      }
    } else {
      filters.paywall = filters.paywall.filter(function (val, idx, arr) {
        return val != option;
      });
    }
  } else if (option == "TARGET-ACCEPTANCE") {
    filters.acceptance_base = parseFloat(val);
  } else if (option == "VARIABILITY-ACCEPTANCE") {
    filters.acceptance_range = parseFloat(val);
  } else if (option == "MIN-RATIO") {
    filters.ratio_min = getRatioFromSliderVal(val);
    if (filters.ratio_min <= SCALE[0]) filters.ratio_min = 0;
  } else if (option == "MAX-RATIO") {
    filters.ratio_max = getRatioFromSliderVal(val);
    if (filters.ratio_max >= SCALE.at(-1)) filters.ratio_max = 100;
  }
}

function setOptionInStorageAndFilter(option, val) {
  chrome.storage.sync.set(
    { [option]: val },
    updateFilterWithValue.bind(null, option, val)
  );
}

inputAcceptances.forEach((el) => {
  var acceptances = el.id;

  chrome.storage.sync.get([acceptances], function (items) {
    if (items[acceptances]) {
      el.value = items[acceptances];
      updateFilterWithValue(acceptances, items[acceptances]);
    }
  });

  el.addEventListener("input", (ev) => {
    setOptionInStorageAndFilter(acceptances, el.value);
  });
});

function displayProblem(prob, candidateLength) {
  if (!prob) return;

  let resultDiv = document.getElementById("result-div");
  resultDiv.style.display = "block";

  let acceptance = prob[4];
  let diff = prob[5];
  let likes = prob[6];
  let dislikes = prob[7];
  let linkClass;
  if (diff == "EASY") {
    linkClass = "easy-color";
  } else if (diff == "MED") {
    linkClass = "med-color";
  } else {
    linkClass = "hard-color";
  }
  let isPrem = prob[3] !== "FREE";
  let optionalAsterisk = isPrem ? "*" : "";

  resultDiv.innerHTML = `<a class="${linkClass} problem-link" target="_blank" href="https://leetcode.com${prob[2]}">${prob[0]}: ${prob[1]}  ${optionalAsterisk}</a>`;
  resultDiv.innerHTML += `<div>(Out of ${candidateLength})</div>`;
  resultDiv.innerHTML += `<div><span style="font-weight:bold">Acceptance:</span> ${acceptance}</div>`;
  resultDiv.innerHTML += `<div><span style="font-weight:bold">Like/Dislike:</span> ${likes}/${dislikes} (${
    Math.round((likes / dislikes) * 10) / 10
  }%) </div>`;
}

chrome.storage.sync.get(["problem", "candidateLength"], (item) => {
  if (item) {
    displayProblem(item["problem"], item["candidateLength"]);
  }
});

document.getElementById("pick-problem-btn").addEventListener("click", () => {
  let [candidateProblems, candidateLength] = pickProblem(filters, 5);

  if (candidateProblems.length > 0) {
    let prob =
      candidateProblems[Math.floor(Math.random() * candidateProblems.length)];
    chrome.storage.sync.set({
      problem: prob,
      candidateLength: candidateLength,
    });
    displayProblem(prob, candidateLength);
  } else {
    let resultDiv = document.getElementById("result-div");
    resultDiv.style.display = "block";

    resultDiv.innerText =
      "No found problem for given criteria, please try again!";
    chrome.storage.sync.remove("problem");
  }
});

function setTextAreaWithProblemsArray(arr) {
  let problemsTextArea = document.getElementById("textarea");
  let problems = getProblemsForNumbers(arr);

  problemsTextArea.value = "";
  for (let i = 0; i < arr.length; i++) {
    let pNum = arr[i];
    if (pNum in problems) {
      problemsTextArea.value += `${pNum} - ${problems[pNum][1]}  \n`;
    }
  }
}

document
  .getElementById("completed-problems-btn")
  .addEventListener("click", () => {
    chrome.storage.sync.get(["avoidedProblems"], (arr) => {
      togglePopup();
      setTextAreaWithProblemsArray(arr["avoidedProblems"]);
    });
  });

document.getElementById("save-problems-btn").addEventListener("click", () => {
  let problems = document.getElementById("textarea").value.trim().split("\n");
  let sortedProblems = new Set();
  for (let i = 0; i < problems.length; i++) {
    let pNum = problems[i].split("-")[0].trim();
    if (isNaN(pNum)) {
      alert(`Found not a number ${problems[i]} on line ${i + 1}`);
      return;
    }
    if (pNum.length !== 0) {
      sortedProblems.add(parseInt(pNum));
    }
  }

  let inputProblemsArray = Array.from(sortedProblems).sort((a, b) => {
    return a - b;
  });
  chrome.storage.sync.set({ avoidedProblems: inputProblemsArray });
  setTextAreaWithProblemsArray(inputProblemsArray);
});

function togglePopup(hide = false) {
  let popup = document.getElementById("popup");
  if (hide) {
    popup.style.display = "none";
  } else {
    popup.style.display = popup.style.display === "none" ? "" : "none";
  }
}

// Catch click outside the popup
window.addEventListener("click", function (e) {
  if (document.getElementById("popup").contains(e.target)) {
    // Clicked in box
  } else if (
    !document.getElementById("completed-problems-btn").contains(e.target)
  ) {
    // Clicked outside the box
    togglePopup(true);
  }
});
