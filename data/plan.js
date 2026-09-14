// Existing future plan and graduation targets; not certified by the transcripts.
window.Roadmap = window.Roadmap || {};
Roadmap.semesters = [
      { sem: '115-1', yr: 'Y3S1', note: 'Capstone 開始 · 東京實習後衝刺', req: [
        { n: '學院指定向度-人文與藝術 (2/2)', cr: 2, b: '△' }, { n: '學生自選向度', cr: 3, b: '△' }, { n: '通訊系統實習 ◎', cr: 1, b: '▲' }, { n: '應用軟體設計實習 ◎', cr: 1, b: '▲' }, { n: '實務專題(一)', cr: 2, b: '▲' }, { n: '專題討論 (1/2)', cr: 1, b: '▲' }
      ], elec: [{ n: '計算機演算法', cr: 3, t: 'sys' }, { n: '系統程式', cr: 3, t: 'sys' }, { n: 'FPGA系統設計實務', cr: 3, t: 'sw' }, { n: '密碼學', cr: 3, t: 'sys' }] },
      { sem: '115-2', yr: 'Y3S2', note: '▲ 全部結束 · 補修在此學期', retakeWarning: true, req: [
        { n: '電子學(二)', cr: 3, b: '▲', retake: true }, { n: '機率', cr: 3, b: '▲', retake: true }, { n: '數位系統設計實習◎ / 高頻電路實習◎', cr: 1, b: '▲' }, { n: '校外實習', cr: 2, b: '▲' }, { n: '專題討論 (2/2)', cr: 1, b: '▲' }, { n: '實務專題(二)', cr: 2, b: '▲' }
      ], elec: [{ n: '機器學習', cr: 3, t: 'ai', pri: true }, { n: '作業系統', cr: 3, t: 'sys' }, { n: '資料庫系統', cr: 3, t: 'sys' }, { n: '嵌入式系統概論', cr: 3, t: 'sw' }] },
      { sem: '116-1', yr: 'Y4S1', note: '純選修 · 求職季', req: [], elec: [{ n: '人工智慧', cr: 3, t: 'ai', pri: true }, { n: '深度學習', cr: 3, t: 'ai', pri: true }, { n: '大數據處理與系統實作', cr: 3, t: 'sys' }, { n: '計算機網路', cr: 3, t: 'sw' }, { n: '全端網頁軟體系統實作', cr: 3, t: 'sw' }, { n: '軟體工程', cr: 3, t: 'sw' }], hasCross: true },
      { sem: '116-2', yr: 'Y4S2', note: '畢業年 · 作品集衝刺', grad: true, req: [], elec: [{ n: '深度學習應用開發實務', cr: 3, t: 'ai', pri: true }, { n: '自然語言處理與情感計算', cr: 3, t: 'ai', pri: true }, { n: '深度強化學習', cr: 3, t: 'ai' }, { n: 'Python物件導向實務應用', cr: 3, t: 'sw' }], hasCross: true }
    ];
Roadmap.targets = { gened: 28, major: 63, elec: 21, free: 20 };
