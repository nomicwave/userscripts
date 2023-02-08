// ==UserScript==
// @name         Facebook - Show Most Recent Posts by Default
// @namespace    https://greasyfork.org/users/222319
// @version      1.0.3
// @description  Forces the news feed to show 'most recent' posts by default.
// @author       Nomicwave <nomicwave@gmail.com>
// @license      MIT License <https://opensource.org/licenses/MIT>
// @match        *.facebook.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=facebook.com
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    var url_string = window.location.href;
    var url = new URL(url_string);
    var sk = url.searchParams.get("sk");

    if (sk !== "h_chr") {
        var p = (/(?<=\?).+/).exec(url_string);
        var params = p ? p.toString().replace(/sk=.*?(&|$)/, "") : "";
        params = params.concat(params ? params.match(/&$/) ? "sk=h_chr" : "&sk=h_chr" : "sk=h_chr");
        window.location.replace(("https://www.facebook.com/?").concat(params));
    }
})();