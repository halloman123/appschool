/* =======================================================
   app.js - hoofdlogica van Magic Meeting (verzameling-app)
   ======================================================= */

"use strict";

const SLEUTEL_KAARTEN  = "magicKaarten";
const SLEUTEL_VRIENDEN = "magicVrienden";
const SLEUTEL_ACTIEF   = "magicActieveEigenaar";

let kaarten = [];
let vrienden = [];
let actieveEigenaar = "";
let huidigePeriode = "alles";
let huidigeRarity  = "alles";
let huidigeSet     = "alles";
let gekozenKaart = null;
let zoekTimer = null;

const KLEUR_HEX = {
  W: "#f4e8c4", U: "#3676b8", B: "#28221c",
  R: "#ba3a2e", G: "#3a8048", C: "#c4bba6", M: "#d4af37"
};

/* ===== 1. LocalStorage ===== */

function laadGegevens() {
  try {
    const rk = localStorage.getItem(SLEUTEL_KAARTEN);
    kaarten = rk ? JSON.parse(rk) : [];
  } catch (e) { console.error("Kaarten lezen mislukt:", e); kaarten = []; }
  try {
    const rv = localStorage.getItem(SLEUTEL_VRIENDEN);
    vrienden = rv ? JSON.parse(rv) : [];
  } catch (e) { console.error("Vrienden lezen mislukt:", e); vrienden = []; }
  if (vrienden.length === 0) vrienden = [t("ik")];
  actieveEigenaar = localStorage.getItem(SLEUTEL_ACTIEF) || vrienden[0];
  if (vrienden.indexOf(actieveEigenaar) === -1) actieveEigenaar = vrienden[0];
}
function bewaarKaarten()  { localStorage.setItem(SLEUTEL_KAARTEN,  JSON.stringify(kaarten)); }
function bewaarVrienden() { localStorage.setItem(SLEUTEL_VRIENDEN, JSON.stringify(vrienden)); }
function bewaarActief()   { localStorage.setItem(SLEUTEL_ACTIEF,   actieveEigenaar); }

/* ===== 2. Schermnavigatie ===== */

function toonScherm(naam) {
  document.querySelectorAll(".scherm").forEach(function (s) { s.classList.add("verborgen"); });
  document.getElementById("scherm-" + naam).classList.remove("verborgen");
  document.querySelectorAll(".nav-knop").forEach(function (k) {
    k.classList.toggle("actief", k.dataset.scherm === naam);
  });
  if (naam === "statistieken") toonStatistieken();
  if (naam === "vrienden")     toonVrienden();
  window.scrollTo(0, 0);
}

/* ===== 3. Overzicht + filters ===== */

function binnenPeriode(datumTekst, periode) {
  if (periode === "alles") return true;
  const dagen = { dag: 1, week: 7, maand: 31 }[periode];
  const d = new Date(datumTekst + "T00:00:00");
  const vandaag = new Date(); vandaag.setHours(0,0,0,0);
  const grens = new Date(vandaag); grens.setDate(grens.getDate() - (dagen - 1));
  return d >= grens && d <= vandaag;
}
function kaartenVanEigenaar(naam) {
  return kaarten.filter(function (k) { return k.eigenaar === naam; });
}
function filterKaarten(eigenaar, periode) {
  return kaartenVanEigenaar(eigenaar).filter(function (k) {
    if (!binnenPeriode(k.datum, periode)) return false;
    if (huidigeRarity !== "alles" && k.categorie !== huidigeRarity) return false;
    if (huidigeSet    !== "alles" && k.set       !== huidigeSet)    return false;
    return true;
  });
}

function toonOverzicht() {
  vulEigenaarDropdowns();
  vulSetDropdown();
  const zichtbaar = filterKaarten(actieveEigenaar, huidigePeriode)
    .sort(function (a, b) { return b.datum.localeCompare(a.datum); });

  document.getElementById("statAantal").textContent  = totaalAantal(zichtbaar);
  document.getElementById("statWaarde").textContent  = formatteerEuro(totaalWaarde(zichtbaar));
  document.getElementById("statTopKleur").textContent = topKleurNaam(zichtbaar);

  const lijst = document.getElementById("kaartLijst");
  lijst.innerHTML = "";
  zichtbaar.forEach(function (k) { lijst.appendChild(maakKaartElement(k)); });

  document.getElementById("leegMelding").style.display =
    zichtbaar.length === 0 ? "block" : "none";
}

