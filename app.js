const STORAGE_KEY = "daily_health_logs_v3";
const TARGETS_HISTORY_KEY = "code_life_targets_history_v1";
const MYLIST_KEY = "code_life_mylist_v1";

let currentDateStr = getTodayISO();
let calYear = Number(currentDateStr.slice(0, 4));
let calMonth = Number(currentDateStr.slice(5, 7)) - 1;
let currentActivities = [];
let editingActivityIndex = null;
let editingMyListId = null;
let isTextManuallyEdited = false;

const els = {
  syncStatus: document.getElementById("syncStatus"),
  dateTextDisplay: document.getElementById("dateTextDisplay"),
  prevDateBtn: document.getElementById("prevDateBtn"),
  nextDateBtn: document.getElementById("nextDateBtn"),

  // Morning Vitals
  mNoRecord: document.getElementById("mNoRecord"),
  mVitalsBody: document.getElementById("mVitalsBody"),
  mBpSys: document.getElementById("mBpSys"),
  mBpDia: document.getElementById("mBpDia"),
  mHr: document.getElementById("mHr"),
  mSymptom: document.getElementById("mSymptom"),
  mIhb: document.getElementById("mIhb"),
  mIhbText: document.getElementById("mIhbText"),
  mIhbPill: document.getElementById("mIhbPill"),

  // Night Vitals
  nNoRecord: document.getElementById("nNoRecord"),
  nVitalsBody: document.getElementById("nVitalsBody"),
  nBpSys: document.getElementById("nBpSys"),
  nBpDia: document.getElementById("nBpDia"),
  nHr: document.getElementById("nHr"),
  nSymptom: document.getElementById("nSymptom"),
  nIhb: document.getElementById("nIhb"),
  nIhbText: document.getElementById("nIhbText"),
  nIhbPill: document.getElementById("nIhbPill"),

  // Body & Targets
  waist: document.getElementById("waist"),
  weight: document.getElementById("weight"),
  bfp: document.getElementById("bfp"),
  bmi: document.getElementById("bmi"),
  visceralFat: document.getElementById("visceralFat"),
  bmr: document.getElementById("bmr"),
  bodyTemp: document.getElementById("bodyTemp"),
  bodyTargetSummary: document.getElementById("bodyTargetSummary"),
  toggleBodyTargetBtn: document.getElementById("toggleBodyTargetBtn"),
  bodyTargetEditor: document.getElementById("bodyTargetEditor"),
  bodyTargetEffectiveDate: document.getElementById("bodyTargetEffectiveDate"),
  targetWaist: document.getElementById("targetWaist"),
  targetWeight: document.getElementById("targetWeight"),

  // Intake & Supplements & Targets
  pGrams: document.getElementById("pGrams"),
  fGrams: document.getElementById("fGrams"),
  cGrams: document.getElementById("cGrams"),
  kcal: document.getElementById("kcal"),
  intakeTargetDisplay: document.getElementById("intakeTargetDisplay"),
  toggleIntakeTargetBtn: document.getElementById("toggleIntakeTargetBtn"),
  intakeTargetEditor: document.getElementById("intakeTargetEditor"),
  intakeTargetEffectiveDate: document.getElementById("intakeTargetEffectiveDate"),
  targetP: document.getElementById("targetP"),
  targetF: document.getElementById("targetF"),
  targetC: document.getElementById("targetC"),
  targetKcal: document.getElementById("targetKcal"),
  mSuppHmb: document.getElementById("mSuppHmb"),
  mSuppAmino: document.getElementById("mSuppAmino"),
  mSuppHmbPill: document.getElementById("mSuppHmbPill"),
  mSuppAminoPill: document.getElementById("mSuppAminoPill"),
  mSuppCustom: document.getElementById("mSuppCustom"),
  nSuppHmb: document.getElementById("nSuppHmb"),
  nSuppAmino: document.getElementById("nSuppAmino"),
  nSuppHmbPill: document.getElementById("nSuppHmbPill"),
  nSuppAminoPill: document.getElementById("nSuppAminoPill"),
  nSuppCustom: document.getElementById("nSuppCustom"),

  // Active
  activeKcal: document.getElementById("activeKcal"),
  cardioLoad: document.getElementById("cardioLoad"),
  actFormTitle: document.getElementById("actFormTitle"),
  myListSelect: document.getElementById("myListSelect"),
  actCategory: document.getElementById("actCategory"),
  actName: document.getElementById("actName"),
  actTimeType: document.getElementById("actTimeType"),
  actTimeVal: document.getElementById("actTimeVal"),
  actNote: document.getElementById("actNote"),
  addActivityBtn: document.getElementById("addActivityBtn"),
  cancelActivityEditBtn: document.getElementById("cancelActivityEditBtn"),
  activityListContainer: document.getElementById("activityListContainer"),

  // Text & Save
  saveAndCopyBtn: document.getElementById("saveAndCopyBtn"),
  regenerateTextBtn: document.getElementById("regenerateTextBtn"),
  formattedOutput: document.getElementById("formattedOutput"),

  // MyList
  myListFormTitle: document.getElementById("myListFormTitle"),
  myShortName: document.getElementById("myShortName"),
  myFullName: document.getElementById("myFullName"),
  myDetail: document.getElementById("myDetail"),
  addMyListBtn: document.getElementById("addMyListBtn"),
  cancelMyListEditBtn: document.getElementById("cancelMyListEditBtn"),
  myListItems: document.getElementById("myListItems"),

  // Calendar & Backup
  calPrevMonth: document.getElementById("calPrevMonth"),
  calNextMonth: document.getElementById("calNextMonth"),
  calMonthLabel: document.getElementById("calMonthLabel"),
  calGrid: document.getElementById("calGrid"),
  exportJsonBtn: document.getElementById("exportJsonBtn"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  importFileInput: document.getElementById("importFileInput"),
  backupInfo: document.getElementById("backupInfo"),

  // Data
  vitalsChart: document.getElementById("vitalsChart"),
  bodyChart: document.getElementById("bodyChart"),
  toggleLogTableBtn: document.getElementById("toggleLogTableBtn"),
  fullLogSection: document.getElementById("fullLogSection"),
  fullLogTable: document.getElementById("fullLogTable")
};

function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 10);
}

