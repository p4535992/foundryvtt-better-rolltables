import API from "../../API";
import { BetterTables } from "../../better-tables";
import { CONSTANTS } from "../../constants/constants";
import SETTINGS from "../../constants/settings";
import { BRTBetterHelpers } from "../../core/brt-helper";
import { BRTCONFIG } from "../../core/config";
import { BRTUtils } from "../../core/utils";
import { info, isRealNumber, warn } from "../../lib";

export class RollTableToActorHelpers {
  static async retrieveItemsDataFromRollTableResult(table, options = {}) {
    let brt = new BetterTables();
    const results = await brt.getBetterTableResults(table, options);
    let itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    if (itemsData.length === 0) {
      return;
    }
    itemsData = RollTableToActorHelpers.preStackItems(itemsData);
    return itemsData;
  }

  static async retrieveItemsDataFromRollTableResultSpecialHarvester(table, options = {}) {
    let brt = new BetterTables();
    const results = await brt.getBetterTableResults(table, options);
    let itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    if (itemsData.length === 0) {
      return;
    }
    itemsData = RollTableToActorHelpers.preStackItemsSpecialHarvester(itemsData);
    return itemsData;
  }

  static async addRollTableItemsToActor(table, actor, options = {}) {
    let brt = new BetterTables();
    const results = await brt.getBetterTableResults(table, options);
    const itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    const actorWithItems = await RollTableToActorHelpers.addItemsToActor(actor, itemsData);
    // Notify the user of items added
    let itemNames = itemsData
      .map((i) => {
        const itemStackAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
        if (!itemStackAttribute) {
          return i.name;
        }
        // const stack = parseInt(getProperty(i.system, itemStackAttribute));
        const stack = parseInt(getProperty(i, itemStackAttribute));
        if (stack <= 1) {
          return i.name;
        }
        return `${stack} ${i.name}`;
      })
      .join(", ");
    const actorNames = controlledActors.map((a) => a.name).join(", ");
    const infoStr = RollTableToActorHelpers._stringInject(i18n(`${CONSTANTS.MODULE_ID}.label.importSuccess`), [
      itemNames,
      actorNames,
    ]);
    info(infoStr, true);
    const items = itemsData;
    return items;
  }

  /**
   * Add rolltable results to actor
   * @param {TableResult[]}results
   * @return {void} array of item data
   */
  static async addResultsToControlledTokens(results, stackSame = true) {
    // Grab the items
    let itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    if (itemsData.length === 0) {
      return;
    }
    itemsData = RollTableToActorHelpers.preStackItems(itemsData);

    // Grab the actors
    const controlledActors = canvas.tokens.controlled.map((t) => t.actor).filter((a) => a.isOwner);
    if (controlledActors.length === 0) {
      return;
    }
    // Add the items
    for (const actor of controlledActors) {
      await RollTableToActorHelpers.addItemsToActor(actor, itemsData, stackSame);
    }

    // Notify the user of items added
    let itemNames = itemsData
      .map((i) => {
        const itemStackAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
        if (!itemStackAttribute) {
          return i.name;
        }
        // const stack = parseInt(getProperty(i.system, itemStackAttribute));
        const stack = parseInt(getProperty(i, itemStackAttribute));
        if (stack <= 1) {
          return i.name;
        }
        return `${stack} ${i.name}`;
      })
      .join(", ");
    const actorNames = controlledActors.map((a) => a.name).join(", ");
    const infoStr = RollTableToActorHelpers._stringInject(i18n(`${CONSTANTS.MODULE_ID}.label.importSuccess`), [
      itemNames,
      actorNames,
    ]);
    info(infoStr, true);
    const items = itemsData;
    return items;
  }

  static _stringInject(str, arr) {
    if (typeof str !== "string" || !(arr instanceof Array)) {
      return false;
    }

    return str.replace(/({\d})/g, function (i) {
      return arr[i.replace(/{/, "").replace(/}/, "")];
    });
  }

