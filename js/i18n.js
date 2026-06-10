/* =======================================================
   i18n.js - vertalingen voor de taalswitch (NL / EN)
   ======================================================= */

const VERTALINGEN = {
  nl: {
    nav_overzicht: "Overzicht",
    nav_toevoegen: "Toevoegen",
    nav_vrienden: "Vrienden",
    nav_statistieken: "Stats",
    nav_over: "Over",

    overzicht_titel: "Mijn kaarten",
    label_bekijk: "Bekijk verzameling van",
    filter_alles: "Alles",
    filter_dag: "Dag",
    filter_week: "Week",
    filter_maand: "Maand",
    filter_rarity_label: "Rarity",
    filter_set_label: "Pak",
    filter_alle_rarity: "Alle rarities",
    filter_alle_sets: "Alle pakken",
    stat_kaarten: "Kaarten",
    stat_waarde: "Waarde",
    stat_topkleur: "Top kleur",
    leeg_melding: "Deze verzameling is nog leeg. Voeg een kaart toe!",
    rarity_label: "Rarity",

    toevoegen_titel: "Nieuwe kaart",
    label_eigenaar: "Voor wie?",
    label_datum: "Datum gekregen",
    label_kaart: "Zoek een kaart (via Scryfall)",
    label_omschrijving: "Notitie",
    ph_kaart: "Typ een kaartnaam...",
    ph_omschrijving: "Bijvoorbeeld: gekregen op verjaardag",
    knop_opslaan: "Kaart opslaan",
    fout_datum: "Kies een datum.",
    fout_kaart: "Kies een kaart uit de zoekresultaten.",
    fout_eigenaar: "Kies een vriend (eigenaar).",
    opslaan_ok: "Kaart opgeslagen!",
    auto_prijs: "Prijs (auto)",
    auto_rarity: "Rarity (auto)",

    vrienden_titel: "Vrienden",
    vrienden_uitleg: "Iedere vriend heeft zijn eigen verzameling. Tik op een naam om die verzameling te openen.",
    vrienden_nieuw_label: "Nieuwe vriend",
    vrienden_nieuw_ph: "Naam van vriend",
    vrienden_toevoegen: "Vriend toevoegen",
    vrienden_open: "Open verzameling",
    vrienden_kaarten: "kaarten",
    vrienden_verwijder_bevestig: "Wil je deze vriend en alle bijbehorende kaarten echt verwijderen?",
    kaart_verwijder_bevestig: "Weet je zeker dat je deze kaart wilt verwijderen?",
    popup_ok: "Ja",
    popup_annuleer: "Annuleer",
    popup_oke: "Oke",
    grap_tweede_vriend: "Voor je tweede vriend rekenen we normaal € 2.000,- aan beheerskosten. Stort dit bedrag op rekeningnummer NL00 GRAP 1234 5678 90. (Grapje, de vriend wordt gewoon gratis toegevoegd.)",
    fout_naam_leeg: "Vul een naam in.",
    fout_naam_bestaat: "Die naam staat er al.",
    fout_ik_verwijderen: "Jezelf kun je niet verwijderen.",

    stats_titel: "Statistieken",
    stats_voor: "Statistieken van",
    stats_grafiek: "Kaarten per kleur",
    stats_rarity: "Kaarten per rarity",
    grafiek_leeg: "Nog geen kaarten om te tonen.",

    kleur_W: "Wit",
    kleur_U: "Blauw",
    kleur_B: "Zwart",
    kleur_R: "Rood",
    kleur_G: "Groen",
    kleur_C: "Kleurloos",
    kleur_M: "Meerkleurig",

    rarity_common: "Common",
    rarity_uncommon: "Uncommon",
    rarity_rare: "Rare",
    rarity_mythic: "Mythic",

    over_titel: "Over Magic Meeting",
    over_tekst1: "Magic Meeting is een Progressive Web App waarmee jij en je vrienden je Magic: the Gathering-verzameling bijhouden. De app werkt offline en is installeerbaar op je telefoon.",
    over_tekst2: "Kaartgegevens, afbeeldingen en prijzen komen van de Scryfall API. Je eigen verzamelingen worden lokaal op je apparaat opgeslagen in LocalStorage.",
    over_bron_titel: "Bron",
    over_bron_tekst: "kaartdata, afbeeldingen en prijzen.",
    over_taal_titel: "Taal",
    over_data_titel: "Gegevens",
    knop_reset: "Alle gegevens wissen",
    reset_bevestig: "Weet je zeker dat je ALLE vrienden en kaarten wilt wissen?",
    over_credit: "KW1C - Software Development Niveau 4",

    ik: "Ik"
  },

  en: {
    nav_overzicht: "Overview",
    nav_toevoegen: "Add",
    nav_vrienden: "Friends",
    nav_statistieken: "Stats",
    nav_over: "About",

    overzicht_titel: "My cards",
    label_bekijk: "Viewing collection of",
    filter_alles: "All",
    filter_dag: "Day",
    filter_week: "Week",
    filter_maand: "Month",
    filter_rarity_label: "Rarity",
    filter_set_label: "Set",
    filter_alle_rarity: "All rarities",
    filter_alle_sets: "All sets",
    stat_kaarten: "Cards",
    stat_waarde: "Value",
    stat_topkleur: "Top color",
    leeg_melding: "This collection is empty. Add a card!",
    rarity_label: "Rarity",

    toevoegen_titel: "New card",
    label_eigenaar: "For whom?",
    label_datum: "Date acquired",
    label_kaart: "Search a card (via Scryfall)",
    label_omschrijving: "Note",
    ph_kaart: "Type a card name...",
    ph_omschrijving: "For example: got it for my birthday",
    knop_opslaan: "Save card",
    fout_datum: "Please choose a date.",
    fout_kaart: "Please pick a card from the search results.",
    fout_eigenaar: "Please choose a friend (owner).",
    opslaan_ok: "Card saved!",
    auto_prijs: "Price (auto)",
    auto_rarity: "Rarity (auto)",

    vrienden_titel: "Friends",
    vrienden_uitleg: "Each friend has their own collection. Tap a name to open that collection.",
    vrienden_nieuw_label: "New friend",
    vrienden_nieuw_ph: "Friend's name",
    vrienden_toevoegen: "Add friend",
    vrienden_open: "Open collection",
    vrienden_kaarten: "cards",
    vrienden_verwijder_bevestig: "Are you sure you want to delete this friend and all their cards?",
    kaart_verwijder_bevestig: "Are you sure you want to delete this card?",
    popup_ok: "Yes",
    popup_annuleer: "Cancel",
    popup_oke: "OK",
    grap_tweede_vriend: "Normally a second friend costs € 2,000 in admin fees. Please transfer this amount to account number NL00 JOKE 1234 5678 90. (Just kidding, the friend will be added for free.)",
    fout_naam_leeg: "Please enter a name.",
    fout_naam_bestaat: "That name already exists.",
    fout_ik_verwijderen: "You cannot delete yourself.",

    stats_titel: "Statistics",
    stats_voor: "Statistics of",
    stats_grafiek: "Cards per color",
    stats_rarity: "Cards per rarity",
    grafiek_leeg: "No cards to show yet.",

    kleur_W: "White",
    kleur_U: "Blue",
    kleur_B: "Black",
    kleur_R: "Red",
    kleur_G: "Green",
    kleur_C: "Colorless",
    kleur_M: "Multicolor",

    rarity_common: "Common",
    rarity_uncommon: "Uncommon",
    rarity_rare: "Rare",
    rarity_mythic: "Mythic",

    over_titel: "About Magic Meeting",
    over_tekst1: "Magic Meeting is a Progressive Web App for tracking your and your friends' Magic: the Gathering collections. The app works offline and can be installed on your phone.",
    over_tekst2: "Card data, images and prices come from the Scryfall API. Your collections are stored locally on your device in LocalStorage.",
    over_bron_titel: "Source",
    over_bron_tekst: "card data, images and prices.",
    over_taal_titel: "Language",
    over_data_titel: "Data",
    knop_reset: "Delete all data",
    reset_bevestig: "Are you sure you want to delete ALL friends and cards?",
    over_credit: "KW1C - Software Development Level 4",

    ik: "Me"
  }
};

let huidigeTaal = localStorage.getItem("magicTaal") || "nl";

function t(sleutel) {
  const woordenboek = VERTALINGEN[huidigeTaal] || VERTALINGEN.nl;
  return woordenboek[sleutel] || sleutel;
}

function pasTaalToe(taal) {
  huidigeTaal = VERTALINGEN[taal] ? taal : "nl";
  localStorage.setItem("magicTaal", huidigeTaal);
  document.documentElement.lang = huidigeTaal;

  document.querySelectorAll("[data-i18n]").forEach(function (element) {
    const sleutel = element.getAttribute("data-i18n");
    element.textContent = t(sleutel);
  });

  document.querySelectorAll("[data-i18n-ph]").forEach(function (element) {
    const sleutel = element.getAttribute("data-i18n-ph");
    element.placeholder = t(sleutel);
  });

  const taalKnop = document.getElementById("taalKnop");
  if (taalKnop) taalKnop.textContent = huidigeTaal.toUpperCase();

  document.querySelectorAll(".taal-optie").forEach(function (knop) {
    knop.classList.toggle("actief", knop.dataset.taal === huidigeTaal);
  });
}
