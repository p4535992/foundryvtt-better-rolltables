# API DOCUMENTATION

### This is the documentation to the old api, it will remain for retrocompatibility, all the api references are moved from ` game.betterTables` and `game.modules.get("better-rolltables").public.API` to `game.modules.get("better-rolltables").api`, so please use  `game.modules.get("better-rolltables").api` for get api form this module.

### The documentation can be out of sync with the API code checkout the code if you want to dig up [API](../../src/scripts/API.js)

The api is reachable from the variable `game.modules.get('better-rolltables').api` or from the socket libary `socketLib` on the variable `game.modules.get('better-rolltables').socket` if present and active.


## OLD API

### roll(tableEntity:RollTable):void ⇒ <code>Promise&lt;void&gt;</code>

`game.modules.get("better-rolltables").api.roll(tableEntity)` ⇒ `Promise<object>`

Creates an item pile token at a location, or an item pile actor, or both at the same time.

**Returns**: `Promise<object<{tokenUuid: string, actorUuid: string}>>` - The UUID of the token and/or actor that was just created.

| Param                    | Type                    | Default | Description                                                                                                           |
|--------------------------|-------------------------|---------|-----------------------------------------------------------------------------------------------------------------------|
| options                  | `object`                |         | Options to pass to the function                                                                                       |
| [options.position]       | `object/boolean`        | `false` | Where to create the item pile, with x and y coordinates                                                               |
| [options.sceneId]        | `string/boolean`        | `false` | Which scene to create the item pile on                                                                                |
| [options.tokenOverrides] | `object`                | `{}`    | Token data to apply onto the newly created token                                                                      |
| [options.actorOverrides] | `object`                | `{}`    | Actor data to apply to the newly created actor (if unlinked)                                                          |
| [options.itemPileFlags]  | `object`                | `{}`    | Item pile specific flags to apply to the token and actor - see [pile flag defaults](constants.md#pile-flag-defaults)  |
| [options.items]          | `Array/boolean`         | `false` | Any items to create on the item pile                                                                                  |
| [options.createActor]    | `boolean`               | `false` | Whether to create a new item pile actor                                                                               |
| [options.pileActorName]  | `string/boolean`        | `false` | The UUID, ID, or name of the actor to use when creating this item pile                                                |
| [options.folder]         | `string/boolean/Folder` | `false` | The folder object, folder ID, or folder name to put the new item pile actor                                           |

---

**Returns**: <code>Promise&lt;void&gt;</code> - Return nothing

| Param | Type | Description | Note |
| --- | --- | --- | --- |
| item | <code>string or Item</code> | The uuid of the item or the item object himself | If you use the module 'Item Macro' the variable value is 'item' |
| type | <code>string</code> | The type of the item to choose (background,backpack,base,class,consumable,equipment,feat,loot,spell,subclass,tool,weapon) | |
| name | <code>string</code> | OPTIONAL: The new name of the item | |
| image | <code>string</code> | OPTIONAL: The path to the new image of the item | |
| prefix | <code>string</code> | OPTIONAL: Applied a prefix on the name of the item | |
| suffix | <code>string</code> | OPTIONAL: Applied a suffix on the name of the item | |

**Example**:

```
game.modules.get('better-rolltables').api.retrieveAndApplyBonuses({
    item: "Actor.7bm6EK8jnopnGRS4.Item.kowQq6PhIxid2ei5",
    type: "weapon"
})

```



* `roll(tableEntity)`
* `betterTableRoll(tableEntity,options)`
* `generateChatStory()`
* `createTableFromCompendium(tableName, compendium, weightPredicateObject)`
* `generateLoot(tableEntity,options)`
* `generateChatLoot(tableEntity,options)`
* `addLootToSelectedToken(tableEntity, token, options)`
* `rollCompendiumAsRolltable(compendium)`

The `options` Argument is optional.

You can check the [better-tables.js](../src/scripts/better-tables.js)
for all available methods.

See the [options page](./Options-Argument-for-API-methods.md) for optional
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
The `[options](./Options-Argument-for-API-methods.md)` argument currently has no effect on the method.

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



## NEW API
