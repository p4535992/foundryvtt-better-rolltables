import { NULL } from "sass";
import { BRTBetterHelpers } from "../better/brt-helper";
import { CONSTANTS } from "../constants/constants";
import { isRealBoolean, isRealBooleanOrElseNull, isRealNumber } from "../lib";
import SETTINGS from "../constants/settings";

export class BRTUtils {
  static addRollModeToChatData(chatData, rollMode) {
    rollMode = rollMode ?? game.settings.get("core", "rollMode");
    if (String(getProperty(chatData, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`)) === "true") {
      rollMode = "gmroll";
    }

    switch (rollMode) {
      case "blindroll":
        chatData.blind = true;
      // no break needed, if so please change this comment ?
      // eslint-disable-next-line no-fallthrough
      case "gmroll":
        chatData.whisper = [game.users.find((u) => u.isGM).id];
        break;
      case "selfroll":
        chatData.whisper = [game.userId];
        break;
    }
  }

  /**
   *
   * @param {string} compendiumName
   * @param {string} entityName
   *
   * @returns {Item}
   */
  static async findInCompendiumByName(compendiumName, entityName) {
    const compendium = game.packs.get(compendiumName);
    if (compendium) {
      const entry = compendium.index.getName(entityName);
      if (entry) {
        return await compendium.getDocument(entry._id);
      }
    } else {
      switch (compendiumName) {
        case "RollTable":
          return game.tables.getName(entityName);
        case "Actor":
          return game.actors.getName(entityName);
        case "Item":
          return game.items.getName(entityName);
        case "JournalEntry":
          return game.journal.getName(entityName);
        case "Playlist":
          return game.playlists.getName(entityName);
        case "Scene":
          return game.scenes.getName(entityName);
        case "Macro":
          return game.macros.getName(entityName);
        case "Card":
          return game.cards.getName(entityName);
      }
    }
  }

  static async findInCompendiumById(compendiumName, entityId) {
    return await game.packs.get(compendiumName)?.getDocument(entityId);
  }

  static separateIdComendiumName(stringWithComendium) {
    const split = stringWithComendium.split(".");
    const nameOrId = split.pop().trim();
    const compendiumName = split.join(".").trim();
    return {
      nameOrId: nameOrId,
      compendiumName: compendiumName,
    };
  }

  /**
   *
   * @param {TableResult} result reference to item
   * @returns {object|boolean} item from compendium
   */
  static async getItemFromCompendium(result) {
    let nameEntry = getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`)
      ? getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`)
      : result.text;
    return BRTUtils.findInCompendiumByName(result.collection, nameEntry);
  }

  /**
   *
   * @param {object} compendium reference to compendium to roll
   * @returns {object} item from compendium
   */
  static async getRandomItemFromCompendium(compendium) {
    const pack = game.packs.get(compendium);
    if (!pack) return;
    const size = pack.index.size;
    if (size === 0) {
      ui.notifications.warn(`Compendium ${pack.title} is empty.`);
      return;
    }
    const randonIndex = Math.floor(Math.random() * size);
    const randomItem = pack.index.contents[randonIndex];
    return pack.getDocument(randomItem._id);
  }

  static getIconByEntityType(entityType) {
    switch (entityType) {
      case "RollTable":
        return "fa-th-list";
      case "Actor":
        return "fa-user";
      case "Item":
        return "fa-suitcase";
      case "JournalEntry":
        return "fa-book-open";
      case "Playlist":
        return "fa-music";
      case "Scene":
        return "fa-map";
      case "Macro":
        return "fa-terminal";
      default:
        return "";
    }
  }

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {number} options.rollsAmount
   * @param {number} options.dc
   * @param {string} options.skill
   * @param {boolean} options.isTokenActor
   * @param {boolean} options.stackSame
   * @param {string} options.customRoll
   * @param {number} options.itemLimit
   * @param {string} options.rollMode
   * @param {string} options.distinct
   * @param {string} options.distinctKeepRolling
   * @returns {Promise<{rollsAmount: number, dc: number, skill: string, isTokenActor: boolean, stackSame: boolean, customRoll: string, itemLimit: number, rollMode: string, distinct: boolean, distinctKeepRolling: string}>},
   */
  static async updateOptions(tableEntity, options = {}) {
    let newOptions = {};
    if (!options) {
      options = {};
    }

    let rollsAmount = undefined;
    if (options?.rollsAmount) {
      if (isRealNumber(options?.rollsAmount)) {
        rollsAmount = options?.rollsAmount;
      } else {
        rollsAmount = await BRTBetterHelpers.tryRoll(options?.rollsAmount);
      }
    } else {
      rollsAmount = await BRTBetterHelpers.rollsAmount(tableEntity);
    }

    newOptions.rollsAmount = rollsAmount;

    let dc =
      options?.dc ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_DC_VALUE_KEY}`) ||
      undefined;

    if (dc) {
      if (isRealNumber(dc)) {
        // DO NOTHING
      } else if (String(dc) === "0") {
        dc = 0;
      } else {
        let dcI = null;
        try {
          dcI = Number(dc);
        } catch (e) {}
        if (dcI && isRealNumber(dcI)) {
          dc = dcI;
        } else {
          dc = await BRTBetterHelpers.tryRoll(dc);
        }
      }
    }
    newOptions.dc = dc;

    newOptions.skill =
      options?.skill ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) ||
      undefined;

    newOptions.isTokenActor = isRealBoolean(options?.isTokenActor)
      ? String(options?.isTokenActor) === "true"
        ? true
        : false
      : false;

    newOptions.stackSame = isRealBoolean(options?.stackSame)
      ? String(options?.stackSame) === "true"
        ? true
        : false
      : true;

    let customRole = options?.customRole ? options.customRole : undefined;
    if (!customRole) {
      customRole = options?.customRoll ? options.customRoll : undefined;
    }
    newOptions.customRoll = customRole;

    newOptions.itemLimit = options?.itemLimit && isRealNumber(options.itemLimit) ? Number(options.itemLimit) : 0;

    let rollMode = options?.rollMode ?? null;
    if (String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`)) === "true") {
      rollMode = "gmroll";
    }
    newOptions.rollMode = rollMode;

    let distinct = isRealBooleanOrElseNull(options?.distinct);
    if (distinct === null) {
      distinct = isRealBooleanOrElseNull(
        getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT}`)
      );
    }
    if (distinct === null) {
      distinct = undefined;
    }

    newOptions.distinct = isRealBoolean(distinct) ? (String(distinct) === "true" ? true : false) : false;

    let distinctKeepRolling = isRealBooleanOrElseNull(options?.distinctKeepRolling);
    if (distinctKeepRolling === null) {
      distinctKeepRolling = isRealBooleanOrElseNull(
        getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT_KEEP_ROLLING}`)
      );
    }
    if (distinctKeepRolling === null) {
      distinctKeepRolling = undefined;
    }

    newOptions.distinctKeepRolling = isRealBoolean(distinctKeepRolling)
      ? String(distinctKeepRolling) === "true"
        ? true
        : false
      : false;

    newOptions.displayChat = isRealBoolean(options?.displayChat)
      ? String(options?.displayChat) === "true"
        ? true
        : false
      : true;

    let usePercentage = isRealBooleanOrElseNull(options?.usePercentage);
    if (usePercentage === null) {
      usePercentage = isRealBooleanOrElseNull(
        getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_USE_PERCENTAGE}`)
      );
    }
    if (usePercentage === null) {
      usePercentage = undefined;
    }

    newOptions.usePercentage = isRealBoolean(usePercentage) ? (String(usePercentage) === "true" ? true : false) : false;

    return newOptions;
  }

  static async addToItemData(itemsData, itemEntity, itemData = {}, isHidden = false) {
    const existingItem = itemsData.find((i) => i.item.id === itemEntity.id);
    const quantity = getProperty(itemData, SETTINGS.QUANTITY_PROPERTY_PATH) || 1;
    const weight = getProperty(itemData, SETTINGS.WEIGHT_PROPERTY_PATH) || 0;

    if (existingItem) {
      existingItem.quantity = +existingItem.quantity + +quantity;
      existingItem.weight = +existingItem.weight + +weight;
    } else {
      // we will scale down the font size if an item name is too long
      const fontSize = Math.max(60, 100 - Math.max(0, (itemEntity.name || itemEntity.text).length - 27) * 2);

      let type = undefined;
      if (itemEntity.isText) {
        type = CONST.TABLE_RESULT_TYPES.TEXT;
      } else if (itemEntity.pack) {
        type = CONST.TABLE_RESULT_TYPES.COMPENDIUM;
      } else {
        type = CONST.TABLE_RESULT_TYPES.DOCUMENT;
      }

      // let resultDoc = await BRTBetterHelpers.retrieveDocumentFromResult(itemEntity);
      let resultDoc = itemEntity;

      itemsData.push({
        documentName: resultDoc.documentName,
        compendiumName: resultDoc.pack,
        type: type,
        item: {
          id: resultDoc.id,
          _id: resultDoc.id,
          name: resultDoc.name,
          img: resultDoc.img ?? resultDoc.src ?? `icons/svg/d20-highlight.svg`,
          text: resultDoc.text ?? resultDoc.name ?? "",
          uuid: resultDoc?.uuid ?? "",
          isHidden: isHidden,
        },
        quantity: quantity,
        weight: weight,
        fontSize: fontSize,
      });
    }

    return itemsData;
  }

  static isTableResultText(result) {
    return result?.type === CONST.TABLE_RESULT_TYPES.TEXT;
  }

  static isTableResultDocument(result) {
    return result?.type === CONST.TABLE_RESULT_TYPES.DOCUMENT;
  }

  static isTableResultCompendium(result) {
    return result?.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM;
  }
}
