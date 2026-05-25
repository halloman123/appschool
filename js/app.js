/* =======================================================
   app.js - hoofdlogica van Magic Meeting
   Onderdelen:
     1. Gegevens laden/bewaren (LocalStorage)
     2. Schermnavigatie
     3. Overzicht tonen + filteren op periode
     4. Rekenfuncties (winrate e.d.)
     5. Meeting toevoegen (formulier + Scryfall)
     6. Statistieken + grafiek (canvas)
     7. Taalswitch
     8. Reset + opstart
   ======================================================= */

"use strict";

/* ---------- Constanten en toestand ---------- */
const OPSLAG_SLEUTEL = "magicMeetings";

let meetings = [];            /* alle meetings (uit LocalStorage) */
let huidigePeriode = "alles"; /* actief filter: alles/dag/week/maand */
let gekozenKaart = null;      /* sleutelkaart die in het formulier is gekozen */
let zoekTimer = null;         /* timer voor het vertragen van de Scryfall-zoekopdracht */

/* =======================================================
   1. GEGEVENS LADEN EN BEWAREN (LocalStorage)
   ======================================================= */

function laadMeetings() {
  const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
  try {
    meetings = ruw ? JSON.parse(ruw) : [];
  } catch (fout) {
    console.error("Kon meetings niet lezen:", fout);
    meetings = [];
  }
}

function bewaarMeetings() {
  localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(meetings));
}

/* =======================================================
   2. SCHERMNAVIGATIE
   ======================================================= */

function toonScherm(naam) {
  /* verberg alle schermen, toon het gekozen scherm */
  document.querySelectorAll(".scherm").forEach(function (scherm) {
    scherm.classList.add("verborgen");
  });
  document.getElementById("scherm-" + naam).classList.remove("verborgen");

  /* markeer de juiste knop in de navigatiebalk */
  document.querySelectorAll(".nav-knop").forEach(function (knop) {
    knop.classList.toggle("actief", knop.dataset.scherm === naam);
  });

  /* het statistiekenscherm tekent zijn grafiek pas bij het openen */
  if (naam === "statistieken") {
    toonStatistieken();
  }
  window.scrollTo(0, 0);
}

/* =======================================================
   3. OVERZICHT TONEN EN FILTEREN
   ======================================================= */

/* binnenPeriode() - bepaalt of een datum binnen het filter valt */
function binnenPeriode(datumTekst, periode) {
  if (periode === "alles") {
    return true;
  }
  const aantalDagen = { dag: 1, week: 7, maand: 31 }[periode];

  const meetingDatum = new Date(datumTekst + "T00:00:00");
  const vandaag = new Date();
  vandaag.setHours(0, 0, 0, 0);

  const ondergrens = new Date(vandaag);
  ondergrens.setDate(ondergrens.getDate() - (aantalDagen - 1));

  return meetingDatum >= ondergrens && meetingDatum <= vandaag;
}

/* filterMeetings() - geeft de meetings terug die in de periode vallen */
function filterMeetings(periode) {
  return meetings.filter(function (meeting) {
    return binnenPeriode(meeting.datum, periode);
  });
}

/* toonOverzicht() - vult het overzichtsscherm */
function toonOverzicht() {
  const zichtbaar = filterMeetings(huidigePeriode)
    .sort(function (a, b) { return b.datum.localeCompare(a.datum); });

  /* samenvatting bovenaan */
  const gewonnen = totaalGewonnen(zichtbaar);
  const gespeeld = totaalGespeeld(zichtbaar);
  document.getElementById("statAantal").textContent = zichtbaar.length;
  document.getElementById("statGewonnen").textContent = gewonnen;
  document.getElementById("statWinrate").textContent = berekenWinrate(gewonnen, gespeeld) + "%";

  /* de lijst met meetings opbouwen */
  const lijst = document.getElementById("meetingLijst");
  lijst.innerHTML = "";
  zichtbaar.forEach(function (meeting) {
    lijst.appendChild(maakMeetingElement(meeting));
  });

  /* melding tonen als er niets is */
  document.getElementById("leegMelding").style.display =
    zichtbaar.length === 0 ? "block" : "none";
}

