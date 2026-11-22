(function () {
  function toN(v) {
    const s = String(v ?? "").trim();
    if (s === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  // カロリー = P×4 + F×9 + C×4(整数に四捨五入)
  function calcKcal() {
    const p = toN(els.pGrams.value);
    const f = toN(els.fGrams.value);
    const c = toN(els.cGrams.value);
    if (p === null && f === null && c === null) return "";
    return String(Math.round((p || 0) * 4 + (f || 0) * 9 + (c || 0) * 4));
  }

  function syncKcal() {
    els.kcal.value = calcKcal();
    els.kcal.dispatchEvent(new Event("input"));
  }

  els.kcal.readOnly = true;
  [els.pGrams, els.fGrams, els.cGrams].forEach((el) => el.addEventListener("input", syncKcal));

  function normalize(text) {
    let t = String(text || "").trim();
    const q = t.indexOf("?");
    if (q >= 0) t = t.slice(q + 1);
    t = t.replace(/[\r\n]+/g, "&").replace(/&+/g, "&").replace(/^&|&$/g, "");
    const params = new URLSearchParams(t);

    // カロリーはヘルスケアから取り込まない
    params.delete("kcal");

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

  const wrap = document.createElement("div");
  wrap.style.cssText = "margin:0 0 12px;";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "ヘルスケアから取り込む";
  btn.style.cssText =
    "display:block;width:100%;padding:14px;border:0;border-radius:12px;font-size:16px;font-weight:700;background:#38bdf8;color:#0f172a;";

  const msg = document.createElement("div");
  msg.style.cssText = "margin-top:6px;font-size:13px;color:#38bdf8;";

  const box = document.createElement("div");
  box.className = "hidden";
  box.style.cssText = "margin-top:8px;";
  box.innerHTML =
    '<textarea rows="3" placeholder="ここに貼り付け" style="display:block;width:100%;box-sizing:border-box;padding:10px;border-radius:10px;"></textarea>' +
    '<button type="button" style="display:block;width:100%;margin-top:6px;padding:12px;border-radius:10px;">反映</button>';

  wrap.append(btn, msg, box);
  const anchor = els.dateTextDisplay.closest(".card") || els.dateTextDisplay.parentElement;
  anchor.insertAdjacentElement("beforebegin", wrap);

  const ta = box.querySelector("textarea");

  function importText(text) {
    const qs = normalize(text);
    if (!qs) {
      msg.textContent = "取り込める項目がありません";
      return false;
    }
    const hasPFC = ["p", "f", "c"].some((k) => new URLSearchParams(qs).has(k));
    history.replaceState({}, "", location.pathname + "?" + qs);
    loadDateIntoForm(getTodayISO(), true);
    history.replaceState({}, "", location.pathname);
    if (hasPFC) syncKcal();
    const ok = els.syncStatus.textContent.includes("項目反映");
    msg.textContent = ok
      ? els.syncStatus.textContent.replace("URLから", "取り込みで")
      : "取り込める項目がありませんでした";
    return ok;
  }

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
      msg.textContent = "読み取れませんでした。下の枠に貼り付けて「反映」を押してください";
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
  }
})();
