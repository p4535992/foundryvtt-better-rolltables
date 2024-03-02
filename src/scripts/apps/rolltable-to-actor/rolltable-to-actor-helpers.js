import API from "../../API";
import { BetterTables } from "../../better-tables";
import { CONSTANTS } from "../../constants/constants";
import SETTINGS from "../../constants/settings";
import { BRTBetterHelpers } from "../../tables/better/brt-helper";
import { BRTUtils } from "../../core/utils";
import Logger from "../../lib/Logger";
import { RetrieveHelpers } from "../../lib/retrieve-helpers";
import ItemPilesHelpers from "../../lib/item-piles-helpers";

export class RollTableToActorHelpers {
  static async retrieveItemsDataFromRollTableResult(table, options = {}) {
    let itemsData = await ItemPilesHelpers.retrieveItemsDataFromRollTable(table, options);
    /*
    let brt = new BetterTables();
    const results = await brt.getBetterTableResults(table, options);
    let itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    if (itemsData.length === 0) {
      return;
    }
    itemsData = RollTableToActorHelpers.preStackItems(itemsData);
    */
    return itemsData;
  }

  static async retrieveItemsDataFromRollTableResultSpecialHarvester(table, options = {}) {
    let itemsData = await ItemPilesHelpers.retrieveItemsDataFromRollTable(table, options);
    /*
    let brt = new BetterTables();
    const results = await brt.getBetterTableResults(table, options);
    let itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    if (itemsData.length === 0) {
      return;
    }
    itemsData = RollTableToActorHelpers.preStackItemsSpecialHarvester(itemsData);
    */
    return itemsData;
  }

