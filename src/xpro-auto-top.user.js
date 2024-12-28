// ==UserScript==
// @name        XPro Auto Top
// @namespace   https://github.com/shapoco/xpro-auto-top/
// @updateURL   https://shapoco.github.io/xpro-auto-top/xpro-auto-top.user.js
// @downloadURL https://shapoco.github.io/xpro-auto-top/xpro-auto-top.user.js
// @match       https://tweetdeck.twitter.com/*
// @match       https://pro.twitter.com/*
// @match       https://pro.x.com/*
// @version     1.0.22
// @author      Shapoco
// @description 「新しいポストを表示」を自動的にクリックする
// @run-at      document-start
// ==/UserScript==

(function() {
  'use strict';

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
      while(p && p.tagName) {
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
        }
      });
      section.addEventListener('mouseout', () => {
        if (this.hoveredSections.includes(section)) {
          this.hoveredSections.pop(section);
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

    // ボタン毎の処理
    processSpan(span) {
      // span要素を含むbuttonを探す
      var button = span.parentNode;
      while(button.tagName.toUpperCase() !== 'BUTTON') {
        button = button.parentNode;
        if (!button) return;
      }

      // ボタンが不可視の場合は無視
      if (button.ariaHidden == 'true' || parseInt(button.tabIndex) < 0) {
        return;
      }

      // ボタンが所属するカラムがカーソルを含む場合は延期
      for(var section of this.hoveredSections) {
        const childButtons = Array.from(section.querySelectorAll('button'));
        if (childButtons.filter(b => b == button).length > 0) {
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