/* maakMeetingElement() - bouwt een <li> die op een mini-kaart lijkt */
function maakMeetingElement(meeting) {
  const li = document.createElement("li");
  li.className = "meeting-kaart";
  li.style.borderLeftColor = randKleurVoor(meeting.kleuren);

  /* afbeelding (of een nette plaatsvervanger) */
  if (meeting.kaartAfbeelding) {
    const afbeelding = document.createElement("img");
    afbeelding.className = "meeting-art";
    afbeelding.src = meeting.kaartAfbeelding;
    afbeelding.alt = meeting.kaartNaam || "kaart";
    afbeelding.loading = "lazy";
    li.appendChild(afbeelding);
  } else {
    const leeg = document.createElement("div");
    leeg.className = "meeting-art";
    leeg.style.display = "flex";
    leeg.style.alignItems = "center";
    leeg.style.justifyContent = "center";
    leeg.style.fontWeight = "800";
    leeg.style.color = "#8a6d2c";
    leeg.textContent = "MTG";
    li.appendChild(leeg);
  }

  /* tekstgedeelte */
  const info = document.createElement("div");
  info.className = "meeting-info";

  const naam = document.createElement("div");
  naam.className = "meeting-naam";
  naam.textContent = meeting.kaartNaam || meeting.omschrijving || "Meeting";
  info.appendChild(naam);

  const meta = document.createElement("div");
  meta.className = "meeting-meta";
  meta.textContent = formatteerDatum(meeting.datum);
  const format = document.createElement("span");
  format.className = "meeting-format";
  format.textContent = meeting.categorie;
  meta.appendChild(document.createTextNode("  "));
  meta.appendChild(format);
  info.appendChild(meta);

  if (meeting.omschrijving) {
    const omschrijving = document.createElement("div");
    omschrijving.className = "meeting-omschrijving";
    omschrijving.textContent = meeting.omschrijving;
    info.appendChild(omschrijving);
  }

  const resultaat = document.createElement("div");
  resultaat.className = "meeting-resultaat";
  resultaat.textContent =
    meeting.gewonnen + " / " + meeting.gespeeld + " " + t("resultaat_gewonnen");
  resultaat.style.color = randKleurVoor(meeting.kleuren);
  info.appendChild(resultaat);

  li.appendChild(info);

  /* verwijderknop */
  const verwijder = document.createElement("button");
  verwijder.className = "verwijder-knop";
  verwijder.type = "button";
  verwijder.textContent = "×";
  verwijder.setAttribute("aria-label", "Verwijder meeting");
  verwijder.addEventListener("click", function () {
    verwijderMeeting(meeting.id);
  });
  li.appendChild(verwijder);

  return li;
}

/* verwijderMeeting() - haalt 1 meeting weg (onderdeel van CR.D) */
function verwijderMeeting(id) {
  meetings = meetings.filter(function (meeting) { return meeting.id !== id; });
  bewaarMeetings();
  toonOverzicht();
}

/* =======================================================
   4. REKENFUNCTIES (herbruikbaar)
   ======================================================= */

/* berekenWinrate() - zet gewonnen/gespeeld om naar een percentage (0-100) */
function berekenWinrate(gewonnen, gespeeld) {
  if (gespeeld <= 0) {
    return 0;
  }
  return Math.round((gewonnen / gespeeld) * 100);
}

/* totaalGewonnen() - telt alle gewonnen potjes in een lijst op */
function totaalGewonnen(lijst) {
  return lijst.reduce(function (som, meeting) {
    return som + Number(meeting.gewonnen);
  }, 0);
}

/* totaalGespeeld() - telt alle gespeelde potjes in een lijst op */
function totaalGespeeld(lijst) {
  return lijst.reduce(function (som, meeting) {
    return som + Number(meeting.gespeeld);
  }, 0);
}

/* randKleurVoor() - kiest een randkleur op basis van de manakleuren */
function randKleurVoor(kleuren) {
  const kaart = {
    W: "#d9c75a", U: "#2a7ed0", B: "#4a4038", R: "#d3372a", G: "#2f8a3e"
  };
  if (!kleuren || kleuren.length === 0) {
    return "#9a9284";          /* kleurloos */
  }
  if (kleuren.length > 1) {
    return "#c8a14a";          /* meerkleurig = goud */
  }
  return kaart[kleuren[0]] || "#9a9284";
}

/* formatteerDatum() - "2026-05-18" -> "18-05-2026" */
function formatteerDatum(datumTekst) {
  const delen = datumTekst.split("-");
  return delen[2] + "-" + delen[1] + "-" + delen[0];
}

