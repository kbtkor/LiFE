(function () {
  const KEY = "code_life_memos_v1";
  const $ = (id) => document.getElementById(id);

  function load() {
    try {
      const a = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  }
  function store(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }
  window.loadMemos = load;
  const uid = () => "m" + Date.now() + Math.random().toString(36).slice(2, 6);

  // ---- スタイル ----
  const st = document.createElement("style");
  st.textContent = `
:root{--ic-note:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z'/%3E%3Cpath d='M15 3v6h6'/%3E%3C/svg%3E");}
.bottom-nav{grid-template-columns:repeat(5,1fr);}
.nav-btn{font-size:.72rem;}
.nav-btn[data-page="memo"]{--ic:var(--ic-note);}
.mi::before{content:"";display:inline-block;width:1.15em;height:1.15em;margin-right:6px;vertical-align:-.2em;background-color:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat;}
.mi-bookmark{--ic:var(--ic-bookmark);}
.mi-list{--ic:var(--ic-list);}
.mi-note{--ic:var(--ic-note);}
.memo-name{flex:1;text-align:left;background:none;border:none;color:var(--accent);font-weight:700;font-size:.9rem;padding:2px 0;word-break:break-all;}
#page-memo textarea{resize:vertical;}
`;
  document.head.appendChild(st);

  // ---- ページ ----
  const page = document.createElement("div");
  page.id = "page-memo";
  page.className = "page";
  page.innerHTML = `
    <div id="memoMain">
      <div class="card">
        <div class="section-title"><span class="mi mi-bookmark">メモの登録</span></div>
        <div style="margin-bottom:8px;">
          <label for="memoName">メモ名</label>
          <input type="text" id="memoName" placeholder="例: 買い物リスト" />
        </div>
        <div style="margin-bottom:8px;">
          <label for="memoBody">内容</label>
          <textarea id="memoBody" rows="5" placeholder="内容を入力"></textarea>
        </div>
        <button type="button" id="memoAddBtn" class="accent-btn full-btn">メモを登録</button>
        <div id="memoMsg" class="muted-note"></div>
      </div>
      <div class="card">
        <div class="section-title"><span class="mi mi-list">登録メモリスト</span></div>
        <div id="memoList"></div>
      </div>
    </div>
    <div id="memoEdit" class="hidden">
      <div class="card">
        <div class="section-title"><span class="mi mi-note">メモの編集</span></div>
        <div style="margin-bottom:8px;">
          <label for="memoEditName">メモ名</label>
          <input type="text" id="memoEditName" />
        </div>
        <div style="margin-bottom:8px;">
          <label for="memoEditBody">内容</label>
          <textarea id="memoEditBody" rows="10"></textarea>
        </div>
        <div class="row" style="gap:6px;">
          <button type="button" id="memoSaveBtn" class="accent-btn" style="flex:1;">登録</button>
          <button type="button" id="memoDelBtn" class="danger-btn" style="flex:1;padding:8px 12px;font-size:.85rem;">削除</button>
          <button type="button" id="memoBackBtn" style="flex:1;">戻る</button>
        </div>
        <div id="memoEditMsg" class="muted-note"></div>
      </div>
    </div>`;
  document.querySelector(".container").appendChild(page);

  // ---- 下のタブ ----
  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = "nav-btn";
  tab.dataset.page = "memo";
  tab.textContent = "メモ";
  tab.addEventListener("click", () => {
    switchPage("memo");
    window.scrollTo(0, 0);
  });
  document.querySelector(".bottom-nav").appendChild(tab);

  // ---- 一覧 ----
  function copyText(t, done) {
    const ng = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = t;
        ta.style.cssText = "position:fixed;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        done(true);
      } catch (e) {
        done(false);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(() => done(true), ng);
    } else {
      ng();
    }
  }

  function mkBtn(text, cls, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = text;
    b.addEventListener("click", fn);
    return b;
  }

  function move(i, d) {
    const list = load();
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const t = list[i];
    list[i] = list[j];
    list[j] = t;
    store(list);
    render();
  }

  function render() {
    const box = $("memoList");
    const list = load();
    box.innerHTML = "";
    if (!list.length) {
      const e = document.createElement("div");
      e.className = "muted-note";
      e.textContent = "登録されたメモはまだありません。";
      box.appendChild(e);
      return;
    }
    list.forEach((m, i) => {
      const row = document.createElement("div");
      row.className = "activity-item";
      const nameBtn = mkBtn(m.name || "(無題)", "memo-name", () => openEdit(m.id));
      const acts = document.createElement("div");
      acts.className = "item-actions";
      const cp = mkBtn("コピー", "edit-btn", () => {
        copyText(m.body || "", (ok) => {
          cp.textContent = ok ? "コピー済" : "失敗";
          setTimeout(() => { cp.textContent = "コピー"; }, 1200);
        });
      });
      const up = mkBtn("↑", "edit-btn", () => move(i, -1));
      up.disabled = i === 0;
      up.style.opacity = i === 0 ? "0.35" : "1";
      const dn = mkBtn("↓", "edit-btn", () => move(i, 1));
      dn.disabled = i === list.length - 1;
      dn.style.opacity = i === list.length - 1 ? "0.35" : "1";
      acts.append(cp, up, dn);
      row.append(nameBtn, acts);
      box.appendChild(row);
    });
  }

  // ---- 登録 ----
  $("memoAddBtn").addEventListener("click", () => {
    const name = $("memoName").value.trim();
    if (!name) {
      $("memoMsg").textContent = "メモ名を入力してください。";
      return;
    }
    const list = load();
    list.push({ id: uid(), name, body: $("memoBody").value });
    store(list);
    $("memoName").value = "";
    $("memoBody").value = "";
    $("memoMsg").textContent = "登録しました。";
    render();
  });

  // ---- 編集画面 ----
  let editId = null;
  function showEdit(on) {
    $("memoMain").classList.toggle("hidden", on);
    $("memoEdit").classList.toggle("hidden", !on);
    window.scrollTo(0, 0);
  }
  function openEdit(id) {
    const m = load().find((x) => x.id === id);
    if (!m) return;
    editId = id;
    $("memoEditName").value = m.name || "";
    $("memoEditBody").value = m.body || "";
    $("memoEditMsg").textContent = "";
    showEdit(true);
  }
  $("memoSaveBtn").addEventListener("click", () => {
    const name = $("memoEditName").value.trim();
    if (!name) {
      $("memoEditMsg").textContent = "メモ名を入力してください。";
      return;
    }
    const list = load();
    const m = list.find((x) => x.id === editId);
    if (m) {
      m.name = name;
      m.body = $("memoEditBody").value;
      store(list);
    }
    editId = null;
    render();
    showEdit(false);
  });
  $("memoDelBtn").addEventListener("click", () => {
    if (!confirm("このメモを削除しますか?")) return;
    store(load().filter((x) => x.id !== editId));
    editId = null;
    render();
    showEdit(false);
  });
  $("memoBackBtn").addEventListener("click", () => {
    editId = null;
    showEdit(false);
  });

  // ---- JSONインポートでメモを取り込む ----
  els.importFileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const p = JSON.parse(String(rd.result || "{}"));
        if (!p || !Array.isArray(p.memos)) return;
        const cur = load();
        const ids = new Set(cur.map((m) => m.id));
        p.memos.forEach((m) => {
          if (m && m.id && !ids.has(m.id)) {
            cur.push({ id: m.id, name: String(m.name || ""), body: String(m.body || "") });
          }
        });
        store(cur);
        render();
      } catch (err) {}
    };
    rd.readAsText(file);
  }, true);

  render();
})();
