/**
 * nl-wallet-inloggen.js
 *
 * Inloggen met NL Wallet vanaf de inlogkeuze (/inloggen/zakelijk/) en de terugkeer na een
 * sessie op dezelfde telefoon (/inloggen/nl-wallet/terug/). Markup: _includes/nl-wallet-inloggen.njk.
 *
 * Een klik op [data-nl-wallet-inloggen] (de kaart "Inloggen met een wallet") opent direct het
 * venster van NL Wallet met de QR-code. De knoppen van NL Wallet zelf
 * (assets/javascript/vendor/nl-wallet-web.iife.js) staan onzichtbaar op de pagina; dit script
 * klikt ze aan. Boven het venster voor een bevoegdheid staat in de grijze overlay een titel, want beide
 * vensters zien er hetzelfde uit. Per onderneming bouwt dit script uit /api/nl-wallet/config een
 * onzichtbare link om de bevoegdheid (demo-attestatie van KVK Demo) in de wallet te zetten; de
 * toelichting (Shift+P, nl-wallet-toelichting.js) toont ze, samen met de installatie van NL Wallet MOZa
 * met de testpersoon Karin Jansen. Het venster voor een bevoegdheid werkt met vaste
 * links en kan niet zien wanneer de uitgifte klaar is (wallet_web meldt daar alleen "close"); onder
 * dat venster staat daarom een link terug naar inloggen, en sluiten opent het inlogvenster ook weer.
 *
 * Met ?onderneming=toevoegen (vanuit "Mijn ondernemingen" in het portaal) opent het venster direct,
 * om de bevoegdheid voor nog een onderneming te delen. Die moet van dezelfde persoon zijn.
 *
 * Na het inloggen bewaart dit script de naam in sessionStorage onder "inlog:persoon", en onder
 * "inlog:ondernemingen" de bevoegdheden die in deze sessie gedeeld zijn (nl-wallet-portaal.js toont ze);
 * personas.js toont die naam in plaats van die van de persona. De persona is het bedrijf:
 * heeft precies één persona het KVK-nummer uit de bevoegdheid, dan gaat de gebruiker door
 * naar die persona. In moza-portaal kiest de server de persona (zie api/nl-wallet).
 *
 * Afloopwegen bij het inloggen:
 *   - Andere telefoon (cross_device): dit script volgt de sessie via /api/nl-wallet/sessie
 *     (de server kent het token uit een cookie). Is die gelukt, dan gaat de gebruiker direct
 *     door. De knop zelf meldt "success" pas als het venster gesloten wordt; dat blijft een
 *     tweede weg naar hetzelfde doel.
 *   - Zelfde telefoon (same_device): de app stuurt de browser naar de terugkeerpagina
 *     met ?session_token=…&nonce=…; zonder die nonce geeft de server niets vrij.
 */

