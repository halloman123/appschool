# Magic Meeting

Een mobiele app (Progressive Web App) om je **Magic: the Gathering**-potjes en
-toernooien bij te houden. Per "meeting" leg je de datum, het format, een
omschrijving en het resultaat vast. Via de [Scryfall API](https://scryfall.com/docs/api)
koppel je een sleutelkaart aan elke meeting.

Schoolproject voor KW1C — Software Development Niveau 4, module *Eenvoudige Mobiele App (PWA)*.

## Functies

- Meetings toevoegen, bekijken en verwijderen (opgeslagen in LocalStorage)
- Filteren per periode: dag, week of maand
- Sleutelkaart zoeken via de Scryfall API (met autocomplete en kaartafbeelding)
- Statistieken met een grafiek (gewonnen potjes per maand) en verdeling per format
- Taalswitch Nederlands / Engels
- Werkt offline en is installeerbaar als app (PWA)

## Techniek

- HTML5, CSS3 en JavaScript (zonder framework)
- Scryfall API voor kaartgegevens
- LocalStorage voor de eigen gegevens
- Service worker + manifest voor offline gebruik

## Lokaal draaien

De app is statisch. Plaats de map in `htdocs` van XAMPP en open:

```
http://localhost/mobileApp/
```

Openen via `localhost` (of `https`) is nodig: de service worker werkt niet als
je het bestand direct opent.

## Mappen

| Map / bestand        | Inhoud                                   |
|----------------------|------------------------------------------|
| `index.html`         | De app (vier schermen)                   |
| `css/`               | Vormgeving                               |
| `js/`                | i18n.js, scryfall.js, app.js             |
| `manifest.json`      | PWA-instellingen                         |
| `service-worker.js`  | Offline-functionaliteit                  |
| `icons/`             | App-iconen                               |
| `ontwerp/`           | Grof ontwerp (B1)                        |

## Bron

Kaartdata en afbeeldingen: [Scryfall](https://scryfall.com). Magic: the Gathering
is een product van Wizards of the Coast; deze app is een schoolproject en niet
officieel gelieerd.
