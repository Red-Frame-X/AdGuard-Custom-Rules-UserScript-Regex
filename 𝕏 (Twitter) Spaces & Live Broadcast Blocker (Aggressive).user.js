// ==UserScript==
// @name         𝕏 (Twitter) Spaces & Live Broadcast Blocker (Aggressive)
// @namespace    http://tampermonkey.net/
// @license      CC0 (Public Domain)
// @version      1.3
// @description  「𝕏でライブ放送する」「スペース」バーを強制的に排除します（再表示防止・!important対応版）
// @author       Red Frame X
// @match        https://x.com/*
// @match        https://twitter.com/*
// @updateURL    https://github.com/Red-Frame-X/AdGuard-Custom-Rules-UserScript-Regex/raw/refs/heads/main/%F0%9D%95%8F%20(Twitter)%20Spaces%20&%20Live%20Broadcast%20Blocker%20(Aggressive).user.js
// @downloadURL  https://github.com/Red-Frame-X/AdGuard-Custom-Rules-UserScript-Regex/raw/refs/heads/main/%F0%9D%95%8F%20(Twitter)%20Spaces%20&%20Live%20Broadcast%20Blocker%20(Aggressive).user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ログ出力用（動作確認したい場合は true にしてください）
    const DEBUG = false;

    /**
     * 要素を強力に隠す関数
     * Reactによるスタイル上書きに対抗するため !important を付与します
     */
    const hideElement = (element) => {
        if (element && element.style.display !== 'none') {
            element.style.setProperty('display', 'none', 'important');
            element.style.setProperty('height', '0', 'important');
            element.style.setProperty('margin', '0', 'important');
            element.style.setProperty('padding', '0', 'important');
            element.style.setProperty('border', 'none', 'important');
            element.style.setProperty('min-height', '0', 'important'); // 追加: コンテナの最小高さを潰す
            if (DEBUG) console.log('𝕏 Live/Space Blocker: Hidden element', element);
        }
    };

    const checkAndRemove = () => {
        // 1. 見出し（Header）部分の除去
        const headers = document.querySelectorAll('h2[role="heading"]');
        headers.forEach(h2 => {
            if (h2.style.display === 'none') return;
            if (h2.textContent.includes('Xでライブ放送する')) {
                const parentDiv = h2.closest('div.r-1wtj0ep') || h2.parentElement;
                hideElement(parentDiv);
            }
        });

        // 2. 本体（Card）部分の除去 (placementTracking)
        const trackingElements = document.querySelectorAll('[data-testid="placementTracking"]');
        trackingElements.forEach(element => {
            if (element.style.display === 'none') return;
            const textContent = element.textContent;
            const spaceButton = element.querySelector('button[aria-label*="スペース"]');

            if (textContent.includes('Xでライブ放送する') || spaceButton) {
                hideElement(element);
            }
        });

        // 3. ボタン型通知（Space Bar / Live Notification）の除去 [新規追加]
        // 提示されたHTMLのような button要素 を aria-label で特定します
        // キーワード: "ライブ放送", "さんがホスト", "スペース"
        const spaceButtons = document.querySelectorAll('button[aria-label*="ライブ放送"], button[aria-label*="さんがホスト"], button[aria-label*="スペース"]');

        spaceButtons.forEach(btn => {
            if (btn.style.display === 'none') return;

            const label = btn.getAttribute('aria-label');
            // 誤爆防止: 明らかにスペース/ライブの通知と思われるキーワードを厳密に確認
            if (label && (label.startsWith('ライブ放送') || label.includes('さんがホスト') || label.includes('リスニング中'))) {

                // ケースA: タイムラインの中に埋め込まれている場合 (cellInnerDivごと消すときれいに消える)
                const cellInner = btn.closest('[data-testid="cellInnerDiv"]');
                if (cellInner) {
                    hideElement(cellInner);
                }
                // ケースB: 独立したバーとして表示されている場合 (ボタン自体を消す)
                else {
                    hideElement(btn);
                }
            }
        });
    };

    // 監視と実行の設定

    // 1. 初回実行
    checkAndRemove();

    // 2. MutationObserverによる監視
    const observer = new MutationObserver((mutations) => {
        checkAndRemove();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 3. スクロールイベント時にもチェック
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = requestAnimationFrame(() => {
                checkAndRemove();
                scrollTimeout = null;
            });
        }
    }, { passive: true });

})();
