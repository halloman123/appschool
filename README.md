# Magic Meeting

Een mobiele app (Progressive Web App) waarmee jij en je vrienden je
**Magic: the Gathering-verzameling** bijhouden. Iedere vriend heeft zijn
eigen lijst kaarten. Per kaart leg je vast wanneer je hem kreeg en een
korte notitie; de **rarity** en **prijs in euro** worden automatisch
opgehaald via de [Scryfall API](https://scryfall.com/docs/api).

Schoolproject voor KW1C - Software Development Niveau 4, module
*Eenvoudige Mobiele App (PWA)*.

## Functies

- Kaarten toevoegen, bekijken en verwijderen (opgeslagen in LocalStorage)
- Vrienden beheren - iedere vriend heeft zijn eigen verzameling
- Wisselen tussen verzamelingen via een dropdown
- Filteren op periode (dag/week/maand), rarity (common/uncommon/rare/mythic)
  en pak (de set waar de kaart uit komt)
- Kaart zoeken via Scryfall met live suggesties + kaartafbeelding
- Statistieken: totale waarde, top kleur, en een pie-chart van je kaarten
  per kleur, plus balken per rarity
- Taalswitch Nederlands / Engels
- Werkt offline en is installeerbaar als app (PWA)

## Techniek

- HTML5, CSS3 en JavaScript (zonder framework)
- Scryfall API voor kaartgegevens, afbeeldingen en prijzen
- LocalStorage voor de eigen gegevens
- Service worker + manifest voor offline gebruik en installatie

## Lokaal draaien

De app is statisch. Plaats de map in `htdocs` van XAMPP en open in je browser:

```
http://localhost/appschool/
```

Openen via `localhost` (of `https`) is nodig: de service worker werkt niet
als je het HTML-bestand direct opent vanaf je schijf.

## Mappen

| Map / bestand       | Inhoud                                                |
|---------------------|-------------------------------------------------------|
| `index.html`        | De app (5 schermen: overzicht, toevoegen, vrienden, stats, over) |
| `css/`              | Vormgeving in de stijl van een Magic-kaartachterkant   |
| `js/i18n.js`        | Vertalingen NL/EN                                     |
| `js/scryfall.js`    | Koppeling met de Scryfall API                         |
| `js/app.js`         | Hoofdlogica (CRUD, filters, vrienden, statistieken)   |
| `manifest.json`     | PWA-instellingen                                      |
| `service-worker.js` | Offline-functionaliteit                               |
| `icons/`            | App-iconen                                            |
| `ontwerp/`          | Grof ontwerp (B1)                                     |

## Gegevens (LocalStorage)

| Sleutel                 | Inhoud                                  |
|-------------------------|-----------------------------------------|
| `magicKaarten`          | Alle kaarten van alle eigenaren         |
| `magicVrienden`         | Lijst met namen van vrienden (incl. "Ik") |
| `magicActieveEigenaar`  | De verzameling die op dat moment getoond wordt |
| `magicTaal`             | `nl` of `en`                            |

Per kaart wordt opgeslagen: datum, rarity, notitie, prijs in euro,
kaartnaam, kaartafbeelding, manakleuren en de set.

## Bron

Kaartdata, afbeeldingen en prijzen: [Scryfall](https://scryfall.com).
Magic: the Gathering is een product van Wizards of the Coast; deze app
is een schoolproject en niet officieel gelieerd.