function maakKaartElement(kaart) {
  const li = document.createElement("li");
  li.className = "meeting-kaart";
  li.style.borderLeftColor = randKleurVoor(kaart.kleuren);

  if (kaart.kaartAfbeelding) {
    const img = document.createElement("img");
    img.className = "meeting-art";
    img.src = kaart.kaartAfbeelding;
    img.alt = kaart.kaartNaam || "kaart";
    img.loading = "lazy";
    li.appendChild(img);
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

  const info = document.createElement("div");
  info.className = "meeting-info";

  const naam = document.createElement("div");
  naam.className = "meeting-naam";
  naam.textContent = kaart.kaartNaam;
  info.appendChild(naam);

  const meta = document.createElement("div");
  meta.className = "meeting-meta";
  meta.textContent = formatteerDatum(kaart.datum) + "  ";
  const rar = document.createElement("span");
  rar.className = "rarity-badge rarity-" + (kaart.categorie || "common");
  rar.textContent = t("rarity_" + (kaart.categorie || "common"));
  meta.appendChild(rar);
  info.appendChild(meta);

  if (kaart.omschrijving) {
    const om = document.createElement("div");
    om.className = "meeting-omschrijving";
    om.textContent = kaart.omschrijving;
    info.appendChild(om);
  }

  const aantalPerKaart = Number(kaart.aantal || 1);
  if (aantalPerKaart > 1) {
    const aantalEl = document.createElement("span");
    aantalEl.className = "meeting-format";
    aantalEl.style.marginLeft = "6px";
    aantalEl.textContent = "x" + aantalPerKaart;
    meta.appendChild(aantalEl);
  }

  const waarde = document.createElement("div");
  waarde.className = "meeting-resultaat";
  waarde.textContent = formatteerEuro(Number(kaart.waarde || 0) * aantalPerKaart);
  waarde.style.color = randKleurVoor(kaart.kleuren);
  info.appendChild(waarde);

  li.appendChild(info);

  const verwijder = document.createElement("button");
  verwijder.className = "verwijder-knop";
  verwijder.type = "button";
  verwijder.textContent = "x";
  verwijder.setAttribute("aria-label", "Verwijder kaart");
  verwijder.addEventListener("click", function () { verwijderKaart(kaart.id); });
  li.appendChild(verwijder);

  return li;
}

async function verwijderKaart(id) {
  if (!await bevestigPopup(t("kaart_verwijder_bevestig"))) return;
  kaarten = kaarten.filter(function (k) { return k.id !== id; });
  bewaarKaarten();
  toonOverzicht();
}

/* bevestigPopup() - eigen modal in plaats van browser-confirm.
   Bouwt de modal volledig op met JavaScript en verwijdert hem weer
   bij sluiten. Zo kan er nooit een "vastzittende" modal in de DOM
   blijven hangen, ook niet bij een stevige cache. */
function bevestigPopup(tekst) {
  return new Promise(function (resolve) {
    const laag = document.createElement("div");
    Object.assign(laag.style, {
      position: "fixed", top: "0", left: "0",
      width: "100vw", height: "100vh",
      background: "rgba(28,19,10,0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", boxSizing: "border-box", zIndex: "100000"
    });

    const doos = document.createElement("div");
    Object.assign(doos.style, {
      background: "#ece0c8",
      border: "3px solid #2e2013", borderRadius: "14px",
      boxShadow: "0 0 0 4px #78592e, 0 12px 30px rgba(0,0,0,.5)",
      padding: "22px 22px 18px", maxWidth: "360px", width: "100%",
      fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif"
    });

    const p = document.createElement("p");
    p.textContent = tekst;
    Object.assign(p.style, {
      fontSize: "1rem", color: "#2e2013",
      marginBottom: "18px", lineHeight: "1.45", margin: "0 0 18px"
    });

    const knoppen = document.createElement("div");
    Object.assign(knoppen.style, { display: "flex", gap: "10px" });

    function maakKnop(label, kleurAchtergrond, kleurTekst, kleurRand) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = label;
      Object.assign(b.style, {
        flex: "1", padding: "11px 10px",
        fontWeight: "800", fontSize: ".92rem",
        borderRadius: "8px", cursor: "pointer",
        background: kleurAchtergrond, color: kleurTekst,
        border: "2px solid " + kleurRand, fontFamily: "inherit"
      });
      return b;
    }
    const nee = maakKnop(t("popup_annuleer"), "#f6efdd", "#2e2013", "#78592e");
    const ja  = maakKnop(t("popup_ok"),       "#ba3a2e", "#fff",    "#1c130a");

    knoppen.appendChild(nee); knoppen.appendChild(ja);
    doos.appendChild(p); doos.appendChild(knoppen);
    laag.appendChild(doos);
    document.body.appendChild(laag);
    ja.focus();

    function sluit(antwoord) {
      laag.remove();
      document.removeEventListener("keydown", escH);
      resolve(antwoord);
    }
    function jaH()    { sluit(true);  }
    function neeH()   { sluit(false); }
    function escH(e)  { if (e.key === "Escape") sluit(false); }
    function buitenH(e){ if (e.target === laag) sluit(false); }

    ja.addEventListener("click", jaH);
    nee.addEventListener("click", neeH);
    laag.addEventListener("click", buitenH);
    document.addEventListener("keydown", escH);
  });
}

