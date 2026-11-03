#!/usr/bin/env node
/*
 * 冒煙測試：用真的瀏覽器打開 index.html，跑過記帳主要流程。
 * 執行：npm test（或 node tests/smoke.test.js）
 * 需要 Playwright 與 Chromium：npm install && npx playwright install chromium
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.json': 'application/json'
};

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push([true, name]);
    console.log('  ✓ ' + name);
  } catch (e) {
    results.push([false, name]);
    console.log('  ✗ ' + name + '\n    ' + ((e && e.stack) || e).toString().split('\n').slice(0, 3).join('\n    '));
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-smoke-'));

  async function openPage(url = '/index.html') {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
    const page = await context.newPage();
    page.errors = [];
    page.dialogs = [];
    page.on('pageerror', e => page.errors.push(e.message));
    page.on('dialog', d => {
      page.dialogs.push(d.message());
      d.accept();
    });
    await page.goto(base + url);
    await page.waitForFunction(() => typeof render === 'function' && typeof state === 'object');
    await page.waitForTimeout(300);
    return page;
  }

  console.log('kanban-bookkeeping smoke tests');

  await test('頁面載入沒有 JavaScript 錯誤', async () => {
    const page = await openPage();
    assert(page.errors.length === 0, page.errors.join('\n'));
    await page.context().close();
  });

  await test('新增一筆支出並存進 localStorage', async () => {
    const page = await openPage();
    await page.evaluate(() => openEdit('', 'expense'));
    await page.fill('#eamt', '120');
    await page.fill('#estore', '早餐店');
    await page.click('#save');
    await page.waitForTimeout(300);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem(KEY)).entries);
    assert(saved.length === 1 && saved[0].amount === 120 && saved[0].store === '早餐店', JSON.stringify(saved));
    assert(page.errors.length === 0, page.errors.join('\n'));
    await page.context().close();
  });

  await test('發票 CSV：多行品項不重複計算、千分位、作廢略過、格式不符會回報', async () => {
    const good = path.join(tmp, 'invoices.csv');
    fs.writeFileSync(
      good,
      [
        '發票號碼,發票日期,賣方名稱,發票金額,消費明細_品名,消費明細_金額,發票狀態',
        'AB12345678,20261020,全家便利商店,120,,,開立',
        'AB12345678,20261020,全家便利商店,120,,,開立',
        'CD11112222,20261021,麥當勞,"1,050",大麥克餐,"1,000",開立',
        'CD11112222,20261021,麥當勞,"1,050",可樂,50,開立',
        'EF33334444,20261022,星巴克,150,拿鐵,150,作廢'
      ].join('\n')
    );
    const bad = path.join(tmp, 'bad.csv');
    fs.writeFileSync(bad, 'foo,bar\n1,2\n');
    const page = await openPage();
    await page.setInputFiles('#csv', [good, bad]);
    await page.waitForTimeout(600);
    const rows = await page.evaluate(() => state.entries.map(x => [x.id, x.amount]).sort());
    assert(
      JSON.stringify(rows) ===
        JSON.stringify([
          ['inv-AB12345678', 120],
          ['inv-CD11112222', 1050]
        ]),
      JSON.stringify(rows)
    );
    assert(page.errors.length === 0, page.errors.join('\n'));
    await page.context().close();
  });

  await test('本機資料損毀時會另存原始內容，不會被新資料蓋掉', async () => {
    const page = await openPage();
    await page.evaluate(() => localStorage.setItem(KEY, '{bad json'));
    await page.reload();
    await page.waitForTimeout(800);
    assert(
      page.dialogs.some(m => m.includes('讀取本機記帳資料失敗')),
      '沒有出現提示'
    );
    await page.evaluate(() => openEdit('', 'expense'));
    await page.fill('#eamt', '50');
    await page.click('#save');
    await page.waitForTimeout(300);
    const backups = await page.evaluate(() =>
      Object.keys(localStorage)
        .filter(k => k.includes('-corrupt-'))
        .map(k => localStorage.getItem(k))
    );
    assert(backups.length === 1 && backups[0] === '{bad json', JSON.stringify(backups));
    await page.context().close();
  });

  await test('儲存空間已滿時提示失敗，不顯示「已刪除」', async () => {
    const page = await openPage();
    await page.evaluate(() => {
      state.entries.push(normalizeEntry({ id: 'x1', amount: 10, store: 'A' }));
      saveLocal();
    });
    const toasts = await page.evaluate(() => {
      const seen = [];
      const orig = window.bookkeepingToast;
      window.bookkeepingToast = t => {
        seen.push(t);
        return orig && orig(t);
      };
      Storage.prototype.setItem = function () {
        throw new DOMException('full', 'QuotaExceededError');
      };
      deleteEntry('x1');
      return new Promise(r => setTimeout(() => r(seen), 50));
    });
    assert(toasts.some(t => t.includes('儲存失敗')) && !toasts.some(t => t.includes('已刪除')), JSON.stringify(toasts));
    await page.context().close();
  });

  await test('分類名稱會被轉義', async () => {
    const page = await openPage();
    await page.evaluate(() => {
      state.entries.push(normalizeEntry({ id: 'x2', amount: 1, category: '<b>x</b>' }));
      render();
    });
    assert((await page.evaluate(() => document.querySelectorAll('#cat b, #ecat b').length)) === 0);
    await page.context().close();
  });

  await test('簡體模式轉換介面，但保留使用者輸入的店名', async () => {
    const page = await openPage();
    await page.evaluate(() => {
      state.entries.push(normalizeEntry({ id: 'x3', amount: 1, date: today(), store: '臺灣銀行體驗' }));
      state.profile.language = 'zh-Hans';
      saveLocal();
    });
    await page.reload();
    await page.waitForTimeout(800);
    await page.evaluate(() => setTab('book'));
    const stores = await page.evaluate(() =>
      [...document.querySelectorAll('[data-user-text]')].map(e => e.textContent).join('|')
    );
    assert(stores.includes('臺灣銀行體驗'), stores);
    await page.context().close();
  });

  await test('隱藏分頁延後繪製，切換過去時會畫出最新內容', async () => {
    const page = await openPage();
    await page.evaluate(() => {
      setTab('adventure');
      for (let i = 0; i < 130; i++)
        state.entries.push(
          normalizeEntry({ id: 'c' + i, amount: 10 + i, date: today(), store: '店' + i, source: '手動支出' })
        );
      render();
    });
    assert(await page.evaluate(() => staleSections.has('commentary')), 'commentary 應該標記為待更新');
    await page.evaluate(() => setTab('commentary'));
    const cards = await page.evaluate(() => document.querySelectorAll('#commentaryList .commentary-entry').length);
    assert(cards === 60, '應先顯示 60 則，實際 ' + cards);
    await page.click('[data-commentary-more]');
    assert((await page.evaluate(() => document.querySelectorAll('#commentaryList .commentary-entry').length)) === 120);
    assert(page.errors.length === 0, page.errors.join('\n'));
    await page.context().close();
  });

  await test('匯出 CSV：防公式注入，檔名標出範圍', async () => {
    const page = await openPage();
    await page.evaluate(() => {
      state.entries.push(normalizeEntry({ id: 'x4', amount: 5, date: today(), store: '=HYPERLINK("x")' }));
      render();
    });
    // 無頭 Chromium 不回報中文下載檔名，所以直接記下程式設定的 a.download。
    await page.evaluate(() => {
      const orig = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        window.__lastDownloadName = this.download;
        return orig.call(this);
      };
    });
    const [download] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => exportCsv())]);
    const file = path.join(tmp, 'export.csv');
    await download.saveAs(file);
    const text = fs.readFileSync(file, 'utf8');
    assert(text.includes(`"'=HYPERLINK(""x"")"`), text);
    const name = await page.evaluate(() => window.__lastDownloadName);
    assert(/^終端記錄匯出_\d{4}-\d{2}\.csv$/.test(name), name);
    await page.context().close();
  });

  await test('live.html 轉址到 index.html', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(base + '/live.html?a=1#b');
    await page.waitForURL(/index\.html\?a=1#b$/);
    await context.close();
  });

  await browser.close();
  server.close();
  const failed = results.filter(r => !r[0]).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
