import { BRTBuilder } from "./core/brt-builder.js";
import { BetterResults } from "./core/brt-table-results.js";
import { CONSTANTS, BRTCONFIG } from "./core/config.js";
import { LootChatCard } from "./loot/loot-chat-card.js";
import { LootCreator } from "./loot/loot-creator.js";
import { getRandomItemFromCompendium } from "./core/utils.js";
import { CompendiumToRollTableHelpers } from "./apps/compendium-to-rolltable/compendium-to-rollTable-helpers.js";
import { RollFromCompendiumAsRollTableHelpers } from "./apps/roll-from-compendium-as-rolltable/roll-from-compendium-as-rolltable-helpers.js";
import { BRTLootHelpers } from "./loot/loot-helpers.js";

/**
 * Create a new API class and export it as default
 */
const API = {

    betterTables: new BetterTables(),
  /**
   * Get better rolltable tags from settings
   *
   */
  getTags() {
    return game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.TAGS.USE);
  },

  /**
   * Roll a table an add the resulting loot to a given token.
   *
   * @param {RollTable} tableEntity
   * @param {TokenDocument} token
   * @param {options} object
   * @returns
   */
  async addLootToSelectedToken(tableEntity, token = null, options = null) {
    return await BRTLootHelpers.addLootToSelectedToken(tableEntity, token, options);
  },

  /**
   *
   * @param {*} tableEntity
   */
  async generateLoot(tableEntity, options = {}) {
    return await BRTLootHelpers.generateLoot(tableEntity, options);
  },


  /**
   *
   * @param {*} tableEntity
   */
  async generateChatLoot(tableEntity, options = null) {
    return await BRTLootHelpers.generateChatLoot(tableEntity, options)
  },

  /**
   *
   * @param {String} compendium ID of the compendium to roll
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
        compendiumName,tableName, { weightPredicate });
  }



  /* ======================================================== */
  /* NEW API INTEGRATION */
  /* ======================================================== */


}

export default API