/* ===== 4. Rekenfuncties ===== */

/* totaalWaarde() - som van prijs * aantal voor elke kaart */
function totaalWaarde(lijst) {
  return lijst.reduce(function (s, k) {
    return s + Number(k.waarde || 0) * Number(k.aantal || 1);
  }, 0);
}
/* totaalAantal() - som van aantal voor elke kaart in de lijst */
function totaalAantal(lijst) {
  return lijst.reduce(function (s, k) { return s + Number(k.aantal || 1); }, 0);
}
function telPerKleur(lijst) {
  const t = { W:0, U:0, B:0, R:0, G:0, C:0, M:0 };
  lijst.forEach(function (k) {
    t[kleurBucket(k.kleuren)] += Number(k.aantal || 1);
  });
  return t;
}
function kleurBucket(kleuren) {
  if (!kleuren || kleuren.length === 0) return "C";
  if (kleuren.length > 1) return "M";
  return kleuren[0];
}
function telPerRarity(lijst) {
  const t = { common:0, uncommon:0, rare:0, mythic:0 };
  lijst.forEach(function (k) {
    const r = k.categorie || "common";
    if (t[r] !== undefined) t[r] += Number(k.aantal || 1);
  });
  return t;
}
function topKleurNaam(lijst) {
  if (lijst.length === 0) return "-";
  const tel = telPerKleur(lijst);
  let beste = "C", hoog = -1;
  Object.keys(tel).forEach(function (kl) {
    if (tel[kl] > hoog) { hoog = tel[kl]; beste = kl; }
  });
  return t("kleur_" + beste);
}
function randKleurVoor(kleuren) {
  return KLEUR_HEX[kleurBucket(kleuren)];
}
function formatteerDatum(s) {
  const d = s.split("-"); return d[2] + "-" + d[1] + "-" + d[0];
}
function formatteerEuro(b) {
  return "€" + Number(b || 0).toFixed(2).replace(".", ",");
}

/* ===== 5. Kaart toevoegen ===== */

function behandelKaartZoeken(event) {
  const z = event.target.value;
  clearTimeout(zoekTimer);
  zoekTimer = setTimeout(async function () {
    try {
      const r = await zoekKaarten(z);
      toonSuggesties(r);
    } catch (e) { console.error("Zoeken mislukt:", e); toonSuggesties([]); }
  }, 300);
}

function toonSuggesties(resultaten) {
  const lijst = document.getElementById("kaartSuggesties");
  lijst.innerHTML = "";
  if (resultaten.length === 0) { lijst.classList.remove("zichtbaar"); return; }
  resultaten.forEach(function (kaart) {
    const li = document.createElement("li");
    if (kaart.thumb) {
      const img = document.createElement("img");
      img.className = "suggestie-thumb";
      img.src = kaart.thumb; img.alt = ""; img.loading = "lazy";
      li.appendChild(img);
    }
    const tekstWrap = document.createElement("div");
    tekstWrap.className = "suggestie-tekst";
    const naam = document.createElement("div");
    naam.className = "suggestie-naam"; naam.textContent = kaart.naam;
    tekstWrap.appendChild(naam);
    if (kaart.setNaam) {
      const setEl = document.createElement("div");
      setEl.className = "suggestie-set"; setEl.textContent = kaart.setNaam;
      tekstWrap.appendChild(setEl);
    }
    li.appendChild(tekstWrap);
    li.addEventListener("click", function () { kiesKaart(kaart); });
    lijst.appendChild(li);
  });
  lijst.classList.add("zichtbaar");
}

