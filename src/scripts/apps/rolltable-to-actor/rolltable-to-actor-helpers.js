import { BetterTables } from "../../better-tables";
import { CONSTANTS } from "../../constants/constants";
import SETTINGS from "../../constants/settings";

export class RollTableToActorHelpers {
  static async addRollTableItemsToActor(table, actor) {
    let brt = new BetterTables();
    const results = await brt.getBetterTableResults(table);
    const itemsData = await RollTableToActorHelpers.resultsToItemsData(results);
    const actorWithItems = await RollTableToActorHelpers.addItemsToActor(actor, itemsData);
    return actorWithItems;
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
    ui.notifications.info(infoStr);
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
      if (!r.documentId) {
        continue;
      }
      const collection = game.collections.get(r.documentCollection) ?? game.packs.get(r.documentCollection);
      let document = (await collection?.get(r.documentId)) ?? (await collection?.getDocument(r.documentId));
      if (document instanceof Item) {
        itemsData.push(document.toObject());
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
    const stackAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.QUANTITY_PROPERTY_PATH);
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
        const newStack = getProperty(match, stackAttribute) + (getProperty(item, stackAttribute) ?? 1);
        setProperty(match, `${stackAttribute}`, newStack);
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
    const priceAttribute = game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.PRICE_PROPERTY_PATH) ?? 0;
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
          await match.update({
            //   [`system.${stackAttribute}`]: newStack,
            [`${stackAttribute}`]: newStack,
            [`${priceAttribute}`]: newPrice,
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
}
