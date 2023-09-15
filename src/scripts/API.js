import { BRTBuilder } from "./core/brt-builder.js";
import { BetterResults } from "./core/brt-table-results.js";
import { BRTCONFIG } from "./core/config.js";
import { LootChatCard } from "./loot/loot-chat-card.js";
import { LootCreator } from "./loot/loot-creator.js";
import { getRandomItemFromCompendium } from "./core/utils.js";
import { CompendiumToRollTableHelpers } from "./apps/compendium-to-rolltable/compendium-to-rollTable-helpers.js";
import { RollFromCompendiumAsRollTableHelpers } from "./apps/roll-from-compendium-as-rolltable/roll-from-compendium-as-rolltable-helpers.js";
import { BRTLootHelpers } from "./loot/loot-helpers.js";
import { BRTStoryHelpers } from "./story/story-helpers.js";
import { BetterTables } from "./better-tables.js";
import { CONSTANTS } from "./constants/constants.js";

/**
 * Create a new API class and export it as default
 */
const API = {
  /**
   *  Support object for retrocompatbility
   */
  betterTables: new BetterTables(),

  /**
   * Get better rolltable tags from settings
   *
   */
  getTags() {
    return game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.TAGS.USE);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {('blindroll'|'gmroll'|'selfroll')} options.rollMode The roll mode
   * @returns {Promise<void>}
   */
  async betterTableRoll(tableEntity, options = null) {
    return await this.betterTables.betterTableRoll(tableEntity, options);
  },

  async updateSpellCache(pack = null) {
    return await this.betterTables.updateSpellCache(pack);
  },

  /**
   *
   * @param {String} compendium ID of the compendium to roll
   * @returns {Promise<{flavor: string; sound: string; user: object; content: object;} | undefined}
   */
  async rollCompendiumAsRolltable(compendium = null, hideChatMessage) {
    return await RollFromCompendiumAsRollTableHelpers.rollCompendiumAsRollTable(compendium, hideChatMessage);
  },

  /**
   * @module BetterRolltables.API.createRolltableFromCompendium
   *
   * @description Create a new RollTable by extracting entries from a compendium.
   *
   * @version 1.0.1
   * @since 1.8.7
   *
   * @param {string} compendiumName the name of the compendium to use for the table generation
   * @param {string} tableName the name of the table entity that will be created
   * @param {function(Document)} weightPredicate a function that returns a weight (number) that will be used
   * for the tableResult weight for that given entity. returning 0 will exclude the entity from appearing in the table
   *
   * @returns {Promise<Document>} the table entity that was created
   */
  async createRolltableFromCompendium(
    compendiumName,
    tableName = compendiumName + " RollTable",
    { weightPredicate = null } = {}
  ) {
    return await CompendiumToRollTableHelpers.compendiumToRollTable(
      compendiumName,
      tableName ?? compendiumName + " RollTable",
      { weightPredicate }
    );
  },

  /**
   * @module BetterRolltables.API.createTableFromCompendium
   *
   * @description Create a new RollTable by extracting entries from a compendium.
   *
   * @version 1.0.1
   * @since 1.8.7
   *
   * @param {string} compendiumName the name of the compendium to use for the table generation
   * @param {string} tableName the name of the table entity that will be created
   * @param {function(Document)} weightPredicate a function that returns a weight (number) that will be used
   * for the tableResult weight for that given entity. returning 0 will exclude the entity from appearing in the table
   *
   * @returns {Promise<Document>} the table entity that was created
   */
  async createTableFromCompendium(
    compendiumName,
    tableName = compendiumName + " RollTable",
    { weightPredicate = null } = {}
  ) {
    return await CompendiumToRollTableHelpers.compendiumToRollTable(
      compendiumName,
      tableName ?? compendiumName + " RollTable",
      { weightPredicate }
    );
  },

  /* ================================================ */
  /* LOOT */
  /* ================================================ */

  /**
   * Roll a table an add the resulting loot to a given token.
   *
   * @param {RollTable} tableEntity
   * @param {TokenDocument} token
   * @param {Object} options
   * @param {('blindroll'|'gmroll'|'selfroll')} options.rollMode The roll mode
   * @returns {Promise<void>}
   */
  async addLootToSelectedToken(tableEntity, token = null, options = null) {
    return await BRTLootHelpers.addLootToSelectedToken(tableEntity, token, options);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {('blindroll'|'gmroll'|'selfroll')} options.rollMode The roll mode
   * @returns {Promise<void>}
   */
  async generateLoot(tableEntity, options = {}) {
    return await BRTLootHelpers.generateLoot(tableEntity, options);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {('blindroll'|'gmroll'|'selfroll')} options.rollMode The roll mode
   * @returns {Promise<void>}
   */
  async generateChatLoot(tableEntity, options = null) {
    return await BRTLootHelpers.generateChatLoot(tableEntity, options);
  },

  /* ================================================ */
  /* STORY */
  /* ================================================ */

  /**
   * Get story results
   * @param {RollTable} tableEntity
   * @returns {Promise<{ string, string }>}
   */
  async getStoryResults(tableEntity) {
    return await BRTStoryHelpers.getStoryResults(tableEntity);
  },

  /**
   * Get story results
   * @param {RollTable} tableEntity
   * @returns {Promise<void>}
   */
  async generateChatStory(tableEntity) {
    return await BRTStoryHelpers.generateChatStory(tableEntity);
  },

  /* ======================================================== */
  /* NEW API INTEGRATION */
  /* ======================================================== */

  /**
   * @module game.modules.get('better-rolltables').api.createRollTableFromCompendium
   * @description Create a new RollTable by extracting entries from a compendium.
   * @param {string} compendiumName the name of the compendium to use for the table generation
   * @param {string} tableName the name of the table entity that will be created
   * @param {function(Document)} weightPredicate a function that returns a weight (number) that will be used
   * for the tableResult weight for that given entity. returning 0 will exclude the entity from appearing in the table
   *
   * @returns {Promise<Document>} the table entity that was created
   */
  async createRollTableFromCompendium(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw error("createRollTableFromCompendium | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw error("createRollTableFromCompendium | inAttributes must be of type object");
    }

    const compendiumName = inAttributes.compendiumName;
    const tableName = inAttributes.tableName ?? compendiumName + " RollTable";
    const weightPredicate = inAttributes.weightPredicate;

    return await CompendiumToRollTableHelpers.compendiumToRollTable(compendiumName, tableName, { weightPredicate });
  },

  /**
   *
   * @param {String} compendium ID of the compendium to roll
   * @returns {Promise<{flavor: string; sound: string; user: object; content: object;} | undefined}
   */
  async rollCompendiumAsRollTable(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw error("rollCompendiumAsRollTable | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw error("rollCompendiumAsRollTable | inAttributes must be of type object");
    }
    const compendium = inAttributes.compendium;
    const hideChatMessage = inAttributes.hideChatMessage;
    return await RollFromCompendiumAsRollTableHelpers.rollCompendiumAsRollTable(compendium, hideChatMessage);
  },
};

export default API;
