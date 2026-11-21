(function () {
  function normalize(text) {
    let t = String(text || "").trim();
    const q = t.indexOf("?");
    if (q >= 0) t = t.slice(q + 1);
    t = t.replace(/[\r\n]+/g, "&").replace(/&+/g, "&").replace(/^&|&$/g, "");
    const params = new URLSearchParams(t);

    // 時刻つき血圧(bp=HH:mm/上/下/脈拍)を12時で朝夜に振り分け(各枠は最新の1件)
    const slots = { m: null, n: null };
    params.getAll("bp").forEach((s) => {
      const [time, sys, dia, hr] = s.split("/");
      const mt = /^(\d{1,2}):(\d{2})/.exec((time || "").trim());
      if (!mt) return;
      const mins = Number(mt[1]) * 60 + Number(mt[2]);
      const k = mins < 720 ? "m" : "n";
      if (!slots[k] || mins >= slots[k].mins) slots[k] = { mins, sys, dia, hr };
    });
    params.delete("bp");
    ["m", "n"].forEach((k) => {
      const v = slots[k];
      if (!v) return;
      if (v.sys) params.set(`${k}_bp_sys`, v.sys);
      if (v.dia) params.set(`${k}_bp_dia`, v.dia);
      if (v.hr) params.set(`${k}_hr`, v.hr);
    });
    return params.toString();
  }

  function importText(text) {
    const qs = normalize(text);
    if (!qs) {
      els.syncStatus.textContent = "取り込める項目がありません";
      return false;
    }
    history.replaceState({}, "", location.pathname + "?" + qs);
    loadDateIntoForm(getTodayISO(), true);
    history.replaceState({}, "", location.pathname);
    els.syncStatus.textContent = els.syncStatus.textContent.replace("URLから", "取り込みで");
    return true;
  }

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "ヘルスケアから取り込む";
  btn.style.cssText =
    "width:100%;margin:8px 0;padding:12px;border:0;border-radius:12px;font-weight:700;background:#38bdf8;color:#0f172a;";
  els.syncStatus.insertAdjacentElement("afterend", btn);

  const box = document.createElement("div");
  box.className = "hidden";
  box.style.cssText = "margin:8px 0;";
  box.innerHTML =
    '<textarea rows="3" style="width:100%;" placeholder="ここに貼り付け"></textarea>' +
    '<button type="button" style="width:100%;margin-top:6px;padding:10px;">反映</button>';
  btn.insertAdjacentElement("afterend", box);
  const ta = box.querySelector("textarea");
  box.querySelector("button").addEventListener("click", () => {
    if (importText(ta.value)) {
      ta.value = "";
      box.classList.add("hidden");
    }
  });

  btn.addEventListener("click", async () => {
    try {
      importText(await navigator.clipboard.readText());
    } catch {
      box.classList.remove("hidden");
      els.syncStatus.textContent = "貼り付け枠に貼って「反映」を押してください";
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
  }
})();
