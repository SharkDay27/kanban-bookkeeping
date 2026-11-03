/* 輕量通知：取代原本的 React + sonner（約 258KB）。介面維持 window.bookkeepingToast(text)。 */
(function () {
  'use strict';
  const root = document.getElementById('notificationRoot');
  if (!root) return;
  const MAX_VISIBLE = 2;
  const ERROR_RE = /沒有可用|請先|請選擇|請輸入|不能|無法|不足|未達|失敗|倒下|已滿|最多|至少/;
  const SUCCESS_RE = /成功|已儲存|已新增|已刪除|已記錄|已復原|已裝備|已卸下|完成|已切換/;
  const ICONS = {
    success:
      '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M6 10.4l2.6 2.6L14.2 7.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error:
      '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M10 5.6v5.6" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/><circle cx="10" cy="14.2" r="1.1" fill="#fff"/></svg>'
  };
  const list = document.createElement('ol');
  list.className = 'bk-toaster';
  list.setAttribute('aria-live', 'polite');
  list.setAttribute('aria-relevant', 'additions text');
  list.setAttribute('aria-label', '通知');
  root.appendChild(list);

  function dismiss(item) {
    if (!item || item.dataset.leaving) return;
    item.dataset.leaving = '1';
    clearTimeout(item._timer);
    item.classList.add('bk-toast-leave');
    setTimeout(function () {
      item.remove();
    }, 200);
  }
  function startTimer(item) {
    clearTimeout(item._timer);
    item._timer = setTimeout(function () {
      dismiss(item);
    }, item._remaining);
  }

  window.bookkeepingToast = function (message) {
    const text = String(message || '');
    const type = ERROR_RE.test(text) ? 'error' : SUCCESS_RE.test(text) ? 'success' : 'info';
    const item = document.createElement('li');
    item.className = 'bk-toast bk-toast-' + type;
    item.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'bk-toast-close';
    close.setAttribute('aria-label', '關閉通知');
    close.textContent = '×';
    close.onclick = function () {
      dismiss(item);
    };
    const body = document.createElement('div');
    body.className = 'bk-toast-text';
    body.textContent = text;
    if (ICONS[type]) {
      const icon = document.createElement('span');
      icon.className = 'bk-toast-icon';
      icon.innerHTML = ICONS[type];
      item.appendChild(icon);
    }
    item.appendChild(body);
    item.appendChild(close);
    list.appendChild(item);
    // 只保留最新幾則
    const live = [...list.children].filter(function (x) {
      return !x.dataset.leaving;
    });
    live.slice(0, Math.max(0, live.length - MAX_VISIBLE)).forEach(dismiss);
    item._remaining = type === 'error' ? 5500 : 4200;
    item.addEventListener('mouseenter', function () {
      clearTimeout(item._timer);
    });
    item.addEventListener('mouseleave', function () {
      startTimer(item);
    });
    startTimer(item);
    return item;
  };
})();