(function () {
	"use strict";

	var INLOG_KEY = "inlog:persoon";
	var ONDERNEMINGEN_KEY = "inlog:ondernemingen";
	var VERVOLG_KEY = "inlog:vervolg";
	// moza-portaal: de server zet na het inloggen zelf de persona (cookie), dus door naar de home.
	var STANDAARD_VERVOLG = "/";
	var VOLG_INTERVAL_MS = 2000;
	var VOLG_MAXIMUM_MS = 5 * 60 * 1000;
	var doorgestuurd = false;
	var toevoegen = false;
	var volgt = false;

	// Alleen een pad binnen deze site, zelfde regel als vervolg.js.
	//
	// Kijken naar de eerste twee tekens is niet genoeg: een browser leest "\" als "/" en slaat tabs en
	// regeleinden over, dus "/\host" en "/<tab>/host" komen allebei uit op "//host", een andere site.
	// Daarom weigeren we die tekens en vragen we de browser zelf waar het pad uitkomt.
	function veiligPad(pad) {
		if (typeof pad !== "string" || pad.charAt(0) !== "/" || pad.charAt(1) === "/") return null;
		if (/[\\\u0000-\u001f\u007f]/.test(pad)) return null;
		try {
			return new URL(pad, window.location.origin).origin === window.location.origin ? pad : null;
		} catch (e) {
			return null;
		}
	}

	function opslag(actie) {
		try {
			return actie(sessionStorage);
		} catch (e) {
			return null;
		}
	}

	function vervolg() {
		return (
			veiligPad(
				opslag(function (s) {
					return s.getItem(VERVOLG_KEY);
				})
			) || STANDAARD_VERVOLG
		);
	}

	function haalJson(url) {
		return fetch(url, { headers: { Accept: "application/json" } }).then(function (antwoord) {
			if (!antwoord.ok) throw new Error("HTTP " + antwoord.status);
			return antwoord.json();
		});
	}

	// De persona met precies het KVK-nummer uit de bevoegdheid, of null.
	function personaVan(gegevens) {
		var kvkNummer = gegevens.bevoegdheid && gegevens.bevoegdheid.kvkNummer;
		if (!kvkNummer) return null;
		var gevonden = (window.personasData || []).filter(function (persona) {
			return persona.bedrijf && persona.bedrijf.kvkNummer === kvkNummer;
		});
		return gevonden.length === 1 ? gevonden[0] : null;
	}

	function doelVoor(gegevens) {
		var pad = vervolg();
		var persona = personaVan(gegevens);
		if (!persona) return pad;
		return pad + (pad.indexOf("?") === -1 ? "?" : "&") + "persona=" + encodeURIComponent(persona.label || persona.id);
	}

	function toon(selector, groep) {
		groep = groep || "data-nl-wallet-status";
		document.querySelectorAll("[" + groep + "]").forEach(function (el) {
			el.hidden = !el.matches(selector);
		});
	}

	function vul(selector, tekst) {
		document.querySelectorAll(selector).forEach(function (el) {
			el.textContent = tekst;
		});
	}

	function leesJson(sleutel) {
		try {
			return JSON.parse(
				opslag(function (s) {
					return s.getItem(sleutel);
				})
			);
		} catch (e) {
			return null;
		}
	}

	function verwerk(gegevens) {
		// Toevoegen mag alleen voor wie al ingelogd is: een bevoegdheid uit iemand anders wallet hoort
		// niet bij deze sessie.
		var ingelogd = leesJson(INLOG_KEY);
		if (toevoegen && ingelogd && (ingelogd.voornaam !== gegevens.voornaam || ingelogd.achternaam !== gegevens.achternaam)) {
			toon("[data-nl-wallet-status='andere-persoon']");
			return null;
		}

		var ondernemingen = toevoegen ? leesJson(ONDERNEMINGEN_KEY) || [] : [];
		var b = gegevens.bevoegdheid;
		if (
			b &&
			!ondernemingen.some(function (o) {
				return o.kvkNummer === b.kvkNummer;
			})
		) {
			ondernemingen.push({ kvkNummer: b.kvkNummer, handelsnaam: b.handelsnaam, functie: b.functie });
		}
		opslag(function (s) {
			s.setItem(INLOG_KEY, JSON.stringify({ voornaam: gegevens.voornaam, achternaam: gegevens.achternaam, middel: "NL Wallet" }));
			s.setItem(ONDERNEMINGEN_KEY, JSON.stringify(ondernemingen));
		});
		vul("[data-nl-wallet-naam]", gegevens.voornaam + " " + gegevens.achternaam);
		vul("[data-nl-wallet-onderneming]", gegevens.bevoegdheid ? gegevens.bevoegdheid.handelsnaam : "");
		var doel = doelVoor(gegevens);
		document.querySelectorAll("[data-nl-wallet-vervolg]").forEach(function (el) {
			el.href = doel;
		});
		toon("[data-nl-wallet-status='ingelogd']");
		return doel;
	}

	function gaNaar(doel) {
		if (!doel || doorgestuurd) return;
		doorgestuurd = true;
		window.location.assign(doel);
	}

	function inloggen(token, nonce) {
		toon("[data-nl-wallet-status='bezig']");
		var url = "/api/nl-wallet/sessies/" + encodeURIComponent(token) + "/gegevens" + (nonce ? "?nonce=" + encodeURIComponent(nonce) : "");
		return haalJson(url)
			.then(verwerk)
			.catch(function (e) {
				console.error("[NL Wallet] Inloggen mislukt.", e);
				toon("[data-nl-wallet-status='mislukt']");
				return null;
			});
	}

	// Volgt de lopende sessie tot die klaar is. Het venster van NL Wallet mag daarbij open blijven.
	function volgSessie() {
		if (volgt) return;
		volgt = true;
		var gestart = Date.now();
		function stop() {
			volgt = false;
		}
		function tik() {
			if (doorgestuurd || Date.now() - gestart > VOLG_MAXIMUM_MS) return stop();
			haalJson("/api/nl-wallet/sessie")
				.catch(function () {
					return {};
				})
				.then(function (sessie) {
					if (sessie.status === "DONE" && sessie.gegevens) {
						stop();
						return gaNaar(verwerk(sessie.gegevens));
					}
					if (["FAILED", "CANCELLED", "EXPIRED"].indexOf(sessie.status) !== -1) return stop();
					setTimeout(tik, VOLG_INTERVAL_MS);
				});
		}
		setTimeout(tik, VOLG_INTERVAL_MS);
	}

	// -- Onzichtbare knoppen van NL Wallet --------------------------------------------------------

	var plek = null;
	var loginKnop = null;
	var bevoegdheidKnop = null;
	var ondernemingen = null;

	// Een knop van NL Wallet, onzichtbaar; alleen het venster dat hij opent is te zien.
	function maakKnop(attributen) {
		var knop = document.createElement("nl-wallet-button");
		knop.className = "nl-wallet-onzichtbaar";
		knop.setAttribute("lang", "nl");
		Object.keys(attributen).forEach(function (naam) {
			knop.setAttribute(naam, attributen[naam]);
		});
		plek.appendChild(knop);
		return knop;
	}

	// Probeert iets tot het lukt, hoogstens een paar seconden lang: de knop van NL Wallet bouwt zijn
	// shadow DOM pas op als de custom element geregistreerd en aan de pagina gehangen is.
	function probeer(poging) {
		var pogingen = 0;
		(function volgende() {
			if (poging() || ++pogingen > 150) return;
			setTimeout(volgende, 20);
		})();
	}

	// Klik de knop in de shadow DOM aan zodra de custom element klaar is.
	function open(knop) {
		if (!window.customElements) return;
		window.customElements.whenDefined("nl-wallet-button").then(function () {
			probeer(function () {
				var binnen = knop.shadowRoot && knop.shadowRoot.querySelector("[part='button']");
				if (binnen) binnen.click();
				return !!binnen;
			});
		});
	}

	// Een knop weghalen sluit zijn venster, zonder de vraag "Wilt u stoppen?".
	function verwijder(knop) {
		if (knop && knop.parentNode) knop.parentNode.removeChild(knop);
		return null;
	}

	function verbergOverlay() {
		document.querySelectorAll("[data-nl-wallet-overlay]").forEach(function (el) {
			el.hidden = true;
		});
	}

	// De titel boven en de link onder het venster horen bij één venster en zijn er alleen zolang dat open
	// is. Sluit de gebruiker het venster zelf (de knop staat er dan nog), dan volgt bijSluiten.
	function volgVenster(knop, soort, bijSluiten) {
		var overlay = document.querySelectorAll("[data-nl-wallet-overlay='" + soort + "']");
		var wasOpen = false;
		function werkBij() {
			var isOpen = !!(knop.isConnected && knop.shadowRoot && knop.shadowRoot.querySelector(".modal-anchor"));
			overlay.forEach(function (el) {
				el.hidden = !isOpen;
			});
			if (wasOpen && !isOpen && knop.isConnected && bijSluiten) bijSluiten();
			wasOpen = isOpen;
		}
		probeer(function () {
			if (!knop.isConnected || !knop.shadowRoot) return !knop.isConnected;
			new MutationObserver(werkBij).observe(knop.shadowRoot, { childList: true, subtree: true });
			werkBij();
			return true;
		});
	}

	function openInloggen() {
		verbergOverlay();
		bevoegdheidKnop = verwijder(bevoegdheidKnop);
		loginKnop = verwijder(loginKnop);
		loginKnop = maakKnop({ usecase: "moza_inloggen", "start-url": "/api/nl-wallet/sessies", text: "Inloggen met NL Wallet" });
		loginKnop.addEventListener("success", function (e) {
			var sessieToken = e.detail && e.detail[0];
			if (!sessieToken || doorgestuurd) return;
			inloggen(sessieToken, null).then(gaNaar);
		});
		loginKnop.addEventListener("failed", function () {
			toon("[data-nl-wallet-status='mislukt']");
		});
		volgVenster(loginKnop, "inloggen");
		open(loginKnop);
		volgSessie();
	}

	function openBevoegdheid(onderneming) {
		verbergOverlay();
		loginKnop = verwijder(loginKnop);
		bevoegdheidKnop = verwijder(bevoegdheidKnop);
		vul("[data-nl-wallet-titel-onderneming]", onderneming.handelsnaam);
		bevoegdheidKnop = maakKnop({ text: "Voeg toe aan NL Wallet", "same-device-ul": onderneming.same_device_ul, "cross-device-ul": onderneming.cross_device_ul });
		// Sluiten betekent hier: klaar met toevoegen (of afgezien). Terug naar inloggen.
		volgVenster(bevoegdheidKnop, "bevoegdheid", openInloggen);
		open(bevoegdheidKnop);
	}

	// Per onderneming een (onzichtbare) link; de toelichting klikt die aan.
	function bouwBevoegdheidLinks(config) {
		ondernemingen = (config && config.bevoegdheden) || [];
		var plekLinks = document.querySelector("[data-nl-wallet-bevoegdheid-links]");
		if (!plekLinks) return;
		plekLinks.textContent = "";
		ondernemingen.forEach(function (onderneming, i) {
			if (i > 0) plekLinks.appendChild(document.createTextNode(i === ondernemingen.length - 1 ? " of " : ", "));
			var link = document.createElement("a");
			link.href = "#";
			link.textContent = onderneming.handelsnaam;
			link.setAttribute("data-nl-wallet-bevoegdheid-toevoegen", onderneming.id);
			link.addEventListener("click", function (e) {
				e.preventDefault();
				// De links op het moment van klikken: een pagina die al een tijd openstaat kan links
				// hebben met een certificaat dat inmiddels vervangen is.
				haalJson("/api/nl-wallet/config")
					.then(function (vers) {
						return (
							(vers.bevoegdheden || []).filter(function (o) {
								return o.id === onderneming.id;
							})[0] || onderneming
						);
					})
					.catch(function () {
						return onderneming;
					})
					.then(openBevoegdheid);
			});
			plekLinks.appendChild(link);
		});
	}

	document.addEventListener("DOMContentLoaded", function () {
		var params = new URLSearchParams(window.location.search);

		// Terugkeer op dezelfde telefoon.
		if (document.querySelector("[data-nl-wallet-terug]")) {
			var token = params.get("session_token");
			if (!token) return toon("[data-nl-wallet-status='mislukt']");
			inloggen(token, params.get("nonce")).then(function (doel) {
				if (doel) window.location.replace(doel);
			});
			return;
		}

		plek = document.querySelector("[data-nl-wallet-knoppen]");
		var kaart = document.querySelector("[data-nl-wallet-inloggen]");
		if (!plek || !kaart) return;

		// Het venster en de link erin zijn position: fixed. Een voorouder met container-type (zoals op
		// de inlogpagina) wordt dan hun referentie en het venster beslaat maar een deel van het scherm.
		// Direct onder <body> hebben ze het hele scherm.
		document.body.appendChild(plek);
		document.querySelectorAll("[data-nl-wallet-overlay]").forEach(function (el) {
			document.body.appendChild(el);
		});

		toevoegen = params.get("onderneming") === "toevoegen";

		var gevraagd = veiligPad(params.get("vervolg"));
		opslag(function (s) {
			if (gevraagd) s.setItem(VERVOLG_KEY, gevraagd);
			else s.removeItem(VERVOLG_KEY);
		});

		kaart.addEventListener("click", function (e) {
			e.preventDefault();
			// Een nieuwe inlogpoging begint zonder de naam en ondernemingen van een vorige; toevoegen
			// houdt ze juist.
			if (!toevoegen) {
				opslag(function (s) {
					s.removeItem(INLOG_KEY);
					s.removeItem(ONDERNEMINGEN_KEY);
				});
			}
			openInloggen();
		});

		haalJson("/api/nl-wallet/config")
			.then(bouwBevoegdheidLinks)
			.catch(function () {
				bouwBevoegdheidLinks(null);
			});

		// Vanuit "Mijn ondernemingen": direct het venster, zonder eerst de kaart te kiezen.
		if (toevoegen) openInloggen();
		document.querySelectorAll("[data-nl-wallet-naar-inloggen]").forEach(function (link) {
			link.addEventListener("click", function (e) {
				e.preventDefault();
				openInloggen();
			});
		});
	});
})();
