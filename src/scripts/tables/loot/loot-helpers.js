import { RollTableToActorHelpers } from "../../apps/rolltable-to-actor/rolltable-to-actor-helpers";
import { CONSTANTS } from "../../constants/constants";
import { BRTBetterHelpers } from "../better/brt-helper";
import { BetterResults } from "../../core/brt-table-results";
import { LootChatCard } from "./loot-chat-card";
import { BRTUtils } from "../../core/utils";
import { BetterRollTable } from "../../core/brt-table";
import SETTINGS from "../../constants/settings";
import Logger from "../../lib/Logger";
import ItemPilesHelpers from "../../lib/item-piles-helpers";
import { isRealBoolean } from "../../lib/lib";

export class BRTLootHelpers {
    /**
     * Roll a table an add the resulting loot to a given token.
     *
     * @param {RollTable} tableEntity
     * @param {TokenDocument} token
     * @param {options} object
     * @returns
     */
    static async addLootToSelectedToken(tableEntity, token = null, options = {}) {
        let tokenstack = [];
        if (null == token && canvas.tokens.controlled.length === 0) {
            return Logger.error("Please select a token first", true);
        } else {
            tokenstack = token ? (token.constructor === Array ? token : [token]) : canvas.tokens.controlled;
        }
        Logger.info("Loot generation started.", true);

        const brtTable = new BetterRollTable(tableEntity, options);
        await brtTable.initialize();

        const resultsBrt = await brtTable.betterRoll();

        const rollMode = brtTable.rollMode;
        const roll = brtTable.mainRoll;
        const results = resultsBrt?.results;

        const br = new BetterResults(tableEntity, results, options?.stackResultsWithBRTLogic);
        const betterResults = await br.buildResults();
        const currencyData = br.getCurrencyData();

        for (const token of tokenstack) {
            Logger.info(`Loot generation started on token '${token.name}'`, true);
            /*
            await ItemPilesHelpers.populateActorOrTokenViaTable(token, tableEntity, options);

            const currencyString = tableEntity.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.LOOT_CURRENCY_STRING_KEY);
            const currencyDataForItemPiles = ItemPilesHelpers.generateCurrenciesStringFromString(currencyString);
            await ItemPilesHelpers.addCurrencies(token, currencyDataForItemPiles);
            */
            const currencyDataForItemPiles = ItemPilesHelpers.generateCurrenciesStringFromString(currencyData);

            await ItemPilesHelpers.addCurrencies(token, currencyDataForItemPiles);
            await ItemPilesHelpers.populateActorOrTokenViaTableResults(token, results);

            Logger.info(`Loot generation ended on token '${token.name}'`, true);

            if (isRealBoolean(options.displayChat)) {
                if (!options.displayChat) {
                    continue;
                }
            }

            const lootChatCard = new LootChatCard(betterResults, currencyData, rollMode, roll);
            await lootChatCard.createChatCard(tableEntity);
        }
        Logger.info("Loot generation complete.", true);
        return;
    }

    /**
     *
     * @param {*} tableEntity
     */
    static async generateLoot(tableEntity, options = {}) {
        const brtTable = new BetterRollTable(tableEntity, options);
        await brtTable.initialize();

        const resultsBrt = await brtTable.betterRoll();

        const rollMode = brtTable.rollMode;
        const roll = brtTable.mainRoll;
        const results = resultsBrt?.results;

        const br = new BetterResults(tableEntity, results, options?.stackResultsWithBRTLogic);
        const betterResults = await br.buildResults();
        const currencyData = br.getCurrencyData();
        /*
    const isTokenActor = brtTable.options?.isTokenActor;
    const stackSame = brtTable.options?.stackSame;
    const itemLimit = brtTable.options?.itemLimit;
    const actor = await BRTLootHelpers.createActor(tableEntity);
    await BRTLootHelpers.addCurrenciesToActor(actor, currencyData);
    await RollTableToActorHelpers.addItemsToActorOld(actor, betterResults, stackSame, itemLimit);
    */
        const actor = await BRTLootHelpers.createActor(tableEntity);
        // const currencyString = tableEntity.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.LOOT_CURRENCY_STRING_KEY);
        const currencyDataForItemPiles = ItemPilesHelpers.generateCurrenciesStringFromString(currencyData);

        await ItemPilesHelpers.addCurrencies(actor, currencyDataForItemPiles);
        await ItemPilesHelpers.populateActorOrTokenViaTableResults(actor, results);

        // if (game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE)) {
        if (isRealBoolean(options.displayChat)) {
            if (!options.displayChat) {
                return;
            }
        }

        const lootChatCard = new LootChatCard(betterResults, currencyData, rollMode, roll);
        await lootChatCard.createChatCard(tableEntity);
        // }
    }