function kiesKaart(kaart) {
  document.getElementById("kaartSuggesties").classList.remove("zichtbaar");
  document.getElementById("invoerKaart").value = kaart.naam;
  gekozenKaart = kaart;
  toonKaartPreview(kaart);
}

function toonKaartPreview(kaart) {
  const preview = document.getElementById("kaartPreview");
  document.getElementById("kaartPreviewImg").src = kaart.afbeelding || "";
  document.getElementById("kaartPreviewNaam").textContent = kaart.naam;
  document.getElementById("kaartPreviewPrijs").textContent = formatteerEuro(kaart.prijs);

  const rar = document.getElementById("kaartPreviewRarity");
  rar.textContent = t("rarity_" + (kaart.rarity || "common"));
  rar.className = "rarity-badge rarity-" + (kaart.rarity || "common");

  const kleurRij = document.getElementById("kaartPreviewKleuren");
  kleurRij.innerHTML = "";
  kleurRij.appendChild(maakManaRij(kaart.kleuren));

  preview.classList.remove("verborgen");
}

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

function behandelOpslaan(event) {
  event.preventDefault();
  const eigenaar = document.getElementById("invoerEigenaar").value;
  const datum = document.getElementById("invoerDatum").value;
  const omschrijving = document.getElementById("invoerOmschrijving").value.trim();
  const aantal = Math.max(1, parseInt(document.getElementById("invoerAantal").value, 10) || 1);

  if (!eigenaar) { toonFormMelding("formMelding", t("fout_eigenaar"), "fout"); return; }
  if (!datum)    { toonFormMelding("formMelding", t("fout_datum"),    "fout"); return; }
  if (!gekozenKaart) { toonFormMelding("formMelding", t("fout_kaart"), "fout"); return; }
  if (aantal < 1) { toonFormMelding("formMelding", t("fout_aantal"), "fout"); return; }

  const nieuw = {
    id: Date.now(),
    eigenaar: eigenaar,
    datum: datum,
    categorie: gekozenKaart.rarity || "common",
    omschrijving: omschrijving,
    waarde: Number(gekozenKaart.prijs || 0),
    aantal: aantal,
    kaartNaam: gekozenKaart.naam,
    kaartAfbeelding: gekozenKaart.afbeelding,
    kleuren: gekozenKaart.kleuren || [],
    set: gekozenKaart.set || "",
    setNaam: gekozenKaart.setNaam || ""
  };

  kaarten.push(nieuw);
  bewaarKaarten();
  actieveEigenaar = eigenaar;
  bewaarActief();

  herstelFormulier();
  toonFormMelding("formMelding", t("opslaan_ok"), "ok");
  toonOverzicht();
  toonScherm("overzicht");
}

function toonFormMelding(id, tekst, soort) {
  const m = document.getElementById(id);
  m.textContent = tekst;
  m.className = "form-melding " + soort;
}

function herstelFormulier() {
  document.getElementById("kaartForm").reset();
  document.getElementById("invoerDatum").value = vandaagTekst();
  document.getElementById("kaartPreview").classList.add("verborgen");
  document.getElementById("kaartSuggesties").classList.remove("zichtbaar");
  gekozenKaart = null;
  vulEigenaarDropdowns();
}

/* ===== 6. Vrienden + eigenaar-dropdowns ===== */

function vulSetDropdown() {
  const sel = document.getElementById("filterSet");
  if (!sel) return;
  const setKaart = {};
  kaartenVanEigenaar(actieveEigenaar).forEach(function (k) {
    if (k.set) setKaart[k.set] = k.setNaam || k.set;
  });
  const codes = Object.keys(setKaart).sort(function (a, b) {
    return setKaart[a].localeCompare(setKaart[b]);
  });
  sel.innerHTML = "";
  const eerste = document.createElement("option");
  eerste.value = "alles";
  eerste.textContent = t("filter_alle_sets");
  sel.appendChild(eerste);
  codes.forEach(function (code) {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = setKaart[code];
    sel.appendChild(opt);
  });
  if (huidigeSet !== "alles" && codes.indexOf(huidigeSet) === -1) huidigeSet = "alles";
  sel.value = huidigeSet;
}

