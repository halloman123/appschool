/* =======================================================
   scryfall.js - koppeling met de Scryfall API
   Documentatie: https://scryfall.com/docs/api
   Twee functies:
     zoekKaartnamen()  -> lijst met kaartnamen (autocomplete)
     haalKaartOp()     -> gegevens van een specifieke kaart
   ======================================================= */

const SCRYFALL_BASIS = "https://api.scryfall.com";

/* ---------------------------------------------------------
   zoekKaartnamen(zoekterm)
   Vraagt de Scryfall-autocomplete om maximaal 20 kaartnamen
   die op de zoekterm lijken. Geeft een array van strings terug.
   --------------------------------------------------------- */
async function zoekKaartnamen(zoekterm) {
  if (!zoekterm || zoekterm.trim().length < 2) {
    return [];
  }

  const url = SCRYFALL_BASIS + "/cards/autocomplete?q=" + encodeURIComponent(zoekterm);
  const reactie = await fetch(url);

  if (!reactie.ok) {
    throw new Error("Scryfall autocomplete gaf status " + reactie.status);
  }

  const data = await reactie.json();
  return data.data || [];
}

/* ---------------------------------------------------------
   haalKaartOp(kaartnaam)
   Haalt een exacte kaart op en vormt het antwoord om tot
   een eenvoudig object dat de app gebruikt:
     { naam, afbeelding, kleuren }
   --------------------------------------------------------- */
async function haalKaartOp(kaartnaam) {
  const url = SCRYFALL_BASIS + "/cards/named?exact=" + encodeURIComponent(kaartnaam);
  const reactie = await fetch(url);

  if (!reactie.ok) {
    throw new Error("Kaart niet gevonden op Scryfall (status " + reactie.status + ")");
  }

  const kaart = await reactie.json();
  return {
    naam: kaart.name,
    afbeelding: kiesAfbeelding(kaart),
    kleuren: kaart.color_identity || []
  };
}

/* ---------------------------------------------------------
   kiesAfbeelding(kaart) - hulpfunctie
   Sommige kaarten hebben twee kanten; dan staan de
   afbeeldingen in card_faces. Deze functie kiest altijd
   een bruikbare afbeelding (de "art_crop": alleen de art).
   --------------------------------------------------------- */
function kiesAfbeelding(kaart) {
  if (kaart.image_uris && kaart.image_uris.art_crop) {
    return kaart.image_uris.art_crop;
  }
  if (kaart.card_faces && kaart.card_faces[0] && kaart.card_faces[0].image_uris) {
    return kaart.card_faces[0].image_uris.art_crop;
  }
  return ""; /* geen afbeelding beschikbaar */
}
