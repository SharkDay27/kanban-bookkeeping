# 記帳手札

純前端的記帳工具，附帶 RPG 養成（罪人評議、探索、任務、圖鑑）。沒有後端，**所有資料只存在使用者自己瀏覽器的 `localStorage`**。

## 使用

- 直接用瀏覽器開 `index.html`，或部署到任何靜態網站空間（GitHub Pages、Render Static Site 等）。
- 手機建議透過 https 開啟；用區網 IP 的 http 也能正常記帳。
- `live.html` 只是轉址到 `index.html`，保留給舊書籤與主畫面捷徑。

### 資料與備份

| 功能 | 說明 |
|---|---|
| 備份 JSON / 還原備份 | 完整匯出或覆蓋本機資料（記帳＋RPG 進度）。換手機或清瀏覽器前請先備份。 |
| 匯出 CSV | 匯出**目前篩選條件**下的記錄；檔名會標出範圍，要匯出全部請先清空月份與篩選。 |
| 匯入發票 CSV | 匯入財政部電子發票平台下載的消費明細。同一張發票重複匯入只會更新；作廢發票會略過。 |

- 資料存在 `localStorage` 的 `kanban-bookkeeping-rpg-v4`。
- 若讀取時發現資料損毀，原始內容會另存成 `kanban-bookkeeping-rpg-v4-corrupt-<時間>`，並提示下載，不會被覆蓋。

## 開發

```bash
npm install                        # 安裝 Playwright（只有跑測試需要）
npx playwright install chromium    # 第一次跑測試前下載瀏覽器
npm start                          # 本機開啟 http://localhost:8080
npm test                           # 冒煙測試：用真的瀏覽器跑過主要流程
npm run format                     # Prettier 排版（資料表檔案見 .prettierignore）
npm run bump                       # 修改 JS/CSS 後執行，更新 index.html 的快取版本號
```

> 修改任何 `.js` / `.css` 後記得 `npm run bump`，否則使用者的瀏覽器可能繼續用舊檔案。

### 檔案結構

所有腳本都用一般 `<script>` 依序載入（見 `index.html` 底部），共用全域變數，**順序有相依性**。

| 類別 | 檔案 |
|---|---|
| 核心 | `app.js`（資料讀寫、記帳、匯入匯出、畫面繪製、分頁切換） |
| 記帳介面 | `records.js`（記錄列表）、`daily-ledger.js`（日曆帳本）、`bookkeeping-habits.js`（常用項目、每日獎勵）、`statistics.js` |
| 介面外觀 | `minimal-ui.js/.css`、`compact-ui.js`、`daily-ledger.css`、`styles.css`、`toast-ui.js`（通知） |
| 罪人評議 | `dialogues.js`、`commentary-amounts.js`、`commentary-pairs.js`、`araya-dialogues.js`、`sinner-addresses.js` |
| 探索與戰鬥 | `exploration*.js`、`area-exploration.js`、`field-combat.js`、`revival.js`、`regional-*.js`、`frontier-*.js`、`enemies.js` |
| 養成 | `sinners.js`、`sinner-skills.js`、`sinner-management.js`、`equipment.js`、`item-*.js`、`backpack.js`、`bestiary.js`、`quests.js`、`achievements.js`、`manager-progress.js` |

### 開發注意事項

- **使用者輸入的文字一律經過 `esc()`**（各模組的 `safe()` / `e()` 也是呼叫它）再放進 `innerHTML`。
- 店名、備註、品名等使用者文字的外層加上 `data-user-text`，簡體模式就不會轉換它們。
- `render()` 只重畫目前顯示中的分頁；新增分頁時，把它的繪製函式加進 `app.js` 的 `SECTION_RENDERERS`。
- 存檔一律呼叫 `saveLocal()`，它失敗時會回傳 `false` 並提示使用者，不會丟出例外。
