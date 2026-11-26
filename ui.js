(function () {
  // ---- スタイル ----
  const st = document.createElement("style");
  st.textContent = `
:root{--ic-activity:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 12h-4l-3 9L9 3l-3 9H2'/%3E%3C/svg%3E");}

/* 固定ヘッダー */
.header-bar{
  position:sticky;top:0;z-index:90;
  margin:calc(-38px - env(safe-area-inset-top, 0px)) -14px 10px;
  padding:calc(38px + env(safe-area-inset-top, 0px)) 14px 8px;
  background:var(--bg);
  border-bottom:1px solid var(--border);
}
.status-box{display:flex;flex-direction:column;align-items:flex-end;max-width:62%;text-align:right;line-height:1.3;}
.status-label{font-size:.68rem;color:var(--muted);}
.status-label::before{content:"";display:inline-block;width:1.1em;height:1.1em;margin-right:4px;vertical-align:-.2em;background-color:currentColor;-webkit-mask:var(--ic-activity) center/contain no-repeat;mask:var(--ic-activity) center/contain no-repeat;}

/* データページの見出しアイコン */
.card:has(#vitalsChart) > .section-title > span::before,
.card:has(#bodyChart) > .section-title > span::before,
.card:has(#activeChart) > .section-title > span::before{
 .title-sub{display:block;padding-left:calc(1.15em + 6px);}
  content:"";display:inline-block;width:1.15em;height:1.15em;margin-right:6px;vertical-align:-.2em;
  background-color:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;
}
.card:has(#vitalsChart) > .section-title > span{--ic:var(--ic-heart);}
.card:has(#bodyChart) > .section-title > span{--ic:var(--ic-user);}
.card:has(#activeChart) > .section-title > span{--ic:var(--ic-flame);}
`;
  document.head.appendChild(st);

  // ---- ヘッダー:Statusの見出しを足す ----
  const sync = document.getElementById("syncStatus");
  if (sync && sync.parentNode) {
    const box = document.createElement("div");
    box.className = "status-box";
    const label = document.createElement("span");
    label.className = "status-label";
    label.textContent = "Status";
    sync.parentNode.insertBefore(box, sync);
    box.append(label, sync);
  }
  // ---- データページの見出し:「過去14日グラフ」のあとで改行 ----
  document.querySelectorAll("#page-data .section-title > span").forEach((sp) => {
    if (sp.querySelector(".title-sub")) return;
    const t = sp.textContent;
    const i = t.indexOf("グラフ");
    if (i < 0) return;
    const head = t.slice(0, i + 3);
    const sub = t.slice(i + 3).trim();
    if (!sub) return;
    sp.textContent = head;
    const s = document.createElement("span");
    s.className = "title-sub";
    s.textContent = sub;
    sp.appendChild(s);
  });

  // ---- グラフ:右軸の系列(カーディオ負荷)を棒グラフにする ----
  const FONT = "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif";

  drawLineChart = function (canvas, labels, seriesList) {
    if (canvas.id === "activeChart") {
      seriesList.forEach((s) => {
        if (s.axis === "right") s.bar = true;
      });
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const w = canvas.clientWidth || Math.max(240, Math.min(600, window.innerWidth - 28) - 28);
    const h = canvas.clientHeight || 190;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.textBaseline = "alphabetic";

    // 凡例の配置(row を指定した系列は、その段に並べる)
    ctx.font = `12px ${FONT}`;
    const legendGap = seriesList.some((s) => s.row !== undefined) ? 10 : 14;
    const legend = [];
    let legendX = 42;
    let legendRow = 0;
    seriesList.forEach((s) => {
      const r = s.row || 0;
      if (r !== legendRow) {
        legendRow = r;
        legendX = 42;
      }
      const text = `${s.bar ? "■" : "●"} ${s.label}`;
      legend.push({ text, x: legendX, row: r, color: s.color });
      legendX += ctx.measureText(text).width + legendGap;
    });
    const legendRows = Math.max(0, ...legend.map((it) => it.row)) + 1;

    const hasRight = seriesList.some((s) => s.axis === "right");
    const pad = { top: 26 + (legendRows - 1) * 16, right: hasRight ? 42 : 16, bottom: 26, left: 42 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const leftSeries = seriesList.filter((s) => s.axis !== "right");
    const rightSeries = seriesList.filter((s) => s.axis === "right");

    function calcRange(list) {
      const vals = list.flatMap((s) => s.data.filter((v) => v !== null));
      if (!vals.length) return null;
      let min = Math.min(...vals);
      let max = Math.max(...vals);
      if (list.some((s) => s.bar)) {
        return { min: 0, max: (max > 0 ? max : 1) * 1.1 };
      }
      if (min === max) { min -= 1; max += 1; }
      const margin = (max - min) * 0.1;
      return { min: min - margin, max: max + margin };
    }

    const lr = calcRange(leftSeries);
    const rr = calcRange(rightSeries);

    if (!lr && !rr) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = `14px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText("データがありません", w / 2, h / 2);
      return;
    }

    const leftDecimals = leftSeries.some((s) => s.int) ? 0 : 1;
    const rightDecimals = rightSeries.some((s) => s.int) ? 0 : 1;

    // 横線と縦軸の数値
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.font = `12px ${FONT}`;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH * i) / 4;
      const yy = Math.round(y) + 0.5;
      ctx.beginPath();
      ctx.moveTo(pad.left, yy);
      ctx.lineTo(w - pad.right, yy);
      ctx.stroke();

      if (lr) {
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "right";
        const lv = (lr.max - ((lr.max - lr.min) * i) / 4).toFixed(leftDecimals);
        ctx.fillText(lv, pad.left - 6, y + 4);
      }
      if (rr) {
        ctx.fillStyle = rightSeries[0].color;
        ctx.textAlign = "left";
        const rv = (rr.max - ((rr.max - rr.min) * i) / 4).toFixed(rightDecimals);
        ctx.fillText(rv, w - pad.right + 6, y + 4);
      }
    }

    // 横軸の日付
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.font = `11px ${FONT}`;
    labels.forEach((lbl, idx) => {
      if (idx % 2 !== 0 && labels.length > 7) return;
      const x = pad.left + (plotW * idx) / Math.max(1, labels.length - 1);
      ctx.fillText(lbl, x, h - 8);
    });

    // 凡例
    ctx.textAlign = "left";
    ctx.font = `12px ${FONT}`;
    legend.forEach((it) => {
      ctx.fillStyle = it.color;
      ctx.fillText(it.text, it.x, 14 + it.row * 16);
    });

    // 棒グラフ(線より先に描く)
    seriesList.forEach((s) => {
      if (!s.bar) return;
      const range = s.axis === "right" ? rr : lr;
      if (!range) return;
      const bw = Math.max(4, Math.min(14, (plotW / Math.max(1, labels.length)) * 0.5));
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.55;
      s.data.forEach((v, idx) => {
        if (v === null || v <= 0) return;
        const x = pad.left + (plotW * idx) / Math.max(1, labels.length - 1);
        const y = pad.top + plotH - ((v - range.min) / (range.max - range.min)) * plotH;
        ctx.fillRect(x - bw / 2, y, bw, pad.top + plotH - y);
      });
      ctx.globalAlpha = 1;
    });

    // 線と点
    seriesList.forEach((s) => {
      if (s.bar) return;
      const range = s.axis === "right" ? rr : lr;
      if (!range) return;
      const yOf = (v) => pad.top + plotH - ((v - range.min) / (range.max - range.min)) * plotH;

      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      let started = false;
      s.data.forEach((v, idx) => {
        if (v === null) return;
        const x = pad.left + (plotW * idx) / Math.max(1, labels.length - 1);
        const y = yOf(v);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);

      s.data.forEach((v, idx) => {
        if (v === null) return;
        const x = pad.left + (plotW * idx) / Math.max(1, labels.length - 1);
        const y = yOf(v);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  };
})();
