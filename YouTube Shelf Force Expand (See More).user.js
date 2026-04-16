// ==UserScript==
// @name         YouTube Shelf Force Expand (See More)
// @namespace    http://tampermonkey.net/
// @license      CC0 (Public Domain)
// @version      1.0
// @description  YouTubeのシェルフの「もっと見る」を強制的に展開しボタンを隠す
// @author       Red Frame X
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/Red-Frame-X/AdGuard-Custom-Rules-UserScript-Regex/raw/refs/heads/main/YouTube%20Shelf%20Force%20Expand%20(See%20More).user.js
// @downloadURL  https://github.com/Red-Frame-X/AdGuard-Custom-Rules-UserScript-Regex/raw/refs/heads/main/YouTube%20Shelf%20Force%20Expand%20(See%20More).user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. CSSルールの適用
    // AdGuard: www.youtube.com##ytd-rich-shelf-renderer .button-container
    const css = `
        ytd-rich-shelf-renderer .button-container {
            display: none !important;
        }
    `;

    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(css);
    } else {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // 2. スクリプトレットのロジック（属性操作）
    function applyAttributes() {
        // AdGuard: scriptlet("remove-attr", "hidden", "ytd-rich-item-renderer")
        // hidden属性を持つアイテムがあれば、その属性を削除して表示させる
        const hiddenItems = document.querySelectorAll('ytd-rich-item-renderer[hidden]');
        if (hiddenItems.length > 0) {
            for (const item of hiddenItems) {
                item.removeAttribute('hidden');
            }
        }

        // AdGuard: scriptlet("set-attr", "is-show-more-hidden", "", "ytd-rich-shelf-renderer")
        // シェルフ自体に is-show-more-hidden 属性を付与する（空文字を設定）
        // 既に設定済みの要素は除外して処理負荷を下げる
        const shelves = document.querySelectorAll('ytd-rich-shelf-renderer:not([is-show-more-hidden])');
        if (shelves.length > 0) {
            for (const shelf of shelves) {
                shelf.setAttribute('is-show-more-hidden', '');
            }
        }
    }

    // 3. 監視設定 (YouTubeはSPAで動的に要素が増えるため)
    const observer = new MutationObserver((mutations) => {
        // 変更があった場合のみ実行
        let shouldProcess = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0 || mutation.type === 'attributes') {
                shouldProcess = true;
                break;
            }
        }

        if (shouldProcess) {
            applyAttributes();
        }
    });

    // ページ読み込み完了時と監視開始
    window.addEventListener('load', () => {
        applyAttributes();
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true, // hidden属性が動的に付与される可能性も考慮
            attributeFilter: ['hidden']
        });
    });

    // 即時実行（DOM構築中にも適用するため）
    applyAttributes();

})();