  /**
   * Converts a list of results into a list of item data
   * @param {TableResult[]}results
   * @return {Promise<{Object[]}>} array of item data
   */
  static async resultsToItemsData(results) {
    const itemsData = [];
    for (const r of results) {
      if (!r.documentId || r.type === CONST.TABLE_RESULT_TYPES.TEXT) {
        continue;
      }
      // NOTE: The formulaAmount calculation is already done on the betterRoll Method
      let document = null;
      if (getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`)) {
        document = await fromUuid(
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`)
        );
        if (!document) {
          const collection = game.collections.get(r.documentCollection) ?? game.packs.get(r.documentCollection);
          document = (await collection?.get(r.documentId)) ?? (await collection?.getDocument(r.documentId));
        }
      } else {
        const collection = game.collections.get(r.documentCollection) ?? game.packs.get(r.documentCollection);
        document = (await collection?.get(r.documentId)) ?? (await collection?.getDocument(r.documentId));
      }
      if (document instanceof Item) {
        const itemTmp = document.toObject();
        itemTmp.uuid = document.uuid;
        // Update with custom name if present
        if (!getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)) {
          setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`, itemTmp.name);
        } else {
          setProperty(
            itemTmp,
            `name`,
            getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)
          );
        }
        // Merge flags brt to item data
        if (!getProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`)) {
          setProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`, {});
        }
        mergeObject(itemTmp.flags[CONSTANTS.MODULE_ID], getProperty(r, `flags.${CONSTANTS.MODULE_ID}`));
        itemsData.push(itemTmp);
      } else {
        warn(`The Table Result is not a item`, false, r);
      }
    }
    return itemsData;
  }

  /**
   * Preemptively stacks all items in the itemsData, if possible
   * @param itemsData
   * @return {*[]|*}
   */
  static preStackItems(itemsData) {
    return RollTableToActorHelpers._preStackItemsImpl(itemsData, false, false, false);
  }

  /**
   * Preemptively stacks all items in the itemsData, if possible
   * @param itemsData
   * @return {*[]|*}
   */
  static preStackItemsSpecialHarvester(itemsData) {
    return RollTableToActorHelpers._preStackItemsImpl(itemsData, false, true, true);
  }

  /**
   * Preemptively stacks all items in the itemsData, if possible
   * @param itemsData
   * @return {*[]|*}
   */
  static _preStackItemsImpl(itemsData, ignoreQuantity = false, ignorePrice = false, ignoreWeight = false) {
    const stackAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
    const priceAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH);
    const weightAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.WEIGHT_PROPERTY_PATH);
    if (!stackAttribute) {
      return itemsData;
    }
    const stackedItemsData = [];
    for (const item of itemsData) {
      const match = stackedItemsData.find((i) => {
        return RollTableToActorHelpers.itemMatches(i, item);
      });
      if (!match) {
        stackedItemsData.push(item);
      } else {
        // const newStack = getProperty(match.system, stackAttribute) + (getProperty(item.system, stackAttribute) ?? 1);
        // setProperty(match, `system.${stackAttribute}`, newStack);
        if (!ignoreQuantity) {
          const newStack = getProperty(match, stackAttribute) + (getProperty(item, stackAttribute) ?? 1);
          setProperty(match, `${stackAttribute}`, newStack);
        }
        if (!ignorePrice) {
          const newPrice = getProperty(match, priceAttribute) + (getProperty(item, priceAttribute) ?? 1);
          setProperty(match, `${priceAttribute}`, newPrice);
        }
        if (!ignoreWeight) {
          const newWeight = getProperty(match, weightAttribute) + (getProperty(item, weightAttribute) ?? 1);
          setProperty(match, `${weightAttribute}`, newWeight);
        }
      }
    }
    return stackedItemsData;
  }

  /**
   * Adds the Items item to an actor, stacking them if possible
   * @param {Actor} actor
   * @param {Object[]} itemsData
   * @returns {Promise<itemsData>}
   */
  static async addItemsToActor(actor, itemsData, stackSame = true) {
    const stackAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
    const priceAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH);
    const weightAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.WEIGHT_PROPERTY_PATH_PROPERTY_PATH);
    if (!stackAttribute) {
      return Item.create(itemsData, { parent: actor });
    }
    const items = [];
    for (const item of itemsData) {
      if (stackSame) {
        const match = actor.getEmbeddedCollection("Item").find((i) => {
          return RollTableToActorHelpers.itemMatches(i, item);
        });
        if (match) {
          // const newStack = getProperty(match.system, stackAttribute) + (getProperty(item.system, stackAttribute) ?? 1);
          const newStack = getProperty(match, stackAttribute) + (getProperty(item, stackAttribute) ?? 1);
          const newPrice = getProperty(match, priceAttribute) + (getProperty(item, priceAttribute) ?? 0);
          const newWeight = getProperty(match, weightAttribute) + (getProperty(item, weightAttribute) ?? 0);
          await match.update({
            //   [`system.${stackAttribute}`]: newStack,
            [`${stackAttribute}`]: newStack,
            [`${priceAttribute}`]: newPrice,
            [`${weightAttribute}`]: newWeight,
          });
        } else {
          const i = await Item.create(itemsData, { parent: actor });
          items.push(i);
        }
      } else {
        const i = await Item.create(itemsData, { parent: actor });
        items.push(i);
      }
    }
    return items;
  }

  static itemMatches(charItem, tableItem) {
    if (charItem.name !== tableItem.name) {
      return false;
    }

    const matchAttributesBlacklist = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.MATCH_ATTRIBUTES_BLACKLIST);

    const flattenChar = flattenObject(charItem.system);
    const flattenTable = flattenObject(tableItem.system);

    for (const k of Object.keys(tableItem)) {
      if (flattenChar[k] == null || flattenTable[k] == null) {
        continue;
      }
      const isBlacklisted = matchAttributesBlacklist.find((b) => k.startsWith(b));
      if (isBlacklisted != null) {
        continue;
      }
      if (flattenChar[k] !== flattenTable[k]) {
        console.log(flattenChar[k], k);
        return false;
      }
    }
    return true;
  }

  // /**
  //  * Interesting but not necessary there are other modules for this
  //  * Hooks.on('renderItemSheet', (_app, element, _options) => injectRightClickContentLink(element));
  //  * Hooks.on('renderActorSheet', (_app, element, _options) => injectRightClickContentLink(element));
  //  * @param {*} appElement
  //  */
  // static async injectRightClickContentLink(appElement) {
  //   const contentLinks = appElement.find('.content-link[data-type="RollTable"]');
  //   contentLinks.mousedown(async (ev) => {
  //     if (ev.which !== 3) return;
  //     const tableUuid = ev.currentTarget.dataset.uuid;
  //     if (!tableUuid) return;
  //     const tableDocument = await fromUuid(tableUuid);
  //     const roll = await tableDocument.roll();
  //     await tableDocument?.draw({
  //       roll: roll.roll,
  //       results: roll.results,
  //       rollMode: game.settings.get("core", "rollMode"),
  //     });
  //   });
  // }

  /**
   *
   * @param {Actor} actor to which to add items to
   * @param {TableResult[]} results
   * @param {boolean} stackSame if true add quantity to an existing item of same name in the current actor
   * @param {number} customLimit
   *
   * @returns {object[]} items
   */
  static async addItemsToActorOld(actor, results, stackSame = true, customLimit = 0) {
    const items = [];
    for (const item of results) {
      const newItem = await RollTableToActorHelpers._createItem(item, actor, stackSame, customLimit);
      items.push(newItem);
    }
    return items;
    // const items = await RollTableToActorHelpers.addItemsToActor(actor, results, stackSame);
    // return items;
  }

  /**
   *
   * @param {token} token
   * @param {TableResult[]} results
   * @param {boolean} stackSame
   * @param {boolean} isTokenActor - is the token already the token actor?
   * @param {number} customLimit
   *
   * @returns {object[]} items
   */
  static async addItemsToTokenOld(token, results, stackSame = true, isTokenActor = false, customLimit = 0) {
    const items = [];
    for (const item of results) {
      // Create the item making sure to pass the token actor and not the base actor
      const targetActor = isTokenActor ? token : token.actor;
      const newItem = await RollTableToActorHelpers._createItem(item, targetActor, stackSame, customLimit);
      items.push(newItem);
    }
    // const items = await RollTableToActorHelpers.addResultsToControlledTokens(results, stackSame);
    // return items;
  }

  /**
   *
   * @param {object} item representation
   * @param {Actor} actor to which to add items to
   * @param {boolean} stackSame if true add quantity to an existing item of same name in the current actor
   * @param {number} customLimit
   * @returns {Item} the create Item (foundry item)
   */
  static async _createItem(item, actor, stackSame = true, customLimit = 0) {
    const newItemData = await RollTableToActorHelpers.buildItemData(item);
    const itemPrice = getProperty(newItemData, BRTCONFIG.PRICE_PROPERTY_PATH) || 0;
    const embeddedItems = [...actor.getEmbeddedCollection("Item").values()];
    const originalItem = embeddedItems.find(
      (i) => i.name === newItemData.name && itemPrice === getProperty(i, BRTCONFIG.PRICE_PROPERTY_PATH)
    );

    /** if the item is already owned by the actor (same name and same PRICE) */
    if (originalItem && stackSame) {
      /** add quantity to existing item */

      const stackAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
      const priceAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH);
      const weightAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.WEIGHT_PROPERTY_PATH);

      const newItemQty = getProperty(newItemData, stackAttribute) || 1;
      const originalQty = getProperty(originalItem, stackAttribute) || 1;
      const updateItem = { _id: originalItem.id };
      const newQty = RollTableToActorHelpers._handleLimitedQuantity(newItemQty, originalQty, customLimit);

      if (newQty != newItemQty) {
        setProperty(updateItem, stackAttribute, newQty);

        const newPrice = getProperty(originalItem, priceAttribute) + (getProperty(newItemData, priceAttribute) ?? 1);
        setProperty(updateItem, `${priceAttribute}`, newPrice);

        const newWeight = getProperty(originalItem, weightAttribute) + (getProperty(newItemData, weightAttribute) ?? 1);
        setProperty(updateItem, `${weightAttribute}`, newWeight);

        await actor.updateEmbeddedDocuments("Item", [updateItem]);
      }
      return actor.items.get(originalItem.id);
    } else {
      /** we create a new item if we don't own already */
      return await actor.createEmbeddedDocuments("Item", [newItemData]);
    }
  }

  /**
   *
   * @param {number} currentQty Quantity of item we want to add
   * @param {number} originalQty Quantity of the originalItem already in posession
   * @param {number} customLimit A custom Limit
   * @returns
   */
  static _handleLimitedQuantity(currentQty, originalQty, customLimit = 0) {
    const newQty = Number(originalQty) + Number(currentQty);

    if (customLimit > 0) {
      // limit is bigger or equal to newQty
      if (Number(customLimit) >= Number(newQty)) {
        return newQty;
      }
      //limit was reached, we stick to that limit
      return customLimit;
    }

    //we don't care for the limit
    return newQty;
  }

  /**
   *
   * @param {object} item
   * @returns
   */
  static async buildItemData(item) {
    let itemData = {},
      existingItem = false;
    /** Try first to load item from compendium */
    if (item.collection) {
      existingItem = await BRTUtils.getItemFromCompendium(item);
      itemData = duplicate(existingItem);
      itemData.type = BRTCONFIG.ITEM_LOOT_TYPE;
    }

    /** Try first to load item from item list */
    if (!existingItem) {
      /** if an item with this name exist we load that item data, otherwise we create a new one */
      existingItem = game.items.getName(item.text);
      if (existingItem) {
        itemData = duplicate(existingItem);
        itemData.type = BRTCONFIG.ITEM_LOOT_TYPE;
      }
    }

    const itemConversions = {
      Actor: {
        text: `${item.text} Portrait`,
        img: existingItem?.img || "icons/svg/mystery-man.svg",
      },
      Scene: {
        text: "Map of " + existingItem?.name,
        img: existingItem?.thumb || "icons/svg/direction.svg",
        price: new Roll("1d20 + 10").roll({ async: false }).total || 1,
      },
    };

    const convert = itemConversions[existingItem?.documentName] ?? false;
    /** Create item from text since the item does not exist */
    const createNewItem = !existingItem || convert;

    if (createNewItem) {
      const name = convert ? convert?.text : item.text,
        type = BRTCONFIG.ITEM_LOOT_TYPE,
        img = convert ? convert?.img : item.img,
        price = convert ? convert?.price : item.price || 0;

      itemData = { name: name, type, img: img, system: { price: price } }; // "icons/svg/mystery-man.svg"
    }

    if (Object.getOwnPropertyDescriptor(item, "commands") && item.commands) {
      itemData = RollTableToActorHelpers._applyCommandToItemData(itemData, item.commands);
    }

    if (!itemData) {
      return;
    }
    itemData = await RollTableToActorHelpers.preItemCreationDataManipulation(itemData);
    return itemData;
  }

  /**
   *
   * @param {object} itemData
   * @param {object[]} commands
   * @returns {object} itemData
   */
  static _applyCommandToItemData(itemData, commands) {
    for (const cmd of commands) {
      // TODO check the type of command, that is a command to be rolled and a valid command
      let rolledValue;
      try {
        rolledValue = new Roll(cmd.arg).roll({ async: false }).total;
      } catch (error) {
        continue;
      }
      setProperty(itemData, `system.${cmd.command.toLowerCase()}`, rolledValue);
    }
    return itemData;
  }

  /** MANIPULATOR */

  /**
   *
   * @param {number} level
   *
   * @returns {Item}
   */
  static async _getRandomSpell(level) {
    const spells = API.betterTables
        .getSpellCache()
        .filter((spell) => getProperty(spell, BRTCONFIG.SPELL_LEVEL_PATH) === level),
      spell = spells[Math.floor(Math.random() * spells.length)];
    return BRTUtils.findInCompendiumById(spell.collection, spell._id);
  }

  /**
   *
   * @param {*} itemData
   *
   * @returns
   */
  static async preItemCreationDataManipulation(itemData) {
    const match = BRTCONFIG.SCROLL_REGEX.exec(itemData.name);

    itemData = duplicate(itemData);

    if (!match) {
      return itemData;
    }

    // If it is a scroll then open the compendium
    const level = match[1].toLowerCase() === "cantrip" ? 0 : parseInt(match[1]);
    const itemEntity = await RollTableToActorHelpers._getRandomSpell(level);

    if (!itemEntity) {
      ui.notifications.warn(
        CONSTANTS.MODULE_ID + ` | No spell of level ${level} found in compendium  ${itemEntity.collection} `
      );
      return itemData;
    }

    const itemLink = `@Compendium[${itemEntity.pack}.${itemEntity._id}]`;
    // make the name shorter by removing some text
    itemData.name = itemData.name.replace(/^(Spell\s)/, "");
    itemData.name = itemData.name.replace(/(Cantrip\sLevel)/, "Cantrip");
    itemData.name += ` (${itemEntity.name})`;
    itemData.system.description.value =
      "<blockquote>" +
      itemLink +
      "<br />" +
      itemEntity.system.description.value +
      "<hr />" +
      itemData.system.description.value +
      "</blockquote>";
    return itemData;
  }
}
