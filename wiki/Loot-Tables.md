## First steps
To create a Loot RollTable change the _better table type_ to "**Loot Table**"

![howto picture 1](./img/loot/1.jpg)

## Loot table options overview

![howto picture 2](./img/loot/2.jpg)

In the currency loot field **(A)** you can specify some currency that is always rolled, no matter the table result. See below the section on how to roll currency.

Field **(B)** Takes a roll formula (for example 1d4) and it is the amount of times the entire table is rolled.

Field **(C)** "Add loot to actor" is the name of the actor to use. If left empty every time loot is generated a new loot actor is created and the loot added to it. If a name is provided, the loot is added to that actor every time. This field is only used when clicking _Generate Loot_


## Loot Table features

Let's do a table, where we roll 1d4, if we get 1 we want to roll 1d4+1 times on another table for potions, if we get 2-4 we want to roll multiple times in 2 different tables, items and scrolls.

![howto picture 3](./img/loot/3.jpg)

In the field marked with **(A)** you can set a formula that indicate how many times to roll if this result is drawn.
To link a table you can drag and drop the table entity on top of the results, you can both link tables that are in the world or inside compendia.

You can find this table example to use as a template in the compendium list under "Loot Tables"

Note **(B)**, we are using overlapping results to draw from 2 table when we roll between 2 and 4. Use overlapping results to draw multiple results at once.

Clicking **(C)** the Generate Loot button will create or add to a loot actor called "shop" (as configured in the table)
Clicking **(D)** Will roll the loot and link it in chat.

### Currency
In the field **(E)** you can define a list of currencies that are always added when rolling the table (it is added only once, no matter the amounts of roll set)
the syntax is `formula[currency]` in a comma separated list
```
100*1d6[gp],4d4+4[sp]
```
is a valid currency list.
It is also possible to define additional currencies as table results, with the following syntax:
![howto picture 4](./img/loot/4.jpg)

please NOTE the additional curly braces.

### Advanced syntax
![howto picture 5](./img/loot/5.jpg)

**(A)** is an example of simple item setup, using table links to entities in compendia or world and just setting the roll formula amount to get 1d20 or +1 Arrows.

Setting a table result as text **(B)** allows you to create items on the fly (they dont need to exist as items in the world) and randomize some of their properties. In this example an item Herb is created with a value of 25. _@price_ lets you setup a formula to randomize the price of the item created.
other allowed commands are _@quantity_ (since text results do not have a formula field this allow to create more than 1 item per result) and _@weight_

## Random scrolls

If a scroll from the srd compendium is drawn from a table (currently dnd5e and pf2 are supported) a spell of the appropriate level is randomized and picked.
The following table is included in the module (for dnd5e) and can be found inside the _Loot Table_ compendium.

![howto picture 5](./img/loot/7.jpg)

In the module option you can choose the compendium from which to randomly pick the spells from

![howto picture 5](./img/loot/6.jpg)

The scrolls will have the name of the spell and will appear as follow

![howto picture 5](./img/loot/8.jpg)
