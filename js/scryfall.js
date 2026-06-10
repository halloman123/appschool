/* =======================================================
   scryfall.js - koppeling met de Scryfall API
   ======================================================= */

const SCRYFALL_BASIS = "https://api.scryfall.com";

async function zoekKaarten(zoekterm) {
  if (!zoekterm || zoekterm.trim().length < 2) {
    return [];
  }
  /* Filters in de zoekopdracht:
     - "-is:promo"   : geen promotionele versies
     - "-is:digital" : geen Arena-exclusieve / Alchemy-versies
                       (die hebben geen euro-prijs en zijn niet op papier) */
  const url = SCRYFALL_BASIS + "/cards/search?q=" +
              encodeURIComponent(zoekterm + " -is:promo -is:digital") +
              "&order=name&unique=prints";
  const reactie = await fetch(url);
  if (reactie.status === 404) return [];
  if (!reactie.ok) throw new Error("Scryfall gaf status " + reactie.status);
  const data = await reactie.json();
  return (data.data || []).slice(0, 10).map(maakKaartObject);
}

async function haalKaartOp(kaartnaam) {
  const url = SCRYFALL_BASIS + "/cards/named?exact=" + encodeURIComponent(kaartnaam);
  const reactie = await fetch(url);
  if (!reactie.ok) throw new Error("Kaart niet gevonden (status " + reactie.status + ")");
  return maakKaartObject(await reactie.json());
}

function maakKaartObject(kaart) {
  const beelden = kaart.image_uris ||
                  (kaart.card_faces && kaart.card_faces[0] && kaart.card_faces[0].image_uris) ||
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

function leesPrijs(prijzen) {
  const eur = parseFloat(prijzen.eur);
  if (!isNaN(eur)) return eur;
  const usd = parseFloat(prijzen.usd);
  if (!isNaN(usd)) return Math.round(usd * 0.92 * 100) / 100;
  return 0;
}
