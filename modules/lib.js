async function is_premium_or_logged_in() {
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

export { is_premium_or_logged_in };
