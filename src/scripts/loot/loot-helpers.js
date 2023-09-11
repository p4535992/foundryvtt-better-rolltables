import { BRTBuilder } from "../core/brt-builder";
import { BetterResults } from "../core/brt-table-results";
import { BRTCONFIG, CONSTANTS } from "../core/config";
import { LootChatCard } from "./loot-chat-card";
import { LootCreator } from "./loot-creator";

export class BRTLootHelpers {

    /**
   * Roll a table an add the resulting loot to a given token.
   *
   * @param {RollTable} tableEntity
   * @param {TokenDocument} token
   * @param {options} object
   * @returns
   */
  async addLootToSelectedToken(tableEntity, token = null, options = null) {
    let tokenstack = [];
    const isTokenActor = options && options?.isTokenActor,
      stackSame = options && options?.stackSame ? options.stackSame : true,
      customRoll = options && options?.customRole ? options.customRole : undefined,
      itemLimit = options && options?.itemLimit ? Number(options.itemLimit) : 0;

    if (null == token && canvas.tokens.controlled.length === 0) {
      return ui.notifications.error("Please select a token first");
    } else {
      tokenstack = token ? (token.length >= 0 ? token : [token]) : canvas.tokens.controlled;
    }

    ui.notifications.info(CONSTANTS.MODULE_ID + " | API | Loot generation started.");

    const brtBuilder = new BRTBuilder(tableEntity);

    for (const token of tokenstack) {
      const results = await brtBuilder.betterRoll(customRoll);
      const br = new BetterResults(results);
      const betterResults = await br.buildResults(tableEntity);
      const currencyData = br.getCurrencyData();
      const lootCreator = new LootCreator(betterResults, currencyData);

      await lootCreator.addCurrenciesToToken(token, isTokenActor);
      await lootCreator.addItemsToToken(token, stackSame, isTokenActor, itemLimit);
    }

    return ui.notifications.info(CONSTANTS.MODULE_ID + " | API | Loot generation complete.");
  }

  /**
   *
   * @param {*} tableEntity
   */
  static async generateLoot(tableEntity, options = {}) {
    const builder = new BRTBuilder(tableEntity),
      results = await builder.betterRoll(),
      br = new BetterResults(results),
      betterResults = await br.buildResults(tableEntity),
      currencyData = br.getCurrencyData(),
      lootCreator = new LootCreator(betterResults, currencyData); //LootCreator;

    await lootCreator.createActor(tableEntity);
    await lootCreator.addCurrenciesToActor();
    await lootCreator.addItemsToActor();

    if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE)) {
      let rollMode = options && "rollMode" in options ? options.rollMode : null;
      if (String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${BRTCONFIG.HIDDEN_TABLE}`)) === "true") {
        rollMode = "gmroll";
      }
      const lootChatCard = new LootChatCard(betterResults, currencyData, rollMode);
      await lootChatCard.createChatCard(tableEntity);
    }
  }

  static async generateChatLoot(tableEntity, options = null) {
    let rollMode = options && "rollMode" in options ? options.rollMode : null;
    if (String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${BRTCONFIG.HIDDEN_TABLE}`)) === "true") {
      rollMode = "gmroll";
    }
    const brtBuilder = new BRTBuilder(tableEntity),
      results = await brtBuilder.betterRoll(),
      br = new BetterResults(results),
      betterResults = await br.buildResults(tableEntity),
      currencyData = br.getCurrencyData(),
      lootChatCard = new LootChatCard(betterResults, currencyData, rollMode);

    await lootChatCard.createChatCard(tableEntity);
  }

}
