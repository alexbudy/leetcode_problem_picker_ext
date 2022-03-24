import { pickProblem } from "./modules/lib.js";

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
    // Because of CORS policy, can't make requests to www.leetcode.com,
    // so better to remove this check for now
    // if (el.id == "premium-btn" && el.classList.contains("selected")) {
    //   isPremiumOrLoggedIn().then((ret) => {
    //     const [is_signed_in, is_prem] = ret;

    //     if (!is_signed_in) {
    //       alert("Must login first to solve premium LeetCode problems.");
    //       el.classList.remove("selected");
    //     } else if (!is_prem) {
    //       alert("Must be a premium member to solve premium LeetCode problems.");
    //       el.classList.remove("selected");
    //     }

    //     setOptionInStorageAndFilter(option, el.classList.contains("selected"));
    //   });
    // }

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

document.getElementById("pick-problem-btn").addEventListener("click", () => {
  let [candidateProblems, totalMatchingCriteria] = pickProblem(filters, 5);
  console.log(candidateProblems);
  console.log(totalMatchingCriteria);
  for (const prob of candidateProblems) {
    console.log("https://leetcode.com" + prob[2]);
  }
});
