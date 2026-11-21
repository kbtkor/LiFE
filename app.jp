const STORAGE_KEY = "daily_health_logs_v3";
const TARGETS_KEY = "code_life_targets_v1";
const MYLIST_KEY = "code_life_mylist_v1";

let currentDateStr = getTodayISO();
let calYear = Number(currentDateStr.slice(0, 4));
let calMonth = Number(currentDateStr.slice(5, 7)) - 1;
let currentActivities = [];
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

  // Body
  waist: document.getElementById("waist"),
  weight: document.getElementById("weight"),
  bfp: document.getElementById("bfp"),
  bmi: document.getElementById("bmi"),
  visceralFat: document.getElementById("visceralFat"),
  bmr: document.getElementById("bmr"),
  bodyTemp: document.getElementById("bodyTemp"),
  targetWaist: document.getElementById("targetWaist"),
  targetWeight: document.getElementById("targetWeight"),

  // Intake & Supplements (Morning / Night)
  pGrams: document.getElementById("pGrams"),
  fGrams: document.getElementById("fGrams"),
  cGrams: document.getElementById("cGrams"),
  kcal: document.getElementById("kcal"),
  targetP: document.getElementById("targetP"),
  targetF: document.getElementById("targetF"),
  targetC: document.getElementById("targetC"),
  targetKcal: document.getElementById("targetKcal"),
  intakeTargetDisplay: document.getElementById("intakeTargetDisplay"),
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
  myListSelect: document.getElementById("myListSelect"),
  actCategory: document.getElementById("actCategory"),
  actName: document.getElementById("actName"),
  actTimeType: document.getElementById("actTimeType"),
  actTimeVal: document.getElementById("actTimeVal"),
  actNote: document.getElementById("actNote"),
  addActivityBtn: document.getElementById("addActivityBtn"),
  activityListContainer: document.getElementById("activityListContainer"),

  // Text & Save
  saveAndCopyBtn: document.getElementById("saveAndCopyBtn"),
  regenerateTextBtn: document.getElementById("regenerateTextBtn"),
  formattedOutput: document.getElementById("formattedOutput"),

  // MyList
  myShortName: document.getElementById("myShortName"),
  myFullName: document.getElementById("myFullName"),
  myDetail: document.getElementById("myDetail"),
  addMyListBtn: document.getElementById("addMyListBtn"),
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

