// ==UserScript==
// @name         FitGirl - Dark-Mode
// @namespace    https://greasyfork.org/users/222319
// @version      1.0.1
// @description  Dark mode and visual enhancements.
// @author       Nomicwave
// @license      MIT License <https://opensource.org/licenses/MIT>
// @match        https://fitgirl-repacks.site/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fitgirl-repacks.site
// @run-at       document-start
// ==/UserScript==

(function () {
    const cssText = `
	.site {
    	background-color: #000;
    }

	body, button, input, select, textarea {
    	color: #fff;
    }

	.wplp_outside {
    	background-color: #030603 !important;
    	border: 1px solid #478747 !important;
    }

	article.category-uncategorized > div:last-child > div:last-child {
    	background-color: #130014 !important;
    	border: 1px solid #f600ff !important;
    }

	.wpcu_block_title {
    	color: #d5d5d5;
    }

    .wplp_container .flex-direction-nav a:before {
    	color: #d5d5d5 !important;
    }

    .wplp_container .flex-direction-nav a {
    	text-shadow: none;
        filter: drop-shadow(0 0 .25rem #000) drop-shadow(0 0 1.25rem #000) drop-shadow(0 0 2.25rem #000);
    }

	.site-content [class^=entry-] {
    	background-color: #000;
    }

	article:not(.category-uncategorized) .entry-content ul li img {
    	filter: invert(100%) saturate(350%) hue-rotate(200deg) brightness(75%) contrast(110%);
    }

	.entry-title a {
    	color: #e9e9e9;
    }

	.cat-links a {
    	color: #e9e9e9;
    }

	.entry-meta a {
    	color: #f1f1f1;
    }

	.entry-content .su-spoiler-style-fancy {
    	border: 1px solid #252525;
    	background: #151515;
    }

	.entry-content .su-spoiler-style-fancy > .su-spoiler-title {
    	color: #f1f1f1;
    	background: #151515;
    	border-bottom: 1px solid #353535;
    }

	.entry-content .su-spoiler-style-fancy > .su-spoiler-content {
    	color: #d5d5d5;
    	background: #151515;
    }

	.paging-navigation a {
    	color: #d5d5d5;
    }

	.paging-navigation a:hover {
    	color: #24890d;
    	border-top: 2px solid #24890d;
    }

	.paging-navigation .page-numbers.current {
    	border: 2px solid #24890d;
    }

	.site {
    	max-width: unset;
    }

	.site-header {
    	max-width: unset;
    	box-shadow: 0px 0px 128px rgb(65 166 42 / 55%);
    }

	#secondary {
    	box-shadow: -8px -24px 16px rgb(65 166 42 / 55%);
    }

	#content article + style + div:has(table), #jBnskDj9 {
    	background-color: #0a130a;
    	border: 1px solid #478747;
        max-width: 800px;
        padding: 10px 30px 10px 15px;
    }

	#content article + style + div:has(table) table, #jBnskDj9 table {
    	margin-bottom: 0 !important;
    }

	#content article + style + div:has(table) img, #jBnskDj9 img {
    	border-radius: 3px;
    	border: 1px solid #2c532c;
    }

	#content article + style + div:has(table) table td:last-child, #jBnskDj9 table td:last-child {
    	display: inline-flex;
        width: auto;
        vertical-align: middle;
        justify-content: end;
        align-items: center;
        padding: 0 0 0 30px;
    }

	#content article + style + div:has(table) table td:nth-child(2), #jBnskDj9 table td:nth-child(2) {
        padding: 0 15px;
    }

	#content article + style + div:has(table) .donatebutton, #jBnskDj9 .donatebutton {
    	padding: 5px 15px !important;
        border-radius: 3px;
        flex: 1 0 auto;
    }

	.post-navigation a, .image-navigation a {
    	color: #f1f1f1;
    }

	.post-navigation .meta-nav {
    	color: #d5d5d5;
    }

	#comment-policy {
    	background-color: #0a130a;
    	border: 1px solid #478747;
    }

	#disqus_thread {
    	width: 862px !important;
    }

	.search-box {
        background: linear-gradient(0.25turn, transparent, #165308, #41a62a) !important;
    }

	.search-box .search-field {
        background: linear-gradient(0.25turn, #081e03, #0c2f05) !important;
        color: #d5d5d5;
        border-radius: 3px
    }

	.search-box .search-field::placeholder {
        color: #d5d5d5;
        opacity: .5;
    }

	.search-box .search-field::-webkit-search-cancel-button {
        -webkit-appearance: none;
        height: 1em;
        width: 1em;
        border-radius: 50em;
        background:
            linear-gradient(45deg, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 43%,#d5d5d5 45%,#d5d5d5 55%,rgba(0,0,0,0) 57%,rgba(0,0,0,0) 100%),
            linear-gradient(135deg, transparent 0%,transparent 43%,#d5d5d5 45%,#d5d5d5 55%,transparent 57%,transparent 100%);
        pointer-events: none;
        transition: transform .1s, opacity .1s;
        opacity: 0;
        transform: translateX(-50%) rotateY(-45deg);
    }

	.search-box .search-field:empty:focus::-webkit-search-cancel-button {
        cursor: pointer;
        pointer-events: all;
        opacity: 1;
        transform: translateX(0%) rotateY(0deg);
    }

	.hfeed .entry-content table {
        table-layout: fixed;
        width: 100%;
    	background-color: #030603;
    	border: 1px solid #478747;
        border-radius: 3px;
    }

	.hfeed .entry-content table:first-of-type tr:nth-of-type(3n + 2) {
    	background-color: #0a130a;
    }

	.hfeed .entry-content table:first-of-type tr:nth-of-type(3n + 1) {
    	background-color: #112011;
    }

	.hfeed .entry-content table:first-of-type tr:nth-of-type(3n + 1) td {
    	background-color: transparent !important;
    }

	.hfeed .entry-content table:last-of-type tr:nth-of-type(2n + 2) {
    	background-color: #0a130a;
    }

	.hfeed .entry-content table:last-of-type tr:nth-of-type(2n + 3) td {
        text-align: center;
    }

	.hfeed .entry-content table:last-of-type tr:nth-of-type(2n + 3) iframe {
        margin: 0;
    }

	.hfeed .entry-content table:last-of-type tr:nth-of-type(1) {
    	background-color: #112011;
    }`;

    let style = document.createElement('style');
    style.type = 'text/css';

    if (style.styleSheet) {
        style.styleSheet.cssText = cssText;
    } else {
        style.appendChild(document.createTextNode(cssText));
    }

    document.getElementsByTagName('body')[0].appendChild(style);
})();
