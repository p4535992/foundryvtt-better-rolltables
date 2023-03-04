# Options argument for API methods

Developers can now use an optional options argument on several methods.
This is still work in progress and currently only used for a single option.
Please feel free to [add an issue](https://github.com/p4535992/foundryvtt-better-rolltables/issues)
with options you would like to see.

```javascript
generateLoot(tableEntity, options);
generateChatLoot(tableEntity, options)
betterTableRoll(tableEntity, options)
addLootToSelectedToken (tableEntity, token, options)
```

`options` is expected to be a simple object like `{key: value}`.

As of **version 1.8.5** the only option checked for is the rollMode option.

## `rollMode` option

When calling a betterRolltables method you can set the rollMode to be one of the values.
| mode     | Description |
| --------- | -------------- | 
| `blindroll` | roll blind and only visble to gm |
| `gmroll`    | roll visible to self and gm |
| `selfroll`   | roll visible to self | 

Example:

```javascript
const mode = 'blindroll',
     options = {
         rollMode: mode,
     };
```

