import { BRTBuilder } from "./core/brt-builder.js";
import { BetterResults } from "./core/brt-table-results.js";
import { CONSTANTS, BRTCONFIG } from "./core/config.js";
import { LootChatCard } from "./loot/loot-chat-card.js";
import { LootCreator } from "./loot/loot-creator.js";
import { getRandomItemFromCompendium } from "./core/utils.js";
import { CompendiumToRollTableHelpers } from "./apps/compendium-to-rolltable/compendium-to-rollTable-helpers.js";

/**
 * Create a new API class and export it as default
 */
class API {
  /**
   * Get better rolltable tags from settings
   *
   */
  static getTags() {
    return game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.TAGS.USE);
  }

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

  /**
   *
   * @param {String} compendium ID of the compendium to roll
   */
  static async rollCompendiumAsRolltable(compendium = null, hideChatMessage) {
    if (!game.user.isGM || !compendium) return;

    // Get random item from compendium
    const item = await getRandomItemFromCompendium(compendium);

    // prepare card data
    const fontSize = Math.max(60, 100 - Math.max(0, item.name.length - 27) * 2);
    const chatCardData = {
      compendium: compendium,
      itemsData: [{ item: item, quantity: 1, fontSize: fontSize, type: 2 }],
    };
    const cardHtml = await renderTemplate("modules/better-rolltables/templates/loot-chat-card.hbs", chatCardData);
    let chatData = {
      flavor: `Rolled from compendium ${item.pack}`,
      sound: "sounds/dice.wav",
      user: game.user._id,
      content: cardHtml,
    };

    if (!hideChatMessage) ChatMessage.create(chatData);
    return chatData;
  }

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
  static async createRolltableFromCompendium(
    compendiumName,
    tableName = compendiumName + " RollTable",
    { weightPredicate = null } = {}
  ) {
    return await CompendiumToRollTableHelpers.createRolltableFromCompendium(
        compendiumName,tableName, { weightPredicate });
  }

  /* ======================================================== */
  /* NEW API INTEGRATION */
  /* ======================================================== */


}

export { API };
