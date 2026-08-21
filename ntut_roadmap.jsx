import { useState, useEffect, useCallback } from "react";

// ── Static Data ───────────────────────────────────────────────
const SEMS_DONE = [
  { sem: "113-1", yr: "Y1S1", avg: 87.26, cr: 19 },
  { sem: "113-2", yr: "Y1S2", avg: 83.00, cr: 19 },
  { sem: "114-1", yr: "Y2S1", avg: 86.35, cr: 23 },
  { sem: "114-2", yr: "Y2S2", avg: 84.30, cr: 19 },
];

// 已確認的實際修畢學分；proj 保留為與 done 相同以相容舊介面。
const BUCKETS = [
  { id: "gened", lbl: "共同必修 △", done: 23, total: 28, proj: 23, c: "var(--color-text-success)" },
  { id: "major", lbl: "專業必修 ▲", done: 46, total: 63, proj: 46, c: "var(--color-text-info)" },
  { id: "elec",  lbl: "專業選修 ★", done: 9,  total: 21, proj: 9,  c: "var(--color-text-warning)" },
  { id: "free",  lbl: "跨域+自由",  done: 2,  total: 20, proj: 2,  c: "var(--color-text-secondary)" },
];

// 博雅 sub-requirement
const BOYA_TOTAL = 15;
const BOYA_DONE  = 10; // 親密關係 2cr 已於 114-2 修畢
const BOYA_PROJ  = 10;
const BOYA_ROWS = [
  { lbl: "人文與藝術",        done: 2, total: 4,                    note: "115-1 補完" },
  { lbl: "自然與科學",        done: 4, total: 4,                    complete: true },
  { lbl: "創新與創業",        done: 2, total: 4,                    appBug: true },
  { lbl: "自由向度（自選）",  done: 2, total: 3,                    note: "親密關係已計入" },
];

// 114-2 actual passed courses (電子學(二)、機率為 W，115-2 補修)
const SEM_1142 = [
  // required
  { n: "專業英文 (2/2)",                         cr: 2, b: "△", score: 96 },
  { n: "親密關係 (博雅 · 社會與法治向度)",        cr: 2, b: "△", boya: true, score: 89 },
  { n: "工程數學(二)",                            cr: 3, b: "▲", score: 78 },
  { n: "電子學實習(二)",                          cr: 1, b: "▲", score: 61 },
  { n: "電磁學",                                  cr: 3, b: "▲", score: 78 },
  // electives
  { n: "資料結構",                                cr: 3, b: "★", score: 88 },
  { n: "計算機組織",                              cr: 3, b: "★", score: 81 },
  { n: "國際觀培養：日語與文化(二)",              cr: 2, b: "跨域", score: 98 },
];

