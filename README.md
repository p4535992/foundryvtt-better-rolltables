# Better Rolltables #

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/foundryvtt-better-rolltables/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge)

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fbetter-rolltables&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=better-rolltables)

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-better-rolltables%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-better-rolltables%2Fmaster%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fbetter-rolltables%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/better-rolltables/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/foundryvtt-better-rolltables/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/better-rolltables/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/better-rolltables/)

### If you want to buy me a coffee [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/p4535992)

*better-rolltables* is Module for FoundryVTT to improve and add functionality to Rollable tables
Implementing for example the Treasure Hoard" Tables from the Dungeon master manual becomes possible!

## Features

- Weight normalization: Generates appropriate weight value to results based on range, as opposed to doing the inverse with base sheet.
- Drag & drop re-ordering: Allows drag & dropping results to re-order them. This involves above weight normalization being called automatically as ordering is based on ranges, and doing it without weights is unnecessarily difficult, so make sure this is intended.
- Text result rich editor: Allows editing a text result in ProseMirror.
- Enhance your RollTables with Drag and Drop, Generate Loot, Encounters and and build your NPC Generator!
- Roll on multiple tables with roll formulas
- Auto create a loot actor to store generated loot
- Automatically select a random spells when a scroll item is selected
- A table can specify multiple currencies (with roll formulas) to always be awarded
- Adds an option to change the table roll to GM only.
- Adds the option to automatically import rolled items in controlled actors

## NOTES ABOUT UPDATE FROM 1.8.95 for FVTT 9 to 1.9.1 FVTT 10

The module was updated for the 10 by [elizeuangelo](https://github.com/elizeuangelo) on commission and then perfected by [sasquach45932](https://github.com/sasquach45932) with some updates and bug fixing . Finally [p4535992](https://github.com/p4535992) applied some code best practices (module id as prefix of i18n and css rules, etc.) and taking over maintenance of the module.

A special ty to the original authors [Ultrakorne#6240](https://discordapp.com/users/Ultrakorne#6240), [JackPrince#0494](https://discordapp.com/users/JackPrince#0494) and [DanielBöttner](https://github.com/DanielBoettner).

## NOTE: This module is under maintenance, I have no plans to update or add features. However, I will try to fix any bugs as possible. Any contribution is welcome.

### Intro video

[![Overview video](https://img.youtube.com/vi/TRg4y0joOKA/0.jpg)](https://www.youtube.com/watch?v=TRg4y0joOKA)

[How to Wiki](https://github.com/p4535992/foundryvtt-better-rolltables/blob/master/wiki/Home.md)

## How to use it

### Documentation

* [**Wiki**](https://github.com/p4535992/foundryvtt-better-rolltables/blob/master/wiki/Home.md)
* [How to use Loot Tables](https://github.com/p4535992/foundryvtt-better-rolltables/blob/master/wiki/Loot-Tables.md)
* [FAQs](https://github.com/p4535992/foundryvtt-better-rolltables/blob/master/wiki/FAQ.md)
* [Macro guide](https://github.com/p4535992/foundryvtt-better-rolltables/blob/master/wiki/API-for-macros-and-modules#how-to-roll-tables-from-macros.md)

# 3rd party integration

 | Module | Integration description |
 | ------ | ----------------------- |
 | [LootSheet NPC module](https://github.com/jopeek/fvtt-loot-sheet-npc-5e) | Suggest to use. If installed, _BetterRolltables_ will automatically use it. |
 | [Autocomplete inline properties](https://github.com/ghost-fvtt/FVTT-Autocomplete-Inline-Properties) | If installed offers autocompletion on tags. |

## Api

All informations about the api can be found here [API](./wiki/api/api.md)

# Build

## Install all packages

```bash
npm install
```

### dev

`dev` will let you develop you own code with hot reloading on the browser

```bash
npm run dev
```

## npm build scripts

### build

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run build
```

### build-watch

`build-watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build-watch
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

## [Changelog](./CHANGELOG.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/foundryvtt-better-rolltables/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- **[Enhanced RollTable Sheet](https://gitlab.com/koboldworks/agnostic/rolltable-sheet)** : [MIT](https://gitlab.com/koboldworks/agnostic/rolltable-sheet/-/blob/main/LICENSE)
- **[sortable](https://gist.github.com/code-boxx/45ebe489b99583dc170564113b1ad24e)** : [Code Boxx](https://gist.github.com/code-boxx/45ebe489b99583dc170564113b1ad24e#file-0-js-sortable-table-md)
- **[Roll Table Importer](https://github.com/ClipplerBlood/roll-table-importer)** : [???]()


This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Credit

- [code-boxxKoboldworks](https://gitlab.com/koboldworks) and the module [Enhanced RollTable Sheet](https://gitlab.com/koboldworks/agnostic/rolltable-sheet)
- [code-boxx](https://github.com/code-boxx) and the module [sortable](https://gist.github.com/code-boxx/45ebe489b99583dc170564113b1ad24e)
- [ClipplerBlood](https://github.com/ClipplerBlood) and the module [Roll Table Importer](https://github.com/ClipplerBlood/roll-table-importer)
