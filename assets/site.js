/* HappinessAC 共通スクリプト
   - ページ内タブ（クラス・会費のエリア、実績の年度）
   - スクロールで要素をふわっと表示
   - PCで上部ヘッダーにスクロール時の影をつける */
(function () {
  'use strict';

  /* ---------- ページ内タブ ---------- */
  // URLの #hadano などで、最初に開くタブを指定できます
  function initTabs(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    });
    if (!tabs.length) return;

    function select(index, opts) {
      opts = opts || {};
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        if (panels[i]) panels[i].hidden = !on;
      });
      if (opts.focus) tabs[index].focus();
      if (opts.updateHash && panels[index] && window.history && history.replaceState) {
        history.replaceState(null, '', '#' + panels[index].id);
      }
      // タブバーが画面上部に貼りついている時は、切り替えた内容の先頭へ戻す
      if (opts.toTop && root.getBoundingClientRect().top < 0) {
        root.scrollIntoView({ block: 'start' });
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(i, { updateHash: true, toTop: true });
      });
      tab.addEventListener('keydown', function (e) {
        var last = tabs.length - 1;
        var next = null;
        if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
        else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = last;
        if (next !== null) {
          e.preventDefault();
          select(next, { focus: true, updateHash: true });
        }
      });
    });

    function indexFromHash() {
      var id = decodeURIComponent(location.hash.slice(1));
      if (!id) return -1;
      for (var i = 0; i < panels.length; i++) {
        if (panels[i] && panels[i].id === id) return i;
      }
      return -1;
    }

    var initial = indexFromHash();
    if (initial >= 0) {
      select(initial);
      // 画像などの読み込み後に位置がずれないよう、少し待ってからタブの位置へ
      requestAnimationFrame(function () { root.scrollIntoView({ block: 'start' }); });
    } else {
      var current = 0;
      tabs.forEach(function (tab, i) { if (tab.getAttribute('aria-selected') === 'true') current = i; });
      select(current);
    }

    window.addEventListener('hashchange', function () {
      var i = indexFromHash();
      if (i >= 0) {
        select(i);
        root.scrollIntoView({ block: 'start' });
      }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), function (root) {
    initTabs(root);
    root.classList.add('is-ready');
  });

  /* ---------- スクロールでふわっと表示 ---------- */
  // 最初から画面に入っている要素は隠さない。画面より下にある要素だけを一度隠し、
  // スクロールで見えた時に表示する（スクリプトが動かなくても内容は必ず見える）
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    var fold = (window.innerHeight || document.documentElement.clientHeight) * 0.92;
    var waiting = Array.prototype.filter.call(document.querySelectorAll('[data-reveal]'), function (el) {
      return el.getBoundingClientRect().top > fold;
    });
    var showAll = function () {
      waiting.forEach(function (el) { el.classList.remove('reveal-wait'); });
    };
    if (waiting.length) {
      waiting.forEach(function (el) { el.classList.add('reveal-wait'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-wait');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
      waiting.forEach(function (el) { io.observe(el); });
      window.addEventListener('beforeprint', showAll);
    }
  }

  /* ---------- ヘッダーの影 ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var ticking = false;
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
})();
