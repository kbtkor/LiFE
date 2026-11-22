(function () {
  const PAGES = ["home", "mylist", "calendar", "data"];
  const T = 0.22;
  const pageEl = (n) => document.getElementById("page-" + n);
  const container = document.querySelector(".container");
  const currentIndex = () => PAGES.findIndex((n) => pageEl(n).classList.contains("active"));

  // ---- 今日ボタン ----
  const vp = document.createElement("div");
  vp.className = "cal-viewport";
  els.calGrid.parentNode.insertBefore(vp, els.calGrid);
  vp.appendChild(els.calGrid);

  const todayBtn = document.createElement("button");
  todayBtn.type = "button";
  todayBtn.id = "calTodayBtn";
  todayBtn.className = "mini-btn full-btn";
  todayBtn.style.marginTop = "8px";
  todayBtn.textContent = "今日";
  vp.insertAdjacentElement("afterend", todayBtn);
  todayBtn.addEventListener("click", () => {
    const t = getTodayISO();
    calYear = Number(t.slice(0, 4));
    calMonth = Number(t.slice(5, 7)) - 1;
    if (currentDateStr !== t) loadDateIntoForm(t, false);
    renderCalendar();
  });

  // ---- スワイプ共通 ----
  let st = null;
  let busy = false;
  let pg = null;
  let mo = null;
  let tgt = null;

  function isSkipTarget(el) {
    return !!(el && el.closest && el.closest("input, textarea, select, .table-wrap"));
  }
  function inCalZone(el) {
    return els.calGrid.contains(el) || els.calPrevMonth.parentElement.contains(el);
  }
  function shouldCommit(s, W) {
    const v = Math.abs(s.dx) / Math.max(1, Date.now() - s.time);
    return Math.abs(s.dx) > W * 0.28 || (Math.abs(s.dx) > 40 && v > 0.45);
  }

  function unbind() {
    if (!tgt) return;
    tgt.removeEventListener("touchmove", onMove);
    tgt.removeEventListener("touchend", onEnd);
    tgt.removeEventListener("touchcancel", onCancel);
    tgt = null;
  }

  function onStart(e) {
    unbind();
    if (busy || e.touches.length !== 1 || isSkipTarget(e.target)) { st = null; return; }
    const t = e.touches[0];
    st = {
      x: t.clientX, y: t.clientY, time: Date.now(), mode: null, dx: 0,
      zone: pageEl("calendar").classList.contains("active") && inCalZone(e.target)
    };
    // 触れた要素が途中で消えても、指の動きを受け取れるように要素自体に付ける
    tgt = e.target;
    tgt.addEventListener("touchmove", onMove, { passive: false });
    tgt.addEventListener("touchend", onEnd, { passive: true });
    tgt.addEventListener("touchcancel", onCancel, { passive: true });
  }

  function onMove(e) {
    if (!st || busy) return;
    const t = e.touches[0];
    const dx = t.clientX - st.x;
    const dy = t.clientY - st.y;
    if (st.mode === null) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (st.zone) { st.mode = "month"; beginMonth(); }
        else { st.mode = "page"; beginPage(); }
      } else if (Math.abs(dy) > 10) {
        st.mode = "none";
        return;
      } else {
        return;
      }
    }
    if (st.mode === "none") return;
    e.preventDefault();
    st.dx = dx;
    if (st.mode === "month") moveMonth(dx); else movePage(dx);
  }

  function endTouch(cancel) {
    unbind();
    if (!st) return;
    const s = st;
    st = null;
    if (s.mode === "month" && mo) endMonth(s, cancel);
    else if (s.mode === "page" && pg) endPage(s, cancel);
  }
  function onEnd() { endTouch(false); }
  function onCancel() { endTouch(true); }

  document.addEventListener("touchstart", onStart, { passive: true });

  // ---- ページのスライド ----
  function beginPage() {
    const cur = currentIndex();
    pg = { cur, W: window.innerWidth, active: pageEl(PAGES[cur]), nb: null, dir: 0 };
    container.classList.add("swiping");
  }

  function showNeighbor(dir) {
    if (pg.nb) { pg.nb.style.cssText = ""; pg.nb = null; }
    pg.dir = dir;
    const idx = pg.cur + dir;
    if (idx < 0 || idx >= PAGES.length) return;
    const name = PAGES[idx];
    if (name === "calendar") renderCalendar();
    if (name === "data") renderDataPage();
    const cRect = container.getBoundingClientRect();
    const aRect = pg.active.getBoundingClientRect();
    const top = Math.max(aRect.top, 0) - cRect.top;
    const nb = pageEl(name);
    nb.style.cssText = `display:block;position:absolute;left:0;top:${top}px;width:100%;`;
    pg.nb = nb;
  }

  function movePage(dx) {
    const dir = dx < 0 ? 1 : -1;
    if (pg.dir !== dir) showNeighbor(dir);
    if (pg.nb) {
      pg.active.style.transform = `translate3d(${dx}px,0,0)`;
      pg.nb.style.transform = `translate3d(${dx + dir * pg.W}px,0,0)`;
    } else {
      pg.active.style.transform = `translate3d(${dx * 0.25}px,0,0)`;
    }
  }

  function endPage(s, cancel) {
    const { W, active, nb, dir, cur } = pg;
    const commit = !cancel && !!nb && shouldCommit(s, W);
    busy = true;
    const tr = `transform ${T}s ease-out`;
    active.style.transition = tr;
    if (nb) nb.style.transition = tr;
    void active.offsetWidth;
    if (commit) {
      active.style.transform = `translate3d(${-dir * W}px,0,0)`;
      nb.style.transform = "translate3d(0,0,0)";
    } else {
      active.style.transform = "translate3d(0,0,0)";
      if (nb) nb.style.transform = `translate3d(${dir * W}px,0,0)`;
    }
    setTimeout(() => {
      active.style.cssText = "";
      if (nb) nb.style.cssText = "";
      container.classList.remove("swiping");
      if (commit) {
        switchPage(PAGES[cur + dir]);
        window.scrollTo(0, 0);
      }
      pg = null;
      busy = false;
    }, T * 1000 + 30);
  }

  // ---- 月のスライド(カレンダーの日付部分) ----
  function shiftMonth(dir) {
    let y = calYear;
    let m = calMonth + dir;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    return { y, m };
  }

  // 画面上のカレンダーには触れず、別の場所で前後の月を作る
  function buildNeighbor(dir) {
    const s = shiftMonth(dir);
    const keep = { y: calYear, m: calMonth, grid: els.calGrid, label: els.calMonthLabel };
    const tmp = document.createElement("div");
    tmp.className = keep.grid.className;
    els.calGrid = tmp;
    els.calMonthLabel = document.createElement("span");
    calYear = s.y;
    calMonth = s.m;
    try {
      renderCalendar();
    } finally {
      calYear = keep.y;
      calMonth = keep.m;
      els.calGrid = keep.grid;
      els.calMonthLabel = keep.label;
    }
    return tmp;
  }

  function beginMonth() {
    vp.querySelectorAll(".cal-nb").forEach((n) => n.remove());
    els.calGrid.style.transition = "none";
    els.calGrid.style.transform = "";
    els.calGrid.style.willChange = "transform";
    mo = { W: vp.offsetWidth, prev: buildNeighbor(-1), next: buildNeighbor(1) };
    [mo.prev, mo.next].forEach((c) => {
      c.classList.add("cal-nb");
      c.style.cssText = "position:absolute;top:0;left:0;width:100%;will-change:transform;";
      vp.appendChild(c);
    });
  }

  function moveMonth(dx) {
    const { W, prev, next } = mo;
    els.calGrid.style.transform = `translate3d(${dx}px,0,0)`;
    next.style.transform = `translate3d(${dx + W}px,0,0)`;
    prev.style.transform = `translate3d(${dx - W}px,0,0)`;
  }

  function endMonth(s, cancel) {
    const { W, prev, next } = mo;
    const grid = els.calGrid;
    const dir = s.dx < 0 ? 1 : -1;
    const commit = !cancel && shouldCommit(s, W);
    busy = true;
    const tr = `transform ${T}s ease-out`;
    [grid, prev, next].forEach((n) => { n.style.transition = tr; });
    void grid.offsetWidth;
    if (commit) {
      grid.style.transform = `translate3d(${-dir * W}px,0,0)`;
      next.style.transform = `translate3d(${(1 - dir) * W}px,0,0)`;
      prev.style.transform = `translate3d(${(-1 - dir) * W}px,0,0)`;
    } else {
      grid.style.transform = "translate3d(0,0,0)";
      next.style.transform = `translate3d(${W}px,0,0)`;
      prev.style.transform = `translate3d(${-W}px,0,0)`;
    }
    setTimeout(() => {
      grid.style.transition = "none";
      grid.style.transform = "";
      grid.style.willChange = "";
      prev.remove();
      next.remove();
      if (commit) {
        const n = shiftMonth(dir);
        calYear = n.y;
        calMonth = n.m;
        renderCalendar();
      }
      grid.style.transition = "";
      mo = null;
      busy = false;
    }, T * 1000 + 30);
  }
})();
