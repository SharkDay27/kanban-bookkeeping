#!/usr/bin/env node
/*
 * 更新 index.html 裡所有 CSS / JS 的 ?v= 版本號，讓瀏覽器重新下載新檔案。
 * 用法：npm run bump            → 版本號設為今天日期加時間，例如 20261103-1530
 *       npm run bump -- 20261201a → 指定版本號
 */
'use strict';
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.html');
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const version =
  process.argv[2] ||
  `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
if (!/^[\w.-]+$/.test(version)) {
  console.error('版本號只能包含英數字、底線、點和連字號：' + version);
  process.exit(1);
}
const html = fs.readFileSync(file, 'utf8');
let count = 0;
const next = html.replace(/((?:src|href)="[^"?]+\.(?:js|css|svg))(?:\?v=[^"]*)?"/g, (_, url) => {
  count++;
  return `${url}?v=${version}"`;
});
fs.writeFileSync(file, next);
console.log(`index.html：已將 ${count} 個檔案的版本號更新為 ${version}`);
