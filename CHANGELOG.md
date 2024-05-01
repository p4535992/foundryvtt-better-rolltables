TODO
- Add confirm dialog on reset button ???
- Add flags for cost/price like already done for the quantity is possible now with item piles support

### 2.1.18

- Add new feature "Actor List" connect with some uuid a actor to N rolltable useful for integrate this with other module

### 2.1.17

- Add new api parameters 'rollAsTableType' and 'rollAsTableTypeAllTheTables'so you can roll the same roll table as "Loot" or "Harvest" or "Better" or "Story"

### 2.1.16

- Add some api method and little fix here and there

### 2.1.15

- Add module settings patch... forceNormalizeIfNoResultAreDrawn

### 2.1.12-2.1.13-2.1.14

- Some bug fixing here and there
- Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/35

### 2.1.10-11

- Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/34

### 2.1.9

- Little fix on the multiple tokens loop

### 2.1.8

- Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/32
- Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/33
- Add new feature multiple skill denomination on harvest tables

### 2.1.7

- Add Dynamic DC feature with OR conditions

### 2.1.6

- Add options `stackResultsWithBRTLogic` to stack table results if you want like item piles do under the hood

### 2.1.5

- Rewrite everything on the chat card code
- Add helper for stack results
- Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/30
- Add check on result.drawn as disabled if uuid is broken

### 2.1.4

- Little fix on method isUuid on retrieve helpers

### 2.1.3

- Add class compendium helpers
- Fix retrieve uuid doc sometime fails
- Fix customize image on rolltable
- Fix customize name on rolltable

### 2.1.2

- Big clean up
- Remove the multisystem we leverage everything with item piles
- Add inline roll for all brt types
- Add inline roll for additional currency on loot table
- Convert "Better Result" to a valid "TableResult" for use the toObject and getChatText methods
- Rename old better table reslt uuid tu uuidDoc
- Start a new documentation

### 2.1.1

- Little fix on check for dc with negative numbers

### 2.1.0 [BREAKING CHANGES]

[BREAKING CHANGES] New major release, don't update the module just before a session, take time to do some testing. I rewrote a lot of code, but the most important thing is that I now rely on the item piles module for more complex operations.

- Try to Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/28
- Try to bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/26
- Add item-piles module as dependency and integrate in the core code of the module
- Add feature: https://github.com/p4535992/foundryvtt-better-rolltables/issues/11
- Can't replicate https://github.com/p4535992/foundryvtt-better-rolltables/issues/21
- Can't replicate: https://github.com/p4535992/foundryvtt-better-rolltables/issues/25
- Can't replicate: https://github.com/p4535992/foundryvtt-better-rolltables/issues/27

### 2.0.34

- Try to Bug fix again https://github.com/p4535992/foundryvtt-better-rolltables/issues/16

### 2.0.33

- Try to Bug fix https://github.com/p4535992/foundryvtt-better-rolltables/issues/22

### 2.0.32

- Bug fix https://github.com/p4535992/foundryvtt-better-rolltables/issues/16
- Bug fix https://github.com/p4535992/foundryvtt-better-rolltables/issues/25
- BUg fix https://github.com/p4535992/foundryvtt-better-rolltables/issues/23 ty to @DemianWright
- Add some comment on the sheet about the red background

### 2.0.31

- Little fix on _createItem function

### 2.0.30

- Clean up the code remove old and deprecated config class in favor of the constants class
-
### 2.0.29

- allow (again) quantity formula to accept text (like 1d10) ty to @Pantus

### 2.0.27-28

- Add Feature: https://github.com/p4535992/foundryvtt-better-rolltables/issues/12

### 2.0.26
- Some clean up
- Removed the Spell Caching Feature for good, every system will manage this stuff

### 2.0.25

- Little fix on html template e removed the css background color for not override the one chosen from the system

### 2.0.24 [BREAKING CHANGES]

- Some bug fix on the updateOptions function
- NEW Feature: Add the options displayChat
- NEW Feature: Use Percentage instead range and weight !!! https://github.com/p4535992/foundryvtt-better-rolltables/issues/8
- Convert the input for Quantity and DC to number on the sheet
- Downgrade old method for roll , the one used from itemPiles for retrocompatibility here https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/f4aa02d179c8fee8ba74322db6f4989b23949ff8/src/helpers/pile-utilities.js#L1602

### 2.0.23

- Try to fix again: https://github.com/p4535992/foundryvtt-better-rolltables/issues/3 with socket trick

### 2.0.22

- Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/9

### 2.0.21

- add check for rolltable not undefined on API methods
- remove old css for avoid to override standard css
- add a force rendition for the uuid reference on the table results to avoid to have all the rows colored red qhen change betwenn the old standard sheet and the new ones
- try to bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/7


### 2.0.20

- Bug fix API addLootToSelectedToken

### 2.0.19

- Bug fix on prepareCardData method on better-tables.js line 312

### 2.0.18

- Some little fix

### 2.0.17

- Big update a bunch of bug fixing and better management for inner hidden table result
- Bug fix: https://github.com/p4535992/foundryvtt-better-rolltables/issues/3
- New feature add 'Distinct Result' and 'Distinct Result keep Rolling' feature to the sheet

### 2.0.14-15-16

- Many bug fixing

### 2.0.13

- Many bug fix and big clean up of the code
-
### 2.0.9-10-11-12

- Bug fix https://github.com/p4535992/foundryvtt-better-rolltables/issues/2

### 2.0.8

- Little css fix

### 2.0.5-6-7

- Bug fix
- Add weight property to multisystem behaviour
- Add a better results to items data method with uuid on teh returned result

### 2.0.4

- Update pack and add flag result custom name

### 2.0.3

- Emergency bug fixing replace getDocuments() with contents on compendium

### 2.0.2

- Update chat card templates

### 2.0.1

- Some bug fix
- Regenerate packs
- Add flag for uuid
- Add code for automatic generate uuid referecne fom table result

### 2.0.0 [BREAKING CHANGES]

