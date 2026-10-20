/**
 * nl-wallet-toelichting.js
 *
 * Toelichting bij "Inloggen met een wallet" op /inloggen/zakelijk/, voor presentaties. Markup:
 * _includes/nl-wallet-toelichting.njk. Naar het voorbeeld van de presentatiemodus van bg.rijks.app:
 * een blauw paneel links, de pagina schuift op (html.toelichting-open).
 *
 *   - Shift+P toont of verbergt het paneel (niet tijdens typen in een veld).
 *   - Esc sluit het paneel. Is het paneel open, dan vangt dit script Esc af, zodat het venster van
 *     NL Wallet niet tegelijk vraagt of u wilt stoppen.
 *   - ?toelichting=1 opent het paneel direct.
 *
 * Het venster van NL Wallet (position: fixed in de shadow DOM) blijft zo rechts van het paneel: de CSS
 * maakt [data-nl-wallet-knoppen] dan het referentievlak. De links voor een bevoegdheid in het paneel
 * klikken de onzichtbare links van nl-wallet-inloggen.js aan (die bouwt ze uit /api/nl-wallet/config).
 */

(function () {
	"use strict";

	var KLASSE = "toelichting-open";
	var paneel;
	var vorigeFocus = null;

	function isOpen() {
		return !paneel.hidden;
	}

	// Per onderneming een link die de onzichtbare link van nl-wallet-inloggen.js aanklikt.
	function bouwBevoegdheidLinks() {
		var plek = paneel.querySelector("[data-toelichting-bevoegdheden]");
		var bron = document.querySelectorAll("[data-nl-wallet-bevoegdheid-toevoegen]");
		if (!plek || bron.length === 0) return;
		plek.textContent = "";
		bron.forEach(function (origineel, i) {
			if (i > 0) plek.appendChild(document.createTextNode(i === bron.length - 1 ? " of " : ", "));
			var link = document.createElement("a");
			link.href = "#";
			link.textContent = origineel.textContent;
			link.addEventListener("click", function (e) {
				e.preventDefault();
				origineel.click();
			});
			plek.appendChild(link);
		});
		plek.appendChild(document.createTextNode("."));
	}

	function open() {
		if (isOpen()) return;
		bouwBevoegdheidLinks();
		vorigeFocus = document.activeElement;
		paneel.hidden = false;
		document.documentElement.classList.add(KLASSE);
		paneel.focus({ preventScroll: true });
	}

	function sluit() {
		if (!isOpen()) return;
		paneel.hidden = true;
		document.documentElement.classList.remove(KLASSE);
		if (vorigeFocus && vorigeFocus.isConnected && typeof vorigeFocus.focus === "function") vorigeFocus.focus();
		vorigeFocus = null;
	}

	function typtInVeld(e) {
		var el = e.composedPath ? e.composedPath()[0] : e.target;
		return !!(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)));
	}

	document.addEventListener("DOMContentLoaded", function () {
		paneel = document.querySelector("[data-toelichting]");
		if (!paneel) return;

		// Direct onder <body>, net als de overlay van NL Wallet: vrij van voorouders met container-type.
		document.body.appendChild(paneel);

		paneel.querySelector("[data-toelichting-sluit]").addEventListener("click", sluit);

		// Die links komen pas binnen na /api/nl-wallet/config; bouw ze dan opnieuw.
		var bronLinks = document.querySelector("[data-nl-wallet-bevoegdheid-links]");
		if (bronLinks) new MutationObserver(bouwBevoegdheidLinks).observe(bronLinks, { childList: true });

		// Capture op window: vóór wallet_web, dat zelf ook naar Esc luistert.
		window.addEventListener(
			"keydown",
			function (e) {
				if (e.key === "Escape" && isOpen()) {
					e.preventDefault();
					e.stopImmediatePropagation();
					sluit();
					return;
				}
				if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "P" || e.key === "p") && !typtInVeld(e)) {
					e.preventDefault();
					if (isOpen()) sluit();
					else open();
				}
			},
			true
		);

		if (new URLSearchParams(window.location.search).get("toelichting") === "1") open();
	});
})();
