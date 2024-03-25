
### NEW BEHAVIOUR

Lets you create buttons in item descriptions, chat messages, or journal entries to trigger commands. They look very similar to the deferred inline roll buttons you can create with core Foundry. They also have a similar syntax, making them easy to use and you can use them in the same places.

Say a feature requires a skill check. Currently, the dnd5e system does not support that action type so you have to write it in the description and the player has to trigger it manually. Now you can put `[[/rollSkill slt]]` into the feature's description and this module will turn that into a button that will roll an Slight of Hand check when clicked.

If you are familiar with the deferred inline rolls that Foundry supports, then this should look familiar. You write a command inside square brackets that will trigger that command when clicked. You can optionally pass a flavor at the end to override the button text and use as flavor text when rolled.


![Fast Hands before screenshot](/wiki/img/common_fast-hands-before.png) ![Fast Hands after screenshot](/wiki/img/common_fast-hands-after.png)

**General Syntax:** `[[/<roll-mode><command> <command arguments>]]{<flavor>}`

### Roll Command

TODO


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
