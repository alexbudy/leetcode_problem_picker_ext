// Load in the dataset form a CSV
var problemSet = [];
var problem_map = {};
Papa.parse("./problem_list_complete.csv", {
  download: true,
  skipEmptyLines: true,
  complete: function (res) {
    problemSet = res.data;

    for (let i = 0; i < problemSet.length; i++) {
      let num = problemSet[i][0];
      problem_map[num] = problemSet[i];
    }
  },
});

function getProblemsForNumbers(arr) {
  let probs = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] in problem_map) {
      probs[arr[i]] = problem_map[arr[i]];
    }
  }

  return probs;
}

async function isPremiumOrLoggedIn() {
  let data = await fetch("https://leetcode.com/")
    .then((res) => {
      return res.text();
    })
    .then((html) => {
      // Once LC loads, it sets some window properties in the script which can be parsed
      let ret = [
        html.includes("isSignedIn: true"),
        html.includes("isPremium: true"),
      ];
      return ret;
    });

  return data;
}

// Returns the problems, and problems chosen from
async function pickProblem(filters, probCount = 5) {
  var p = new Promise(function (res, rej) {
    chrome.storage.sync.get(["avoidedProblems"], (probs) => {
      res(probs["avoidedProblems"]);
    });
  });

  let avoidedProblems = await p;

  let candidates = [];
  // skip header row
  for (let i = 1; i < problemSet.length; i++) {
    let [num, title, href, paywall, acceptance, diff, upl, dnl, vrb, topic] =
      problemSet[i];
    num = parseInt(num);
    acceptance = parseFloat(acceptance.slice(0, -1));
    let like_ratio = parseInt(upl) / parseInt(dnl);
    vrb = parseInt(vrb);
    if (!filters.difficulties.includes(diff)) continue;
    if (!filters.topics.includes(topic)) continue;
    if (!filters.paywall.includes(paywall)) continue;
    if (
      acceptance > filters.acceptance_base + filters.acceptance_range ||
      acceptance < filters.acceptance_base - filters.acceptance_range
    )
      continue;
    if (like_ratio < filters.ratio_min || like_ratio > filters.ratio_max)
      continue;
    if (avoidedProblems.includes(num)) continue;

    candidates.push(i);
  }

  let ret_indices = [];
  while (
    ret_indices.length < probCount &&
    candidates.length > ret_indices.length
  ) {
    var r = Math.floor(Math.random() * candidates.length);
    if (ret_indices.indexOf(candidates[r]) === -1)
      ret_indices.push(candidates[r]);
  }
  ret_indices.sort((a, b) => {
    return a - b;
  });

  let return_problems = [];
  for (const i of ret_indices) {
    return_problems.push(problemSet[i]);
  }
  return [return_problems, candidates.length];
}

export { pickProblem, getProblemsForNumbers };