function loadTargets() {
  try {
    return JSON.parse(localStorage.getItem(TARGETS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveTargets() {
  const t = {
    waist: els.targetWaist.value.trim(),
    weight: els.targetWeight.value.trim(),
    p: els.targetP.value.trim(),
    f: els.targetF.value.trim(),
    c: els.targetC.value.trim(),
    kcal: els.targetKcal.value.trim()
  };
  localStorage.setItem(TARGETS_KEY, JSON.stringify(t));
  updateTargetStyles();
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

function updateVitalsVisibility(slot) {
  const isMorning = slot === "morning";
  const chk = isMorning ? els.mNoRecord : els.nNoRecord;
  const body = isMorning ? els.mVitalsBody : els.nVitalsBody;
  const bpSys = isMorning ? els.mBpSys.value.trim() : els.nBpSys.value.trim();
  const bpDia = isMorning ? els.mBpDia.value.trim() : els.nBpDia.value.trim();
  const hr = isMorning ? els.mHr.value.trim() : els.nHr.value.trim();

  const hasAnyData =
    (bpSys !== "" && bpSys !== "0") ||
    (bpDia !== "" && bpDia !== "0") ||
    (hr !== "" && hr !== "0");

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

function updateTargetStyles() {
  applyColorClass(els.waist, getPercentDiffClass(els.waist.value, els.targetWaist.value));
  applyColorClass(els.weight, getPercentDiffClass(els.weight.value, els.targetWeight.value));

  applyColorClass(els.pGrams, getAbsDiffClass(els.pGrams.value, els.targetP.value, 10, 25));
  applyColorClass(els.fGrams, getAbsDiffClass(els.fGrams.value, els.targetF.value, 10, 25));
  applyColorClass(els.cGrams, getAbsDiffClass(els.cGrams.value, els.targetC.value, 10, 25));
  applyColorClass(els.kcal, getAbsDiffClass(els.kcal.value, els.targetKcal.value, 100, 250));

  const tp = els.targetP.value.trim() || "-";
  const tf = els.targetF.value.trim() || "-";
  const tc = els.targetC.value.trim() || "-";
  const tk = els.targetKcal.value.trim() || "-";
  els.intakeTargetDisplay.textContent = `目標値: P ${tp}g / F ${tf}g / C ${tc}g / ${tk}kcal`;
}

function extractNumericValue(raw) {
  if (raw === null || raw === undefined) return "";
  const firstLine = String(raw).split(/\r?\n/)[0].trim();
  const match = firstLine.match(/-?\d+(?:\.\d+)?/);
  return match ? match[0] : "";
}

// 朝のVitalsは時間帯に関わらず朝欄へ反映（夜専用は n_bp_sys / n_bp_dia / n_hr）
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
    { keys: ["m_bp_sys", "bp_sys", "bps"], input: els.mBpSys },
    { keys: ["m_bp_dia", "bp_dia", "bpd"], input: els.mBpDia },
    { keys: ["m_hr", "hr"], input: els.mHr },
    { keys: ["n_bp_sys", "nbps"], input: els.nBpSys },
    { keys: ["n_bp_dia", "nbpd"], input: els.nBpDia },
    { keys: ["n_hr", "nhr"], input: els.nHr }
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
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "danger-btn";
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      currentActivities.splice(idx, 1);
      renderActivities();
      if (!isTextManuallyEdited) updatePreviewText();
    };
    div.appendChild(delBtn);
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
  const hasData = (v.bpSys && v.bpSys !== "0") || (v.bpDia && v.bpDia !== "0") || (v.hr && v.hr !== "0");
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

  updateVitalsVisibility("morning");
  updateVitalsVisibility("night");
  updateTogglePills();
  updateTargetStyles();
  renderActivities();

  if (day.customText && !applyUrl) {
    els.formattedOutput.value = day.customText;
  } else {
    updatePreviewText();
  }
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
    const del = document.createElement("button");
    del.type = "button";
    del.className = "danger-btn";
    del.textContent = "削除";
    del.onclick = () => {
      list.splice(idx, 1);
      saveMyList(list);
    };
    card.appendChild(del);
    els.myListItems.appendChild(card);
  });
}

function renderCalendar() {
  const logs = loadAllLogs();
  els.calMonthLabel.textContent = `${calYear}年${calMonth + 1}月`;
  els.calGrid.innerHTML = "";

  ["日", "月", "火", "水", "木", "金", "土"].forEach((w) => {
    const h = document.createElement("div");
    h.className = "cal-head";
    h.textContent = w;
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
    const cell = document.createElement("div");
    const hasLog = Boolean(logs[iso]);
    cell.className = `cal-cell ${hasLog ? "has-log" : ""} ${iso === currentDateStr ? "selected" : ""}`;
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
  const tWeight = els.targetWeight.value;
  const tWaist = els.targetWaist.value;

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

      const wCls = getPercentDiffClass(b.weight, tWeight);
      const waistCls = getPercentDiffClass(b.waist, tWaist);

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

[els.mNoRecord, els.mBpSys, els.mBpDia, els.mHr].forEach((el) => {
  el.addEventListener("input", () => {
    updateVitalsVisibility("morning");
    if (!isTextManuallyEdited) updatePreviewText();
  });
});

[els.nNoRecord, els.nBpSys, els.nBpDia, els.nHr].forEach((el) => {
  el.addEventListener("input", () => {
    updateVitalsVisibility("night");
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
  el.addEventListener("input", saveTargets);
});

[
  els.waist, els.weight, els.bfp, els.bmi, els.visceralFat, els.bmr, els.bodyTemp,
  els.pGrams, els.fGrams, els.cGrams, els.kcal,
  els.mSuppCustom, els.nSuppCustom,
  els.activeKcal, els.cardioLoad, els.mSymptom, els.nSymptom
].forEach((el) => {
  el.addEventListener("input", () => {
    updateTargetStyles();
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
  currentActivities.push({
    category: els.actCategory.value,
    name,
    timeType: els.actTimeType.value,
    timeVal: els.actTimeVal.value.trim(),
    note: els.actNote.value.trim()
  });
  els.actName.value = "";
  els.actTimeVal.value = "";
  els.actNote.value = "";
  els.myListSelect.value = "";
  renderActivities();
  if (!isTextManuallyEdited) updatePreviewText();
});

els.addMyListBtn.addEventListener("click", () => {
  const shortName = els.myShortName.value.trim();
  const fullName = els.myFullName.value.trim();
  const detail = els.myDetail.value.trim();
  if (!shortName && !fullName) return;
  const list = loadMyList();
  list.push({
    id: `my_${Date.now()}`,
    shortName: shortName || fullName,
    fullName: fullName || shortName,
    detail
  });
  saveMyList(list);
  els.myShortName.value = "";
  els.myFullName.value = "";
  els.myDetail.value = "";
});

els.saveAndCopyBtn.addEventListener("click", async () => {
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
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
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
      const merged = { ...loadAllLogs(), ...parsed };
      saveAllLogs(merged);
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
const savedTargets = loadTargets();
els.targetWaist.value = savedTargets.waist ?? "";
els.targetWeight.value = savedTargets.weight ?? "";
els.targetP.value = savedTargets.p ?? "";
els.targetF.value = savedTargets.f ?? "";
els.targetC.value = savedTargets.c ?? "";
els.targetKcal.value = savedTargets.kcal ?? "";

renderMyList();
saveAllLogs(loadAllLogs());
loadDateIntoForm(currentDateStr, true);
