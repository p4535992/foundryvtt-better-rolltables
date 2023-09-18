import { BRTCONFIG } from "../core/config.js";
import { CONSTANTS } from "../constants/constants.js";
import { RollTableToActorHelpers } from "../apps/rolltable-to-actor/rolltable-to-actor-helpers.js";
import { BRTLootHelpers } from "./loot-helpers.js";
import SETTINGS from "../constants/settings.js";

export class LootCreator {
  /**
   * Will create an actor carring items based on the content of the object lootData
   * @param {object} betterResults check BetterResults
   * @param currencyData
   */
  constructor(betterResults, currencyData) {
    this.betterResults = betterResults;
    this.currencyData = currencyData;
  }

  async createActor(table, overrideName = undefined) {
    const actorName = overrideName || table.getFlag(CONSTANTS.MODULE_ID, BRTCONFIG.LOOT_ACTOR_NAME_KEY);
    this.actor = game.actors.getName(actorName);
    if (!this.actor) {
      this.actor = await Actor.create({
        name: actorName || "New Loot",
        type: game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.DEFAULT_ACTOR_NPC_TYPE),
        img: `modules/${CONSTANTS.MODULE_ID}/assets/artwork/chest.webp`,
        sort: 12000,
        token: { actorLink: true },
      });
    }

    // const lootSheet = game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.LOOT_SHEET_TO_USE_KEY);
    // if (lootSheet in CONFIG.Actor.sheetClasses.npc) {
    //   await this.actor.setFlag("core", "sheetClass", lootSheet);
    // }
  }

  async addCurrenciesToActor() {
    await BRTLootHelpers.addCurrenciesToActor(this.actor, this.currencyData);
  }

  /**
   *
   * @param {Token|Actor} token
   * @param {Boolean} is the token passed as the token actor instead?
   */
  async addCurrenciesToToken(token, isTokenActor = false) {
    await BRTLootHelpers.addCurrenciesToToken(token, this.currencyData, isTokenActor);
  }

  /**
   *
   * @param {boolean} stackSame Should same items be stacked together? Default = true
   * @returns
   */
  async addItemsToActor(stackSame = true) {
    const items = await RollTableToActorHelpers.addItemsToActorOld(this.actor, this.betterResults, stackSame);
    return items;
  }

  /**
   *
   * @param {token} token
   * @param {boolean} stackSame
   * @param {boolean} isTokenActor - is the token already the token actor?
   * @param {number} customLimit
   *
   * @returns {object[]} items
   */
  async addItemsToToken(token, stackSame = true, isTokenActor = false, customLimit = 0) {
    const items = RollTableToActorHelpers.addItemsToTokenOld(
      token,
      this.betterResults,
      stackSame,
      isTokenActor,
      customLimit
    );
    return items;
  }
}
