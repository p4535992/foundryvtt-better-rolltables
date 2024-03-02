import { RollTableToActorHelpers } from "../apps/rolltable-to-actor/rolltable-to-actor-helpers";
import { BetterRollTable } from "../core/brt-table";
import Logger from "./Logger";
import { RetrieveHelpers } from "./retrieve-helpers";

export default class ItemPilesHelpers {
  static FLAGS = {
    ITEM: `flags.item-piles.item`,
    CUSTOM_CATEGORY: `flags.item-piles.item.customCategory`,
  };
  // ===================
  // CURRENCIES HELPERS
  // ===================

  /**
   * Turns a string of currencies into an array containing the data and quantities for each currency
   *
   * @param {string} currencies                               A string of currencies to convert (eg, "5gp 25sp")
   *
   * @returns {Array<object>}                                 An array of object containing the data and quantity for each currency
   */
  static getCurrenciesFromString(currencies) {
    const c = ItemPilesHelpers.generateCurrenciesStringFromString(currencies);
    return game.itempiles.API.getPriceFromString(c).currencies;
  }

  /**
   * Turns a string of currencies into an array containing the data and quantities for each currency
   *
   * @param {string} currencies                               A string of currencies to convert (eg, "5gp 25sp")
   *
   * @returns {string}                                 A string of currencies to convert (eg, "5gp 25sp")
   */
  static generateCurrenciesStringFromString(currenciesS) {
    if (!currenciesS) {
      return "";
    }
    let currenciesSTmp = currenciesS;
    // Convert old brt format 100*1d6[gp],4d4+4[sp] to 100*1d6gp 4d4+4sp
    currenciesSTmp = currenciesSTmp.replaceAll("[", "");
    currenciesSTmp = currenciesSTmp.replaceAll("]", "");
    currenciesSTmp = currenciesSTmp.replaceAll(",", " ");
    // Convert old harvester [[/r 5d6]]{Copper} and [[/r 1d6*100]]{Electrum}[[/r 2d6*10]]{Gold}
    currenciesSTmp = currenciesSTmp.replaceAll(/{Copper}/gi, "cp");
    currenciesSTmp = currenciesSTmp.replaceAll(/{Silver}/gi, "sp");
    currenciesSTmp = currenciesSTmp.replaceAll(/{Electrum}/gi, "ep");
    currenciesSTmp = currenciesSTmp.replaceAll(/{Gold}/gi, "gp");
    currenciesSTmp = currenciesSTmp.replaceAll(/{Platinum}/gi, "pp");
    currenciesSTmp = currenciesSTmp.replaceAll("/r", "");
    return currenciesSTmp;
  }

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]|string} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   */
  static async addCurrencies(actorOrToken, currencies) {
    Logger.debug("addCurrencies | Currencies:", currencies);
    if (typeof currencies === "string" || currencies instanceof String) {
      Logger.debug("addCurrencies | Currencies string for Item Piles:" + currencies);
      await game.itempiles.API.addCurrencies(actorOrToken, currencies);
    } else {
      // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
      const currenciesForItemPiles = [];
      for (const currency of currencies) {
        if (currency.cost && currency.abbreviation) {
          const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
          Logger.debug("addCurrencies | Currency for Item Piles:", currencyForItemPilesS);
          currenciesForItemPiles.push(currencyForItemPilesS);
        }
      }
      Logger.debug("addCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
      const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
      Logger.debug("addCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
      await game.itempiles.API.addCurrencies(actorOrToken, currenciesForItemPilesS);
    }
  }

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]|string} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   * @returns {void}
   */
  static async removeCurrencies(actorOrToken, currencies) {
    Logger.debug("removeCurrencies | Currencies:", currencies);
    if (typeof currencies === "string" || currencies instanceof String) {
      Logger.debug("removeCurrencies | Currencies string for Item Piles:" + currencies);
      await game.itempiles.API.removeCurrencies(actorOrToken, currencies);
    } else {
      // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
      const currenciesForItemPiles = [];
      for (const currency of currencies) {
        if (currency.cost && currency.abbreviation) {
          const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
          Logger.debug("removeCurrencies | Currency for Item Piles:", currencyForItemPilesS);
          currenciesForItemPiles.push(currencyForItemPilesS);
        }
      }
      Logger.debug("removeCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
      const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
      Logger.debug("removeCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
      await game.itempiles.API.removeCurrencies(actorOrToken, currenciesForItemPilesS);
    }
  }

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   */
  static async updateCurrencies(actorOrToken, currencies) {
    Logger.debug("updateCurrencies | Currencies:", currencies);
    if (typeof currencies === "string" || currencies instanceof String) {
      Logger.debug("updateCurrencies | Currencies string for Item Piles:" + currencies);
      await game.itempiles.API.updateCurrencies(actorOrToken, currencies);
    } else {
      // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
      const currenciesForItemPiles = [];
      for (const currency of currencies) {
        if (currency.cost && currency.abbreviation) {
          const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
          Logger.debug("updateCurrencies | Currency for Item Piles:", currencyForItemPilesS);
          currenciesForItemPiles.push(currencyForItemPilesS);
        }
      }
      Logger.debug("updateCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
      const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
      Logger.debug("updateCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
      await game.itempiles.API.updateCurrencies(actorOrToken, currenciesForItemPilesS);
    }
  }

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   * @returns {boolean} The actor or token has enough money
   */
  static hasEnoughCurrencies(actorOrToken, currencies) {
    Logger.debug("hasEnoughCurrencies | Currencies:", currencies);
    if (typeof currencies === "string" || currencies instanceof String) {
      Logger.debug("hasEnoughCurrencies | Currencies string for Item Piles:" + currencies);
      const currencyData = game.itempiles.API.getPaymentData(currencies, { target: actorOrToken });
      return currencyData.canBuy;
    } else {
      // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
      const currenciesForItemPiles = [];
      for (const currency of currencies) {
        if (currency.cost && currency.abbreviation) {
          const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
          Logger.debug("hasEnoughCurrencies | Currency for Item Piles:", currencyForItemPilesS);
          currenciesForItemPiles.push(currencyForItemPilesS);
        }
      }
      Logger.debug("hasEnoughCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
      const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
      Logger.debug("hasEnoughCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
      const currencyData = game.itempiles.API.getPaymentData(currenciesForItemPilesS, { target: actorOrToken });
      return currencyData.canBuy;
    }
  }

  // ===================
  // LOOT HELPERS
  // ===================

  /**
   * Adds item to an actor, increasing item quantities if matches were found
   *
   * @param {Actor/TokenDocument/Token} actorOrToken            The target to add an item to
   * @param {Array} itemsToAdd                                  An array of objects, with the key "item" being an item object or an Item class (the foundry class), with an optional key of "quantity" being the amount of the item to add
   * @param {object} options                                    Options to pass to the function
   * @param {boolean} [options.removeExistingActorItems=false]  Whether to remove the actor's existing items before adding the new ones
   * @param {boolean} [options.skipVaultLogging=false]          Whether to skip logging this action to the target actor if it is a vault
   * @param {string/boolean} [options.interactionId=false]      The interaction ID of this action
   *
   * @returns {Promise<array>}                                  An array of objects, each containing the item that was added or updated, and the quantity that was added
   */
  static async addItems(
    actorOrToken,
    itemsToAdd,
    { removeExistingActorItems = false, skipVaultLogging = false, interactionId = false, mergeSimilarItems = true } = {}
  ) {
    const itemsData = game.itempiles.API.addItems(actorOrToken, itemsToAdd, {
      mergeSimilarItems: mergeSimilarItems, // NOT SUPPORTED ANYMORE FROM ITEM PILES TO REMOVE IN THE FUTURE
      removeExistingActorItems: removeExistingActorItems,
      skipVaultLogging: skipVaultLogging,
      interactionId: interactionId,
    });
    Logger.debug(`addItems | Added ${itemsToAdd.length} items to ${targetedToken.name}`, itemsData);
    return itemsData;
  }

  /*
    if (!canvas.tokens.controlled.length) return;
    for (const selected_token of canvas.tokens.controlled) {
    await game.itempiles.API.rollItemTable("MY_TABLE_NAME_HERE", {
        timesToRoll: "1d4+1",
        targetActor: selected_token.actor,
        removeExistingActorItems: false
    });
    }
    await game.itempiles.API.turnTokensIntoItemPiles(canvas.tokens.controlled);
  */

  /**
   * Rolls on a table of items and collates them to be able to be added to actors and such
   * @href https://fantasycomputer.works/FoundryVTT-ItemPiles/#/sample-macros?id=populate-loot-via-table
   * @param {string/Actor/Token}                                  The name, ID, UUID, or the actor itself, or an array of such
   * @param {string/RollTable} tableReference                     The name, ID, UUID, or the table itself, or an array of such
   * @param {object} options                                      Options to pass to the function
   * @param {string/number} [options.timesToRoll="1"]             The number of times to roll on the tables, which can be a roll formula
   * @param {boolean} [options.resetTable=true]                   Whether to reset the table before rolling it
   * @param {boolean} [options.normalizeTable=true]               Whether to normalize the table before rolling it
   * @param {boolean} [options.displayChat=false]                 Whether to display the rolls to the chat
   * @param {object} [options.rollData={}]                        Data to inject into the roll formula
   * @param {Actor/string/boolean} [options.targetActor=false]    The target actor to add the items to, or the UUID of an actor
   * @param {boolean} [options.removeExistingActorItems=false]    Whether to clear the target actor's items before adding the ones rolled
   * @param {boolean/string} [options.customCategory=false]       Whether to apply a custom category to the items rolled
   *
   * @returns {Promise<Array<Item>>}                              An array of object containing the item data and their quantity
   */
  static async populateLootViaTable(targetActor, tableReference, options = {}) {
    const table = await RetrieveHelpers.getRollTableAsync(tableReference);
    const newOptions = foundry.utils.mergeObject(
      {
        timesToRoll: "1",
        resetTable: true,
        normalizeTable: false,
        displayChat: false,
        rollData: {},
        targetActor: false,
        removeExistingActorItems: false,
        customCategory: false,
      },
      options
    );

    // TODO Why did wasp do this ??
    if (newOptions.resetTable && table.uuid.startsWith("Compendium")) {
      newOptions.resetTable = false;
    }

    // START MOD 4535992
    /*
    let items = await ItemPilesHelpers.rollTable({
      tableUuid: table,
      formula: timesToRoll,
      normalize: normalizeTable,
      resetTable,
      displayChat,
      rollData,
      customCategory,
    });
    if (targetActor) {
        const itemsToAdd = items.map((item) => {
            const actualItem = item.item.toObject();
            return Utilities.setItemQuantity(actualItem, item.quantity);
        });
        items = await this._addItems(targetActor, itemsToAdd, userId, { removeExistingActorItems });
    }
    */
    let items = await ItemPilesHelpers.rollTable(table, newOptions);
    // END MOD 4535992

    if (targetActor) {
      items = await ItemPilesHelpers.addItems(targetActor, itemsToAdd, {
        removeExistingActorItems: removeExistingActorItems,
      });
    }

    return items;
  }

  /**
   * @returns {Promise<array>}  An array of objects, each containing the item that was added or updated, and the quantity that was added
   */
  static async retrieveItemsDataFromRollTable(table, options) {
    return await ItemPilesHelpers.rollTable(table, options);
  }

  //   /**
  //    * @href https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/master/src/helpers/pile-utilities.js#L1885
  //    * @param tableUuid
  //    * @param formula
  //    * @param resetTable
  //    * @param normalize
  //    * @param displayChat
  //    * @param rollData
  //    * @param customCategory
  //    * @returns {Promise<[object]>}
  //    */
  //   static async rollTable({
  //     tableUuid,
  //     formula = "1",
  //     resetTable = true,
  //     normalize = false,
  //     displayChat = false,
  //     rollData = {},
  //     customCategory = false,
  //   } = {}) {
  /**
   * @href https://github.com/fantasycalendar/FoundryVTT-ItemPiles/blob/master/src/helpers/pile-utilities.js#L1885
   * @param {RollTable|string} tableReference
   * @param {Object} options
   * @returns {Promise<ItemData[]>} Item Data
   */
  static async rollTable(tableReference, options) {
    const table = await RetrieveHelpers.getRollTableAsync(tableReference);

    const formula = table.formula;
    const resetTable = !!options.resetTable; // true;
    const normalize = !!options.normalize; // false;
    const displayChat = options.displayChat;
    const rollData = options.roll;
    const customCategory = !!options.customCategory; // false
    const recursive = !!options.recursive; // true

    const rolledItems = [];

    //const table = await fromUuid(tableUuid);

    if (!tableUuid.startsWith("Compendium")) {
      if (resetTable) {
        await table.reset();
      }

      if (normalize) {
        await table.update({
          results: table.results.map((result) => ({
            _id: result.id,
            weight: result.range[1] - (result.range[0] - 1),
          })),
        });
        await table.normalize();
      }
    }

    // START MOD 4535992
    /* 
    const roll = new Roll(formula.toString(), rollData).evaluate({ async: false });
    if (roll.total <= 0) {
      return [];
    }
    let results;
    if (game.modules.get("better-rolltables")?.active) {
      results = (await game.betterTables.roll(table)).itemsData.map((result) => {
        return {
          documentCollection: result.documentCollection,
          documentId: result.documentId,
          text: result.text || result.name,
          img: result.img,
          quantity: 1,
        };
      });
    } else {
      results = (await table.drawMany(roll.total, { displayChat, recursive: true })).results;
    }
    */
    const brtTable = new BetterRollTable(tableEntity, options);
    await brtTable.initialize();
    const resultBrt = await brtTable.betterRoll();
    const results = resultBrt?.results;
    // END MOD 4535992

    for (const rollData of results) {
      let rolledQuantity = rollData?.quantity ?? 1;

      let item;
      if (rollData.documentCollection === "Item") {
        item = game.items.get(rollData.documentId);
      } else {
        const compendium = game.packs.get(rollData.documentCollection);
        if (compendium) {
          item = await compendium.getDocument(rollData.documentId);
        }
      }

      if (item instanceof RollTable) {
        Logger.error(
          `'item instanceof RollTable', It shouldn't never go here something go wrong with the code please contact the brt developer`
        );
        rolledItems.push(
          ...(await ItemPilesHelpers.rollTable({ tableUuid: item.uuid, resetTable, normalize, displayChat }))
        );
      } else if (item instanceof Item) {
        const quantity = Math.max(ItemPilesHelpers.getItemQuantity(item) * rolledQuantity, 1);
        const itemTmp = RollTableToActorHelpers.resultToItemData(rollData);
        // START MOD 4535992
        /*
        rolledItems.push({
          ...rollData,
          item,
          quantity,
        });
        */
        rolledItems.push({
          ...rollData,
          itemTmp,
          quantity,
        });
        // END MOD 4535992
      }
    }

    const items = [];

    rolledItems.forEach((newItem) => {
      const existingItem = items.find((item) => item.documentId === newItem.documentId);
      if (existingItem) {
        existingItem.quantity += Math.max(newItem.quantity, 1);
      } else {
        setProperty(newItem, ItemPilesHelpers.FLAGS.ITEM, getProperty(newItem.item, ItemPilesHelpers.FLAGS.ITEM));
        if (
          game.itempiles.API.QUANTITY_FOR_PRICE_ATTRIBUTE &&
          !getProperty(newItem, game.itempiles.API.QUANTITY_FOR_PRICE_ATTRIBUTE)
        ) {
          setProperty(
            newItem,
            game.itempiles.API.QUANTITY_FOR_PRICE_ATTRIBUTE,
            ItemPilesHelpers.getItemQuantity(newItem.item)
          );
        }
        if (customCategory) {
          setProperty(newItem, ItemPilesHelpers.FLAGS.CUSTOM_CATEGORY, customCategory);
        }
        items.push({
          ...newItem,
        });
      }
    });

    return items;
  }

  /**
   * Returns a given item's quantity
   *
   * @param {Item/Object} item
   * @returns {number}
   */
  static getItemQuantity(item) {
    const itemData = item instanceof Item ? item.toObject() : item;
    return Number(getProperty(itemData, game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE) ?? 0);
  }

  /**
   * Returns a given item's cost/price
   *
   * @param {Item/Object} item
   * @returns {number}
   */
  static getItemCost(item) {
    const itemData = item instanceof Item ? item.toObject() : item;
    return getProperty(itemData, game.itempiles.API.ITEM_PRICE_ATTRIBUTE) ?? 0;
  }

  /**
   * Find and retrieves an item in a list of items
   *
   * @param {Array<Item|Object>} items
   * @param {Item|Object} findItem
   * @param {object} options
   * @param {boolean} returnOne
   * @returns {*}
   */
  static findSimilarItem(itemsToSearch, itemToFind, { returnOne = true } = {}) {
    return game.itempiles.API.findSimilarItem(itemsToSearch, itemToFind, {
      returnOne: returnOne,
    });
  }
}
