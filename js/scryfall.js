/* =======================================================
   scryfall.js - koppeling met de Scryfall API
   Documentatie: https://scryfall.com/docs/api
   Functies:
     zoekKaarten()  -> lijst met kaarten (incl. afbeelding/prijs/rarity)
     haalKaartOp()  -> gegevens van een specifieke kaart (op naam)
   ======================================================= */

const SCRYFALL_BASIS = "https://api.scryfall.com";

/* ---------------------------------------------------------
   zoekKaarten(zoekterm)
   Zoekt kaarten via Scryfall en geeft een lijst objecten
   terug met naam, mini-afbeelding (thumb), kaartafbeelding,
   kleuren, rarity, prijs in euro en set-informatie.
   --------------------------------------------------------- */
async function zoekKaarten(zoekterm) {
  if (!zoekterm || zoekterm.trim().length < 2) {
    return [];
  }
  /* "-is:promo" sluit promo-versies uit.
     "unique=prints" geeft een aparte regel per pak waar de kaart in zit,
     zodat je dezelfde kaart uit verschillende sets kunt kiezen. */
  const url = SCRYFALL_BASIS + "/cards/search?q=" +
              encodeURIComponent(zoekterm + " -is:promo") +
              "&order=name&unique=prints";
  const reactie = await fetch(url);
  if (reactie.status === 404) {
    return [];
  }
  if (!reactie.ok) {
    throw new Error("Scryfall zoeken gaf status " + reactie.status);
  }
  const data = await reactie.json();
  return (data.data || []).slice(0, 10).map(maakKaartObject);
}

/* ---------------------------------------------------------
   haalKaartOp(kaartnaam) - exacte kaart op naam ophalen.
   --------------------------------------------------------- */
async function haalKaartOp(kaartnaam) {
  const url = SCRYFALL_BASIS + "/cards/named?exact=" + encodeURIComponent(kaartnaam);
  const reactie = await fetch(url);
  if (!reactie.ok) {
    throw new Error("Kaart niet gevonden op Scryfall (status " + reactie.status + ")");
  }
  const kaart = await reactie.json();
  return maakKaartObject(kaart);
}

/* ---------------------------------------------------------
   maakKaartObject(kaart) - hulpfunctie die een ruw Scryfall-
   antwoord omzet naar het object dat de app gebruikt.
   Houdt rekening met dubbelzijdige kaarten en ontbrekende prijzen.
   --------------------------------------------------------- */
function maakKaartObject(kaart) {
  const beelden = kaart.image_uris ||
                  (kaart.card_faces &&
                   kaart.card_faces[0] &&
                   kaart.card_faces[0].image_uris) ||
                  {};
  const prijzen = kaart.prices || {};
  return {
    naam: kaart.name,
    thumb: beelden.small || beelden.art_crop || "",
    afbeelding: beelden.art_crop || beelden.normal || beelden.small || "",
    kleuren: kaart.color_identity || [],
    rarity: kaart.rarity || "common",
    prijs: leesPrijs(prijzen),
    set: kaart.set || "",
    setNaam: kaart.set_name || ""
  };
}

/* leesPrijs() - leest de prijs in euro; valt terug op 0 */
function leesPrijs(prijzen) {
  const eur = parseFloat(prijzen.eur);
  if (!isNaN(eur)) return eur;
  /* geen europrijs, wel dollar? ruwe omrekening */
  const usd = parseFloat(prijzen.usd);
  if (!isNaN(usd)) return Math.round(usd * 0.92 * 100) / 100;
  return 0;
}
