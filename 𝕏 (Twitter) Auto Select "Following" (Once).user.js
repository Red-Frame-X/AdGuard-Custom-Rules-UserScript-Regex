// ==UserScript==
// @name         𝕏 (Twitter) Auto Select "Following" (Once)
// @namespace    http://tampermonkey.net/
// @license      CC0 (Public Domain)
// @version      1.3
// @description  x.comのホーム画面アクセス時に、1回だけ「フォロー中」タブを自動クリックし、その後スクリプトを停止します
// @author       Red Frame X
// @match        https://x.com/*
// @match        https://twitter.com/*
// @updateURL    https://gist.githubusercontent.com/Red-Frame-X/b4f34da8569e2005e4dc67c1f1e22221/raw/%25F0%259D%2595%258F%2520(Twitter)%2520Auto%2520Select%2520%2522Following%2522%2520(Once).user.js
// @downloadURL  https://gist.githubusercontent.com/Red-Frame-X/b4f34da8569e2005e4dc67c1f1e22221/raw/%25F0%259D%2595%258F%2520(Twitter)%2520Auto%2520Select%2520%2522Following%2522%2520(Once).user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==



(function() {
    'use strict';

    const TARGET_TAB_TEXT = "フォロー中";
    let hasClicked = false; // 実行済みかどうかのフラグ

    /**
     * 「フォロー中」タブを探してクリックする関数
     */
    function clickFollowingTab() {
        // すでに実行済みなら何もしない
        if (hasClicked) return;

        // 現在のURLがホームでない場合は処理しない
        if (location.pathname !== '/home') return;

        const tabs = document.querySelectorAll('div[role="tab"]');

        for (const tab of tabs) {
            // タブ内のテキストに「フォロー中」が含まれているか確認
            if (tab.textContent.includes(TARGET_TAB_TEXT)) {

                // すでに選択されているかチェック
                const isSelected = tab.getAttribute('aria-selected') === 'true';

                if (!isSelected) {
                    tab.click();
                    // console.log(`[AutoSelect] "${TARGET_TAB_TEXT}" タブに切り替えました。`);
                }

                // 【変更点】
                // 処理が完了したらフラグを立て、監視（Observer）を停止してスクリプトを終了させる
                hasClicked = true;
                if (observer) {
                    observer.disconnect();
                    // console.log("[AutoSelect] 処理が完了したため監視を停止しました。");
                }
                return;
            }
        }
    }

    /**
     * DOMの変更を監視
     */
    const observer = new MutationObserver((mutations) => {
        clickFollowingTab();
    });

    // 監視の開始
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // 初期実行
    clickFollowingTab();

})();