const SEMESTERS = [
  {
    sem: "115-1", yr: "Y3S1",
    note: "Capstone 開始 · 東京實習後衝刺",
    req: [
      { n: "學院指定向度-人文與藝術 (2/2)", cr: 2, b: "△" },
      { n: "學生自選向度", cr: 3, b: "△" },
      { n: "通訊系統實習 ◎", cr: 1, b: "▲" },
      { n: "應用軟體設計實習 ◎", cr: 1, b: "▲" },
      { n: "實務專題(一)", cr: 2, b: "▲" },
      { n: "專題討論 (1/2)", cr: 1, b: "▲" },
    ],
    elec: [
      { n: "計算機演算法", cr: 3, t: "sys" },
      { n: "系統程式", cr: 3, t: "sys" },
      { n: "FPGA系統設計實務", cr: 3, t: "sw" },
      { n: "密碼學", cr: 3, t: "sys" },
    ],
  },
  {
    sem: "115-2", yr: "Y3S2",
    note: "▲ 全部結束 · 補修在此學期",
    retakeWarning: true,
    req: [
      { n: "電子學(二)", cr: 3, b: "▲", retake: true },
      { n: "機率", cr: 3, b: "▲", retake: true },
      { n: "數位系統設計實習◎ / 高頻電路實習◎", cr: 1, b: "▲" },
      { n: "校外實習", cr: 2, b: "▲" },
      { n: "專題討論 (2/2)", cr: 1, b: "▲" },
      { n: "實務專題(二)", cr: 2, b: "▲" },
    ],
    elec: [
      { n: "機器學習", cr: 3, t: "ai", pri: true },
      { n: "作業系統", cr: 3, t: "sys" },
      { n: "資料庫系統", cr: 3, t: "sys" },
      { n: "嵌入式系統概論", cr: 3, t: "sw" },
    ],
  },
  {
    sem: "116-1", yr: "Y4S1",
    note: "純選修 · 求職季",
    req: [],
    elec: [
      { n: "人工智慧", cr: 3, t: "ai", pri: true },
      { n: "深度學習", cr: 3, t: "ai", pri: true },
      { n: "大數據處理與系統實作", cr: 3, t: "sys" },
      { n: "計算機網路", cr: 3, t: "sw" },
      { n: "全端網頁軟體系統實作", cr: 3, t: "sw" },
      { n: "軟體工程", cr: 3, t: "sw" },
    ],
    hasCross: true,
  },
  {
    sem: "116-2", yr: "Y4S2", grad: true,
    note: "畢業年 · 作品集衝刺",
    req: [],
    elec: [
      { n: "深度學習應用開發實務", cr: 3, t: "ai", pri: true },
      { n: "自然語言處理與情感計算", cr: 3, t: "ai", pri: true },
      { n: "深度強化學習", cr: 3, t: "ai" },
      { n: "Python物件導向實務應用", cr: 3, t: "sw" },
    ],
    hasCross: true,
  },
];

const TAGS = {
  ai:  { bg: "var(--color-background-info)",    fg: "var(--color-text-info)",    l: "AI" },
  sys: { bg: "var(--color-background-success)", fg: "var(--color-text-success)", l: "SYS" },
  sw:  { bg: "var(--color-background-warning)", fg: "var(--color-text-warning)", l: "SW" },
};

const BUCKET_TAG = {
  "△":   { bg: "var(--color-background-secondary)", fg: "var(--color-text-secondary)" },
  "▲":   { bg: "var(--color-background-info)",      fg: "var(--color-text-info)"      },
  "★":   { bg: "var(--color-background-warning)",   fg: "var(--color-text-warning)"   },
  "跨域": { bg: "var(--color-background-success)",  fg: "var(--color-text-success)"   },
};

function loadInfo(cr) {
  if (cr === 0)  return { bg: "var(--color-background-secondary)", fg: "var(--color-text-tertiary)", l: "—" };
  if (cr <= 12)  return { bg: "var(--color-background-success)",   fg: "var(--color-text-success)", l: "輕鬆" };
  if (cr <= 17)  return { bg: "var(--color-background-info)",      fg: "var(--color-text-info)",    l: "正常" };
  if (cr <= 20)  return { bg: "var(--color-background-warning)",   fg: "var(--color-text-warning)", l: "偏重" };
  return          { bg: "var(--color-background-danger)",    fg: "var(--color-text-danger)",  l: "過重" };
}

function Bar({ pct, color, h = 6 }) {
  return (
    <div style={{ height: h, borderRadius: 3, background: "var(--color-border-tertiary)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3 }} />
    </div>
  );
}

function SecLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-text-tertiary)", margin: "1.4rem 0 8px", letterSpacing: ".06em" }}>
      {children}
    </div>
  );
}

function BucketPill({ b }) {
  const s = BUCKET_TAG[b] || BUCKET_TAG["△"];
  return (
    <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 2, fontWeight: 500, whiteSpace: "nowrap", background: s.bg, color: s.fg }}>{b}</span>
  );
}

