## Better RollTables

### VERY OLD DOCUMENTATION DEPRECATED

How to use [**Loot Tables**](./old/Loot-Tables.md)

How to use [Better RollTables Macros](./old/API-for-macros-and-modules#how-to-roll-tables-from-macros)

[FAQs](./old/FAQ.md)

## Common Features (These feature are present by default in all the BRT tables)

*Work in progress, any help is welcomed*

### Simple inline roll on table text result

![](./img/common_type_inline_data_roll.png)

Every BRT table apply inline roll on text table result with the prefix "roll/ " on the text result content.

As a example a text like this:

```
/roll (1d4) +5
```

is converted runtime in this

```
Rolled: 7
```

### Simple inline currency roll on table text result

Every BRT table apply inline currency roll on text table result with the prefix "/currency" on the text result content.

This feature support many format from old and other modules here a list:

- Old brt format: `100*1d6[gp],4d4+4[sp] to 100*1d6gp 4d4+4sp`
- Harvester format: `[[/r 5d6]]{Copper} and [[/r 1d6*100]]{Electrum}[[/r 2d6*10]]`
- Old brt loot currency formula: `{(2d8+1)*10[cp], 6d8+3 [sp]}`
- Html code base with the editor: `<p>100*1d6[gp],4d4+4[sp]</p>`,`<p>[[/r 5d6]]{Copper} and [[/r 1d6*100]]{Electrum}[[/r 2d6*10]]</p>`, `<p>{(2d8+1)*10[cp], 6d8+3 [sp]}</p>`
- Item Piles format **(The advisable format to use)**: `((2d8+1)*10)cp (6d8+3)sp`

As a example a text like this:

```
/currency 32gp 1d2sp
```

is converted runtime in this

```
32gp 1sp
```

### Actor List Feature

Connect actor with N rolltables, it usually useful in combination with other modules

![](/wiki/img/brt_actor_list_feature.gif)

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