/* =======================================================
   5. MEETING TOEVOEGEN (formulier + Scryfall)
   ======================================================= */

/* --- autocomplete: zoeken terwijl de gebruiker typt --- */
function behandelKaartZoeken(event) {
  const zoekterm = event.target.value;

  /* wacht 300 ms na de laatste toetsaanslag (debounce) */
  clearTimeout(zoekTimer);
  zoekTimer = setTimeout(async function () {
    try {
      const namen = await zoekKaartnamen(zoekterm);
      toonSuggesties(namen);
    } catch (fout) {
      console.error("Zoeken mislukt:", fout);
      toonSuggesties([]);     /* bij geen internet: geen suggesties */
    }
  }, 300);
}

/* toonSuggesties() - vult het suggestielijstje onder het zoekveld */
function toonSuggesties(namen) {
  const lijst = document.getElementById("kaartSuggesties");
  lijst.innerHTML = "";

  if (namen.length === 0) {
    lijst.classList.remove("zichtbaar");
    return;
  }

  namen.slice(0, 10).forEach(function (naam) {
    const li = document.createElement("li");
    li.textContent = naam;
    li.addEventListener("click", function () {
      kiesKaart(naam);
    });
    lijst.appendChild(li);
  });
  lijst.classList.add("zichtbaar");
}

/* kiesKaart() - haalt de gekozen kaart op en toont een voorbeeld */
async function kiesKaart(naam) {
  document.getElementById("kaartSuggesties").classList.remove("zichtbaar");
  document.getElementById("invoerKaart").value = naam;

  try {
    gekozenKaart = await haalKaartOp(naam);
    toonKaartPreview(gekozenKaart);
  } catch (fout) {
    console.error("Kaart ophalen mislukt:", fout);
    gekozenKaart = null;
  }
}

/* toonKaartPreview() - laat de gekozen kaart zien in het formulier */
function toonKaartPreview(kaart) {
  const preview = document.getElementById("kaartPreview");
  document.getElementById("kaartPreviewImg").src = kaart.afbeelding;
  document.getElementById("kaartPreviewNaam").textContent = kaart.naam;

  const kleurRij = document.getElementById("kaartPreviewKleuren");
  kleurRij.innerHTML = "";
  kleurRij.appendChild(maakManaRij(kaart.kleuren));

  preview.classList.remove("verborgen");
}

/* maakManaRij() - bouwt gekleurde manabolletjes */
function maakManaRij(kleuren) {
  const rij = document.createElement("span");
  rij.className = "mana-rij";
  const lijst = (kleuren && kleuren.length) ? kleuren : ["C"];
  lijst.forEach(function (kleur) {
    const bol = document.createElement("span");
    bol.className = "mana-bol mana-" + kleur.toLowerCase();
    rij.appendChild(bol);
  });
  return rij;
}

/* behandelOpslaan() - verwerkt het versturen van het formulier */
function behandelOpslaan(event) {
  event.preventDefault();
  const melding = document.getElementById("formMelding");

  const datum = document.getElementById("invoerDatum").value;
  const categorie = document.getElementById("invoerFormat").value;
  const omschrijving = document.getElementById("invoerOmschrijving").value.trim();
  const gewonnen = Number(document.getElementById("invoerGewonnen").value);
  const gespeeld = Number(document.getElementById("invoerGespeeld").value);

  /* --- controles --- */
  if (!datum) {
    toonFormMelding(t("fout_datum"), "fout");
    return;
  }
  if (gewonnen > gespeeld) {
    toonFormMelding(t("fout_aantal"), "fout");
    return;
  }

  /* --- nieuw meeting-object --- */
  const nieuweMeeting = {
    id: Date.now(),
    datum: datum,
    categorie: categorie,
    omschrijving: omschrijving,
    gewonnen: gewonnen,
    gespeeld: gespeeld,
    kaartNaam: gekozenKaart ? gekozenKaart.naam : "",
    kaartAfbeelding: gekozenKaart ? gekozenKaart.afbeelding : "",
    kleuren: gekozenKaart ? gekozenKaart.kleuren : []
  };

  meetings.push(nieuweMeeting);
  bewaarMeetings();

  /* formulier leegmaken en terug naar het overzicht */
  herstelFormulier();
  toonFormMelding(t("opslaan_ok"), "ok");
  toonOverzicht();
  toonScherm("overzicht");
}