// ── Credits Tab ───────────────────────────────────────────────
function CreditsTab() {
  const showProj = false;

  return (
    <div>
      <SecLabel>CREDIT BUCKETS</SecLabel>
      <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 10 }}>
        目前：80 / 132 (61%)
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {BUCKETS.map(({ id, lbl, done, total, proj, c }) => {
          const val = showProj ? proj : done;
          const warn = id === "elec" && val < 12; // significant gap
          return (
            <div key={id} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "13px 12px", border: warn ? "0.5px solid var(--color-border-warning)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  {lbl}
                  {warn && <span style={{ marginLeft: 5, fontSize: 8, padding: "1px 5px", borderRadius: 2, background: "var(--color-background-warning)", color: "var(--color-text-warning)", fontWeight: 500 }}>缺口</span>}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{val} / {total}</span>
              </div>
              <Bar pct={(val / total) * 100} color={c} />
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                <span>{total - val} cr 剩餘</span>
                {showProj && proj !== done && <span style={{ color: "var(--color-text-info)" }}>+{proj - done} 本學期</span>}
              </div>
            </div>
          );
        })}
      </div>

      <SecLabel>博雅學分 — {showProj ? `${BOYA_PROJ}` : `${BOYA_DONE}`} / {BOYA_TOTAL}</SecLabel>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "13px 12px", marginBottom: "1.5rem" }}>
        <Bar pct={((showProj ? BOYA_PROJ : BOYA_DONE) / BOYA_TOTAL) * 100} color="var(--color-text-secondary)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 10 }}>
          {BOYA_ROWS.map(({ lbl, done, total, complete, appBug, projDone, note }) => {
            const val = showProj ? (projDone ?? done) : done;
            return (
              <div key={lbl} style={{
                background: "var(--color-background-primary)",
                border: (complete || val === total) ? "0.5px solid var(--color-border-success)" : appBug ? "0.5px solid var(--color-border-warning)" : "0.5px solid var(--color-border-tertiary)",
                borderRadius: 6, padding: "8px 9px",
              }}>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3 }}>{lbl}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: (complete || val === total) ? "var(--color-text-success)" : "var(--color-text-primary)" }}>
                  {val} / {total}{(complete || val === total) ? " ✓" : ""}
                </div>
                {appBug && <div style={{ fontSize: 9, color: "var(--color-text-warning)", marginTop: 2 }}>app 顯示 0 ← bug</div>}
                {showProj && note && <div style={{ fontSize: 9, color: "var(--color-text-info)", marginTop: 2 }}>{note}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 9, color: "var(--color-text-warning)", padding: "5px 7px", background: "var(--color-background-warning)", borderRadius: 5, marginTop: 8 }}>
          ⚠ App bug：創新與創業 2cr 被誤分類為自由向度。總計正確。
        </div>
      </div>

      <SecLabel>剩餘學分分佈</SecLabel>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 14px" }}>
        {[
          ["△ 共同必修", "5 cr",  "115-1 完成：人文與藝術(2/2) + 學生自選向度 3cr"],
          ["▲ 專業必修", "17 cr", "115-1(5cr) + 115-2(12cr 含補修)，Y3S2 後全部完成"],
          ["★ 專業選修", "12 cr", "114-2 後 9/21，還差 12cr，Y3–Y4 選修補完"],
          ["跨域+自由",  "18 cr", "日文課 2cr 已計入。★ 超過 21cr 的部分可直接轉計跨域 → 多選 AI 課就能一起填滿"],
        ].map(([label, cr, note]) => (
          <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 11 }}>
            <span style={{ width: 80, color: "var(--color-text-secondary)", flexShrink: 0, fontWeight: 500 }}>{label}</span>
            <span style={{ width: 38, flexShrink: 0, fontWeight: 500 }}>{cr}</span>
            <span style={{ color: "var(--color-text-tertiary)", fontSize: 10, lineHeight: 1.5 }}>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Planner Tab ───────────────────────────────────────────────
function PlannerTab({ checked, toggleCourse, cross, updateCross }) {
  const totalPlanned = SEMESTERS.reduce((sum, s) => {
    const rc = s.req.reduce((a, r) => a + r.cr, 0);
    const ec = s.elec.filter(e => checked[`${s.sem}::${e.n}`]).reduce((a, e) => a + e.cr, 0);
    return sum + rc + ec + (cross[s.sem] || 0);
  }, 0);
  const starDone = 9 + SEMESTERS.reduce((sum, s) =>
    sum + s.elec.filter(e => checked[`${s.sem}::${e.n}`]).reduce((a, e) => a + e.cr, 0), 0
  );
  const crossDone = 2 + Object.values(cross).reduce((a, b) => a + (b || 0), 0);
  const needed = 33; // 52 total after 114-2, minus 114-2 itself (19cr)
  const onTrack = totalPlanned >= needed;

  return (
    <div>
      {/* 114-2 locked card */}
      <div style={{ background: "var(--color-background-primary)", border: "2px solid var(--color-border-info)", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>114-2</span>
              <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>Y2S2</span>
              <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, fontWeight: 500, background: "var(--color-background-info)", color: "var(--color-text-info)" }}>已完成</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
              成績已公布 · 電子學(二)與機率 W，115-2 補修
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 18, fontWeight: 500 }}>19</span>
            <span style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>通過 cr</span>
            <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, fontWeight: 500, background: "var(--color-background-warning)", color: "var(--color-text-warning)" }}>偏重</span>
          </div>
        </div>

        <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginBottom: 7, fontWeight: 500, letterSpacing: ".06em" }}>通過必修 11cr</div>
            {SEM_1142.filter(c => c.b !== "★" && c.b !== "跨域").map(c => (
              <div key={c.n} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 5 }}>
                <BucketPill b={c.b} />
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4, marginLeft: 3 }}>{c.n} <span style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>{c.score} 分</span></span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginBottom: 7, fontWeight: 500, letterSpacing: ".06em" }}>通過選修／跨域 8cr</div>
            {SEM_1142.filter(c => c.b === "★" || c.b === "跨域").map(c => (
              <div key={c.n} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 5 }}>
                <BucketPill b={c.b} />
                <span style={{ fontSize: 11, color: "var(--color-text-primary)", lineHeight: 1.4, marginLeft: 3 }}>{c.n} <span style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>{c.cr}cr · {c.score} 分</span></span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "5px 14px", background: "var(--color-background-info)", fontSize: 10, color: "var(--color-text-info)", display: "flex", justifyContent: "space-between" }}>
          <span>實績：★ 9/21 · 跨域 2/20 · 博雅 10/15</span>
          <span>電子學(二) + 機率 → 115-2 補修</span>
        </div>
      </div>

      {/* Future semesters */}
      {SEMESTERS.map((s) => {
        const rc = s.req.reduce((a, r) => a + r.cr, 0);
        const ec = s.elec.filter(e => checked[`${s.sem}::${e.n}`]).reduce((a, e) => a + e.cr, 0);
        const cc = cross[s.sem] || 0;
        const total = rc + ec + cc;
        const li = loadInfo(total);
        const nChecked = s.elec.filter(e => checked[`${s.sem}::${e.n}`]).length;

        return (
          <div key={s.sem} style={{
            background: "var(--color-background-primary)",
            border: s.retakeWarning ? "0.5px solid var(--color-border-danger)" : "0.5px solid var(--color-border-tertiary)",
            borderRadius: 12, overflow: "hidden", marginBottom: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 14px", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.sem}</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{s.yr}</span>
                  {s.retakeWarning && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, fontWeight: 500, background: "var(--color-background-danger)", color: "var(--color-text-danger)" }}>⚠ 補修</span>}
                  {s.grad && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, fontWeight: 500, background: "var(--color-background-warning)", color: "var(--color-text-warning)" }}>畢業學期</span>}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{s.note}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <span style={{ fontSize: 18, fontWeight: 500 }}>{total}</span>
                <span style={{ fontSize: 9, color: "var(--color-text-tertiary)" }}>cr</span>
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, fontWeight: 500, background: li.bg, color: li.fg }}>{li.l}</span>
              </div>
            </div>

            <div style={{ padding: "12px 14px", display: "grid", gridTemplateColumns: (s.elec.length > 0 || s.hasCross) ? "1fr 1fr" : "1fr", gap: 14 }}>
              <div>
                <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginBottom: 7, fontWeight: 500, letterSpacing: ".06em" }}>
                  必修 {rc > 0 ? `${rc} cr` : "(無)"}
                </div>
                {s.req.length === 0
                  ? <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>本學期無必修課</div>
                  : s.req.map((r) => (
                    <div key={r.n} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 5 }}>
                      <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 2, marginTop: 2, flexShrink: 0, fontWeight: 500, whiteSpace: "nowrap",
                        background: r.retake ? "var(--color-background-danger)" : "var(--color-background-secondary)",
                        color: r.retake ? "var(--color-text-danger)" : "var(--color-text-tertiary)"
                      }}>{r.retake ? "補修" : r.b} {r.cr}cr</span>
                      <span style={{ fontSize: 11, lineHeight: 1.4, color: r.retake ? "var(--color-text-danger)" : "var(--color-text-secondary)" }}>{r.n}</span>
                    </div>
                  ))
                }
              </div>

              {(s.elec.length > 0 || s.hasCross) && (
                <div>
                  {s.elec.length > 0 && (
                    <>
                      <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginBottom: 7, fontWeight: 500, letterSpacing: ".06em" }}>
                        ★ 選修 {nChecked > 0 ? `+${ec} cr 已選` : "(未選)"}
                      </div>
                      {s.elec.map(({ n, cr, t, pri }) => {
                        const id = `${s.sem}::${n}`;
                        const on = !!checked[id];
                        const tag = TAGS[t] || {};
                        return (
                          <label key={n} htmlFor={id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, cursor: "pointer" }}>
                            <input id={id} type="checkbox" checked={on} onChange={() => toggleCourse(id)} style={{ flexShrink: 0, cursor: "pointer" }} />
                            <span style={{ fontSize: 11, color: on ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
                              <span style={{ background: tag.bg, color: tag.fg, fontSize: 8, padding: "1px 4px", borderRadius: 2, marginRight: 4, fontWeight: 500 }}>{tag.l}</span>
                              {pri && <span style={{ color: "var(--color-text-warning)", fontSize: 9, marginRight: 3 }}>★</span>}
                              {n} <span style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>{cr}cr</span>
                            </span>
                          </label>
                        );
                      })}
                    </>
                  )}
                  {s.hasCross && (
                    <div style={{ marginTop: s.elec.length > 0 ? 10 : 0, paddingTop: s.elec.length > 0 ? 10 : 0, borderTop: s.elec.length > 0 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                      <div style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginBottom: 5, fontWeight: 500, letterSpacing: ".06em" }}>跨域+自由 (其他系)</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="number" min={0} max={21} value={cross[s.sem] || 0}
                          onChange={(e) => updateCross(s.sem, Math.max(0, +e.target.value))}
                          style={{ width: 60, fontSize: 13 }} />
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>cr 預計</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: "5px 14px", background: li.bg, fontSize: 10, color: li.fg, display: "flex", justifyContent: "space-between" }}>
              <span>{rc}cr 必修{ec > 0 ? ` + ${ec}cr ★` : ""}{cc > 0 ? ` + ${cc}cr 跨域` : ""} = {total}cr 合計</span>
              <span>{total === 0 ? "尚未規劃" : "已儲存 ✓"}</span>
            </div>
          </div>
        );
      })}

      {/* 115-2 retake warning */}
      <div style={{ padding: "10px 14px", background: "var(--color-background-danger)", borderRadius: 8, marginBottom: 10, fontSize: 11, color: "var(--color-text-danger)", lineHeight: 1.6 }}>
        ⚠ <strong>115-2 補修注意：</strong>電子學(二) 3cr + 機率 3cr 要在同一學期補修，加上原本 6cr 必修，光必修就 12cr。選修盡量控制，避免過重。
      </div>

      {/* Graduation summary */}
      <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px" }}>
        <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 10 }}>
          畢業計劃總覽 <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>(115-1 以後)</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 11 }}>
          <span style={{ color: "var(--color-text-secondary)" }}>已規劃</span>
          <span style={{ fontWeight: 500, color: onTrack ? "var(--color-text-success)" : "var(--color-text-warning)" }}>
            {totalPlanned} / {needed} {onTrack ? "✓ 足夠畢業" : `還差 ${needed - totalPlanned} cr`}
          </span>
        </div>
        <Bar pct={(totalPlanned / Math.max(needed, 1)) * 100} color={onTrack ? "var(--color-text-success)" : "var(--color-text-warning)"} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
          {[
            { l: "★ 選修",    v: starDone,             t: 21,  ok: starDone >= 21 },
            { l: "跨域+自由", v: crossDone,             t: 20,  ok: crossDone >= 20 },
            { l: "畢業總學分", v: 61+19+totalPlanned,   t: 132, ok: (61+19+totalPlanned) >= 132 },
          ].map(({ l, v, t, ok }) => (
            <div key={l} style={{ background: "var(--color-background-primary)", borderRadius: 6, padding: "8px 10px", border: ok ? "0.5px solid var(--color-border-success)" : "0.5px solid var(--color-border-tertiary)" }}>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ok ? "var(--color-text-success)" : "var(--color-text-primary)" }}>
                {v} / {t}{ok ? " ✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("planner");
  const [checked, setChecked] = useState({});
  const [cross, setCross] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try { const r = await window.storage.get("rm-checked"); if (r) setChecked(JSON.parse(r.value)); } catch {}
      try { const r = await window.storage.get("rm-cross");   if (r) setCross(JSON.parse(r.value)); } catch {}
      setLoaded(true);
    }
    load();
  }, []);

  const toggleCourse = useCallback((id) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      window.storage.set("rm-checked", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateCross = useCallback((sem, val) => {
    setCross((prev) => {
      const next = { ...prev, [sem]: val };
      window.storage.set("rm-cross", JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  if (!loaded) return (
    <div style={{ padding: "2rem", color: "var(--color-text-secondary)", fontSize: 13 }}>載入中...</div>
  );

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "1rem 0", maxWidth: 680 }}>
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: 17, fontWeight: 500 }}>NTUT EE Roadmap</div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
          113-batch · Y3S1 進行中 · 2028 畢業 · 目標：AI Application Engineer
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1rem" }}>
        {[
          { v: "85.28", s: "整體平均" },
          { v: "80 / 132", s: "61% 學分" },
          { v: "19 / 55", s: "前次班排名" },
          { v: "34 / 109", s: "前次系排名" },
        ].map(({ v, s }) => (
          <div key={s} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px" }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{v}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2 }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1.25rem" }}>
        {SEMS_DONE.map(({ sem, yr, avg, cr }) => (
          <div key={sem} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-success)", borderRadius: 8, padding: "9px 11px" }}>
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 2 }}>{yr} · {sem} · {cr}cr</div>
            <div style={{ fontSize: 17, fontWeight: 500, color: "var(--color-text-success)" }}>{avg}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: "1.25rem" }}>
        {[["planner", "選課計劃"], ["credits", "學分狀況"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "7px 16px", fontSize: 12, fontWeight: tab === id ? 500 : 400,
            background: "none", border: "none", cursor: "pointer",
            color: tab === id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            borderBottom: `2px solid ${tab === id ? "var(--color-text-primary)" : "transparent"}`,
            marginBottom: -1,
          }}>{lbl}</button>
        ))}
      </div>

      {tab === "planner" && <PlannerTab checked={checked} toggleCourse={toggleCourse} cross={cross} updateCross={updateCross} />}
      {tab === "credits"  && <CreditsTab />}
    </div>
  );
}
