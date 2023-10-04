import { RollTableToActorHelpers } from "../apps/rolltable-to-actor/rolltable-to-actor-helpers";
import { CONSTANTS } from "../constants/constants";
import { BRTBuilder } from "../core/brt-builder";
import { BRTBetterHelpers } from "../better/brt-helper";
import { BetterResults } from "../core/brt-table-results";
import { BRTCONFIG } from "../core/config";
import { HarvestChatCard } from "./harvest-chat-card";
import { isRealNumber } from "../lib";
import { BRTUtils } from "../core/utils";

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
      return ui.notifications.error("Please select a token first");
    } else {
      tokenstack = token ? (token.length >= 0 ? token : [token]) : canvas.tokens.controlled;
    }

    ui.notifications.info(CONSTANTS.MODULE_ID + " | API | Harvest generation started.");

    options = BRTUtils.updateOptions(tableEntity, options);

    const isTokenActor = options?.isTokenActor;
    const stackSame = options?.stackSame;
    const customRoll = options?.customRoll;
    const itemLimit = options?.itemLimit;

    const rollsAmount = options?.rollsAmount;
    const dc = options?.dc;
    const skill = options?.skill;

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
      await RollTableToActorHelpers.addItemsToTokenOld(token, betterResults, stackSame, isTokenActor, itemLimit);
    }

    return ui.notifications.info(CONSTANTS.MODULE_ID + " | API | Harvest generation complete.");
  }

  /**
   *
   * @param {*} tableEntity
   */
  static async generateHarvest(tableEntity, options = {}) {
    options = BRTUtils.updateOptions(tableEntity, options);

    const rollMode = options?.rollMode;
    const stackSame = options?.stackSame;
    const customRoll = options?.customRole;
    const itemLimit = options?.itemLimit;

    const rollsAmount = options?.rollsAmount;
    const dc = options?.dc;
    const skill = options?.skill;

    const builder = new BRTBuilder(tableEntity);
    const resultsBrt = await builder.betterRoll({
      rollsAmount: customRoll ?? rollsAmount,
      dc: dc,
      skill: skill,
    });
    const results = resultsBrt?.results;
    const br = new BetterResults(results);
    const betterResults = await br.buildResults(tableEntity);
    const actor = await BRTHarvestHelpers.createActor(tableEntity);
    await RollTableToActorHelpers.addItemsToActorOld(actor, betterResults, stackSame, itemLimit);

    if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE)) {
      const harvestChatCard = new HarvestChatCard(betterResults, rollMode);
      await harvestChatCard.createChatCard(tableEntity);
    }
  }

  static async generateChatHarvest(tableEntity, options = {}) {
    options = BRTUtils.updateOptions(tableEntity, options);

    const rollMode = options?.rollMode;
    const rollsAmount = options?.rollsAmount;
    const dc = options?.dc;
    const skill = options?.skill;

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

  static async createActor(table, overrideName = undefined) {
    const actorName = overrideName || table.getFlag(CONSTANTS.MODULE_ID, BRTCONFIG.HARVEST_ACTOR_NAME_KEY);
    this.actor = game.actors.getName(actorName);
    if (!this.actor) {
      this.actor = await Actor.create({
        name: actorName || "New Harvest",
        type: game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.DEFAULT_ACTOR_NPC_TYPE),
        img: `modules/${CONSTANTS.MODULE_ID}/assets/artwork/chest.webp`,
        sort: 12000,
        token: { actorLink: true },
      });
    }
  }
}
