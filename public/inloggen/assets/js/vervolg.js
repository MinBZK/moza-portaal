/**
 * vervolg.js
 *
 * Geen onderdeel van de DigiD-assets, maar een toevoeging van dit prototype.
 *
 * De DigiD-schermen eindigen standaard in /moza/. De MOZa-landingspagina op
 * /mox/ heeft een eigen portaal, dus die stuurt ?vervolg=<pad> mee. Dit script
 * draagt die parameter door de flow heen en stuurt de gebruiker aan het eind
 * naar dat pad.
 *
 * Zonder parameter verandert er niets: de bestaande flow blijft intact.
 */

(function () {
	"use strict";

	// moza-portaal: zonder parameter naar de portaal-home met de standaard-
	// persona, net als de knop "Inloggen met DigiD" op de landingspagina.
	var vervolg = new URLSearchParams(window.location.search).get("vervolg") || "/?persona=1111";

	// Alleen een pad binnen deze site. Een absolute URL of een protocol-relatief
	// "//host" pad zou de gebruiker naar een vreemde site kunnen sturen.
	//
	// Kijken naar de eerste twee tekens is niet genoeg: een browser leest "\" als
	// "/" en slaat tabs en regeleinden over, dus "/\host" en "/<tab>/host" komen
	// allebei uit op "//host". Daarom weigeren we die tekens en vragen we de
	// browser zelf waar het pad uitkomt. Zelfde regel als nl-wallet-inloggen.js.
	function veiligPad(pad) {
		if (typeof pad !== "string" || pad.charAt(0) !== "/" || pad.charAt(1) === "/") return null;
		if (/[\\\u0000-\u001f\u007f]/.test(pad)) return null;
		try {
			return new URL(pad, window.location.origin).origin === window.location.origin ? pad : null;
		} catch (e) {
			return null;
		}
	}

	vervolg = veiligPad(vervolg);
	if (!vervolg) return;

	document.addEventListener("DOMContentLoaded", function () {
		// Tussenstap: de parameter meegeven aan het volgende scherm.
		document.querySelectorAll('a.authentication[href^="/inloggen/"]').forEach(function (link) {
			link.href = link.getAttribute("href") + "?vervolg=" + encodeURIComponent(vervolg);
		});

		// Laatste stap. Niet via form.action, want dit is een GET-formulier en
		// dan komt de gebruiker met een sliert querystring in het portaal aan.
		var form = document.querySelector("form.app_verification");
		if (!form) return;
		form.addEventListener("submit", function (e) {
			e.preventDefault();
			window.location.href = vervolg;
		});
	});
})();