function vulEigenaarDropdowns() {
  ["kiesEigenaar", "invoerEigenaar"].forEach(function (id) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = "";
    vrienden.forEach(function (naam) {
      const opt = document.createElement("option");
      opt.value = naam; opt.textContent = naam;
      if (naam === actieveEigenaar) opt.selected = true;
      sel.appendChild(opt);
    });
  });
}

function toonVrienden() {
  const lijst = document.getElementById("vriendenLijst");
  lijst.innerHTML = "";
  vrienden.forEach(function (naam) {
    const aantal = totaalAantal(kaartenVanEigenaar(naam));
    const li = document.createElement("li");
    li.className = "vriend-rij" + (naam === actieveEigenaar ? " actief" : "");

    const naamEl = document.createElement("span");
    naamEl.className = "vriend-naam"; naamEl.textContent = naam;
    li.appendChild(naamEl);

    const aantalEl = document.createElement("span");
    aantalEl.className = "vriend-aantal";
    aantalEl.textContent = aantal + " " + t("vrienden_kaarten");
    li.appendChild(aantalEl);

    const openKnop = document.createElement("button");
    openKnop.className = "vriend-knop";
    openKnop.type = "button";
    openKnop.textContent = t("vrienden_open");
    openKnop.addEventListener("click", function () { kiesActieveEigenaar(naam); });
    li.appendChild(openKnop);

    if (naam !== t("ik") && naam !== "Ik" && naam !== "Me") {
      const verwijder = document.createElement("button");
      verwijder.className = "vriend-verwijder";
      verwijder.type = "button";
      verwijder.textContent = "x";
      verwijder.setAttribute("aria-label", "Verwijder vriend");
      verwijder.addEventListener("click", function () { verwijderVriend(naam); });
      li.appendChild(verwijder);
    }
    lijst.appendChild(li);
  });
}

async function behandelVriendToevoegen(event) {
  event.preventDefault();
  const veld = document.getElementById("invoerVriend");
  const naam = veld.value.trim();
  if (!naam) { toonFormMelding("vriendMelding", t("fout_naam_leeg"), "fout"); return; }
  if (vrienden.indexOf(naam) !== -1) {
    toonFormMelding("vriendMelding", t("fout_naam_bestaat"), "fout"); return;
  }
  /* grapje: bij de tweede vriend (eerste extra na "Ik") tonen we een nep-rekening */
  if (vrienden.length === 1) {
    await infoPopup(t("grap_tweede_vriend"));
  }
  vrienden.push(naam);
  bewaarVrienden();
  veld.value = "";
  toonFormMelding("vriendMelding", "", "ok");
  toonVrienden();
  vulEigenaarDropdowns();
}

/* infoPopup() - informatieve modal met een enkele OK-knop.
   Klik op de knop, achtergrond of Esc om hem te sluiten. */
function infoPopup(tekst) {
  return new Promise(function (resolve) {
    const laag = document.createElement("div");
    Object.assign(laag.style, {
      position: "fixed", top: "0", left: "0",
      width: "100vw", height: "100vh",
      background: "rgba(28,19,10,0.72)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", boxSizing: "border-box", zIndex: "100000"
    });
    const doos = document.createElement("div");
    Object.assign(doos.style, {
      background: "#ece0c8",
      border: "3px solid #2e2013", borderRadius: "14px",
      boxShadow: "0 0 0 4px #78592e, 0 12px 30px rgba(0,0,0,.5)",
      padding: "22px 22px 18px", maxWidth: "360px", width: "100%",
      fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif"
    });
    const p = document.createElement("p");
    p.textContent = tekst;
    Object.assign(p.style, {
      fontSize: "1rem", color: "#2e2013",
      lineHeight: "1.45", margin: "0 0 18px"
    });
    const knop = document.createElement("button");
    knop.type = "button";
    knop.textContent = t("popup_oke");
    Object.assign(knop.style, {
      width: "100%", padding: "11px 10px",
      fontWeight: "800", fontSize: ".92rem",
      borderRadius: "8px", cursor: "pointer",
      background: "#c8a14a", color: "#1c130a",
      border: "2px solid #1c130a", fontFamily: "inherit"
    });
    doos.appendChild(p); doos.appendChild(knop);
    laag.appendChild(doos);
    document.body.appendChild(laag);
    function sluit() {
      laag.remove();
      document.removeEventListener("keydown", escH);
      resolve();
    }
    function escH(e) { if (e.key === "Escape") sluit(); }
    knop.addEventListener("click", sluit);
    laag.addEventListener("click", function (e) { if (e.target === laag) sluit(); });
    document.addEventListener("keydown", escH);
    knop.focus();
  });
}