- [BREAKING CHANGES] Do not update just before a sessione take you time to mak some test
- Better API integration with many new options
- Better multisystem integration
- New feature: Add api method to convert compendium to rooltable with or without filter
- Every BRT Type Table has is own sheet
- Removed old Tag feature (i will look to a integration with the taggere module later)
- Removed old panel html behaviour
- New Feature: New HARVEST Table Type with filter for the result base on dc and skill string
- New Feature: Import table results on actor and or token
- Removed old integration with lootshet, just use whatever you like Item Piles, Dfred Pocket Change ecc. (Item Piles integration not excluded in the future)
- New Feature: Edit table result type Document/Compendium (render sheet) or type Text with Prose Mirror (ty to koboldworks for the inspiration)
- New Feature: Drag & drop and re-ordering table element (ty to koboldworks for the inspiration).
- New Feature: Generates appropriate weight value to results based on range, as opposed to doing the inverse with base sheet (ty to koboldworks for the inspiration).
- New Feature: Allows editing a text result in ProseMirror (ty to koboldworks for the inspiration).
- Add module settings for re-enable the old 1.9.X behaviour if you really want...
- Integration with the module [Better Harvesting & Looting](https://github.com/OhhLoz/Harvester), checkout the big compendium
- Documentation for api and use cases on demand...

### 1.9.4

- Adds an option to change the table roll to GM only. Add the hidden table checkbox feature on the roll drawn from rolltable (liKe the ol kandashi module)

### 1.9.3

- upgrade for fvtt11

### 1.9.2

- Fixed a retrocomaptibility error on flags for formula text

### v1.9.1 the [p4535992](https://github.com/p4535992) refactoring

- Maintance mode for fvtt10
- refactor the code with best practices

### v1.9.0.1 the [sasquach45932](https://github.com/sasquach45932) bug fixing

- Additional fixes for Foundry v10

### v1.9.0.0 the [elizeuangelo](https://github.com/elizeuangelo) rework

- Now fully compatible with Foundry v10

### v1.8.9.5 > v1.8.92/3/4

- added support for actor and scene conversion to map and portrait loot item
- Fixed several Spell scroll related issues
- Added general <a href="https://foundryvtt.com/packages/pf1">Pathfinder 1e</a> support. Thanks to <a href="https://github.com/mkahvi">Mana</a> for the quick help.
- Fixed the <a href="https://github.com/p4535992/foundryvtt- better- rolltables/blob/master/scripts/API.js">API</a>

### v1.8.9

- Several Updates by JackPrince [ <a href="https://discordapp.com/users/JackPrince#0494" title="JackPrince"><i class="fab fa- discord"></i></a> <a href="https://github.com/DanielBoettner"><i class="fab fa- github"></i></a> ]
- Interface updates
- simple tags one tables
- added an <a href="https://github.com/p4535992/foundryvtt- better- rolltables/blob/master/scripts/API.js">API</a>
- allow a betterRoll with options, this allows for example to roll with BetterRolltables from a Lootsheet(using the formulas from the lootsheet)

### v1.8.6

- Fixed a bug in <em>createTableFromCompendium()</em>

### v1.8.4

- various fixes
- Added a method that allows populating tokens (e.g. via macro)

### v1.8.3

- add option to disable message when generating loot to actor (disabled by default)
- fix null JournalEntry error when rolling story table

### v1.8.2

- Various bug fixes

### v1.8.1

- Various bug fixes

### v1.8.0

- Another update from Daimakaicho for this update
- add new currency sharing feature (to be activated in the options) <img src="https://user- images.githubusercontent.com/1334405/127393996- 4be06643- dbcc- 47d7- 8b43- b996b19a2398.gif" />
- remove all .mjs extension to help with reverse proxy
- fix images not loaded in compendiums when better- rolltables is enabled
- fix text results handled as items when using new tables mode
- fix broken result icon when result is a macro

### v1.7.0

- Thanks to Daimakaicho for this entire update! see <a href="https://github.com/p4535992/foundryvtt- better- rolltables/releases/tag/v1.7.0">patch notes</a> for full description
- Various QOL improvements (see the module option to enable them and patch notes for screenshots)
- A new option has been added to stick the header of rolltable to top
- A button is now append to linked rolltables in journal entries to roll table in one click!
- A "roll table" action has been add to rolltables context menu to allow rolling table without opening it
- A "Roll compendium" has been added on compendiums context menu to allow rolling on compendium without creating a specific rolltable

### v1.6.14

- Thanks to Daimakaicho for this entire update!
- Fixed create table from compendium
- improved roll table performance on big tables with multiple draws.
- random spell scroll generation improvements

### v1.6.13

- Thank to JackPrince and Daimakaicho for the update
- French Translation
- Story text is now selectable
- Various Bugfixes

### v1.6.12

- Another update from JackPrince#0494 (<a href="https://github.com/DanielBoettner">github.com/DanielBoettner</a>) fixing generation of spellscrolls.
- Add link and description of spell to the spell scrolls
- Updated the method to generate tables from a compendium
- Added an entry to the contextmenu of a compendium to start generation
- Fixes inline rolls like Lorem ipsum got [[3d6]] of dolor sit amet
- Adds German translation

### v1.6.11

- Thanks to JackPrince#0494 (<a href="https://github.com/DanielBoettner">github.com/DanielBoettner</a>) for this update, he fixed the broken tables loosing the table type after clicking update. <b>Note:</b> this fix requires foundry 0.8.8 to work
- code cleaning and api updates in preparation for foundry 0.9

### v1.6.10

- Fixed Item not stacking correctly when rolling a loot table on an actor
- Fixed Currency not working correctly when rolling a loot table on an actor
- Known issue: after clicking update the table type resets to default. As a workaround please modify the table, click update and after reset the type to the wanted one
- Please report bugs on github with screenshots showing the table and the related issue

### v1.6.9

- Fixed Story Tables not working in foundry 0.8.x
- Known issue: after clicking update the table type resets to default. As a workaround please modify the table, click update and after reset the type to the wanted one
- Please report bugs on github with screenshots showing the table and the related issue

### v1.6.8

- Fixed Formula field for each table result not showing
- Known issue: after clicking update the table type resets to default. As a workaround please modify the table, click update and after reset the type to the wanted one
- Please report bugs on github with screenshots showing the table and the related issue

### v1.6.7

- Fixed inner roll tables rolls broken in 0.8
- Updated module to work with foundry 0.8.x
- Merged pull request from Fotamecus to better support systems like PF1E

### v1.6.4

- Exposed API to get story reults via macro 'game.betterTables.getStoryResults(table)' (thanks jsabol)
- Added macro only function to add generated loot to selected token with 'game.betterTables.addLootToSelectedToken(table)' (Thanks VaderDojo for the code)

### v1.6.3

- Module updated for foundry 0.7.5
- fixed paypal link (that's why i was getting no tip right!?

### v1.5.1

- Faster performance when parsing loot tables with a lot of text entries
- Fixed a bug where text items where not created correctly

### v1.5.0

- Loot tables now also have the formula field for every result similar to (not for text result)
- Updated Loot table examples (5e) showcasing simpler table configuration
- New documentation page for <a href="https://github.com/p4535992/foundryvtt- better- rolltables/wiki/Loot- Tables">loot tables</a>
- Spanish translation (thanks to HonzoNebro)

