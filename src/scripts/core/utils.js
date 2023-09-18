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
   * @param {object} item reference to item
   * @returns {object|boolean} item from compendium
   */
  static async getItemFromCompendium(item) {
    return BRTUtils.findInCompendiumByName(item.collection, item.text);
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
}