async function verwijderVriend(naam) {
  if (naam === t("ik") || naam === "Ik" || naam === "Me") {
    toonFormMelding("vriendMelding", t("fout_ik_verwijderen"), "fout"); return;
  }
  if (!await bevestigPopup(t("vrienden_verwijder_bevestig"))) return;
  vrienden = vrienden.filter(function (v) { return v !== naam; });
  kaarten  = kaarten.filter(function (k) { return k.eigenaar !== naam; });
  if (actieveEigenaar === naam) actieveEigenaar = vrienden[0];
  bewaarVrienden(); bewaarKaarten(); bewaarActief();
  toonVrienden(); vulEigenaarDropdowns(); toonOverzicht();
}

function kiesActieveEigenaar(naam) {
  actieveEigenaar = naam; bewaarActief();
  vulEigenaarDropdowns(); toonOverzicht(); toonScherm("overzicht");
}

/* ===== 7. Statistieken ===== */

function toonStatistieken() {
  const lijst = kaartenVanEigenaar(actieveEigenaar);
  document.getElementById("statsEigenaar").textContent = actieveEigenaar;
  document.getElementById("statTotaal").textContent = totaalAantal(lijst);
  document.getElementById("statTotaalWaarde").textContent = formatteerEuro(totaalWaarde(lijst));
  document.getElementById("statTopKleur2").textContent = topKleurNaam(lijst);
  tekenKleurGrafiek(telPerKleur(lijst));
  toonRarityVerdeling(telPerRarity(lijst));
}

function tekenKleurGrafiek(telling) {
  const canvas = document.getElementById("grafiek");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const totaal = Object.keys(telling).reduce(function (s, k) { return s + telling[k]; }, 0);
  if (totaal === 0) {
    ctx.fillStyle = "#6b5d48";
    ctx.font = "13px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("grafiek_leeg"), W/2, H/2);
    vulKleurLegenda(telling, totaal);
    return;
  }
  const cx = W/2, cy = H/2, r = Math.min(cx, cy) - 12;
  let hoek = -Math.PI/2;
  Object.keys(telling).forEach(function (kl) {
    if (telling[kl] === 0) return;
    const eindHoek = hoek + (telling[kl] / totaal) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, hoek, eindHoek);
    ctx.closePath();
    ctx.fillStyle = KLEUR_HEX[kl]; ctx.fill();
    ctx.strokeStyle = "#1c130a"; ctx.lineWidth = 2; ctx.stroke();
    hoek = eindHoek;
  });
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "#8a6d2c"; ctx.lineWidth = 3; ctx.stroke();
  vulKleurLegenda(telling, totaal);
}

function vulKleurLegenda(telling, totaal) {
  const houder = document.getElementById("kleurLegenda");
  houder.innerHTML = "";
  Object.keys(telling).forEach(function (kl) {
    if (telling[kl] === 0) return;
    const item = document.createElement("span");
    item.className = "legenda-item";
    const stip = document.createElement("span");
    stip.className = "legenda-stip";
    stip.style.background = KLEUR_HEX[kl];
    item.appendChild(stip);
    const tekst = document.createElement("span");
    tekst.textContent = t("kleur_" + kl) + ": " + telling[kl];
    item.appendChild(tekst);
    houder.appendChild(item);
  });
}

