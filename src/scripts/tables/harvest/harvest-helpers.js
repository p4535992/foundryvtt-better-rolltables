import { RollTableToActorHelpers } from "../../apps/rolltable-to-actor/rolltable-to-actor-helpers";
import { CONSTANTS } from "../../constants/constants";
import { BRTBetterHelpers } from "../better/brt-helper";
import { BetterResults } from "../../core/brt-table-results";
import { HarvestChatCard } from "./harvest-chat-card";
import { BRTUtils } from "../../core/utils";
import { BetterRollTable } from "../../core/brt-table";
import SETTINGS from "../../constants/settings";
import Logger from "../../lib/Logger";
import ItemPilesHelpers from "../../lib/item-piles-helpers";
import { isRealBoolean, isRealNumber, parseAsArray } from "../../lib/lib";

export class BRTHarvestHelpers {
    /**
     * Roll a table an add the resulting harvest to a given token.
     *
     * @param {RollTable} tableEntity
     * @param {TokenDocument} token
     * @param {options} object
     * @returns
     */
    static async addHarvestToSelectedToken(tableEntity, token = null, options = {}) {
        let tokenstack = [];
        if (null == token && canvas.tokens.controlled.length === 0) {
            return Logger.error("Please select a token first");
        } else {
            tokenstack = token ? (token.constructor === Array ? token : [token]) : canvas.tokens.controlled;
        }
        Logger.info("Harvest generation started.");

        const brtTable = new BetterRollTable(tableEntity, options);
        await brtTable.initialize();

        const resultsBrt = await brtTable.betterRoll();
        const rollMode = brtTable.rollMode;
        const roll = brtTable.mainRoll;

        const results = resultsBrt?.results;
        const br = new BetterResults(tableEntity, results, options?.stackResultsWithBRTLogic);
        const betterResults = await br.buildResults();

        for (const token of tokenstack) {
            Logger.info(`Harvest generation started on token '${token.name}'`, true);
            /*
            await ItemPilesHelpers.populateActorOrTokenViaTable(token, tableEntity, options);

            const currencyString = tableEntity.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.LOOT_CURRENCY_STRING_KEY);
            const currencyData = ItemPilesHelpers.generateCurrenciesStringFromString(currencyString);
            await ItemPilesHelpers.addCurrencies(token, currencyData);
            */
            await ItemPilesHelpers.populateActorOrTokenViaTableResults(token, results);

            Logger.info(`Harvest generation ended on token '${token.name}'`, true);

            if (isRealBoolean(options.displayChat)) {
                if (!options.displayChat) {
                    continue;
                }
            }

            const harvestChatCard = new HarvestChatCard(betterResults, rollMode, roll);
            await harvestChatCard.createChatCard(tableEntity);
        }
        Logger.info("Harvest generation complete.");
        return;
    }

    /**
     *
     * @param {*} tableEntity
     */
    static async generateHarvest(tableEntity, options = {}) {
        const brtTable = new BetterRollTable(tableEntity, options);
        await brtTable.initialize();

        const resultsBrt = await brtTable.betterRoll();

        const isTokenActor = brtTable.options?.isTokenActor;
        const stackSame = brtTable.options?.stackSame;
        const itemLimit = brtTable.options?.itemLimit;

        const rollMode = brtTable.rollMode;
        const roll = brtTable.mainRoll;

        const results = resultsBrt?.results;
        const br = new BetterResults(tableEntity, results, options?.stackResultsWithBRTLogic);
        const betterResults = await br.buildResults();

        const actor = await BRTHarvestHelpers.createActor(tableEntity);
        // await RollTableToActorHelpers.addItemsToActorOld(actor, betterResults, stackSame, itemLimit);
        await ItemPilesHelpers.populateActorOrTokenViaTableResults(actor, results);

        // if (game.settings.get(CONSTANTS.MODULE_ID, CONSTANTS.ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE)) {
        if (isRealBoolean(options.displayChat)) {
            if (!options.displayChat) {
                return;
            }
        }

        const harvestChatCard = new HarvestChatCard(betterResults, rollMode, roll);
        await harvestChatCard.createChatCard(tableEntity);
        // }
    }

    static async generateChatHarvest(tableEntity, options = {}) {
        const brtTable = new BetterRollTable(tableEntity, options);
        await brtTable.initialize();
        const resultsBrt = await brtTable.betterRoll();

        const rollMode = brtTable.rollMode;
        const roll = brtTable.mainRoll;
        const results = resultsBrt?.results;

        const br = new BetterResults(tableEntity, results, options?.stackResultsWithBRTLogic);
        const betterResults = await br.buildResults();

        const harvestChatCard = new HarvestChatCard(betterResults, rollMode, roll);

        await harvestChatCard.createChatCard(tableEntity);
    }

    static async createActor(table, overrideName = undefined) {
        const actorName = overrideName || table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.HARVEST_ACTOR_NAME_KEY);
        let actor = game.actors.getName(actorName);
        if (!actor) {
            actor = await Actor.create({
                name: actorName || "New Harvest",
                type: game.itempiles.API.ACTOR_CLASS_TYPE, // game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.DEFAULT_ACTOR_NPC_TYPE),
                img: `modules/${CONSTANTS.MODULE_ID}/assets/artwork/chest.webp`,
                sort: 12000,
                token: { actorLink: true },
            });
        }

        return actor;
    }

    /**
     *
     * @param {string} dynamicDcValue
     * @param {number} dc
     * @param {string} skill
     * @returns {boolean}
     */
    static calculateDynamicDcSync(dynamicDcValue, dc, skill) {
        if (!isRealNumber(dc) || parseInt(dc) <= 0) {
            return false;
        }
        if (!skill) {
            return false;
        }
        const mapDynamicDc = BRTHarvestHelpers.prepareMapDynamicDcSync(dynamicDcValue);
        if (!mapDynamicDc.has(skill.trim())) {
            return false;
        }
        if (mapDynamicDc.get(skill.trim()) <= parseInt(dc)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @param {string} dynamicDcValue
     * @returns {Map<string,string>}
     */
    static prepareMapDynamicDcSync(dynamicDcValue) {
        const dynamicDcValues = parseAsArray(dynamicDcValue);
        const mapDynamicDc = new Map();
        for (const entry of dynamicDcValues) {
            if (!entry || !entry.includes("=")) {
                continue;
            }
            const ss = entry.split("=");
            const skillEntry = ss[0].trim();
            const dcEntry = ss[1].trim();
            mapDynamicDc.set(skillEntry, BRTBetterHelpers.tryRollSync(dcEntry));
        }
        return mapDynamicDc;
    }

    /**
     *
     * @param {string} dynamicDcValue
     * @returns {string}
     */
    static prepareValueDynamicDcSync(dynamicDcValue) {
        const mapDynamicDc = BRTHarvestHelpers.prepareMapDynamicDcSync(dynamicDcValue);
        let asStrings = [];
        for (let [key, value] of mapDynamicDc.entries()) {
            asStrings.push(`${key}=${value}`);
        }
        return asStrings.join(",").trim();
    }
}
