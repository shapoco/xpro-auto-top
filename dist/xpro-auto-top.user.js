// ==UserScript==
// @name        XProAutoTop
// @namespace   https://github.com/shapoco/xpro-auto-top/
// @updateURL   https://github.com/shapoco/xpro-auto-top/raw/refs/heads/main/dist/xpro-auto-top.user.js
// @downloadURL https://github.com/shapoco/xpro-auto-top/raw/refs/heads/main/dist/xpro-auto-top.user.js
// @match       https://tweetdeck.twitter.com/*
// @match       https://pro.twitter.com/*
// @match       https://pro.x.com/*
// @version     1.0.39
// @author      Shapoco
// @description 「新しいポストを表示」を自動的にクリックする
// @run-at      document-start
// ==/UserScript==

(function () {
  'use strict';

  const DEBUG_MODE = false;

  class XProAutoTop {
    constructor() {
      this.knownSections = [];
      this.hoveredSections = [];
      this.intervalId = -1;
    }

    // 起動処理
    start() {
      this.intervalId = window.setInterval(() => {
        this.scanSections();
        this.scanSpans();
      }, 1000);
    }

    // カラムの列挙
    scanSections() {
      var newKnownSections = [];
      document.querySelectorAll('section').forEach(section => {
        if (this.processSection(section)) {
          newKnownSections.push(section);
        }
      });
      this.knownSections = newKnownSections;
    }

    // カラム毎の処理
    processSection(section) {
      // 最もrootに近いsectionのみを抽出
      var p = section.parentNode;
      while (p && p.tagName) {
        if (p.tagName.toUpperCase() === 'SECTION') {
          return false;
        }
        p = p.parentNode;
      }

      // 既知のカラムは無視
      if (this.knownSections.includes(section)) return false;

      // カラム毎のイベント設定
      section.addEventListener('mouseover', () => {
        if (!this.hoveredSections.includes(section)) {
          this.hoveredSections.push(section);
          if (DEBUG_MODE) {
            console.log(`mouseover ${this.hoveredSections.length}`);
          }
        }
      });
      section.addEventListener('mouseout', () => {
        if (this.hoveredSections.includes(section)) {
          this.hoveredSections.pop(section);
          if (DEBUG_MODE) {
            console.log(`mouseout  ${this.hoveredSections.length}`);
          }
        }
      });
      return true;
    }

    // ボタンの検索
    scanSpans() {
      document.querySelectorAll('span').forEach(span => {
        if (span.textContent == '新しいポストを表示') {
          this.processSpan(span);
        }
      });
    }

    /** ボタン毎の処理
     * @param {HTMLElement} span
     */
    processSpan(span) {
      // span要素を含むbuttonを探す
      /** @type {HTMLElement} */
      var button = span.parentNode;
      while (button.tagName.toUpperCase() !== 'BUTTON') {
        button = button.parentNode;
        if (!button) return;
      }

      // ボタンが不可視の場合は無視
      if (button.ariaHidden == 'true' || parseInt(button.tabIndex) < 0) {
        return;
      }

      // ボタンが所属するカラムがカーソルを含む場合は延期
      for (var section of this.hoveredSections) {
        const childButtons = Array.from(section.querySelectorAll('button'));
        if (childButtons.filter(b => b == button).length > 0) {
          button.dataset.xpatLastHovered = (new Date()).getTime();
          return;
        }
      }

      // 最後にホバーされてから 5 秒以内なら延期
      if (button.dataset.xpatLastHovered) {
        const lastHovered = parseInt(button.dataset.xpatLastHovered);
        if ((new Date()).getTime() - lastHovered <= 5000) {
          return;
        }
      }

      // クリック
      button.click();
    }
  }

  window.xpat = new XProAutoTop();
  window.xpat.start();

})();