function toonRarityVerdeling(telling) {
  const houder = document.getElementById("rarityVerdeling");
  houder.innerHTML = "";
  const rs = ["common", "uncommon", "rare", "mythic"];
  const max = Math.max.apply(null, rs.map(function (r) { return telling[r]; })) || 1;
  rs.forEach(function (r) {
    if (telling[r] === 0) return;
    const rij = document.createElement("div");
    rij.className = "format-balk-rij";
    const naam = document.createElement("span");
    naam.className = "format-balk-naam"; naam.textContent = t("rarity_" + r);
    const spoor = document.createElement("div");
    spoor.className = "format-balk-spoor";
    const vulling = document.createElement("div");
    vulling.className = "format-balk-vulling";
    vulling.style.width = ((telling[r] / max) * 100) + "%";
    spoor.appendChild(vulling);
    const aantal = document.createElement("span");
    aantal.className = "format-balk-aantal"; aantal.textContent = telling[r];
    rij.appendChild(naam); rij.appendChild(spoor); rij.appendChild(aantal);
    houder.appendChild(rij);
  });
}

/* ===== 8. Taal, reset, opstart ===== */

function wisselTaal(taal) {
  pasTaalToe(taal);
  vertaalIkInVrienden();
  toonOverzicht();
  if (!document.getElementById("scherm-statistieken").classList.contains("verborgen")) toonStatistieken();
  if (!document.getElementById("scherm-vrienden").classList.contains("verborgen"))    toonVrienden();
}

function vertaalIkInVrienden() {
  const oude = ["Ik", "Me"];
  const nieuw = t("ik");
  vrienden = vrienden.map(function (v) { return oude.indexOf(v) !== -1 ? nieuw : v; });
  kaarten.forEach(function (k) { if (oude.indexOf(k.eigenaar) !== -1) k.eigenaar = nieuw; });
  if (oude.indexOf(actieveEigenaar) !== -1) actieveEigenaar = nieuw;
  bewaarVrienden(); bewaarKaarten(); bewaarActief();
}

function vandaagTekst() {
  const nu = new Date();
  nu.setMinutes(nu.getMinutes() - nu.getTimezoneOffset());
  return nu.toISOString().slice(0, 10);
}

function koppelGebeurtenissen() {
  document.querySelectorAll(".nav-knop").forEach(function (knop) {
    knop.addEventListener("click", function () { toonScherm(knop.dataset.scherm); });
  });

  document.querySelectorAll(".filter-knop").forEach(function (knop) {
    knop.addEventListener("click", function () {
      document.querySelectorAll(".filter-knop").forEach(function (k) { k.classList.remove("actief"); });
      knop.classList.add("actief");
      huidigePeriode = knop.dataset.periode;
      toonOverzicht();
    });
  });

  document.getElementById("kiesEigenaar").addEventListener("change", function (e) {
    actieveEigenaar = e.target.value;
    bewaarActief();
    huidigeSet = "alles";
    document.getElementById("filterRarity").value = "alles";
    huidigeRarity = "alles";
    toonOverzicht();
  });

  document.getElementById("filterRarity").addEventListener("change", function (e) {
    huidigeRarity = e.target.value; toonOverzicht();
  });
  document.getElementById("filterSet").addEventListener("change", function (e) {
    huidigeSet = e.target.value; toonOverzicht();
  });

  document.getElementById("invoerKaart").addEventListener("input", behandelKaartZoeken);
  document.getElementById("kaartForm").addEventListener("submit", behandelOpslaan);
  document.getElementById("vriendForm").addEventListener("submit", behandelVriendToevoegen);

  document.getElementById("taalKnop").addEventListener("click", function () {
    wisselTaal(huidigeTaal === "nl" ? "en" : "nl");
  });
  document.querySelectorAll(".taal-optie").forEach(function (knop) {
    knop.addEventListener("click", function () { wisselTaal(knop.dataset.taal); });
  });

  document.getElementById("resetKnop").addEventListener("click", async function () {
    if (!await bevestigPopup(t("reset_bevestig"))) return;
    kaarten = [];
    vrienden = [t("ik")];
    actieveEigenaar = vrienden[0];
    bewaarKaarten(); bewaarVrienden(); bewaarActief();
    toonOverzicht();
    if (!document.getElementById("scherm-statistieken").classList.contains("verborgen")) toonStatistieken();
    if (!document.getElementById("scherm-vrienden").classList.contains("verborgen"))    toonVrienden();
  });
}

function start() {
  pasTaalToe(huidigeTaal);
  laadGegevens();
  vulEigenaarDropdowns();
  document.getElementById("invoerDatum").value = vandaagTekst();
  koppelGebeurtenissen();
  toonOverzicht();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(function (e) {
      console.warn("Service worker niet geregistreerd:", e);
    });
  }
}
document.addEventListener("DOMContentLoaded", start);
