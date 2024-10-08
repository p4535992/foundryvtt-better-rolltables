import API from "../../API";
import { BetterTables } from "../../better-tables";
import { CONSTANTS } from "../../constants/constants";
import SETTINGS from "../../constants/settings";
import { BRTBetterHelpers } from "../../tables/better/brt-helper";
import { BRTUtils } from "../../core/utils";
import Logger from "../../lib/Logger";
import { RetrieveHelpers } from "../../lib/retrieve-helpers";
import ItemPilesHelpers from "../../lib/item-piles-helpers";
import { isEmptyObject } from "../../lib/lib";

export class RollTableToActorHelpers {
    /**
     *
     * @param {RollTable} table
     * @param {Object} options
     * @returns {Promise<ItemData[]>} Item Data Array.  An array of objects, each containing the item that was added or updated, and the quantity that was added
     */
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
        const itemsData = await ItemPilesHelpers.populateActorOrTokenViaTable(actor, table, {
            targetActor: actor,
            removeExistingActorItems: false,
            timesToRoll: isEmptyObject(options?.rollsAmount)
                ? isEmptyObject(options?.timesToRoll)
                    ? "1"
                    : String(options?.timesToRoll)
                : String(options?.rollsAmount),
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
                const itemTmp = i.item;
                const itemStackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
                if (!itemStackAttribute) {
                    return itemTmp.name;
                }
                // const stack = parseInt(foundry.utils.getProperty(i.system, itemStackAttribute));
                const stack = parseInt(foundry.utils.getProperty(itemTmp, itemStackAttribute));
                if (stack <= 1) {
                    return itemTmp.name;
                }
                return `${stack} ${itemTmp.name}`;
            })
            .join(", ");
        const controlledActors = [actor];
        const actorNames = controlledActors.map((a) => a.name).join(", ");
        const infoStr = Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.importSuccess`, {
            itemNames: itemNames,
            actorNames: actorNames,
        });
        Logger.info(infoStr, true);
        //Logger.info(Logger.i18n(`${CONSTANTS.MODULE_ID}.label.importSuccess`), true);
        const items = itemsData;
        return items;
    }

    /**
     * Add rolltable results to actor
     * @deprecated to remove we use item piles now
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
                const itemTmp = i.item;
                const itemStackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
                if (!itemStackAttribute) {
                    return itemTmp.name;
                }
                // const stack = parseInt(foundry.utils.getProperty(i.system, itemStackAttribute));
                const stack = parseInt(foundry.utils.getProperty(itemTmp, itemStackAttribute));
                if (stack <= 1) {
                    return itemTmp.name;
                }
                return `${stack} ${itemTmp.name}`;
            })
            .join(", ");
        const actorNames = controlledActors.map((a) => a.name).join(", ");
        const infoStr = Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.importSuccess`, {
            itemNames: itemNames,
            actorNames: actorNames,
        });
        Logger.info(infoStr, true);

        //Logger.info(Logger.i18n(`${CONSTANTS.MODULE_ID}.label.importSuccess`), true);
        const items = itemsData;
        return items;
    }

    /**
     * @deprecated to remove we use item piles now
     * @param {*} str
     * @param {*} arr
     * @returns
     */
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
            const itemTmp = await RollTableToActorHelpers.resultToItemData(r);
            if (itemTmp) {
                itemsData.push(itemTmp);
            }
        }
        return itemsData;
    }

    /**
     * Converts a result into a item data
     * @param {TableResult} r
     * @return {Promise<{ItemData}>} item data
     */
    static async resultToItemData(r) {
        let document = null;
        if (!r.documentId || r.type === CONST.TABLE_RESULT_TYPES.TEXT) {
            if (foundry.utils.getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`)) {
                document = await fromUuid(
                    foundry.utils.getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`),
                );
            }
            if (!document) {
                return null;
            }
        }
        // if (result.documentCollection === "Item") {
        //   existingItem = game.items.get(result.documentId);
        // } else {
        //   const compendium = game.packs.get(result.documentCollection);
        //   if (compendium) {
        //     existingItem = await compendium.getDocument(result.documentId);
        //   }
        // }
        // NOTE: The formulaAmount calculation is already done on the betterRoll Method
        if (foundry.utils.getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`)) {
            document = await fromUuid(
                foundry.utils.getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`),
            );
            if (!document) {
                try {
                    const collection =
                        game.collections.get(r.documentCollection) ??
                        (await RetrieveHelpers.getCompendiumCollectionAsync(r.documentCollection, true, false));
                    document = (await collection?.get(r.documentId)) ?? (await collection?.getDocument(r.documentId));
                } catch (e) {
                    // DO NOTHING
                }
            }
        } else {
            try {
                const collection =
                    game.collections.get(r.documentCollection) ??
                    (await RetrieveHelpers.getCompendiumCollectionAsync(r.documentCollection, true, false));
                document = (await collection?.get(r.documentId)) ?? (await collection?.getDocument(r.documentId));
            } catch (e) {
                // DO NOTHING
            }
        }

        // Maybe i can remove these double checks...
        // Try first to load item from compendium
        if (!document && r.collection) {
            document = await BRTUtils.getItemFromCompendium(r);
        }
        // Try first to load item from item list
        if (!document) {
            // if an item with this name exist we load that item data, otherwise we create a new one
            document = game.items.getName(r.text);
        }

        if (!document) {
            Logger.error(`Cannot find document for result`, false, r);
            return null;
        }

        // const itemConversions = {
        //     Actor: {
        //         name: `${r.text} Portrait`,
        //         img: document?.img || "icons/svg/mystery-man.svg",
        //         price: new Roll("1d20 + 10").evaluateSync().total || 1, // TODO MAKE MORE RANDOM
        //         type: game.itempiles.API.ITEM_CLASS_LOOT_TYPE,
        //     },
        //     Scene: {
        //         name: `Map of ${document?.name}`,
        //         img: document?.thumb || "icons/svg/direction.svg",
        //         price: new Roll("1d20 + 10").evaluateSync().total || 1, // TODO MAKE MORE RANDOM
        //         type: game.itempiles.API.ITEM_CLASS_LOOT_TYPE,
        //     },
        // };

        // if (!(document instanceof Item)) {
        //     // const defaultType = Item.TYPES[0]; // TODO add on item piles default item type like actor
        //     Logger.debug(`You cannot create itemData from this result probably is not a item`, r);
        //     return null;
        // }

        let itemTmp = null;
        let customName = foundry.utils.getProperty(
            r,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`,
        );
        let customImage = foundry.utils.getProperty(
            r,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`,
        );

        if (document instanceof Item) {
            itemTmp = document.toObject();
            itemTmp.uuid = document.uuid;
        } else if (document instanceof Actor && game.itempiles.API.ITEM_CLASS_LOOT_TYPE) {
            Logger.debug(`The Table Result is not a item but a Actor`, false, r);
            itemTmp = {};
            itemTmp.name = `${r.text || document?.name} Portrait`;
            itemTmp.img = document?.img || "icons/svg/mystery-man.svg";
            itemTmp.type = game.itempiles.API.ITEM_CLASS_LOOT_TYPE;
            ItemPilesHelpers.setItemCost(itemTmp, await BRTBetterHelpers.tryRoll("1d20 +10", 1)); // TODO MAKE MORE RANDOM
            ItemPilesHelpers.setItemQuantity(itemTmp, 1);

            customName = `${customName || itemTmp.name} Portrait`;
        } else if (document instanceof Scene && game.itempiles.API.ITEM_CLASS_LOOT_TYPE) {
            Logger.debug(`The Table Result is not a item but a Scene`, false, r);
            itemTmp = {};
            itemTmp.name = `Map of ${r.text || document?.name}`;
            itemTmp.img = document?.thumb || document?.img || "icons/svg/direction.svg";
            itemTmp.type = game.itempiles.API.ITEM_CLASS_LOOT_TYPE;
            ItemPilesHelpers.setItemCost(itemTmp, await BRTBetterHelpers.tryRoll("1d20 +10", 1)); // TODO MAKE MORE RANDOM
            ItemPilesHelpers.setItemQuantity(itemTmp, 1);

            customName = `Map of ${customName || itemTmp.name}`;
        } else {
            Logger.debug(`The Table Result is not a item`, false, r);
            return null;
        }

        // Update with custom name if present
        // Set up custom name
        foundry.utils.setProperty(
            r,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`,
            itemTmp.name,
        );
        if (!customName) {
            foundry.utils.setProperty(
                r,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`,
                itemTmp.name,
            );
        } else {
            foundry.utils.setProperty(itemTmp, `name`, customName);
        }
        // Set up custom icon
        foundry.utils.setProperty(
            r,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_ICON}`,
            itemTmp.img,
        );
        if (!customImage) {
            foundry.utils.setProperty(
                r,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`,
                itemTmp.img,
            );
        } else {
            foundry.utils.setProperty(itemTmp, `img`, customImage);
        }
        // Set up custom quantity (ty item piles)
        // TODO DISABLED FOR NOW WE USE THE LOGIC 1:1 INSTEAD N:1 FOR NOW
        /*

        let customQuantity = foundry.utils.getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`);

      if (!customQuantity) {
        foundry.utils.setProperty(
          r,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`,
          ItemPilesHelpers.getItemQuantity(itemTmp)
        );
      } else {
        foundry.utils.setProperty(
          itemTmp,
          `quantity`,
          customQuantity
        );
      }
      */
        // Merge flags brt to item data
        if (!foundry.utils.getProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`)) {
            foundry.utils.setProperty(itemTmp, `flags.${CONSTANTS.MODULE_ID}`, {});
        }
        foundry.utils.mergeObject(
            itemTmp.flags[CONSTANTS.MODULE_ID],
            foundry.utils.getProperty(r, `flags.${CONSTANTS.MODULE_ID}`),
        );
        // itemsData.push(itemTmp);
        return itemTmp;
    }

    /**
     * Preemptively stacks all items in the itemsData, if possible
     * @deprecated remain for the special case of the harvester module harvester
     * @param itemsData
     * @return {*[]|*}
     */
    static preStackItems(itemsData) {
        return RollTableToActorHelpers._preStackItemsImpl(itemsData, false, false, false);
    }

    /**
     * Preemptively stacks all items in the itemsData, if possible
     * @deprecated remain for the special case of the harvester module harvester
     * @param itemsData
     * @return {*[]|*}
     */
    static preStackItemsSpecialHarvester(itemsData) {
        return RollTableToActorHelpers._preStackItemsImpl(itemsData, false, true, true);
    }

    /**
     * Preemptively stacks all items in the itemsData, if possible
     * @deprecated remain for the special case of the harvester module harvester
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
                // const newStack = foundry.utils.getProperty(match.system, stackAttribute) + (foundry.utils.getProperty(item.system, stackAttribute) ?? 1);
                // foundry.utils.setProperty(match, `system.${stackAttribute}`, newStack);
                if (!ignoreQuantity) {
                    const newStack =
                        foundry.utils.getProperty(match, stackAttribute) +
                        (foundry.utils.getProperty(item, stackAttribute) ?? 1);
                    foundry.utils.setProperty(match, `${stackAttribute}`, newStack);
                }
                if (!ignorePrice) {
                    const newPriceValue =
                        (foundry.utils.getProperty(match, priceAttribute)?.value ?? 0) +
                        (foundry.utils.getProperty(item, priceAttribute)?.value ?? 0);
                    const newPrice = {
                        denomination: foundry.utils.getProperty(item, priceAttribute)?.denomination,
                        value: newPriceValue,
                    };
                    foundry.utils.setProperty(match, `${priceAttribute}`, newPrice);
                }
                // if (!ignoreWeight) {
                //   const newWeight = foundry.utils.getProperty(match, weightAttribute) + (foundry.utils.getProperty(item, weightAttribute) ?? 1);
                //   foundry.utils.setProperty(match, `${weightAttribute}`, newWeight);
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
                    // const newStack = foundry.utils.getProperty(match.system, stackAttribute) + (foundry.utils.getProperty(item.system, stackAttribute) ?? 1);
                    const newStack =
                        foundry.utils.getProperty(match, stackAttribute) +
                        (foundry.utils.getProperty(item, stackAttribute) ?? 1);
                    const newPriceValue =
                        (foundry.utils.getProperty(match, priceAttribute)?.value ?? 0) +
                        (foundry.utils.getProperty(item, priceAttribute)?.value ?? 0);
                    const newPrice = {
                        denomination: foundry.utils.getProperty(item, priceAttribute)?.denomination,
                        value: newPriceValue,
                    };
                    // const newWeight = foundry.utils.getProperty(match, weightAttribute) + (foundry.utils.getProperty(item, weightAttribute) ?? 0);

                    const newQty = RollTableToActorHelpers._handleLimitedQuantity(
                        newStack,
                        foundry.utils.getProperty(item, stackAttribute),
                        customLimit,
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
     * @deprecated very old method
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
            customLimit,
        );
        return items;
    }

    // /**
    //  * @deprecated not used anymore
    //  * @param {TableResult} result representation
    //  * @param {Actor} actor to which to add items to
    //  * @param {boolean} stackSame if true add quantity to an existing item of same name in the current actor
    //  * @param {number} customLimit
    //  * @returns {Item} the create Item (foundry item)
    //  */
    // static async _createItem(result, actor, stackSame = true, customLimit = 0) {
    //     const newItemData = await RollTableToActorHelpers.buildItemData(result);
    //     const priceAttribute = game.itempiles.API.ITEM_PRICE_ATTRIBUTE; // SETTINGS.PRICE_PROPERTY_PATH
    //     const itemPrice = foundry.utils.getProperty(newItemData, priceAttribute) || 0;
    //     const embeddedItems = [...actor.getEmbeddedCollection("Item").values()];
    //     const originalItem = embeddedItems.find(
    //         (i) => i.name === newItemData.name && itemPrice === foundry.utils.getProperty(i, priceAttribute),
    //     );

    //     /** if the item is already owned by the actor (same name and same PRICE) */
    //     if (originalItem && stackSame) {
    //         /** add quantity to existing item */

    //         const stackAttribute = game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
    //         const priceAttribute = game.itempiles.API.ITEM_PRICE_ATTRIBUTE; // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH);
    //         // const weightAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.WEIGHT_PROPERTY_PATH);

    //         const newItemQty = foundry.utils.getProperty(newItemData, stackAttribute) || 1;
    //         const originalQty = foundry.utils.getProperty(originalItem, stackAttribute) || 1;
    //         const updateItem = { _id: originalItem.id };
    //         const newQty = RollTableToActorHelpers._handleLimitedQuantity(newItemQty, originalQty, customLimit);

    //         if (newQty != newItemQty) {
    //             foundry.utils.setProperty(updateItem, stackAttribute, newQty);

    //             const newPriceValue =
    //                 (foundry.utils.getProperty(originalItem, priceAttribute)?.value ?? 0) +
    //                 (foundry.utils.getProperty(newItemData, priceAttribute)?.value ?? 0);
    //             const newPrice = {
    //                 denomination: foundry.utils.getProperty(item, priceAttribute)?.denomination,
    //                 value: newPriceValue,
    //             };
    //             foundry.utils.setProperty(updateItem, `${priceAttribute}`, newPrice);

    //             // const newWeight = foundry.utils.getProperty(originalItem, weightAttribute) + (foundry.utils.getProperty(newItemData, weightAttribute) ?? 1);
    //             // foundry.utils.setProperty(updateItem, `${weightAttribute}`, newWeight);

    //             await actor.updateEmbeddedDocuments("Item", [updateItem]);
    //         }
    //         return actor.items.get(originalItem.id);
    //     } else {
    //         /** we create a new item if we don't own already */
    //         return await actor.createEmbeddedDocuments("Item", [newItemData]);
    //     }
    // }

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

    // /**
    //  * @deprecated we use instead RollTableToActorHelpers.resultToItemData(result)
    //  * @param {TableResult} result
    //  * @returns
    //  */
    // static async buildItemData(result) {
    //     /*
    // // PATCH 2023-10-04
    // let customResultName = undefined;
    // let customResultImg = undefined;
    // if (foundry.utils.getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)) {
    //   customResultName = foundry.utils.getProperty(
    //     result,
    //     `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`
    //   );
    // }

    // if (foundry.utils.getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)) {
    //   customResultImg = foundry.utils.getProperty(
    //     result,
    //     `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`
    //   );
    // }

    // let existingItem = undefined;

    // let docUuid = foundry.utils.getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`);
    // if (docUuid) {
    //   existingItem = await fromUuid(docUuid);
    // }

    // if (result.documentCollection === "Item") {
    //   existingItem = game.items.get(result.documentId);
    // } else {
    //   const compendium = game.packs.get(result.documentCollection);
    //   if (compendium) {
    //     existingItem = await compendium.getDocument(result.documentId);
    //   }
    // }

    // // Try first to load item from compendium
    // if (!existingItem && result.collection) {
    //   existingItem = await BRTUtils.getItemFromCompendium(result);
    // }

    // // Try first to load item from item list
    // if (!existingItem) {
    //   // if an item with this name exist we load that item data, otherwise we create a new one
    //   existingItem = game.items.getName(result.text);
    // }

    // if (!existingItem) {
    //   Logger.error(`Cannot find document for result`, false, result);
    //   return null;
    // }

    // let itemData = foundry.utils.duplicate(existingItem);

    // if (customResultName) {
    //   itemData.name = customResultName;
    // }
    // if (customResultImg) {
    //   itemData.img = customResultImg;
    // }

    // if(!itemData.type) {
    //    itemData.type = CONSTANTS.ITEM_LOOT_TYPE;
    // }

    // const itemConversions = {
    //   Actor: {
    //     text: customResultName ? `${customResultName} Portrait` : `${result.text} Portrait`,
    //     img: customResultImg || existingItem?.img || "icons/svg/mystery-man.svg",
    //     price: new Roll("1d20 + 10").evaluateSync().total || 1,
    //   },
    //   Scene: {
    //     text: customResultName ? `Map of ${customResultName}` : `Map of ${existingItem?.name}`,
    //     img: customResultImg || existingItem?.thumb || "icons/svg/direction.svg",
    //     price: new Roll("1d20 + 10").evaluateSync().total || 1,
    //   },
    // };

    // const convert = itemConversions[existingItem?.documentName] ?? false;
    // //  Create item from text since the item does not exist
    // const createNewItem = !existingItem || convert;

    // if (createNewItem) {
    //   const name = convert ? convert?.text : result.text;
    //   const type = CONSTANTS.ITEM_LOOT_TYPE;
    //   const img = convert ? convert?.img : result.img;
    //   const price = convert ? convert?.price : result.price || 0;

    //   itemData = {
    //     name: name,
    //     type: type,
    //     img: img, // "icons/svg/mystery-man.svg"
    //     system: {
    //       price: price,
    //     },
    //   };
    // }

    // if (Object.getOwnPropertyDescriptor(result, "commands") && result.commands) {
    //   itemData = RollTableToActorHelpers._applyCommandToItemData(itemData, result.commands);
    // }

    // if (!itemData) {
    //   return;
    // }
    // */
    //     const itemData = RollTableToActorHelpers.resultToItemData(result);
    //     return itemData;
    // }

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
                rolledValue = new Roll(cmd.arg).evaluateSync().total;
            } catch (e) {
                Logger.error(e.message, false, e);
                continue;
            }
            foundry.utils.setProperty(itemData, `system.${cmd.command.toLowerCase()}`, rolledValue);
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
    //       .filter((spell) => foundry.utils.getProperty(spell, CONSTANTS.SPELL_LEVEL_PATH) === level),
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

    //   itemData = foundry.utils.duplicate(itemData);

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
