/* =======================================================
   i18n.js - vertalingen voor de taalswitch (NL / EN)
   Bevat alle teksten in twee talen + een functie die de
   teksten in de pagina vervangt.
   ======================================================= */

const VERTALINGEN = {
  nl: {
    /* navigatie */
    nav_overzicht: "Overzicht",
    nav_toevoegen: "Toevoegen",
    nav_statistieken: "Stats",
    nav_over: "Over",

    /* overzicht */
    overzicht_titel: "Mijn meetings",
    filter_alles: "Alles",
    filter_dag: "Dag",
    filter_week: "Week",
    filter_maand: "Maand",
    stat_meetings: "Meetings",
    stat_gewonnen: "Gewonnen",
    stat_winrate: "Winrate",
    stat_besteformat: "Top format",
    leeg_melding: "Nog geen meetings in deze periode. Voeg er een toe!",
    resultaat_gewonnen: "gewonnen",

    /* toevoegen */
    toevoegen_titel: "Nieuwe meeting",
    label_datum: "Datum",
    label_format: "Format",
    label_kaart: "Sleutelkaart (zoek via Scryfall)",
    label_omschrijving: "Omschrijving",
    label_gewonnen: "Gewonnen potjes",
    label_gespeeld: "Gespeelde potjes",
    ph_kaart: "Typ een kaartnaam...",
    ph_omschrijving: "Deck, tegenstander of notities...",
    knop_opslaan: "Meeting opslaan",
    fout_datum: "Kies een datum.",
    fout_aantal: "Gewonnen potjes kan niet groter zijn dan gespeelde potjes.",
    fout_kaart: "Zoek en kies eerst een sleutelkaart.",
    opslaan_ok: "Meeting opgeslagen!",

    /* statistieken */
    stats_titel: "Statistieken",
    stats_grafiek: "Gewonnen potjes per maand",
    stats_formats: "Meetings per format",
    grafiek_leeg: "Nog geen gegevens om te tonen.",

    /* over */
    over_titel: "Over Magic Meeting",
    over_tekst1: "Magic Meeting is een Progressive Web App waarmee je je Magic: the Gathering-potjes en -toernooien bijhoudt. De app werkt offline en is installeerbaar op je telefoon.",
    over_tekst2: "Kaartgegevens komen van de Scryfall API. Je eigen meetings worden lokaal op je apparaat opgeslagen in LocalStorage.",
    over_bron_titel: "Bron",
    over_bron_tekst: "kaartdata en afbeeldingen.",
    over_taal_titel: "Taal",
    over_data_titel: "Gegevens",
    knop_reset: "Alle meetings wissen",
    reset_bevestig: "Weet je zeker dat je ALLE meetings wilt wissen?",
    over_credit: "KW1C - Software Development Niveau 4"
  },

  en: {
    /* navigation */
    nav_overzicht: "Overview",
    nav_toevoegen: "Add",
    nav_statistieken: "Stats",
    nav_over: "About",

    /* overview */
    overzicht_titel: "My meetings",
    filter_alles: "All",
    filter_dag: "Day",
    filter_week: "Week",
    filter_maand: "Month",
    stat_meetings: "Meetings",
    stat_gewonnen: "Wins",
    stat_winrate: "Win rate",
    stat_besteformat: "Top format",
    leeg_melding: "No meetings in this period yet. Add one!",
    resultaat_gewonnen: "won",

    /* add */
    toevoegen_titel: "New meeting",
    label_datum: "Date",
    label_format: "Format",
    label_kaart: "Key card (search via Scryfall)",
    label_omschrijving: "Description",
    label_gewonnen: "Games won",
    label_gespeeld: "Games played",
    ph_kaart: "Type a card name...",
    ph_omschrijving: "Deck, opponent or notes...",
    knop_opslaan: "Save meeting",
    fout_datum: "Please choose a date.",
    fout_aantal: "Games won cannot be greater than games played.",
    fout_kaart: "Please search and pick a key card first.",
    opslaan_ok: "Meeting saved!",

    /* statistics */
    stats_titel: "Statistics",
    stats_grafiek: "Games won per month",
    stats_formats: "Meetings per format",
    grafiek_leeg: "No data to show yet.",

    /* about */
    over_titel: "About Magic Meeting",
    over_tekst1: "Magic Meeting is a Progressive Web App to track your Magic: the Gathering games and tournaments. The app works offline and can be installed on your phone.",
    over_tekst2: "Card data comes from the Scryfall API. Your own meetings are stored locally on your device in LocalStorage.",
    over_bron_titel: "Source",
    over_bron_tekst: "card data and images.",
    over_taal_titel: "Language",
    over_data_titel: "Data",
    knop_reset: "Delete all meetings",
    reset_bevestig: "Are you sure you want to delete ALL meetings?",
    over_credit: "KW1C - Software Development Level 4"
  }
};

/* Huidige taal - standaard Nederlands, kan uit LocalStorage komen */
let huidigeTaal = localStorage.getItem("magicTaal") || "nl";

/* t() - haalt een vertaalde tekst op via een sleutel */
function t(sleutel) {
  const woordenboek = VERTALINGEN[huidigeTaal] || VERTALINGEN.nl;
  return woordenboek[sleutel] || sleutel;
}

/* pasTaalToe() - vervangt alle statische teksten in de pagina */
function pasTaalToe(taal) {
  huidigeTaal = VERTALINGEN[taal] ? taal : "nl";
  localStorage.setItem("magicTaal", huidigeTaal);
  document.documentElement.lang = huidigeTaal;

  /* teksten (data-i18n) */
  document.querySelectorAll("[data-i18n]").forEach(function (element) {
    const sleutel = element.getAttribute("data-i18n");
    element.textContent = t(sleutel);
  });

  /* placeholders (data-i18n-ph) */
  document.querySelectorAll("[data-i18n-ph]").forEach(function (element) {
    const sleutel = element.getAttribute("data-i18n-ph");
    element.placeholder = t(sleutel);
  });

  /* knop in de kopbalk toont de actieve taal */
  const taalKnop = document.getElementById("taalKnop");
  if (taalKnop) taalKnop.textContent = huidigeTaal.toUpperCase();

  /* actieve taalknop op het scherm "Over" markeren */
  document.querySelectorAll(".taal-optie").forEach(function (knop) {
    knop.classList.toggle("actief", knop.dataset.taal === huidigeTaal);
  });
}
