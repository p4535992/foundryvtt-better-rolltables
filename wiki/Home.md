## Better RollTables

### VERY OLD DOCUMENTATION DEPRECATED

How to use [**Loot Tables**](./old/Loot-Tables.md)

How to use [Better RollTables Macros](./old/API-for-macros-and-modules#how-to-roll-tables-from-macros)

[FAQs](./old/FAQ.md)

## Common Features

### Inline roll on table text result

Every BRT table apply inline rollm on text table result with the prefix "roll/" so for example:

A text like this:

```
/roll (1d4) +5

```

is converted runtime in this

```
Rolled: 7

```

## Better Tables

*Work in progress, any help is welcomed*

## Loot Tables


### Inline currency data roll on table text result

Every BRT Loot table apply inline roll for the currency data on text rable result. 

**NOTE:** Every text table result in a type BRT Loot tables is treated as a currencyData formula and converted in a item piles supported formula

A text like this:

```
{(2d8+1)*10[cp], 2d8+1 [sp]}

```

is converted runtime in this 

```
20cp 16sp
```



## Harvest Tables

*Work in progress, any help is welcomed*

## Story Tables

*Work in progress, any help is welcomed*