function shiftDate(isoStr, days) {
  const [y, m, d] = isoStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function loadAllLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAllLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  els.backupInfo.textContent = `保存済み日数: ${Object.keys(logs).length}日分`;
}

// ② 目標値履歴管理（変更日以降継続・変更日以前はそのまま）
function loadTargetHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(TARGETS_HISTORY_KEY) || "null");
    if (Array.isArray(raw) && raw.length > 0) return raw;
  } catch {}
  return [
    {
      effectiveDate: "1900-01-01",
      waist: "",
      weight: "",
      p: "",
      f: "",
      c: "",
      kcal: ""
    }
  ];
}

function saveTargetHistory(list) {
  list.sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  localStorage.setItem(TARGETS_HISTORY_KEY, JSON.stringify(list));
}

function getEffectiveTargetsForDate(dateStr) {
  const history = loadTargetHistory();
  let matched = {
    effectiveDate: "1900-01-01",
    waist: "",
    weight: "",
    p: "",
    f: "",
    c: "",
    kcal: ""
  };
  for (const entry of history) {
    if (entry.effectiveDate <= dateStr) {
      matched = { ...matched, ...entry };
    }
  }
  return matched;
}

function commitTargetChangeForCurrentDate() {
  const history = loadTargetHistory();
  const base = getEffectiveTargetsForDate(currentDateStr);
  const updatedEntry = {
    effectiveDate: currentDateStr,
    waist: els.targetWaist.value.trim() || base.waist || "",
    weight: els.targetWeight.value.trim() || base.weight || "",
    p: els.targetP.value.trim() || base.p || "",
    f: els.targetF.value.trim() || base.f || "",
    c: els.targetC.value.trim() || base.c || "",
    kcal: els.targetKcal.value.trim() || base.kcal || ""
  };

  const existingIdx = history.findIndex((h) => h.effectiveDate === currentDateStr);
  if (existingIdx >= 0) {
    history[existingIdx] = updatedEntry;
  } else {
    history.push(updatedEntry);
  }
  saveTargetHistory(history);
  refreshTargetDisplayAndColors();
}

function refreshTargetDisplayAndColors() {
  const eff = getEffectiveTargetsForDate(currentDateStr);
  els.bodyTargetEffectiveDate.textContent = currentDateStr;
  els.intakeTargetEffectiveDate.textContent = currentDateStr;

  els.bodyTargetSummary.textContent =
    `適用中の目標（胴囲 / 体重）: ${eff.waist || "-"} cm / ${eff.weight || "-"} kg`;

  const tp = eff.p || "-";
  const tf = eff.f || "-";
  const tc = eff.c || "-";
  const tk = eff.kcal || "-";
  els.intakeTargetDisplay.textContent =
    `適用中の目標値: P ${tp}g / F ${tf}g / C ${tc}g / ${tk}kcal`;

  applyColorClass(els.waist, getPercentDiffClass(els.waist.value, eff.waist));
  applyColorClass(els.weight, getPercentDiffClass(els.weight.value, eff.weight));

  applyColorClass(els.pGrams, getAbsDiffClass(els.pGrams.value, eff.p, 10, 25));
  applyColorClass(els.fGrams, getAbsDiffClass(els.fGrams.value, eff.f, 10, 25));
  applyColorClass(els.cGrams, getAbsDiffClass(els.cGrams.value, eff.c, 10, 25));
  applyColorClass(els.kcal, getAbsDiffClass(els.kcal.value, eff.kcal, 100, 250));
}

function loadMyList() {
  try {
    const list = JSON.parse(localStorage.getItem(MYLIST_KEY) || "null");
    if (Array.isArray(list)) return list;
  } catch {}
  return [
    {
      id: "preset_bd5",
      shortName: "BD5分",
      fullName: "ボディブレード",
      detail: "ボディブレード30秒+スクワット30秒×5セット"
    }
  ];
}

function saveMyList(list) {
  localStorage.setItem(MYLIST_KEY, JSON.stringify(list));
  renderMyList();
}

