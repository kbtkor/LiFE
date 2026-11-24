(function () {
  const SHIFT = { "朝BP/HR": 1, "夜BP/HR": 1, "PFC": 4, "P/F/C": 4 };

  function apply() {
    document.querySelectorAll("#fullLogTable th").forEach((th) => {
      if (th.querySelector(".hshift")) return;
      const n = SHIFT[th.textContent.trim()];
      if (!n) return;
      const s = document.createElement("span");
      s.className = "hshift";
      s.textContent = th.textContent;
      s.style.cssText = "position:relative;left:-" + n + "em;";
      th.textContent = "";
      th.appendChild(s);
    });
  }

  const table = document.getElementById("fullLogTable");
  if (table) {
    new MutationObserver(apply).observe(table, { childList: true, subtree: true });
  }
  apply();
})();
