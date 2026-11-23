(function () {
  const pos = (el) => hasPositiveValue(el.value);

  // ---- ⑥ Body / Intake / Active に「記録なし」チェックを追加 ----
  function addNoRecord(anchorEl, id) {
    const title = anchorEl.closest(".card").querySelector(".section-title");
    const label = document.createElement("label");
    label.className = "check-pill";
    label.innerHTML = '<input type="checkbox" id="' + id + '" /> 記録なし';
    title.appendChild(label);
    return label.querySelector("input");
  }
  const bNo = addNoRecord(els.waist, "bNoRecord");
  const iNo = addNoRecord(els.pGrams, "iNoRecord");
  const aNo = addNoRecord(els.activeKcal, "aNoRecord");

  const bodyInputs = [els.waist, els.weight, els.bfp, els.bmi, els.visceralFat, els.bmr, els.bodyTemp];
  const intakeInputs = [els.pGrams, els.fGrams, els.cGrams, els.kcal];
  const activeInputs = [els.activeKcal, els.cardioLoad];

  // 値が入っているときは「記録なし」を外す(Vitalsと同じ動き)
  function syncChecks() {
    if (bodyInputs.some(pos)) bNo.checked = false;
    if ([els.pGrams, els.fGrams, els.cGrams].some(pos)) iNo.checked = false;
    if (activeInputs.some(pos)) aNo.checked = false;
  }

  // ---- ②⑥ 赤枠警告 ----
  updateBlankWarnings = function () {
    const mSkip = els.mNoRecord.checked;
    [els.mBpSys, els.mBpDia, els.mHr].forEach((i) => i.classList.toggle("err-border", !(mSkip || pos(i))));
    const nSkip = els.nNoRecord.checked;
    [els.nBpSys, els.nBpDia, els.nHr].forEach((i) => i.classList.toggle("err-border", !(nSkip || pos(i))));
    bodyInputs.forEach((i) => i.classList.toggle("err-border", !(bNo.checked || pos(i))));
    intakeInputs.forEach((i) => i.classList.toggle("err-border", !(iNo.checked || pos(i))));
    // 活動が1件以上あるときだけ、アクティブ消費とカーディオ負荷は入力必須
    const needActive = currentActivities.length > 0 && !aNo.checked;
    activeInputs.forEach((i) => i.classList.toggle("err-border", needActive && !pos(i)));
  };

  function onChange() {
    syncChecks();
    updateBlankWarnings();
    if (!isTextManuallyEdited) updatePreviewText();
  }
  [...bodyInputs, els.pGrams, els.fGrams, els.cGrams, ...activeInputs].forEach((el) =>
    el.addEventListener("input", onChange)
  );
  [bNo, iNo, aNo].forEach((el) => el.addEventListener("change", onChange));

  // 活動の追加・削除でも警告を更新
  const _renderActivities = renderActivities;
  renderActivities = function () {
    _renderActivities();
    updateBlankWarnings();
  };

  // 保存データに「記録なし」を含める
  const _collect = collectCurrentDayState;
  collectCurrentDayState = function () {
    const s = _collect();
    s.body.noRecord = bNo.checked;
    s.intake.noRecord = iNo.checked;
    s.active.noRecord = aNo.checked;
    return s;
  };

  // AI検索用テキストにも反映
  const _build = buildFormattedText;
  buildFormattedText = function (dateStr, state) {
    const lines = _build(dateStr, state).split("\n");
    function range(prefix) {
      const s = lines.findIndex((l) => l.startsWith(prefix));
      if (s < 0) return null;
      let e = s + 1;
      while (e < lines.length && lines[e] !== "") e++;
      return [s + 1, e];
    }
    if (state.body && state.body.noRecord) {
      const r = range("■ Body");
      if (r) lines.splice(r[0], r[1] - r[0], "  記録なし");
    }
    if (state.intake && state.intake.noRecord) {
      const r = range("■ Intake");
      if (r) {
        const keep = lines.slice(r[0], r[1]).filter((l) => l.startsWith("  サプリメント"));
        lines.splice(r[0], r[1] - r[0], "  PFC・摂取カロリー: 記録なし", ...keep);
      }
    }
    if (state.active && state.active.noRecord) {
      const r = range("■ Active");
      if (r) {
        const keep = lines.slice(r[0], r[1]).filter((l) => !l.startsWith("  アクティブ消費"));
        lines.splice(r[0], r[1] - r[0], "  アクティブ消費・カーディオ負荷: 記録なし", ...keep);
      }
    }
    return lines.join("\n");
  };

  // ---- ③ 体重は小数第一位まで(切り捨て) ----
    function trunc1(v) {
    const s = String(v == null ? "" : v).trim();
    if (!/^-?\d+\.\d+$/.test(s)) return s;
    // まず小数6桁に丸めて(65.59999999999 → 65.600000)、小数第一位で切り捨てる
    const [i, d] = Number(s).toFixed(6).split(".");
    return i + "." + d.slice(0, 1);
  }

  els.weight.step = "0.1";
  els.weight.addEventListener("change", () => {
    const t = trunc1(els.weight.value);
    if (t !== els.weight.value) {
      els.weight.value = t;
      els.weight.dispatchEvent(new Event("input"));
    }
  });

  let urlCount = 0;
  const _applyUrl = applyUrlParams;
  applyUrlParams = function () {
    const q = new URLSearchParams(window.location.search);
    const hadWeight = ["weight", "wt"].some((k) => q.has(k));
    const n = _applyUrl();
    if (hadWeight) els.weight.value = trunc1(els.weight.value);
    urlCount = n;
    return n;
  };

  // ---- 日付を開いたときに「記録なし」を復元 ----
  function restoreChecks(day) {
    bNo.checked = Boolean(day.body && day.body.noRecord);
    iNo.checked = Boolean(day.intake && day.intake.noRecord);
    aNo.checked = Boolean(day.active && day.active.noRecord);
    syncChecks();
    updateBlankWarnings();
  }

  const _load = loadDateIntoForm;
  loadDateIntoForm = function (dateStr, applyUrl) {
    urlCount = 0;
    _load(dateStr, applyUrl === undefined ? false : applyUrl);
    const day = loadAllLogs()[dateStr] || {};
    restoreChecks(day);
    if (!day.customText || urlCount > 0) updatePreviewText();
  };

  // 最初の表示にも反映
  const first = loadAllLogs()[currentDateStr] || {};
  restoreChecks(first);
  if (!first.customText) updatePreviewText();
})();
