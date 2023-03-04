# Available API methods

You can create a macro using the API provided by better rolltables.
The API offers the following methods (WIP not complete)

* `roll(tableEntity)`
* `betterTableRoll(tableEntity,options)`
* `generateChatStory()`
* `createTableFromCompendium(tableName, compendium, weightPredicateObject)`
* `generateLoot(tableEntity,options)`
* `generateChatLoot(tableEntity,options)`
* `addLootToSelectedToken(tableEntity, token, options)`
* `rollCompendiumAsRolltable(compendium)`

The `options` Argument is optional.

You can check the [better-tables.js](https://github.com/p4535992/foundryvtt-better-rolltables/blob/master/scripts/better-tables.js)
for all available methods.

See the [options page](https://github.com/p4535992/foundryvtt-better-rolltables/wiki/Options-Argument-for-API-methods) for optional
arguments.

## Roll tables from macros
Available from _Better RollTables_ v1.1

### Roll loot in Chat:
```js
const table = game.tables.getName("Loot Table");
game.betterTables.generateChatLoot(table);
```

### Roll a loot table to and populate an Actor:
Note: This will be changed soon to allow overriding the actor.
Currently the actor is taken from the loot table.

```js
const table = game.tables.getName("Loot Table");
game.betterTables.generateLoot(table);
```
### Populate a token with Loot

With #141 support for a token argument was added to `addLootToSelectedToken ()`.
This allows macros or other modules to give a single token or an array of tokens to the method to be used.

As a fallback the there still is a check for currently controlled tokens.
The `[options](https://github.com/p4535992/foundryvtt-better-rolltables/wiki/Options-Argument-for-API-methods)` argument currently has no effect on the method.

## Example

Where `token` is either a token or an array of tokens (like `canvas.tokens.controlled`).

```javascript
const name = 'myLootRolltable',
          rolltable = game.tables.getName(name);

game.betterTables.addLootToSelectedToken(rolltable, token);
```
### Roll a story table:
```js
const table = game.tables.getName("Random NPC");
game.betterTables.generateChatStory(table);
```

### Roll a table as a Better table:
```js
const table = game.tables.getName("Random NPC");
game.betterTables.betterTableRoll(table);
```

The above code works when your table is in the world.
To roll on a table from a compendium you need to have the code for that.
See the example below.

### Roll a table that is inside a compendium
```js
(async () => {
const compendiumContent = await game.packs.get("name.of.the.compendium").getContent();
const table = compendiumContent .find(i => i.name === `Treasure Hoard: Challenge 11-16`);
game.betterTables.generateLoot(table);
})()
```

## Generate rolltables from compendia
### Examples
#### Compendium to rolltable

Using `createTableFromCompendium()` and omitting the optional weightPredicate in a macro or a module.
The following example will take the content of the compendium **dnd5e.items** and create a new rollable table named **My table name**.

```js
game.betterTables.createTableFromCompendium("My table name", "dnd5e.items");
```

You can also filter the entries taken from the the referenced compendium or customize
the weights of each tableResult providing an optional predicate argument when calling `createTableFromCompendium()`.

The optional argument is expected to be an object like this `{weightPredicate: fooFunction}`.

`fooFunction` will be called on every entry/tableResult during table generation.
Entries/tableResults with a weight of `0` will be removed.

#### Filtering the entries

```js
game.betterTables.createTableFromCompendium(
 "001 TABLE",
 "dnd5e.items",
 { weightPredicate: predicate }
);

/*
* this function **has to return the weight** as an integer to use in the table. (0 will not include the item)
*/
function predicate(entity) {
    if(entity.type != "consumable") return 0;
    if(entity.data.data.consumableType != "potion") return 0;
    return 1;
}
```
The above predicate function will only select potions from the dnd5e.items compendium.

#### Adding weight

When not (just) using the predicate function to filter unwanted entries it can be used to
to change the weights.

```js
game.betterTables.createTableFromCompendium("RarityWeightedTable",
    "dnd5e.items",
    { weightPredicate: rarityFilter }
);

function rarityFilter(entity) {
    if(entity.type != "loot") return 0;

    switch (entity.data.data.rarity) {
        case "common":
            return 16;
        case "uncommon":
            return 8;
        case "rare":
            return 4;
        case "veryRare":
            return 2;
        case "legendary":
            return 1;
        default:
            return 0;
    }
}
```