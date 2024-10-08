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
import { isRealBoolean, parseAsArray } from "./lib/lib.js";
import { BetterRollTable } from "./core/brt-table.js";
import Logger from "./lib/Logger.js";
import ItemPilesHelpers from "./lib/item-piles-helpers.js";
import { RetrieveHelpers } from "./lib/retrieve-helpers.js";
import { BRTUtils } from "./core/utils.js";
import BRTActorList from "./apps/actor-list/brt-actor-list.js";

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
     * @param {RollTable|string|UUID} tableEntity rolltable to generate content from
     * @returns {Promise<{flavor: *, sound: string, user: *, content: *}>}
     */
    async roll(tableEntity, options = {}) {
        if (!tableEntity) {
            Logger.warn(`roll | No reference to a rollTable is been passed`, true);
            return;
        }
        const table = await RetrieveHelpers.getRollTableAsync(tableEntity);
        const brtTable = new BetterRollTable(table, options);
        await brtTable.initialize();
        const resultBrt = await brtTable.betterRoll();

        const results = resultBrt?.results;

        let rollMode = options?.rollMode || brtTable.rollMode || null;
        let roll = options?.roll || brtTable.mainRoll || null;

        const br = new BetterResults(table, results, options?.stackResultsWithBRTLogic);
        const betterResults = await br.buildResults();

        const data = {};
        foundry.utils.setProperty(data, `itemsData`, betterResults);
        return data;
    },

    /**
     *
     * @param {RollTable|string|UUID} tableEntity
     * @param {Object} options
     * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
     * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
     * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
     * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
     * @param {string|number} [options.rollsAmount=1]  The rolls amount value
     * @param {string|number} [options.dc=null]  The dc value
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
     * @returns {Promise<TableResult[]>}
     */
    async betterTableRoll(tableEntity, options = {}) {
        if (!tableEntity) {
            Logger.warn(`betterTableRoll | No reference to a rollTable is been passed`, true);
            return;
        }
        const table = await RetrieveHelpers.getRollTableAsync(tableEntity);
        return await this.betterTables.betterTableRoll(table, options);
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

    /**
     *
     * @param {RollTable|string|UUID} tableEntity
     * @param {Object} options
     * @param {Roll|string} [options.roll] An optional pre-configured Roll instance which defines the dice roll to use
     * @param {boolean} [options.recursive=true] Allow drawing recursively from inner RollTable results
     * @param {boolean} [options.displayChat=true] Whether to automatically display the results in chat
     * @param {('blindroll'|'gmroll'|'selfroll')} [options.rollMode=null] The chat roll mode to use when displaying the result
     * @param {string|number} [options.rollsAmount=1]  The rolls amount value
     * @param {string|number} [options.dc=null]  The dc value
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
     * @returns {Promise<{results:TableResult[],currenciesData:Record<string,number>}>}
     */
    async betterTableRollV2(tableEntity, options = {}) {
        if (!tableEntity) {
            Logger.warn(`betterTableRollV2 | No reference to a rollTable is been passed`, true);
            return;
        }
        const table = await RetrieveHelpers.getRollTableAsync(tableEntity);
        return await this.betterTables.betterTableRollV2(table, options);
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
        { weightPredicate = null } = {},
    ) {
        if (!compendiumName) {
            Logger.warn(`createRolltableFromCompendium | No reference to a compendiumName is been passed`, true);
            return;
        }
        return await CompendiumToRollTableHelpers.compendiumToRollTable(
            compendiumName,
            tableName ?? compendiumName + " RollTable",
            { weightPredicate },
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
        { weightPredicate = null } = {},
    ) {
        if (!compendiumName) {
            Logger.warn(`createTableFromCompendium | No reference to a compendiumName is been passed`, true);
            return;
        }
        return await CompendiumToRollTableHelpers.compendiumToRollTable(
            compendiumName,
            tableName ?? compendiumName + " RollTable",
            { weightPredicate },
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
     * @returns {Promise<void>}
     */
    async generateChatHarvest(tableEntity, options = {}) {
        if (!tableEntity) {
            Logger.warn(`generateChatHarvest | No reference to a RollTable is been passed`, true);
            return;
        }
        return await BRTHarvestHelpers.generateChatHarvest(tableEntity, options);
    },

    /**
     * Utility method to retrieve the minimal dc value present on the table
     * @module game.modules.get('better-rolltables').api.retrieveMinDCOnTable(table);
     * @param {RollTable|string|UUID} tableEntity
     * @returns {Promise<number>} The minimal dc founded or 0 otherwise
     */
    async retrieveMinDCOnTable(tableEntity) {
        if (!tableEntity) {
            Logger.warn(`retrieveMinDCOnTable | No reference to a RollTable is been passed`, true);
            return;
        }
        const minDC = await BRTHarvestHelpers.retrieveMinDCOnTable(tableEntity);
        return minDC;
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

    /**
     *
     * @param {Object} inAttributes
     * @returns {Promise<ItemData[]>} Item Data Array.  An array of objects, each containing the item that was added or updated, and the quantity that was added
     */
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
            options,
        );
        return itemsDataToReturn ?? [];
    },

    /**
     * Converts the provided token to a item piles lootable sheet check out the documentation from the itempiles page
     * @href https://fantasycomputer.works/FoundryVTT-ItemPiles/#/api?id=turntokensintoitempiles
     * @href https://github.com/trioderegion/fvtt-macros/blob/master/honeybadger-macros/tokens/single-loot-pile.js#L77
     * @param {Array<Token|TokenDocument} actorOrTokenTarget
     * @param {object} options	object	Options to pass to the function
     * @param {boolean} options.applyDefaultImage little utility for lazy people apply a default image
     * @param {boolean} options.applyDefaultLight little utility for lazy people apply a default light
     * @param {boolean} options.isSinglePile little utility it need 'warpgate' module installed and active for merge all the token items in one big item piles
     * @param {boolean} options.deleteTokens only if singlePile is true it will delete all tokens
     * @param {object} tokenSettings Overriding settings that will update the tokens settings
     * @param {object} pileSettings Overriding settings to be put on the item piles’ settings - see pile flag defaults
     * @returns {Promise<Array>} The uuids of the targets after they were turned into item piles
     */
    async convertTokensToItemPiles(
        tokens,
        options = {
            applyDefaultLight: true,
            untouchedImage: "",
            isSinglePile: false,
            deleteTokens: false,
            addCurrency: false,
        },
        tokenSettings = { rotation: 0 },
        pileSettings = {
            openedImage: "",
            emptyImage: "",
            type: game.itempiles.pile_types.CONTAINER,
            deleteWhenEmpty: false,
            activePlayers: true,
            closed: true,
        },
    ) {
        let tokensTmp = tokens || [];
        if (tokensTmp?.length <= 0) {
            tokensTmp = canvas.tokens.controlled;
        }
        if (tokensTmp?.length > 0) {
            return await ItemPilesHelpers.convertTokensToItemPiles(tokensTmp, options, tokenSettings, pileSettings);
        } else {
            Logger.warn(`No tokens are selected`, true);
        }
    },

    /**
     * Converts the provided token to a item piles lootable sheet check out the documentation from the itempiles page
     * @href https://fantasycomputer.works/FoundryVTT-ItemPiles/#/api?id=turntokensintoitempiles
     * @href https://github.com/trioderegion/fvtt-macros/blob/master/honeybadger-macros/tokens/single-loot-pile.js#L77
     * @param {Array<Token|TokenDocument} actorOrTokenTarget
     * @param {boolean} deleteTokens only if singlePile is true it will delete all tokens
     * @returns {Promise<Array>} The uuids of the targets after they were turned into item piles
     */
    async convertTokensToSingleItemPile(tokens, deleteTokens = false) {
        let tokensTmp = tokens || [];
        if (tokensTmp?.length <= 0) {
            tokensTmp = canvas.tokens.controlled;
        }
        if (tokensTmp?.length > 0) {
            const options = {
                applyDefaultLight: true,
                untouchedImage: "",
                isSinglePile: true,
                deleteTokens: deleteTokens,
                addCurrency: false,
            };
            return await ItemPilesHelpers.convertTokensToItemPiles(tokensTmp, options);
        } else {
            Logger.warn(`No tokens are selected`, true);
        }
    },

    /**
     * Rolls on a table of items and collates them to be able to be added to actors and such
     * @href https://fantasycomputer.works/FoundryVTT-ItemPiles/#/sample-macros?id=populate-loot-via-table
     * @param {string/Actor/Token}                                  The name, ID, UUID, or the actor itself, or an array of such
     * @param {string/RollTable} tableReference                     The name, ID, UUID, or the table itself, or an array of such
     * @param {object} options                                      Options to pass to the function
     * @param {string/number} [options.timesToRoll="1"]             The number of times to roll on the tables, which can be a roll formula
     * @param {boolean} [options.resetTable=true]                   Whether to reset the table before rolling it
     * @param {boolean} [options.normalizeTable=false]               Whether to normalize the table before rolling it
     * @param {boolean} [options.displayChat=false]                 Whether to display the rolls to the chat
     * @param {object} [options.rollData={}]                        Data to inject into the roll formula
     * @param {Actor/string/boolean} [options.targetActor=false]    The target actor to add the items to, or the UUID of an actor
     * @param {boolean} [options.removeExistingActorItems=false]    Whether to clear the target actor's items before adding the ones rolled
     * @param {boolean/string} [options.customCategory=false]       Whether to apply a custom category to the items rolled
     *
     * @returns {Promise<Array<Item>>}                              An array of object containing the item data and their quantity
     */
    async rollItemTable(targetActor, tableReference, options = {}) {
        return await ItemPilesHelpers.rollItemTable(targetActor, tableReference, options);
    },

    /**
     * Covert a Table Result Data to Item Data
     * NOTE: text,actor and scene are treated in different ways...)
     * @param {TableResult} tableResult Table result data to convert
     * @return {Promise<{ItemData}>} item data retrieve fro the current Table result Data
     */
    async resultToItemData(tableResult) {
        return await RollTableToActorHelpers.resultToItemData(tableResult);
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
     * @param {string} [options.skill=null]  The skill denomination. If there is a "," in the skill string. , it will be treated as an array of skills for example "nat,arc" implies that the roll result will be compared as both a nat (nat) and arcane (arc) roll
     * @param {boolean} [options.distinct=false] if checked the same result is not selected more than once indifferently from the number of 'Amount Roll'
     * @param {boolean} [options.distinctKeepRolling=false] if 'Distinct result' is checked and 'Amount Rolls' > of the numbers of the result, keep rolling as a normal 'Roll +' behavior
     * @param {boolean} [options.usePercentage=false] Use the % mechanism instead of the default formula+range behavior
     * @param {boolean} [options.stackResultsWithBRTLogic=false] if enabled the table results are stacked with the BRT logic like the module item-piles a new 'quantity' property is been added to the table result data to check how much the single result is been stacked
     * @param {('none'|'better'|'loot'|'harvest'|'story')} [options.rollAsTableType=null] Roll the rolltable as a specific BRT Roll Table type. Very useful for not duplicate the same rolltable for different usage. If not set the current BRT Roll Table types is used as usual.
     * @param {boolean} [options.rollAsTableTypeAllTheTables] This setting make sense only when you use the parameter 'rollAsTableType'. If true it will treat all the inner tables (or child tables if you prefer) with the same type used on 'rollAsTableType'. Bu default is false.
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

        const [tableReferenceUuid, results, rollMode, roll, stackResultsWithBRTLogic, rollAsTableType] = inAttributes;
        const tableEntity = await fromUuid(tableReferenceUuid);

        const br = new BetterResults(tableEntity, results, stackResultsWithBRTLogic, rollAsTableType); // NOTE: Stack is always false here
        const betterResults = await br.buildResults();

        const brtTypeToCheck = BRTUtils.retrieveBRTType(tableEntity, options?.rollAsTableType);

        if (brtTypeToCheck === CONSTANTS.TABLE_TYPE_BETTER) {
            const betterChatCard = new BetterChatCard(betterResults, rollMode, roll);
            await betterChatCard.createChatCard(tableEntity);
        } else if (brtTypeToCheck === CONSTANTS.TABLE_TYPE_LOOT) {
            const currencyData = br.getCurrencyData();
            const lootChatCard = new LootChatCard(betterResults, currencyData, rollMode, roll);
            await lootChatCard.createChatCard(tableEntity);
        } else if (brtTypeToCheck === CONSTANTS.TABLE_TYPE_STORY) {
            const storyChatCard = new StoryChatCard(betterResults, rollMode, roll);
            await storyChatCard.createChatCard(tableEntity);
        } else if (brtTypeToCheck === CONSTANTS.TABLE_TYPE_HARVEST) {
            const harvestChatCard = new HarvestChatCard(betterResults, rollMode, roll);
            await harvestChatCard.createChatCard(tableEntity);
        } else {
            await brtTable.createChatCard(results, rollMode, roll);
        }
    },

    // ===================================================
    // ACTOR LIST API
    // =====================================================

    /**
     * Method to add some rolltables to the actor list
     * @param {Actor|UUID|string} actor
     * @param {UUID|string} data Can be a RollTable a Folder aCompendiumCollection reference
     * @param {Object} [options={}]
     * @returns {Promise<RollTable[]>}
     */
    async addRollTablesToActorList(actor, data, options = {}) {
        const actorTmp = await RetrieveHelpers.getActorAsync(actor);
        // if (typeof data !== "string") {
        //     throw Logger.error("addRollTablesToActorList | data must be of type string");
        // }
        // const dataTmp = await fromUuid(data);
        return await BRTActorList.addRollTablesToActorList(actorTmp, dataTmp, options);
    },

    /**
     * Method to add some rolltables to the actor list
     * @param {Actor|UUID|string} actor
     * @param {Object} [options={}]
     * @param {('none'|'better'|'loot'|'harvest'|'story')[]} [options.brtTypes=null]
     * @returns {Promise<{rollTableList:{rollTable:RollTable;options:{rollsAmount:string;rollAsTableType:string;}}[];currencies:string}>}
     */
    async retrieveActorList(actor, options) {
        const brtTypes = parseAsArray(options.brtTypes);
        const actorTmp = await RetrieveHelpers.getActorAsync(actor);
        return await BRTActorList.retrieveActorList(actorTmp, brtTypes);
    },

    /**
     *
     * @param {Actor|UUID|string} actor
     * @param {Object} [options={}]
     * @param {('none'|'better'|'loot'|'harvest'|'story')[]} [options.brtTypes=null]
     * @returns {Promise<ItemData[]>} Item Data Array.  An array of objects, each containing the item that was added or updated, and the quantity that was added
     */
    async retrieveItemsDataFromRollTableResultActorList(actor, options) {
        const brtTypes = parseAsArray(options.brtTypes);
        const actorTmp = await RetrieveHelpers.getActorAsync(actor);
        const brtActorList = await this.retrieveActorList(actorTmp, {
            brtTypes: brtTypes,
        });
        const rolltableList = brtActorList.rollTableList;

        const itemsDataToReturnTotal = [];

        for (const rollTableElement of rolltableList) {
            const table = rollTableElement.rollTable;
            const options = rollTableElement.options;
            const itemsDataToReturn = await this.retrieveItemsDataFromRollTableResult({
                table: table,
                options: options,
            });
            itemsDataToReturnTotal.push(itemsDataToReturn ?? []);
        }
        return itemsDataToReturnTotal;
    },
};

export default API;