function toNum(v) {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function hasPositiveValue(v) {
  const n = toNum(v);
  return n !== null && n !== 0;
}

// ① 空欄ミス赤枠警告（数値あり、もしくは計測なしチェックでクリア）
function updateBlankWarnings() {
  const mSkipped = els.mNoRecord.checked;
  [els.mBpSys, els.mBpDia, els.mHr].forEach((inp) => {
    const ok = mSkipped || hasPositiveValue(inp.value);
    inp.classList.toggle("err-border", !ok);
  });

  const nSkipped = els.nNoRecord.checked;
  [els.nBpSys, els.nBpDia, els.nHr].forEach((inp) => {
    const ok = nSkipped || hasPositiveValue(inp.value);
    inp.classList.toggle("err-border", !ok);
  });

  [els.waist, els.weight, els.bfp, els.bmi, els.visceralFat, els.bmr, els.bodyTemp].forEach((inp) => {
    inp.classList.toggle("err-border", !hasPositiveValue(inp.value));
  });

  [els.pGrams, els.fGrams, els.cGrams, els.kcal].forEach((inp) => {
    inp.classList.toggle("err-border", !hasPositiveValue(inp.value));
  });
}

function updateVitalsVisibility(slot) {
  const isMorning = slot === "morning";
  const chk = isMorning ? els.mNoRecord : els.nNoRecord;
  const body = isMorning ? els.mVitalsBody : els.nVitalsBody;
  const bpSys = isMorning ? els.mBpSys.value.trim() : els.nBpSys.value.trim();
  const bpDia = isMorning ? els.mBpDia.value.trim() : els.nBpDia.value.trim();
  const hr = isMorning ? els.mHr.value.trim() : els.nHr.value.trim();

  const hasAnyData =
    hasPositiveValue(bpSys) || hasPositiveValue(bpDia) || hasPositiveValue(hr);

  if (hasAnyData) {
    body.classList.remove("hidden");
  } else {
    body.classList.toggle("hidden", chk.checked);
  }
}

function updateTogglePills() {
  els.mIhbText.textContent = els.mIhb.checked ? "あり" : "なし";
  els.mIhbPill.classList.toggle("on", els.mIhb.checked);
  els.nIhbText.textContent = els.nIhb.checked ? "あり" : "なし";
  els.nIhbPill.classList.toggle("on", els.nIhb.checked);

  els.mSuppHmbPill.classList.toggle("on", els.mSuppHmb.checked);
  els.mSuppAminoPill.classList.toggle("on", els.mSuppAmino.checked);
  els.nSuppHmbPill.classList.toggle("on", els.nSuppHmb.checked);
  els.nSuppAminoPill.classList.toggle("on", els.nSuppAmino.checked);
}

function getPercentDiffClass(val, target) {
  const v = toNum(val);
  const t = toNum(target);
  if (v === null || t === null || t === 0) return "gray";
  const pct = Math.abs((v - t) / t) * 100;
  if (pct <= 1.5) return "blue";
  if (pct >= 5.0) return "red";
  return "gray";
}

function getAbsDiffClass(val, target, blueThresh, redThresh) {
  const v = toNum(val);
  const t = toNum(target);
  if (v === null || t === null) return "gray";
  const diff = Math.abs(v - t);
  if (diff <= blueThresh) return "blue";
  if (diff >= redThresh) return "red";
  return "gray";
}

function applyColorClass(inputEl, colorType) {
  inputEl.classList.remove("val-blue", "val-red", "val-gray");
  inputEl.classList.add(`val-${colorType}`);
}

function extractNumericValue(raw) {
  if (raw === null || raw === undefined) return "";
  const firstLine = String(raw).split(/\r?\n/)[0].trim();
  const match = firstLine.match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

// 夜Vitalsが朝Vitalsに上書きされないよう、朝キーと夜キーを完全分離して反映
function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const mappings = [
    { keys: ["weight", "wt"], input: els.weight },
    { keys: ["waist"], input: els.waist },
    { keys: ["bfp"], input: els.bfp },
    { keys: ["bmi"], input: els.bmi },
    { keys: ["vfat", "visceral_fat"], input: els.visceralFat },
    { keys: ["bmr"], input: els.bmr },
    { keys: ["temp", "body_temp"], input: els.bodyTemp },
    { keys: ["p"], input: els.pGrams },
    { keys: ["f"], input: els.fGrams },
    { keys: ["c"], input: els.cGrams },
    { keys: ["kcal"], input: els.kcal },
    { keys: ["active_kcal", "act"], input: els.activeKcal },
    { keys: ["cardio_load", "cardio"], input: els.cardioLoad },
    // 朝Vitals専用キー
    { keys: ["m_bp_sys", "morning_bp_sys", "bp_sys", "bps"], input: els.mBpSys },
    { keys: ["m_bp_dia", "morning_bp_dia", "bp_dia", "bpd"], input: els.mBpDia },
    { keys: ["m_hr", "morning_hr", "hr"], input: els.mHr },
    // 夜Vitals専用キー
    { keys: ["n_bp_sys", "night_bp_sys", "nbps"], input: els.nBpSys },
    { keys: ["n_bp_dia", "night_bp_dia", "nbpd"], input: els.nBpDia },
    { keys: ["n_hr", "night_hr", "nhr"], input: els.nHr }
  ];

  let count = 0;
  mappings.forEach(({ keys, input }) => {
    for (const k of keys) {
      if (!params.has(k)) continue;
      const numStr = extractNumericValue(params.get(k));
      if (numStr !== "") {
        input.value = numStr;
        count++;
        break;
      }
    }
  });

  els.syncStatus.textContent = count > 0
    ? `URLから${count}項目反映`
    : "ローカル保存モード";
}

// ④ ホーム：入力済活動内容の編集・削除
function resetActivityForm() {
  editingActivityIndex = null;
  els.actFormTitle.textContent = "活動内容を追加";
  els.addActivityBtn.textContent = "＋ 活動を追加";
  els.cancelActivityEditBtn.classList.add("hidden");
  els.actName.value = "";
  els.actTimeVal.value = "";
  els.actNote.value = "";
  els.myListSelect.value = "";
}

function renderActivities() {
  els.activityListContainer.innerHTML = "";
  currentActivities.forEach((act, idx) => {
    const div = document.createElement("div");
    div.className = "activity-item";
    const notePart = act.note ? ` / 備考:${act.note}` : "";
    div.innerHTML = `
      <div>
        <strong>[${act.category}] ${act.name}</strong><br/>
        <span style="color:var(--muted);">${act.timeType}: ${act.timeVal || "-"}${notePart}</span>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.textContent = "編集";
    editBtn.onclick = () => {
      editingActivityIndex = idx;
      els.actFormTitle.textContent = "活動内容を編集中";
      els.addActivityBtn.textContent = "更新を反映";
      els.cancelActivityEditBtn.classList.remove("hidden");
      els.actCategory.value = act.category;
      els.actName.value = act.name;
      els.actTimeType.value = act.timeType;
      els.actTimeVal.value = act.timeVal || "";
      els.actNote.value = act.note || "";
    };

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "danger-btn";
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      currentActivities.splice(idx, 1);
      if (editingActivityIndex === idx) resetActivityForm();
      renderActivities();
      if (!isTextManuallyEdited) updatePreviewText();
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    div.appendChild(actions);
    els.activityListContainer.appendChild(div);
  });
}

function collectCurrentDayState() {
  return {
    morning: {
      noRecord: els.mNoRecord.checked,
      bpSys: els.mBpSys.value.trim(),
      bpDia: els.mBpDia.value.trim(),
      hr: els.mHr.value.trim(),
      symptom: els.mSymptom.value.trim() || "自覚症状なし",
      ihb: els.mIhb.checked
    },
    night: {
      noRecord: els.nNoRecord.checked,
      bpSys: els.nBpSys.value.trim(),
      bpDia: els.nBpDia.value.trim(),
      hr: els.nHr.value.trim(),
      symptom: els.nSymptom.value.trim() || "自覚症状なし",
      ihb: els.nIhb.checked
    },
    body: {
      waist: els.waist.value.trim(),
      weight: els.weight.value.trim(),
      bfp: els.bfp.value.trim(),
      bmi: els.bmi.value.trim(),
      visceralFat: els.visceralFat.value.trim(),
      bmr: els.bmr.value.trim(),
      bodyTemp: els.bodyTemp.value.trim()
    },
    intake: {
      p: els.pGrams.value.trim(),
      f: els.fGrams.value.trim(),
      c: els.cGrams.value.trim(),
      kcal: els.kcal.value.trim(),
      supplements: {
        morning: {
          hmb: els.mSuppHmb.checked,
          amino: els.mSuppAmino.checked,
          custom: els.mSuppCustom.value.trim()
        },
        night: {
          hmb: els.nSuppHmb.checked,
          amino: els.nSuppAmino.checked,
          custom: els.nSuppCustom.value.trim()
        }
      }
    },
    active: {
      activeKcal: els.activeKcal.value.trim(),
      cardioLoad: els.cardioLoad.value.trim(),
      activities: [...currentActivities]
    }
  };
}

function formatVitalsBlock(title, v) {
  const hasData = hasPositiveValue(v.bpSys) || hasPositiveValue(v.bpDia) || hasPositiveValue(v.hr);
  if (v.noRecord && !hasData) {
    return [`${title}: 記録なし`];
  }
  return [
    `${title}:`,
    `  計測: ${v.bpSys || "0"}/${v.bpDia || "0"} 脈拍:${v.hr || "0"}`,
    `  IHB: ${v.ihb ? "あり" : "なし"} / ${v.symptom}`
  ];
}

function formatSuppPeriod(label, s) {
  const items = [];
  if (s?.hmb) items.push("HMB1000mg");
  if (s?.amino) items.push("アミノ酸1200mg");
  if (s?.custom) items.push(s.custom);
  return `${label}: ${items.length ? items.join(", ") : "なし"}`;
}

function buildFormattedText(dateStr, state) {
  const [, m, d] = dateStr.split("-");
  const md = `${Number(m)}/${Number(d)}`;
  const b = state.body;
  const inc = state.intake;
  const act = state.active;
  const supps = inc.supplements || {};

  const actLines = act.activities.length
    ? act.activities.map((a) => `  ・[${a.category}] ${a.name} (${a.timeType}:${a.timeVal || "-"}${a.note ? " / " + a.note : ""})`)
    : ["  なし"];

  return [
    `【${md} Code_LiFE】`,
    "■ Vitals(体調)",
    ...formatVitalsBlock("朝", state.morning),
    ...formatVitalsBlock("夜", state.night),
    "",
    "■ Body(体組成)",
    `  胴囲:${b.waist || "0"}cm / 体重:${b.weight || "0"}kg`,
    `  体脂肪率:${b.bfp || "0"}% / BMI:${b.bmi || "0"} / 内臓脂肪:${b.visceralFat || "0"}`,
    `  基礎代謝:${b.bmr || "0"}kcal / 体温:${b.bodyTemp || "0"}℃`,
    "",
    "■ Intake(摂取)",
    `  PFC: P ${inc.p || "0"}g / F ${inc.f || "0"}g / C ${inc.c || "0"}g`,
    `  摂取カロリー: ${inc.kcal || "0"}kcal`,
    `  サプリメント ${formatSuppPeriod("朝", supps.morning)} / ${formatSuppPeriod("夜", supps.night)}`,
    "",
    "■ Active(活動)",
    `  アクティブ消費:${act.activeKcal || "0"}kcal / カーディオ負荷:${act.cardioLoad || "0"}`,
    ...actLines
  ].join("\n");
}

function updatePreviewText() {
  const state = collectCurrentDayState();
  els.formattedOutput.value = buildFormattedText(currentDateStr, state);
}

function loadDateIntoForm(dateStr, applyUrl = false) {
  currentDateStr = dateStr;
  els.dateTextDisplay.textContent = dateStr;
  isTextManuallyEdited = false;
  resetActivityForm();

  const logs = loadAllLogs();
  const day = logs[dateStr] || {};
  const m = day.morning || {};
  const n = day.night || {};
  const b = day.body || {};
  const inc = day.intake || {};
  const supps = inc.supplements || {};
  const act = day.active || {};

  els.mNoRecord.checked = Boolean(m.noRecord);
  els.mBpSys.value = m.bpSys ?? "";
  els.mBpDia.value = m.bpDia ?? "";
  els.mHr.value = m.hr ?? "";
  els.mSymptom.value = m.symptom ?? "自覚症状なし";
  els.mIhb.checked = Boolean(m.ihb);

  els.nNoRecord.checked = Boolean(n.noRecord);
  els.nBpSys.value = n.bpSys ?? "";
  els.nBpDia.value = n.bpDia ?? "";
  els.nHr.value = n.hr ?? "";
  els.nSymptom.value = n.symptom ?? "自覚症状なし";
  els.nIhb.checked = Boolean(n.ihb);

  els.waist.value = b.waist ?? "";
  els.weight.value = b.weight ?? "";
  els.bfp.value = b.bfp ?? "";
  els.bmi.value = b.bmi ?? "";
  els.visceralFat.value = b.visceralFat ?? "";
  els.bmr.value = b.bmr ?? "";
  els.bodyTemp.value = b.bodyTemp ?? "";

  els.pGrams.value = inc.p ?? "";
  els.fGrams.value = inc.f ?? "";
  els.cGrams.value = inc.c ?? "";
  els.kcal.value = inc.kcal ?? "";

  els.mSuppHmb.checked = Boolean(supps.morning?.hmb);
  els.mSuppAmino.checked = Boolean(supps.morning?.amino);
  els.mSuppCustom.value = supps.morning?.custom ?? "";

  els.nSuppHmb.checked = Boolean(supps.night?.hmb);
  els.nSuppAmino.checked = Boolean(supps.night?.amino);
  els.nSuppCustom.value = supps.night?.custom ?? "";

  els.activeKcal.value = act.activeKcal ?? "";
  els.cardioLoad.value = act.cardioLoad ?? "";
  currentActivities = Array.isArray(act.activities) ? [...act.activities] : [];

  if (applyUrl) applyUrlParams();

  // 該当日の有効目標値を入力欄へ反映（編集画面を開いたとき用）
  const effTargets = getEffectiveTargetsForDate(currentDateStr);
  els.targetWaist.value = effTargets.waist ?? "";
  els.targetWeight.value = effTargets.weight ?? "";
  els.targetP.value = effTargets.p ?? "";
  els.targetF.value = effTargets.f ?? "";
  els.targetC.value = effTargets.c ?? "";
  els.targetKcal.value = effTargets.kcal ?? "";

  updateVitalsVisibility("morning");
  updateVitalsVisibility("night");
  updateTogglePills();
  refreshTargetDisplayAndColors();
  updateBlankWarnings();
  renderActivities();

  if (day.customText && !applyUrl) {
    els.formattedOutput.value = day.customText;
  } else {
    updatePreviewText();
  }
}

// ⑤ Myリスト：登録済内容の編集・削除
function resetMyListForm() {
  editingMyListId = null;
  els.myListFormTitle.textContent = "Myリスト（活動内容マスタ登録）";
  els.addMyListBtn.textContent = "Myリストに登録";
  els.cancelMyListEditBtn.classList.add("hidden");
  els.myShortName.value = "";
  els.myFullName.value = "";
  els.myDetail.value = "";
}

function renderMyList() {
  const list = loadMyList();
  els.myListItems.innerHTML = "";
  els.myListSelect.innerHTML = `<option value="">-- 手入力 / Myリストから選択 --</option>`;

  list.forEach((item, idx) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.shortName}（${item.fullName}）`;
    els.myListSelect.appendChild(opt);

    const card = document.createElement("div");
    card.className = "activity-item";
    card.innerHTML = `
      <div>
        <strong>${item.shortName}</strong>（${item.fullName}）<br/>
        <span style="color:var(--muted);">${item.detail || "-"}</span>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.textContent = "編集";
    editBtn.onclick = () => {
      editingMyListId = item.id;
      els.myListFormTitle.textContent = "Myリスト項目を編集中";
      els.addMyListBtn.textContent = "変更を保存";
      els.cancelMyListEditBtn.classList.remove("hidden");
      els.myShortName.value = item.shortName || "";
      els.myFullName.value = item.fullName || "";
      els.myDetail.value = item.detail || "";
    };

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "danger-btn";
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      const nextList = loadMyList().filter((_, i) => i !== idx);
      if (editingMyListId === item.id) resetMyListForm();
      saveMyList(nextList);
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);
    els.myListItems.appendChild(card);
  });
}

// カレンダー日本の祝日判定（日祝赤字・土曜青字）
function getNthWeekdayOfMonth(year, month1Based, weekday0Sun, nth) {
  const first = new Date(year, month1Based - 1, 1);
  const diff = (weekday0Sun - first.getDay() + 7) % 7;
  return 1 + diff + (nth - 1) * 7;
}

function getEquinoxDay(year, isAutumn) {
  // 1980-2099年向けの春分・秋分日近似式
  if (!isAutumn) {
    return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  }
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

function isJapaneseHoliday(year, month1Based, day) {
  const fixedHolidays = new Set([
    "01-01", // 元日
    "02-11", // 建国記念の日
    "02-23", // 天皇誕生日
    "04-29", // 昭和の日
    "05-03", // 憲法記念日
    "05-04", // みどりの日
    "05-05", // こどもの日
    "08-11", // 山の日
    "11-03", // 文化の日
    "11-23"  // 勤労感謝の日
  ]);

  const mmdd = `${String(month1Based).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const movable = new Set();

  if (month1Based === 1) movable.add(getNthWeekdayOfMonth(year, 1, 1, 2)); // 成人の日（第2月曜）
  if (month1Based === 3) movable.add(getEquinoxDay(year, false)); // 春分の日
  if (month1Based === 7) movable.add(getNthWeekdayOfMonth(year, 7, 1, 3)); // 海の日（第3月曜）
  if (month1Based === 9) movable.add(getNthWeekdayOfMonth(year, 9, 1, 3)); // 敬老の日（第3月曜）
  if (month1Based === 9) movable.add(getEquinoxDay(year, true)); // 秋分の日
  if (month1Based === 10) movable.add(getNthWeekdayOfMonth(year, 10, 1, 2)); // スポーツの日（第2月曜）

  const isDirectHoliday = fixedHolidays.has(mmdd) || movable.has(day);
  if (isDirectHoliday) return true;

  // 振替休日（日曜にあたる祝日の翌日以降の平日）
  const dt = new Date(year, month1Based - 1, day);
  if (dt.getDay() !== 0) {
    const prev = new Date(year, month1Based - 1, day - 1);
    if (prev.getDay() === 0) {
      const pMonth = prev.getMonth() + 1;
      const pDay = prev.getDate();
      const pMmdd = `${String(pMonth).padStart(2, "0")}-${String(pDay).padStart(2, "0")}`;
      const pMovable =
        (pMonth === 1 && pDay === getNthWeekdayOfMonth(year, 1, 1, 2)) ||
        (pMonth === 3 && pDay === getEquinoxDay(year, false)) ||
        (pMonth === 7 && pDay === getNthWeekdayOfMonth(year, 7, 1, 3)) ||
        (pMonth === 9 && pDay === getNthWeekdayOfMonth(year, 9, 1, 3)) ||
        (pMonth === 9 && pDay === getEquinoxDay(year, true)) ||
        (pMonth === 10 && pDay === getNthWeekdayOfMonth(year, 10, 1, 2));
      if (fixedHolidays.has(pMmdd) || pMovable) return true;
    }
  }
  return false;
}

function renderCalendar() {
  const logs = loadAllLogs();
  els.calMonthLabel.textContent = `${calYear}年${calMonth + 1}月`;
  els.calGrid.innerHTML = "";

  const weekDefs = [
    { label: "日", cls: "sun" },
    { label: "月", cls: "" },
    { label: "火", cls: "" },
    { label: "水", cls: "" },
    { label: "木", cls: "" },
    { label: "金", cls: "" },
    { label: "土", cls: "sat" }
  ];

  weekDefs.forEach((w) => {
    const h = document.createElement("div");
    h.className = `cal-head ${w.cls}`.trim();
    h.textContent = w.label;
    els.calGrid.appendChild(h);
  });

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-cell empty";
    els.calGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dow = new Date(calYear, calMonth, d).getDay();
    const isSunOrHoliday = dow === 0 || isJapaneseHoliday(calYear, calMonth + 1, d);
    const isSat = !isSunOrHoliday && dow === 6;

    const cell = document.createElement("div");
    const hasLog = Boolean(logs[iso]);
    cell.className = [
      "cal-cell",
      isSunOrHoliday ? "sun-holiday" : "",
      isSat ? "sat" : "",
      hasLog ? "has-log" : "",
      iso === currentDateStr ? "selected" : ""
    ].filter(Boolean).join(" ");

    cell.innerHTML = `${d}${hasLog ? '<span class="cal-dot"></span>' : ""}`;
    cell.onclick = () => {
      loadDateIntoForm(iso, false);
      switchPage("home");
    };
    els.calGrid.appendChild(cell);
  }
}

function drawLineChart(canvas, labels, seriesList) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const pad = { top: 24, right: 16, bottom: 26, left: 38 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const allVals = seriesList.flatMap((s) => s.data.filter((v) => v !== null));
  if (!allVals.length) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "14px sans-serif";
    ctx.fillText("データがありません", w / 2 - 60, h / 2);
    return;
  }

  let minV = Math.min(...allVals);
  let maxV = Math.max(...allVals);
  if (minV === maxV) { minV -= 1; maxV += 1; }
  const margin = (maxV - minV) * 0.1;
  minV -= margin;
  maxV += margin;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();

    const valLabel = (maxV - ((maxV - minV) * i) / 4).toFixed(1);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText(valLabel, 4, y + 4);
  }

  labels.forEach((lbl, idx) => {
    if (idx % 2 !== 0 && labels.length > 7) return;
    const x = pad.left + (plotW * idx) / Math.max(1, labels.length - 1);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px sans-serif";
    ctx.fillText(lbl, x - 12, h - 8);
  });

  seriesList.forEach((s, sIdx) => {
    ctx.fillStyle = s.color;
    ctx.font = "11px sans-serif";
    ctx.fillText(`● ${s.label}`, pad.left + sIdx * 115, 14);

    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    s.data.forEach((v, idx) => {
      if (v === null) return;
      const x = pad.left + (plotW * idx) / Math.max(1, labels.length - 1);
      const y = pad.top + plotH - ((v - minV) / (maxV - minV)) * plotH;
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    s.data.forEach((v, idx) => {
      if (v === null) return;
      const x = pad.left + (plotW * idx) / Math.max(1, labels.length - 1);
      const y = pad.top + plotH - ((v - minV) / (maxV - minV)) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function renderDataPage() {
  const logs = loadAllLogs();
  const dates14 = [];
  for (let i = 13; i >= 0; i--) {
    dates14.push(shiftDate(getTodayISO(), -i));
  }
  const labels14 = dates14.map((d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`);

  drawLineChart(els.vitalsChart, labels14, [
    { label: "朝 血圧(上)", color: "#38bdf8", data: dates14.map((d) => toNum(logs[d]?.morning?.bpSys)) },
    { label: "夜 血圧(上)", color: "#f87171", data: dates14.map((d) => toNum(logs[d]?.night?.bpSys)) },
    { label: "朝 脈拍", color: "#22c55e", data: dates14.map((d) => toNum(logs[d]?.morning?.hr)) }
  ]);

  drawLineChart(els.bodyChart, labels14, [
    { label: "体重(kg)", color: "#38bdf8", data: dates14.map((d) => toNum(logs[d]?.body?.weight)) },
    { label: "体脂肪率(%)", color: "#facc15", data: dates14.map((d) => toNum(logs[d]?.body?.bfp)) }
  ]);

  const allDates = Object.keys(logs).sort((a, b) => b.localeCompare(a));

  let html = `
    <thead>
      <tr>
        <th>日付</th>
        <th>朝BP/HR</th>
        <th>夜BP/HR</th>
        <th>体重</th>
        <th>胴囲</th>
        <th>体脂肪</th>
        <th>BMI</th>
        <th>内臓脂肪</th>
        <th>基礎代謝</th>
        <th>体温</th>
        <th>PFC</th>
        <th>kcal</th>
      </tr>
    </thead>
    <tbody>
  `;

  if (!allDates.length) {
    html += `<tr><td colspan="12" style="text-align:center; color:var(--muted);">履歴データがありません</td></tr>`;
  } else {
    allDates.forEach((d) => {
      const day = logs[d] || {};
      const m = day.morning || {};
      const n = day.night || {};
      const b = day.body || {};
      const inc = day.intake || {};
      const effTargets = getEffectiveTargetsForDate(d);

      const wCls = getPercentDiffClass(b.weight, effTargets.weight);
      const waistCls = getPercentDiffClass(b.waist, effTargets.waist);

      html += `
        <tr>
          <td>${d}</td>
          <td>${m.noRecord ? "記録なし" : `${m.bpSys || "-"}/${m.bpDia || "-"} (${m.hr || "-"})`}</td>
          <td>${n.noRecord ? "記録なし" : `${n.bpSys || "-"}/${n.bpDia || "-"} (${n.hr || "-"})`}</td>
          <td class="text-${wCls}">${b.weight || "-"}</td>
          <td class="text-${waistCls}">${b.waist || "-"}</td>
          <td>${b.bfp || "-"}</td>
          <td>${b.bmi || "-"}</td>
          <td>${b.visceralFat || "-"}</td>
          <td>${b.bmr || "-"}</td>
          <td>${b.bodyTemp || "-"}</td>
          <td>${inc.p || "-"}/${inc.f || "-"}/${inc.c || "-"}</td>
          <td>${inc.kcal || "-"}</td>
        </tr>
      `;
    });
  }
  html += `</tbody>`;
  els.fullLogTable.innerHTML = html;
}

function switchPage(pageName) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(`page-${pageName}`).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.page === pageName);
  });
  if (pageName === "calendar") renderCalendar();
  if (pageName === "data") renderDataPage();
}

// イベント登録
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchPage(btn.dataset.page));
});

els.prevDateBtn.addEventListener("click", () => loadDateIntoForm(shiftDate(currentDateStr, -1), false));
els.nextDateBtn.addEventListener("click", () => loadDateIntoForm(shiftDate(currentDateStr, 1), false));

// ③ 目標値入力欄の折りたたみトグル
els.toggleBodyTargetBtn.addEventListener("click", () => {
  const willOpen = els.bodyTargetEditor.classList.contains("hidden");
  els.bodyTargetEditor.classList.toggle("hidden", !willOpen);
  els.toggleBodyTargetBtn.textContent = willOpen ? "Body 目標値設定を閉じる" : "Body 目標値設定を開く";
});

els.toggleIntakeTargetBtn.addEventListener("click", () => {
  const willOpen = els.intakeTargetEditor.classList.contains("hidden");
  els.intakeTargetEditor.classList.toggle("hidden", !willOpen);
  els.toggleIntakeTargetBtn.textContent = willOpen ? "Intake 目標値設定を閉じる" : "Intake 目標値設定を開く";
});

[els.mNoRecord, els.mBpSys, els.mBpDia, els.mHr].forEach((el) => {
  el.addEventListener("input", () => {
    updateVitalsVisibility("morning");
    updateBlankWarnings();
    if (!isTextManuallyEdited) updatePreviewText();
  });
});

[els.nNoRecord, els.nBpSys, els.nBpDia, els.nHr].forEach((el) => {
  el.addEventListener("input", () => {
    updateVitalsVisibility("night");
    updateBlankWarnings();
    if (!isTextManuallyEdited) updatePreviewText();
  });
});

[els.mIhb, els.nIhb, els.mSuppHmb, els.mSuppAmino, els.nSuppHmb, els.nSuppAmino].forEach((el) => {
  el.addEventListener("change", () => {
    updateTogglePills();
    if (!isTextManuallyEdited) updatePreviewText();
  });
});

[els.targetWaist, els.targetWeight, els.targetP, els.targetF, els.targetC, els.targetKcal].forEach((el) => {
  el.addEventListener("input", commitTargetChangeForCurrentDate);
});

[
  els.waist, els.weight, els.bfp, els.bmi, els.visceralFat, els.bmr, els.bodyTemp,
  els.pGrams, els.fGrams, els.cGrams, els.kcal,
  els.mSuppCustom, els.nSuppCustom,
  els.activeKcal, els.cardioLoad, els.mSymptom, els.nSymptom
].forEach((el) => {
  el.addEventListener("input", () => {
    refreshTargetDisplayAndColors();
    updateBlankWarnings();
    if (!isTextManuallyEdited) updatePreviewText();
  });
});

els.formattedOutput.addEventListener("input", () => {
  isTextManuallyEdited = true;
});

els.regenerateTextBtn.addEventListener("click", () => {
  isTextManuallyEdited = false;
  updatePreviewText();
});

els.myListSelect.addEventListener("change", () => {
  const id = els.myListSelect.value;
  if (!id) return;
  const item = loadMyList().find((x) => x.id === id);
  if (item) {
    els.actName.value = item.shortName;
    els.actNote.value = item.detail || "";
  }
});

els.addActivityBtn.addEventListener("click", () => {
  const name = els.actName.value.trim();
  if (!name) return;

  const entry = {
    category: els.actCategory.value,
    name,
    timeType: els.actTimeType.value,
    timeVal: els.actTimeVal.value.trim(),
    note: els.actNote.value.trim()
  };

  if (editingActivityIndex !== null && currentActivities[editingActivityIndex]) {
    currentActivities[editingActivityIndex] = entry;
  } else {
    currentActivities.push(entry);
  }

  resetActivityForm();
  renderActivities();
  if (!isTextManuallyEdited) updatePreviewText();
});

els.cancelActivityEditBtn.addEventListener("click", resetActivityForm);

els.addMyListBtn.addEventListener("click", () => {
  const shortName = els.myShortName.value.trim();
  const fullName = els.myFullName.value.trim();
  const detail = els.myDetail.value.trim();
  if (!shortName && !fullName) return;

  const list = loadMyList();
  if (editingMyListId) {
    const idx = list.findIndex((x) => x.id === editingMyListId);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        shortName: shortName || fullName,
        fullName: fullName || shortName,
        detail
      };
    }
  } else {
    list.push({
      id: `my_${Date.now()}`,
      shortName: shortName || fullName,
      fullName: fullName || shortName,
      detail
    });
  }

  saveMyList(list);
  resetMyListForm();
});

els.cancelMyListEditBtn.addEventListener("click", resetMyListForm);

els.saveAndCopyBtn.addEventListener("click", async () => {
  updateBlankWarnings();
  const logs = loadAllLogs();
  const state = collectCurrentDayState();
  state.customText = els.formattedOutput.value;
  logs[currentDateStr] = state;
  saveAllLogs(logs);

  try {
    await navigator.clipboard.writeText(els.formattedOutput.value);
    els.syncStatus.textContent = "保存＆AI検索用コピー完了";
  } catch {
    els.formattedOutput.select();
    document.execCommand("copy");
    els.syncStatus.textContent = "保存＆AI検索用コピー完了";
  }
});

els.calPrevMonth.addEventListener("click", () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});

els.calNextMonth.addEventListener("click", () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

els.exportJsonBtn.addEventListener("click", () => {
  const logs = loadAllLogs();
  const payload = {
    logs,
    targetHistory: loadTargetHistory(),
    myList: loadMyList()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `code-life-logs-${getTodayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  els.syncStatus.textContent = "JSONエクスポート完了";
});

els.importJsonBtn.addEventListener("click", () => els.importFileInput.click());
els.importFileInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();

      // 新形式（logs / targetHistory / myList）と旧形式（日付キー直下）の両方に対応
      const importedLogs = parsed.logs && typeof parsed.logs === "object" ? parsed.logs : parsed;
      const merged = { ...loadAllLogs(), ...importedLogs };
      saveAllLogs(merged);

      if (Array.isArray(parsed.targetHistory) && parsed.targetHistory.length > 0) {
        saveTargetHistory(parsed.targetHistory);
      }
      if (Array.isArray(parsed.myList)) {
        saveMyList(parsed.myList);
      }

      loadDateIntoForm(currentDateStr, false);
      renderCalendar();
      els.syncStatus.textContent = "JSONインポート完了";
    } catch {
      els.syncStatus.textContent = "JSON読込エラー";
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsText(file);
});

els.toggleLogTableBtn.addEventListener("click", () => {
  els.fullLogSection.classList.toggle("hidden");
});

// 初期化
renderMyList();
saveAllLogs(loadAllLogs());
loadDateIntoForm(currentDateStr, true);