/* toonFormMelding() - laat een melding zien onder het formulier */
function toonFormMelding(tekst, soort) {
  const melding = document.getElementById("formMelding");
  melding.textContent = tekst;
  melding.className = "form-melding " + soort;
}

/* herstelFormulier() - maakt het formulier weer leeg */
function herstelFormulier() {
  document.getElementById("meetingForm").reset();
  document.getElementById("invoerDatum").value = vandaagTekst();
  document.getElementById("kaartPreview").classList.add("verborgen");
  document.getElementById("kaartSuggesties").classList.remove("zichtbaar");
  gekozenKaart = null;
}

/* =======================================================
   6. STATISTIEKEN + GRAFIEK
   ======================================================= */

function toonStatistieken() {
  const gewonnen = totaalGewonnen(meetings);
  const gespeeld = totaalGespeeld(meetings);

  document.getElementById("statTotaal").textContent = meetings.length;
  document.getElementById("statGemWinrate").textContent =
    berekenWinrate(gewonnen, gespeeld) + "%";
  document.getElementById("statBesteFormat").textContent = besteFormat();

  tekenGrafiek(gewonnenPerMaand());
  toonFormatVerdeling();
}

/* gewonnenPerMaand() - aggregeert gewonnen potjes per maand (YYYY-MM) */
function gewonnenPerMaand() {
  const perMaand = {};
  meetings.forEach(function (meeting) {
    const maand = meeting.datum.slice(0, 7);   /* "2026-05" */
    perMaand[maand] = (perMaand[maand] || 0) + Number(meeting.gewonnen);
  });

  /* omzetten naar een gesorteerde lijst, laatste 6 maanden */
  return Object.keys(perMaand).sort().slice(-6).map(function (maand) {
    return { maand: maand, waarde: perMaand[maand] };
  });
}

/* tekenGrafiek() - tekent een staafdiagram op het canvas */
function tekenGrafiek(gegevens) {
  const canvas = document.getElementById("grafiek");
  const ctx = canvas.getContext("2d");
  const breedte = canvas.width;
  const hoogte = canvas.height;

  ctx.clearRect(0, 0, breedte, hoogte);

  /* geen gegevens? toon een tekst */
  if (gegevens.length === 0) {
    ctx.fillStyle = "#6b5d48";
    ctx.font = "13px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("grafiek_leeg"), breedte / 2, hoogte / 2);
    return;
  }

  const marge = 28;
  const grondlijn = hoogte - marge;
  const maxWaarde = Math.max.apply(null, gegevens.map(function (g) { return g.waarde; })) || 1;
  const staafBreedte = (breedte - marge * 2) / gegevens.length;

  gegevens.forEach(function (punt, index) {
    const staafHoogte = (punt.waarde / maxWaarde) * (grondlijn - marge);
    const x = marge + index * staafBreedte;
    const y = grondlijn - staafHoogte;

    /* staaf */
    ctx.fillStyle = "#b8923d";
    ctx.fillRect(x + 6, y, staafBreedte - 12, staafHoogte);

    /* waarde boven de staaf */
    ctx.fillStyle = "#2a2018";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(punt.waarde, x + staafBreedte / 2, y - 5);

    /* maandlabel onder de staaf */
    ctx.fillStyle = "#6b5d48";
    ctx.font = "10px Segoe UI, sans-serif";
    ctx.fillText(punt.maand.slice(5) + "/" + punt.maand.slice(2, 4),
                 x + staafBreedte / 2, hoogte - 9);
  });

  /* grondlijn */
  ctx.strokeStyle = "#8a6d2c";
  ctx.beginPath();
  ctx.moveTo(marge, grondlijn);
  ctx.lineTo(breedte - marge, grondlijn);
  ctx.stroke();
}

/* besteFormat() - het format dat het vaakst voorkomt */
function besteFormat() {
  if (meetings.length === 0) {
    return "–";
  }
  const telling = tellingPerFormat();
  let beste = "";
  let hoogste = -1;
  Object.keys(telling).forEach(function (format) {
    if (telling[format] > hoogste) {
      hoogste = telling[format];
      beste = format;
    }
  });
  return beste;
}

