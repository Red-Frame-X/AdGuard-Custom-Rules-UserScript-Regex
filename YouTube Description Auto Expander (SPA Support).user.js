// ==UserScript==
// @name         YouTube Description Auto Expander (SPA Support)
// @namespace    http://tampermonkey.net/
// @license      CC0 (Public Domain)
// @version      1.1
// @description  YouTubeの動画概要欄を自動で展開します（MutationObserver対応版）
// @author       Red Frame X
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/Red-Frame-X/AdGuard-Custom-Rules-UserScript-Regex/raw/refs/heads/main/YouTube%20Description%20Auto%20Expander%20(SPA%20Support).user.js
// @downloadURL  https://github.com/Red-Frame-X/AdGuard-Custom-Rules-UserScript-Regex/raw/refs/heads/main/YouTube%20Description%20Auto%20Expander%20(SPA%20Support).user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /**
     * 概要欄を展開するメイン処理
     */
    function tryExpandDescription() {
        // 1. 親コンテナを取得（展開状態を管理している要素）
        const expander = document.querySelector('ytd-text-inline-expander');

        // 親コンテナが見つからない、または既に展開済み(is-expanded属性がある)なら何もしない
        if (!expander || expander.hasAttribute('is-expanded')) {
            return;
        }

        // 2. 展開ボタンを探す
        // 提供されたHTMLに基づき ID: expand をターゲットにする
        const button = expander.querySelector('#expand');

        // ボタンが存在し、表示されている(hidden属性がない)場合にクリック
        if (button && !button.hidden && button.offsetParent !== null) {
            button.click();
            // console.log('Description Expanded via UserScript'); // デバッグ用
        }
    }

    /**
     * ページ監視用オブザーバーの設定
     * YouTubeはSPAであり、DOMが動的に書き換わるためMutationObserverが最適です
     */
    const observer = new MutationObserver((mutations) => {
        // 負荷軽減のため、ytd-text-inline-expander 関連の変化があった場合のみ実行
        for (const mutation of mutations) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                // 変更があった要素の中に概要欄が含まれているか、または属性変化かを簡易チェック
                const target = mutation.target;
                if (target instanceof Element &&
                   (target.tagName === 'YTD-TEXT-INLINE-EXPANDER' ||
                    target.querySelector?.('ytd-text-inline-expander'))) {
                    tryExpandDescription();
                    break; // 1回の変更検知で十分なのでループを抜ける
                }
            }
        }
    });

    /**
     * オブザーバーの開始処理
     * ytd-app (YouTubeのメインアプリケーションコンテナ) を監視対象とする
     */
    function startObserver() {
        const app = document.querySelector('ytd-app');
        if (app) {
            observer.observe(app, {
                childList: true,
                subtree: true,
                attributes: true, // is-expanded 属性の変化も監視対象に含める可能性を考慮
                attributeFilter: ['hidden', 'is-expanded'] // 監視する属性を限定して軽量化
            });
            // 初回実行（既にロード済みの場合に対応）
            tryExpandDescription();
        } else {
            // ytd-appがまだない場合は少し待って再試行
            setTimeout(startObserver, 500);
        }
    }

    // 実行開始
    startObserver();

    // 念のためのナビゲーション完了イベントフック（オブザーバーの補助）
    document.addEventListener('yt-navigate-finish', () => {
        setTimeout(tryExpandDescription, 500);
    });

})();
