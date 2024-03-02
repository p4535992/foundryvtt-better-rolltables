import { CompendiumToRollTableHelpers } from "./apps/compendium-to-rolltable/compendium-to-rollTable-helpers.js";
import { RollFromCompendiumAsRollTableHelpers } from "./apps/roll-from-compendium-as-rolltable/roll-from-compendium-as-rolltable-helpers.js";
import { BRTLootHelpers } from "./tables/loot/loot-helpers.js";
import { BRTStoryHelpers } from "./tables/story/story-helpers.js";
import { BetterTables } from "./better-tables.js";
import { CONSTANTS } from "./constants/constants.js";
import { RollTableToActorHelpers } from "./apps/rolltable-to-actor/rolltable-to-actor-helpers.js";
import { BRTHarvestHelpers } from "./tables/harvest/harvest-helpers.js";
import { BetterChatCard } from "./tables/better/brt-chat-card.js";
import { BetterResults } from "./core/brt-table-results.js";
import { LootChatCard } from "./tables/loot/loot-chat-card.js";
import { HarvestChatCard } from "./tables/harvest/harvest-chat-card.js";
import { StoryChatCard } from "./tables/story/story-chat-card.js";
import { betterRolltablesSocket } from "./socket.js";
import { isRealBoolean } from "./lib/lib.js";
import { BetterRollTable } from "./core/brt-table.js";
import Logger from "./lib/Logger.js";

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
    return game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.TAGS.USE);
  },

  /**
   * @deprecated remains for retro compatibility for anyone used this ?
   * @param {RollTable} tableEntity rolltable to generate content from
   * @returns {Promise<{flavor: *, sound: string, user: *, content: *}>}
   */
  async rollOld(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`roll | No reference to a rollTable is been passed`, true);
      return;
    }

    return await this.betterTables.roll(tableEntity, options);
  },

  /**
   * @deprecated remains for retro compatibility with Item Piles
   * @param {RollTable} tableEntity rolltable to generate content from
   * @returns {Promise<{flavor: *, sound: string, user: *, content: *}>}
   */
  async roll(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`roll | No reference to a rollTable is been passed`, true);
      return;
    }

    const brtTable = new BetterRollTable(tableEntity, options);
    await brtTable.initialize();
    const resultBrt = await brtTable.betterRoll();

    const results = resultBrt?.results;

    let rollMode = options?.rollMode || brtTable.rollMode || null;
    let roll = options?.roll || brtTable.mainRoll || null;

    const br = new BetterResults(results);
    const betterResults = await br.buildResults(tableEntity);

    const data = {};
    setProperty(data, `itemsData`, betterResults);
    return data;
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<TableResult[]>}
   */
  async betterTableRoll(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`betterTableRoll | No reference to a rollTable is been passed`, true);
      return;
    }
    return await this.betterTables.betterTableRoll(tableEntity, options);
    // TODO
    // if(game.user.isGM) {
    //   return await this.betterTables.betterTableRoll(tableEntity, options);
    // } else {
    //   return await betterRolltablesSocket.executeAsGM(
    // 		"invokeBetterTableRollArr",
    // 		tableEntity.uuid,
    // 		options
    // 	);
    // }
  },

  // async updateSpellCache(pack = null) {
  //   return await this.betterTables.updateSpellCache(pack);
  // },

  /**
   *
   * @param {String} compendium ID of the compendium to roll
   * @returns {Promise<{flavor: string; sound: string; user: object; content: object;} | undefined}
   */
  async rollCompendiumAsRolltable(compendium = null, hideChatMessage) {
    if (!compendium) {
      Logger.warn(`rollCompendiumAsRolltable | No reference to a compendium is been passed`, true);
      return;
    }
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
    if (!compendiumName) {
      Logger.warn(`createRolltableFromCompendium | No reference to a compendiumName is been passed`, true);
      return;
    }
    return await CompendiumToRollTableHelpers.compendiumToRollTable(
      compendiumName,
      tableName ?? compendiumName + " RollTable",
      { weightPredicate }
    );
  },

  /**
   * @description Create a new RollTable by extracting entries from a compendium.
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
    if (!compendiumName) {
      Logger.warn(`createTableFromCompendium | No reference to a compendiumName is been passed`, true);
      return;
    }
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
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<void>}
   */
  async addLootToSelectedToken(tableEntity, token = null, options = {}) {
    if (!tableEntity) {
      Logger.warn(`addLootToSelectedToken | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTLootHelpers.addLootToSelectedToken(tableEntity, token, options);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<void>}
   */
  async generateLoot(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`generateLoot | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTLootHelpers.generateLoot(tableEntity, options);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<void>}
   */
  async generateLootOnSelectedToken(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`generateLootOnSelectedToken | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTLootHelpers.addLootToSelectedToken(tableEntity, null, options);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<void>}
   */
  async generateChatLoot(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`generateChatLoot | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTLootHelpers.generateChatLoot(tableEntity, options);
  },

  /* ================================================ */
  /* HARVEST */
  /* ================================================ */

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<void>}
   */
  async generateHarvest(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`generateHarvest | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTHarvestHelpers.generateHarvest(tableEntity, options);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<void>}
   */
  async generateHarvestOnSelectedToken(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`generateHarvestOnSelectedToken | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTHarvestHelpers.addHarvestToSelectedToken(tableEntity, null, options);
  },

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<void>}
   */
  async generateChatHarvest(tableEntity, options = {}) {
    if (!tableEntity) {
      Logger.warn(`generateChatHarvest | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTHarvestHelpers.generateChatHarvest(tableEntity, options);
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
    if (!tableEntity) {
      Logger.warn(`getStoryResults | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTStoryHelpers.getStoryResults(tableEntity);
  },

  /**
   * Get story results
   * @param {RollTable} tableEntity
   * @returns {Promise<void>}
   */
  async generateChatStory(tableEntity) {
    if (!tableEntity) {
      Logger.warn(`generateChatStory | No reference to a RollTable is been passed`, true);
      return;
    }
    return await BRTStoryHelpers.generateChatStory(tableEntity);
  },

  /* ======================================================== */
  /* NEW API INTEGRATION */
  /* ======================================================== */

  async compendiumToRollTableWithDialog(compendiumName = null, { weightPredicate = null } = {}) {
    if (!compendiumName) {
      Logger.warn(`compendiumToRollTableWithDialog | No reference to a compendiumName is been passed`, true);
      return;
    }
    return await CompendiumToRollTableHelpers.compendiumToRollTableWithDialog(compendiumName, { weightPredicate });
  },

  async compendiumToRollTableWithDialogSpecialCaseHarvester() {
    return await CompendiumToRollTableHelpers.compendiumToRollTableWithDialogSpecialCaseHarvester();
  },

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
    //   throw Logger.error("createRollTableFromCompendium | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw Logger.error("createRollTableFromCompendium | inAttributes must be of type object");
    }

    const compendiumName = inAttributes.compendiumName;
    const tableName = inAttributes.tableName ?? compendiumName + " RollTable";
    const weightPredicate = inAttributes.weightPredicate;
    if (!compendiumName) {
      Logger.warn(`createRollTableFromCompendium | No reference to a compendiumName is been passed`, true);
      return;
    }
    return await CompendiumToRollTableHelpers.compendiumToRollTable(compendiumName, tableName, { weightPredicate });
  },

  /**
   *
   * @param {String} compendium ID of the compendium to roll
   * @returns {Promise<{flavor: string; sound: string; user: object; content: object;} | undefined}
   */
  async rollCompendiumAsRollTable(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type object");
    }
    const compendium = inAttributes.compendium;
    const hideChatMessage = inAttributes.hideChatMessage;
    if (!compendium) {
      Logger.warn(`rollCompendiumAsRollTable | No reference to a compendium is been passed`, true);
      return;
    }
    const obj = await RollFromCompendiumAsRollTableHelpers.rollCompendiumAsRollTable(compendium, hideChatMessage);
    return obj;
  },

  async addRollTableItemsToActor(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type object");
    }
    const table = inAttributes.table;
    const actor = inAttributes.actor;
    const options = inAttributes.options;
    const actorWithItems = await RollTableToActorHelpers.addRollTableItemsToActor(table, actor, options);
    return actorWithItems ?? [];
  },

  async retrieveItemsDataFromRollTableResult(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type object");
    }
    const table = inAttributes.table;
    const options = inAttributes.options;
    const itemsDataToReturn = await RollTableToActorHelpers.retrieveItemsDataFromRollTableResult(table, options);
    return itemsDataToReturn ?? [];
  },

  async retrieveItemsDataFromRollTableResultSpecialHarvester(inAttributes) {
    // if (!Array.isArray(inAttributes)) {
    //   throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type array");
    // }
    // const [uuidOrItem] = inAttributes;
    if (typeof inAttributes !== "object") {
      throw Logger.error("rollCompendiumAsRollTable | inAttributes must be of type object");
    }
    const table = inAttributes.table;
    const options = inAttributes.options;
    const itemsDataToReturn = await RollTableToActorHelpers.retrieveItemsDataFromRollTableResultSpecialHarvester(
      table,
      options
    );
    return itemsDataToReturn ?? [];
  },

  // ===============================
  // SOCKET UTILITY
  // ================================

  /**
   *
   * @param {RollTable} tableEntity
   * @param {Object} options
   * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
   * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
   * @param {string|number} [options.rollsAmount=1]  The rolls amount value
   * @param {string|number} [options.dc=null]  The dc value
   * @param {string} [options.skill=null]  The skill denomination
   * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
   * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
   * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
   * @returns {Promise<TableResult[]>}
   */
  async invokeBetterTableRollArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw Logger.error("invokeBetterTableRollArr | inAttributes must be of type array");
    }
    const [tableReferenceUuid, options] = inAttributes;
    const tableEntity = await fromUuid(tableReferenceUuid);
    return await this.betterTables.betterTableRoll(tableEntity, options);
  },

  async invokeGenericChatCardCreateArr(...inAttributes) {
    if (!Array.isArray(inAttributes)) {
      throw Logger.error("invokeGenericTableRollArr | inAttributes must be of type array");
    }

    const [tableReferenceUuid, results, rollMode, roll] = inAttributes;
    const tableEntity = await fromUuid(tableReferenceUuid);

    const br = new BetterResults(results);
    const betterResults = await br.buildResults(tableEntity);

    if (tableEntity.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_BETTER) {
      const betterChatCard = new BetterChatCard(betterResults, rollMode, roll);
      await betterChatCard.createChatCard(tableEntity);
    } else if (tableEntity.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_LOOT) {
      const currencyData = br.getCurrencyData();
      const lootChatCard = new LootChatCard(betterResults, currencyData, rollMode, roll);
      await lootChatCard.createChatCard(tableEntity);
    } else if (
      tableEntity.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_STORY
    ) {
      const storyChatCard = new StoryChatCard(betterResults, rollMode, roll);
      await storyChatCard.createChatCard(tableEntity);
    } else if (
      tableEntity.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_HARVEST
    ) {
      const harvestChatCard = new HarvestChatCard(betterResults, rollMode, roll);
      await harvestChatCard.createChatCard(tableEntity);
    } else {
      await brtTable.createChatCard(results, rollMode, roll);
    }
  },
};

export default API;