/* tellingPerFormat() - hoe vaak elk format voorkomt */
function tellingPerFormat() {
  const telling = {};
  meetings.forEach(function (meeting) {
    telling[meeting.categorie] = (telling[meeting.categorie] || 0) + 1;
  });
  return telling;
}

/* toonFormatVerdeling() - balkjes per format */
function toonFormatVerdeling() {
  const houder = document.getElementById("formatVerdeling");
  houder.innerHTML = "";

  const telling = tellingPerFormat();
  const formats = Object.keys(telling);
  if (formats.length === 0) {
    return;
  }
  const maximum = Math.max.apply(null, formats.map(function (f) { return telling[f]; }));

  formats.forEach(function (format) {
    const rij = document.createElement("div");
    rij.className = "format-balk-rij";

    const naam = document.createElement("span");
    naam.className = "format-balk-naam";
    naam.textContent = format;

    const spoor = document.createElement("div");
    spoor.className = "format-balk-spoor";
    const vulling = document.createElement("div");
    vulling.className = "format-balk-vulling";
    vulling.style.width = ((telling[format] / maximum) * 100) + "%";
    spoor.appendChild(vulling);

    const aantal = document.createElement("span");
    aantal.className = "format-balk-aantal";
    aantal.textContent = telling[format];

    rij.appendChild(naam);
    rij.appendChild(spoor);
    rij.appendChild(aantal);
    houder.appendChild(rij);
  });
}

/* =======================================================
   7. TAALSWITCH
   ======================================================= */

function wisselTaal(taal) {
  pasTaalToe(taal);          /* uit i18n.js: vervangt de statische teksten */
  toonOverzicht();           /* dynamische teksten opnieuw opbouwen */
  if (!document.getElementById("scherm-statistieken").classList.contains("verborgen")) {
    toonStatistieken();
  }
}

/* =======================================================
   8. HULPFUNCTIES, KOPPELINGEN EN OPSTART
   ======================================================= */

/* vandaagTekst() - datum van vandaag als "JJJJ-MM-DD" */
function vandaagTekst() {
  const nu = new Date();
  nu.setMinutes(nu.getMinutes() - nu.getTimezoneOffset());
  return nu.toISOString().slice(0, 10);
}

/* koppelGebeurtenissen() - zet alle event listeners klaar */
function koppelGebeurtenissen() {
  /* navigatiebalk */
  document.querySelectorAll(".nav-knop").forEach(function (knop) {
    knop.addEventListener("click", function () {
      toonScherm(knop.dataset.scherm);
    });
  });

  /* filterknoppen op het overzicht */
  document.querySelectorAll(".filter-knop").forEach(function (knop) {
    knop.addEventListener("click", function () {
      document.querySelectorAll(".filter-knop").forEach(function (k) {
        k.classList.remove("actief");
      });
      knop.classList.add("actief");
      huidigePeriode = knop.dataset.periode;
      toonOverzicht();
    });
  });

  /* formulier */
  document.getElementById("invoerKaart").addEventListener("input", behandelKaartZoeken);
  document.getElementById("meetingForm").addEventListener("submit", behandelOpslaan);

  /* taalknop in de kopbalk wisselt tussen NL en EN */
  document.getElementById("taalKnop").addEventListener("click", function () {
    wisselTaal(huidigeTaal === "nl" ? "en" : "nl");
  });

  /* taalknoppen op het scherm "Over" */
  document.querySelectorAll(".taal-optie").forEach(function (knop) {
    knop.addEventListener("click", function () {
      wisselTaal(knop.dataset.taal);
    });
  });

  /* resetknop */
  document.getElementById("resetKnop").addEventListener("click", function () {
    if (confirm(t("reset_bevestig"))) {
      meetings = [];
      bewaarMeetings();
      toonOverzicht();
      toonStatistieken();
    }
  });
}

/* start() - wordt uitgevoerd zodra de pagina geladen is */
function start() {
  laadMeetings();
  pasTaalToe(huidigeTaal);                 /* taal toepassen (uit i18n.js) */
  document.getElementById("invoerDatum").value = vandaagTekst();
  koppelGebeurtenissen();
  toonOverzicht();

  /* service worker registreren (voor de offline-PWA) */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(function (fout) {
      console.warn("Service worker niet geregistreerd:", fout);
    });
  }
}

document.addEventListener("DOMContentLoaded", start);