    static async generateChatLoot(tableEntity, options = {}) {
        const brtTable = new BetterRollTable(tableEntity, options);
        await brtTable.initialize();
        const resultsBrt = await brtTable.betterRoll();

        const rollMode = brtTable.rollMode;
        const roll = brtTable.mainRoll;
        const results = resultsBrt?.results;

        const br = new BetterResults(tableEntity, results, options?.stackResultsWithBRTLogic);
        const betterResults = await br.buildResults();
        const currencyData = br.getCurrencyData();

        const lootChatCard = new LootChatCard(betterResults, currencyData, rollMode, roll);

        await lootChatCard.createChatCard(tableEntity);
    }

    // /**
    //  * @deprecated to remove we use item piles now
    //  * @param {*} actor
    //  * @param {*} lootCurrency
    //  */
    // static async addCurrenciesToActor(actor, lootCurrency) {
    //   const currencyData = duplicate(actor.system.currency);
    //   // const lootCurrency = this.currencyData;

    //   for (const key in lootCurrency) {
    //     if (Object.getOwnPropertyDescriptor(currencyData, key)) {
    //       const amount = Number(currencyData[key].value || 0) + Number(lootCurrency[key]);
    //       currencyData[key] = amount.toString();
    //     }
    //   }
    //   await actor.update({ "system.currency": currencyData });
    // }

    // /**
    //  * @deprecated not used anymore
    //  * @param {Token|Actor} token
    //  * @param {Object} currencyData
    //  * @param {Boolean} is the token passed as the token actor instead?
    //  */
    // static async addCurrenciesToToken(token, lootCurrency, isTokenActor = false) {
    //   // needed for base key set in the event that a token has no currency properties
    //   const currencyDataInitial = { cp: 0, ep: 0, gp: 0, pp: 0, sp: 0 };
    //   let currencyData = currencyDataInitial;

    //   if (isTokenActor) {
    //     currencyData = duplicate(token.system.currency);
    //   } else if (token.actor.system.currency) {
    //     currencyData = duplicate(token.actor.system.currency);
    //   }

    //   // const lootCurrency = currencyData;

    //   for (const key in currencyDataInitial) {
    //     const amount = Number(currencyData[key] || 0) + Number(lootCurrency[key] || 0);
    //     currencyData[key] = amount;
    //   }

    //   if (isTokenActor) {
    //     // @type {Actor}
    //     return await token.update({ "system.currency": currencyData });
    //   } else {
    //     return await token.actor.update({ "system.currency": currencyData });
    //   }
    // }

    static async createActor(table, overrideName = undefined) {
        const actorName = overrideName || table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.LOOT_ACTOR_NAME_KEY);
        let actor = game.actors.getName(actorName);
        if (!actor) {
            actor = await Actor.create({
                name: actorName || "New Loot",
                type: game.itempiles.API.ACTOR_CLASS_TYPE, // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.DEFAULT_ACTOR_NPC_TYPE),
                img: `modules/${CONSTANTS.MODULE_ID}/assets/artwork/chest.webp`,
                sort: 12000,
                token: { actorLink: true },
            });
        }

        // const lootSheet = game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.LOOT_SHEET_TO_USE_KEY);
        // if (lootSheet in CONFIG.Actor.sheetClasses.npc) {
        //   await actor.setFlag("core", "sheetClass", lootSheet);
        // }
        return actor;
    }

    // /**
    //  *
    //  * @param {TableResult} result
    //  * @returns {Array<{value:number,denom:string}>} currency extracted to insert on the actor
    //  */
    // static async retrieveLootFromTextLootRoll(result) {
    //   var rollMap = formatLootRoll(result.text);

    //   let currencyDataCalculate = [];
    //   for (let [key, value] of rollMap) {
    //     // var roll = new Roll(value);
    //     // var rollResult = roll.roll({async: false});
    //     var rollResult = await BRTBetterHelpers.tryRoll(value);
    //     currencyDataCalculate.push({
    //       value: rollResult,
    //       denom: key
    //     })
    //   }
    //   return currencyDataCalculate;
    // }

    // static formatLootRoll(resultText)
    // {
    //   let rollTableResult = resultText.replace(/(\[\[\/r\s)?(\]\])?(\}$)?/g,"").split("}");
    //   let returnMap = new Map();

    //   for(let i = 0; i < rollTableResult.length; i++)
    //   {
    //     let extractedRoll = rollTableResult[i].split("{");
    //     returnMap.set(extractedRoll[1], extractedRoll[0]);
    //   }
    //   return returnMap;
    // }
}