  static async addRollTableItemsToActor(table, actor, options = {}) {
    const itemsData = ItemPilesHelpers.populateLootViaTable(table, {
      targetActor: actor,
      removeExistingActorItems: false,
    });
    /*
    let brt = new BetterTables();
    const results = await brt.getBetterTableResults(table, options);
    const itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    const actorWithItems = await RollTableToActorHelpers.addItemsToActor(actor, itemsData);
    */
    // Notify the user of items added
    let itemNames = itemsData
      .map((i) => {
        const itemStackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
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
    const infoStr = RollTableToActorHelpers._stringInject(Logger.i18n(`${CONSTANTS.MODULE_ID}.label.importSuccess`), [
      itemNames,
      actorNames,
    ]);
    Logger.info(infoStr, true);
    const items = itemsData;
    return items;
  }

  /**
   * Add rolltable results to actor
   * @param {Token} token
   * @param {TableResult[]} results
   * @param {boolean} stackSame
   * @param {boolean} isTokenActor - is the token already the token actor?
   * @param {number} customLimit
   * @return {void} array of item data
   */
  static async addResultsToControlledTokens(token, results, stackSame = true, isTokenActor = false, customLimit = 0) {
    // Grab the items
    let itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    if (itemsData.length === 0) {
      return;
    }
    itemsData = RollTableToActorHelpers.preStackItems(itemsData);
    // Grab the actors
    const tokenstack = token ? (token.constructor === Array ? token : [token]) : canvas.tokens.controlled;
    const controlledActors = tokenstack.map((t) => t.actor).filter((a) => a.isOwner);
    if (controlledActors.length === 0) {
      Logger.warn(`No actors founded on the token passed`, true);
      return;
    }
    // Add the items
    for (const actor of controlledActors) {
      //await RollTableToActorHelpers.addItemsToActor(actor, itemsData, stackSame, customLimit);
      await ItemPilesHelpers.addItems(actor, itemsData);
    }

    // Notify the user of items added
    let itemNames = itemsData
      .map((i) => {
        const itemStackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
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
    const infoStr = RollTableToActorHelpers._stringInject(Logger.i18n(`${CONSTANTS.MODULE_ID}.label.importSuccess`), [
      itemNames,
      actorNames,
    ]);
    Logger.info(infoStr, true);
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
   * @param {TableResult[]} results
   * @return {Promise<{Object[]}>} array of item data
   */
  static async resultsToItemsData(results) {
    const itemsData = [];
    for (const r of results) {
      const itemTmp = RollTableToActorHelpers.resultToItemData(r);
      if (itemTmp) {
        itemsData.push(itemTmp);
      }
    }
    return itemsData;
  }

  /**
   * Converts a result into a item data
   * @param {TableResult} r
   * @return {Promise<{Object}>} item data
   */
  static async resultToItemData(r) {
    let document = null;
    if (!r.documentId || r.type === CONST.TABLE_RESULT_TYPES.TEXT) {
      if (getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`)) {
        document = await fromUuid(
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`)
        );
      }
      if (!document) {
        return null;
      }
    }
    // NOTE: The formulaAmount calculation is already done on the betterRoll Method
    if (getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`)) {
      document = await fromUuid(getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`));
      if (!document) {
        const collection =
          game.collections.get(r.documentCollection) ??
          (await RetrieveHelpers.getCompendiumCollectionAsync(r.documentCollection, true, false));
        document = (await collection?.get(r.documentId)) ?? (await collection?.getDocument(r.documentId));
      }
    } else {
      const collection =
        game.collections.get(r.documentCollection) ??
        (await RetrieveHelpers.getCompendiumCollectionAsync(r.documentCollection, true, false));
      document = (await collection?.get(r.documentId)) ?? (await collection?.getDocument(r.documentId));
    }
    if (document instanceof Item) {
      const itemTmp = document.toObject();
      itemTmp.uuid = document.uuid;
      // Update with custom name if present
      setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`, itemTmp.name);
      if (!getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)) {
        setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`, itemTmp.name);
      } else {
        setProperty(
          itemTmp,
          `name`,
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)
        );
      }
      setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_ICON}`, itemTmp.img);
      if (!getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)) {
        setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`, itemTmp.img);
      } else {
        setProperty(
          itemTmp,
          `img`,
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)
        );
      }
      // Merge flags brt to item data
      if (!getProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`)) {
        setProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`, {});
      }
      mergeObject(itemTmp.flags[CONSTANTS.MODULE_ID], getProperty(r, `flags.${CONSTANTS.MODULE_ID}`));
      // itemsData.push(itemTmp);
      return itemTmp;
    } else {
      Logger.warn(`The Table Result is not a item`, false, r);
      return null;
    }
  }

  /**
   * Preemptively stacks all items in the itemsData, if possible
   * @param itemsData
   * @return {*[]|*}
   */
  static preStackItems(itemsData) {
    return RollTableToActorHelpers._preStackItemsImpl(itemsData, false, false); //, false);
  }

  /**
   * Preemptively stacks all items in the itemsData, if possible
   * @param itemsData
   * @return {*[]|*}
   */
  static preStackItemsSpecialHarvester(itemsData) {
    return RollTableToActorHelpers._preStackItemsImpl(itemsData, false, true); // true);
  }

  /**
   * Preemptively stacks all items in the itemsData, if possible
   * @param itemsData
   * @return {*[]|*}
   */
  static _preStackItemsImpl(itemsData, ignoreQuantity = false, ignorePrice = false, ignoreWeight = false) {
    const stackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
    const priceAttribute = game.itempiles.API.ITEM_PRICE_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH);
    // const weightAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.WEIGHT_PROPERTY_PATH);
    if (!stackAttribute) {
      return itemsData;
    }
    const stackedItemsData = [];
    for (const item of itemsData) {
      // const match = stackedItemsData.find((i) => {
      //   return RollTableToActorHelpers.itemMatches(i, item);
      // });
      const match = ItemPilesHelpers.findSimilarItem(stackedItemsData, item);
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
          const newPriceValue =
            (getProperty(match, priceAttribute)?.value ?? 0) + (getProperty(item, priceAttribute)?.value ?? 0);
          const newPrice = {
            denomination: getProperty(item, priceAttribute)?.denomination,
            value: newPriceValue,
          };
          setProperty(match, `${priceAttribute}`, newPrice);
        }
        // if (!ignoreWeight) {
        //   const newWeight = getProperty(match, weightAttribute) + (getProperty(item, weightAttribute) ?? 1);
        //   setProperty(match, `${weightAttribute}`, newWeight);
        // }
      }
    }
    return stackedItemsData;
  }

  /**
   * Adds the Items item to an actor, stacking them if possible
   * @param {Actor} actor
   * @param {Object[]} itemsData
   * @param {boolean} stackSame
   * @param {number} customLimit
   * @returns {Promise<itemsData>}
   */
  static async addItemsToActor(actor, itemsData, stackSame = true, customLimit = 0) {
    const stackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
    const priceAttribute = game.itempiles.API.ITEM_PRICE_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH);
    // const weightAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.WEIGHT_PROPERTY_PATH);
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
          const newPriceValue =
            (getProperty(match, priceAttribute)?.value ?? 0) + (getProperty(item, priceAttribute)?.value ?? 0);
          const newPrice = {
            denomination: getProperty(item, priceAttribute)?.denomination,
            value: newPriceValue,
          };
          // const newWeight = getProperty(match, weightAttribute) + (getProperty(item, weightAttribute) ?? 0);

          const newQty = RollTableToActorHelpers._handleLimitedQuantity(
            newStack,
            getProperty(item, stackAttribute),
            customLimit
          );

          await match.update({
            [`${stackAttribute}`]: newQty,
            [`${priceAttribute}`]: newPrice,
            // [`${weightAttribute}`]: newWeight,
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
        Logger.log(flattenChar[k], k);
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
  static async addResultsToActor(actor, results, stackSame = true, customLimit = 0) {
    // Grab the items
    let itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    if (itemsData.length === 0) {
      return;
    }
    itemsData = RollTableToActorHelpers.preStackItems(itemsData);
    const items = await RollTableToActorHelpers.addItemsToActor(actor, itemsData, stackSame, customLimit);
    return items;
  }

  /**
   * @deprecated
   * @param {Actor} actor to which to add items to
   * @param {TableResult[]} results
   * @param {boolean} stackSame if true add quantity to an existing item of same name in the current actor
   * @param {number} customLimit
   *
   * @returns {object[]} items
   */
  static async addItemsToActorOld(actor, results, stackSame = true, customLimit = 0) {
    // const items = [];
    // for (const item of results) {
    //   const newItem = await RollTableToActorHelpers._createItem(item, actor, stackSame, customLimit);
    //   items.push(newItem);
    // }
    // return items;
    const items = await RollTableToActorHelpers.addResultsToActor(actor, results, stackSame, customLimit);
    return items;
  }

  /**
   * @deprecated
   * @param {token} token
   * @param {TableResult[]} results
   * @param {boolean} stackSame
   * @param {boolean} isTokenActor - is the token already the token actor?
   * @param {number} customLimit
   *
   * @returns {object[]} items
   */
  static async addItemsToTokenOld(token, results, stackSame = true, isTokenActor = false, customLimit = 0) {
    // const items = [];
    // for (const item of results) {
    //   // Create the item making sure to pass the token actor and not the base actor
    //   const targetActor = isTokenActor ? token : token.actor;
    //   const newItem = await RollTableToActorHelpers._createItem(item, targetActor, stackSame, customLimit);
    //   items.push(newItem);
    // }
    const items = await RollTableToActorHelpers.addResultsToControlledTokens(
      token,
      results,
      stackSame,
      isTokenActor,
      customLimit
    );
    return items;
  }

  /**
   * @deprecated not used anymore
   * @param {TableResult} result representation
   * @param {Actor} actor to which to add items to
   * @param {boolean} stackSame if true add quantity to an existing item of same name in the current actor
   * @param {number} customLimit
   * @returns {Item} the create Item (foundry item)
   */
  static async _createItem(result, actor, stackSame = true, customLimit = 0) {
    const newItemData = await RollTableToActorHelpers.buildItemData(result);
    const priceAttribute = game.itempiles.API.ITEM_PRICE_ATTRIBUTE; // SETTINGS.PRICE_PROPERTY_PATH
    const itemPrice = getProperty(newItemData, priceAttribute) || 0;
    const embeddedItems = [...actor.getEmbeddedCollection("Item").values()];
    const originalItem = embeddedItems.find(
      (i) => i.name === newItemData.name && itemPrice === getProperty(i, priceAttribute)
    );

    /** if the item is already owned by the actor (same name and same PRICE) */
    if (originalItem && stackSame) {
      /** add quantity to existing item */

      const stackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
      const priceAttribute = game.itempiles.API.ITEM_PRICE_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH);
      // const weightAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.WEIGHT_PROPERTY_PATH);

      const newItemQty = getProperty(newItemData, stackAttribute) || 1;
      const originalQty = getProperty(originalItem, stackAttribute) || 1;
      const updateItem = { _id: originalItem.id };
      const newQty = RollTableToActorHelpers._handleLimitedQuantity(newItemQty, originalQty, customLimit);

      if (newQty != newItemQty) {
        setProperty(updateItem, stackAttribute, newQty);

        const newPriceValue =
          (getProperty(originalItem, priceAttribute)?.value ?? 0) +
          (getProperty(newItemData, priceAttribute)?.value ?? 0);
        const newPrice = {
          denomination: getProperty(item, priceAttribute)?.denomination,
          value: newPriceValue,
        };
        setProperty(updateItem, `${priceAttribute}`, newPrice);

        // const newWeight = getProperty(originalItem, weightAttribute) + (getProperty(newItemData, weightAttribute) ?? 1);
        // setProperty(updateItem, `${weightAttribute}`, newWeight);

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
   * @param {TableResult} result
   * @returns
   */
  static async buildItemData(result) {
    // PATCH 2023-10-04
    let customResultName = undefined;
    let customResultImg = undefined;
    if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)) {
      customResultName = getProperty(
        result,
        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`
      );
    }

    if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)) {
      customResultImg = getProperty(
        result,
        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`
      );
    }

    let itemData = {};
    let existingItem = undefined;

    let docUuid = getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`);
    if (docUuid) {
      existingItem = await fromUuid(docUuid);
    }

    // Try first to load item from compendium
    if (!existingItem && result.collection) {
      existingItem = await BRTUtils.getItemFromCompendium(result);
    }

    // Try first to load item from item list
    if (!existingItem) {
      // if an item with this name exist we load that item data, otherwise we create a new one
      existingItem = game.items.getName(result.text);
    }

    if (!existingItem) {
      Logger.error(`Cannot find document for result`, false, result);
      return null;
    }

    itemData = duplicate(existingItem);

    if (customResultName) {
      itemData.name = customResultName;
    }
    if (customResultImg) {
      itemData.img = customResultImg;
    }

    itemData.type = CONSTANTS.ITEM_LOOT_TYPE;

    const itemConversions = {
      Actor: {
        text: customResultName ? `${customResultName} Portrait` : `${result.text} Portrait`,
        img: customResultImg || existingItem?.img || "icons/svg/mystery-man.svg",
        price: new Roll("1d20 + 10").roll({ async: false }).total || 1,
      },
      Scene: {
        text: customResultName ? `Map of ${customResultName}` : `Map of ${existingItem?.name}`,
        img: customResultImg || existingItem?.thumb || "icons/svg/direction.svg",
        price: new Roll("1d20 + 10").roll({ async: false }).total || 1,
      },
    };

    const convert = itemConversions[existingItem?.documentName] ?? false;
    /** Create item from text since the item does not exist */
    const createNewItem = !existingItem || convert;

    if (createNewItem) {
      const name = convert ? convert?.text : result.text;
      const type = CONSTANTS.ITEM_LOOT_TYPE;
      const img = convert ? convert?.img : result.img;
      const price = convert ? convert?.price : result.price || 0;

      itemData = {
        name: name,
        type: type,
        img: img, // "icons/svg/mystery-man.svg"
        system: {
          price: price,
        },
      };
    }

    if (Object.getOwnPropertyDescriptor(result, "commands") && result.commands) {
      itemData = RollTableToActorHelpers._applyCommandToItemData(itemData, result.commands);
    }

    if (!itemData) {
      return;
    }
    // itemData = await RollTableToActorHelpers.preItemCreationDataManipulation(itemData);
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
      } catch (e) {
        Logger.error(e.message, false, e);
        continue;
      }
      setProperty(itemData, `system.${cmd.command.toLowerCase()}`, rolledValue);
    }
    return itemData;
  }

  /** MANIPULATOR */

  // /**
  //  *
  //  * @param {number} level
  //  *
  //  * @returns {Item}
  //  */
  // static async _getRandomSpell(level) {
  //   const spells = API.betterTables
  //       .getSpellCache()
  //       .filter((spell) => getProperty(spell, CONSTANTS.SPELL_LEVEL_PATH) === level),
  //     spell = spells[Math.floor(Math.random() * spells.length)];
  //   return BRTUtils.findInCompendiumById(spell.collection, spell._id);
  // }

  // /**
  //  *
  //  * @param {*} itemData
  //  *
  //  * @returns
  //  */
  // static async preItemCreationDataManipulation(itemData) {
  //   const match = CONSTANTS.SCROLL_REGEX.exec(itemData.name);

  //   itemData = duplicate(itemData);

  //   if (!match) {
  //     return itemData;
  //   }

  //   // If it is a scroll then open the compendium
  //   const level = match[1].toLowerCase() === "cantrip" ? 0 : parseInt(match[1]);
  //   const itemEntity = await RollTableToActorHelpers._getRandomSpell(level);

  //   if (!itemEntity) {
  //     Logger.warn(
  //       ` | No spell of level ${level} found in compendium  ${itemEntity.collection} `, true
  //     );
  //     return itemData;
  //   }

  //   const itemLink = `@Compendium[${itemEntity.pack}.${itemEntity._id}]`;
  //   // make the name shorter by removing some text
  //   itemData.name = itemData.name.replace(/^(Spell\s)/, "");
  //   itemData.name = itemData.name.replace(/(Cantrip\sLevel)/, "Cantrip");
  //   itemData.name += ` (${itemEntity.name})`;
  //   itemData.system.description.value =
  //     "<blockquote>" +
  //     itemLink +
  //     "<br />" +
  //     itemEntity.system.description.value +
  //     "<hr />" +
  //     itemData.system.description.value +
  //     "</blockquote>";
  //   return itemData;
  // }
}
