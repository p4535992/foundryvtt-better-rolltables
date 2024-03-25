## Better RollTables

### VERY OLD DOCUMENTATION DEPRECATED

How to use [**Loot Tables**](./old/Loot-Tables.md)

How to use [Better RollTables Macros](./old/API-for-macros-and-modules#how-to-roll-tables-from-macros)

[FAQs](./old/FAQ.md)

## Common Features (These feature are present by default in all the BRT tables)

*Work in progress, any help is welcomed*

### Inline roll on table text result

### OLD BEHAVIOUR (It's not advisable to ue this)

![](./img/common_type_inline_data_roll.png)

Every BRT table apply inline roll on text table result with the prefix "roll/" on the text result content.

As a example a text like this:

```
/roll (1d4) +5
```

is converted runtime in this

```
Rolled: 7
```

### NEW BEHAVIOUR

Lets you create buttons in item descriptions, chat messages, or journal entries to trigger commands. They look very similar to the deferred inline roll buttons you can create with core Foundry. They also have a similar syntax, making them easy to use and you can use them in the same places.

Say a feature requires a skill check. Currently, the dnd5e system does not support that action type so you have to write it in the description and the player has to trigger it manually. Now you can put `[[/rollSkill slt]]` into the feature's description and this module will turn that into a button that will roll an Slight of Hand check when clicked.

If you are familiar with the deferred inline rolls that Foundry supports, then this should look familiar. You write a command inside square brackets that will trigger that command when clicked. You can optionally pass a flavor at the end to override the button text and use as flavor text when rolled.


![Fast Hands before screenshot](/wiki/img/common_fast-hands-before.png) ![Fast Hands after screenshot](/wiki/img/common_fast-hands-after.png)

**General Syntax:** `[[/<roll-mode><command> <command arguments>]]{<flavor>}`

### Roll Command



### Skill Command (Only tested with Dnd5e)

This command will trigger a skill check for the currently-selected tokens. The command requires the skill ID (the short, 3-letter code) for the skill you want to roll. You can find the skill IDs by typing `CONFIG.DND5E.skills` into the browser's console.

**Example:** `[[/rollSkill ath]]` to make an Athletics check

### Ability Command (Only tested with Dnd5e)

This command will trigger an ability check for the currently-selected tokens. The command requires the ability ID (the short, 3-letter code) for the ability check you want to roll. You can find the ability IDs by typing `CONFIG.DND5E.abilities` into the browser's console.

**Example:** `[[/rollAbility str]]` to make a Strength ability check

Simple roll to manage

**Example:** `[[/roll 1d6+3]]`

### Save Command (Only tested with Dnd5e)

This command will trigger a saving throw for the currently-selected tokens. The command requires the ability ID (the short, 3-letter code) for the saving throw you want to roll. You can find the ability IDs by typing `CONFIG.DND5E.abilities` into the browser's console.

**Example:** `[[/rollSave dex]]` to make a Dexterity saving throw

### Item Command

This command will use an item that the selected token has. The command requires the name of the item you want to use and only supports the `roll` Roll Mode.

**Example:** `[[/rollItem Dagger]]` to use a Dagger

### Roll Modes

In addition to the regular `/roll` that uses the current roll mode at the bottom of the chat log, you can explicitly make the button perform other roll modes using their syntax. Useful if you want to prompt players to make a blind roll so only the GM sees the result by using `/blindroll`. More information on roll modes can be found on the [Basic Dice](https://foundryvtt.com/article/dice/) Foundry KB article.

**Example:** `[[/gmrSkill ath]]` for a GM Roll or `[[/srSkill ath]]` for a Self Roll

## Possible Enhancements

There are other possible `Actor5e` functions that could be turned into commands. If you feel like one of these would be useful to you, please file a GitHub issue and I'll consider adding it.

- `rollDeathSave`
- `rollHitDie`
- `shortRest`
- `longRest`
- `convertCurrency`
- `transformInto` (unlikely, has too many arguments)
- `revertOriginalForm`

### Customize images and names

With BRT, it is possible to customize the images and names of items without editing them directly on the compendiums, which is useful for those who want to make a merchant more customized or differentiate products by zone

![](/wiki/img/common_customize_image_name.gif)

### Inner Table + Customized Roll Amount for every rolltable + Quantity Handling

So many combination so little time for a good documentation...

![](/wiki/img/common_type_inner_tables_1.gif)

## Better Tables

*Work in progress, any help is welcomed*

## Loot Tables

*Work in progress, any help is welcomed*

### Inline currency data roll on table text result

![](./img/loot_type_inline_currency_data_roll.png)

Every BRT Loot table apply inline roll for the currency data on text rable result.

**NOTE:** Every text table result in a type BRT Loot tables is treated as a currencyData formula and converted in a item piles supported formula.

This feature support many format from old and other modules here a list:

- Old brt format: `100*1d6[gp],4d4+4[sp] to 100*1d6gp 4d4+4sp`
- Harvester format: `[[/r 5d6]]{Copper} and [[/r 1d6*100]]{Electrum}[[/r 2d6*10]]`
- Old brt loot currency formula: `{(2d8+1)*10[cp], 6d8+3 [sp]}`
- Html code base with the editor: `<p>100*1d6[gp],4d4+4[sp]</p>`,`<p>[[/r 5d6]]{Copper} and [[/r 1d6*100]]{Electrum}[[/r 2d6*10]]</p>`, `<p>{(2d8+1)*10[cp], 6d8+3 [sp]}</p>`
- Item Piles format **(The advisable format to use)**: `((2d8+1)*10)cp (6d8+3)sp`

As a example a text like this:

```
{(2d8+1)*10[cp], 2d8+1 [sp]}
```

is converted runtime in this

```
20cp 16sp
```



## Harvest Tables

*Work in progress, any help is welcomed*

### Multiple Skill denomination allowed

Usually you put a single skill denomination like "nat" or "arc" , but now if there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll.

This is very useful with the feature "Dynamic DC Feature" for create very elaborate rolltable.

### Dynamic DC Feature

It will let you to set multiple and random check at once for dc checks e.g. 'nat=1d20, arc=23'

![](/wiki/img/harvest_type_dynamicdc_feature_2.png)
![](/wiki/img/harvest_type_dynamicdc_feature_1.png)


## Story Tables

*Work in progress, any help is welcomed*
