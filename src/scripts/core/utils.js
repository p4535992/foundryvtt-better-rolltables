import { BRTBetterHelpers } from "../better/brt-helper";
import { CONSTANTS } from "../constants/constants";
import { BRTCONFIG } from "./config";

export class BRTUtils {
  static addRollModeToChatData(chatData, rollMode) {
    rollMode = rollMode ?? game.settings.get("core", "rollMode");
    if (String(getProperty(chatData, `flags.${CONSTANTS.MODULE_ID}.${BRTCONFIG.HIDDEN_TABLE}`)) === "true") {
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
    return BRTUtils.findInCompendiumByName(result.collection, result.text);
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
   * @param {number} options.rollsAmount
   * @param {number} options.dc
   * @param {string} options.skill
   * @param {boolean} options.isTokenActor
   * @param {boolean} options.stackSame
   * @param {string} options.customRoll
   * @param {number} options.itemLimit
   * @param {string} options.rollMode
   * @returns {Promise<{rollsAmount: number, dc: number, skill: string, isTokenActor: boolean, stackSame: boolean, customRoll: string, itemLimit: number, rollMode: string}>},
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
      } else {
        dc = await BRTBetterHelpers.tryRoll(dc);
      }
    }
    newOptions.dc = dc;

    newOptions.skill =
      options?.skill ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) ||
      undefined;

    newOptions.isTokenActor = options?.isTokenActor;
    newOptions.stackSame = options?.stackSame ? options.stackSame : true;

    let customRole = options?.customRole ? options.customRole : undefined;
    if (!customRole) {
      customRole = options?.customRoll ? options.customRoll : undefined;
    }
    newOptions.customRoll = customRole;

    newOptions.itemLimit = options?.itemLimit ? Number(options.itemLimit) : 0;

    let rollMode = options?.rollMode ?? null;
    if (String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${BRTCONFIG.HIDDEN_TABLE}`)) === "true") {
      rollMode = "gmroll";
    }
    newOptions.rollMode;

    return newOptions;
  }
}
