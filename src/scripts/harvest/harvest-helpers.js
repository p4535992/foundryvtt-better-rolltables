import { CONSTANTS } from "../constants/constants";
import { BRTBuilder } from "../core/brt-builder";
import { BRTBetterHelpers } from "../core/brt-helper";
import { BetterResults } from "../core/brt-table-results";
import { BRTCONFIG } from "../core/config";
import { HarvestChatCard } from "./harvest-chat-card";
import { HarvestCreator } from "./harvest-creator";

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
    const isTokenActor = options && options?.isTokenActor;
    const stackSame = options && options?.stackSame ? options.stackSame : true;
    const customRoll = options && options?.customRole ? options.customRole : undefined;
    const itemLimit = options && options?.itemLimit ? Number(options.itemLimit) : 0;

    if (null == token && canvas.tokens.controlled.length === 0) {
      return ui.notifications.error("Please select a token first");
    } else {
      tokenstack = token ? (token.length >= 0 ? token : [token]) : canvas.tokens.controlled;
    }

    ui.notifications.info(CONSTANTS.MODULE_ID + " | API | Harvest generation started.");

    let rollsAmount = options?.rollsAmount || (await BRTBetterHelpers.rollsAmount(tableEntity)) || undefined;
    let dc =
      options?.dc ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_DC_VALUE_KEY}`) ||
      undefined;
    let skill =
      options?.skill ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) ||
      undefined;

    const brtBuilder = new BRTBuilder(tableEntity);

    for (const token of tokenstack) {
      const resultsBrt = await brtBuilder.betterRoll({
        rollsAmount: customRoll ?? rollsAmount,
        dc: dc,
        skill: skill,
      });
      const results = resultsBrt?.results;
      const br = new BetterResults(results);
      const betterResults = await br.buildResults(tableEntity);
      const harvestCreator = new HarvestCreator(betterResults);

      await harvestCreator.addItemsToToken(token, stackSame, isTokenActor, itemLimit);
    }

    return ui.notifications.info(CONSTANTS.MODULE_ID + " | API | Harvest generation complete.");
  }

  /**
   *
   * @param {*} tableEntity
   */
  static async generateHarvest(tableEntity, options = {}) {
    let rollMode = options?.rollMode ?? null;
    if (String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${BRTCONFIG.HIDDEN_TABLE}`)) === "true") {
      rollMode = "gmroll";
    }

    let rollsAmount = options?.rollsAmount || (await BRTBetterHelpers.rollsAmount(tableEntity)) || undefined;
    let dc =
      options?.dc ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_DC_VALUE_KEY}`) ||
      undefined;
    let skill =
      options?.skill ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) ||
      undefined;

    const builder = new BRTBuilder(tableEntity);
    const resultsBrt = await builder.betterRoll({
      rollsAmount: rollsAmount,
      dc: dc,
      skill: skill,
    });
    const results = resultsBrt?.results;
    const br = new BetterResults(results);
    const betterResults = await br.buildResults(tableEntity);
    const harvestCreator = new HarvestCreator(betterResults);

    await harvestCreator.createActor(tableEntity);
    await harvestCreator.addItemsToActor();

    if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE)) {
      const harvestChatCard = new HarvestChatCard(betterResults, rollMode);
      await harvestChatCard.createChatCard(tableEntity);
    }
  }

  static async generateChatHarvest(tableEntity, options = {}) {
    let rollMode = options?.rollMode ?? null;
    if (String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${BRTCONFIG.HIDDEN_TABLE}`)) === "true") {
      rollMode = "gmroll";
    }

    let rollsAmount = options?.rollsAmount || (await BRTBetterHelpers.rollsAmount(tableEntity)) || undefined;
    let dc =
      options?.dc ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_DC_VALUE_KEY}`) ||
      undefined;
    let skill =
      options?.skill ||
      getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) ||
      undefined;

    const brtBuilder = new BRTBuilder(tableEntity);
    const resultsBrt = await brtBuilder.betterRoll({
      rollsAmount: rollsAmount,
      dc: dc,
      skill: skill,
    });
    const results = resultsBrt?.results;
    const br = new BetterResults(results);
    const betterResults = await br.buildResults(tableEntity);
    const harvestChatCard = new HarvestChatCard(betterResults, rollMode);

    await harvestChatCard.createChatCard(tableEntity);
  }
}
