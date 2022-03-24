// Load in the dataset form a CSV
var problemSet = [];
Papa.parse("./problem_list_complete.csv", {
  download: true,
  skipEmptyLines: true,
  complete: function (res) {
    problemSet = res.data;
  },
});

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
function pickProblem(filters, probCount = 5) {
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

export { pickProblem };
