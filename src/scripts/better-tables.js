import { LootChatCard } from "./loot/loot-chat-card.js";
import { BRTBuilder } from "./core/brt-builder.js";
import { BetterResults } from "./core/brt-table-results.js";
import { BRTUtils } from "./core/utils.js";
import { BRTCONFIG } from "./core/config.js";
import API from "./API.js";
import { CONSTANTS } from "./constants/constants.js";
import { i18n } from "./lib.js";
import SETTINGS from "./constants/settings.js";
import { HarvestChatCard } from "./harvest/harvest-chat-card.js";
import { StoryChatCard } from "./story/story-chat-card.js";

export class BetterTables {
  constructor() {
    this._spellCache = undefined;
  }

  /**
   * Get spells in cache for
   * @returns {*}
   */
  getSpellCache() {
    return this._spellCache;
  }

  /**
   *
   * @param {*} tableEntity
   */
  async generateLoot(tableEntity, options = {}) {
    return await API.generateLoot(tableEntity, options);
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
    return await API.addLootToSelectedToken(tableEntity, token, options);
  }

  async generateChatLoot(tableEntity, options = null) {
    return await API.generateChatLoot(tableEntity, options);
  }

  async getStoryResults(tableEntity) {
    return await API.getStoryResults(tableEntity);
  }

  async generateChatStory(tableEntity) {
    return await API.generateChatStory(tableEntity);
  }

  async getBetterTableResults(tableEntity) {
    const brtBuilder = new BRTBuilder(tableEntity);
    const results = await brtBuilder.betterRoll();
    return results;
  }

  async betterTableRoll(tableEntity, options = null) {
    let rollMode = options && "rollMode" in options ? options.rollMode : null;
    if (String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${BRTCONFIG.HIDDEN_TABLE}`)) === "true") {
      rollMode = "gmroll";
    }

    const brtBuilder = new BRTBuilder(tableEntity);
    const results = await brtBuilder.betterRoll();

    if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.USE_CONDENSED_BETTERROLL)) {
      const br = new BetterResults(results);
      const betterResults = await br.buildResults(tableEntity);
      const currencyData = br.getCurrencyData();

      const lootChatCard = new LootChatCard(betterResults, currencyData, rollMode);
      await lootChatCard.createChatCard(tableEntity);
    } else {
      await brtBuilder.createChatCard(results, rollMode);
    }
  }

  /**
   * @param {RollTable} tableEntity rolltable to generate content from
   * @returns {Promise<{flavor: *, sound: string, user: *, content: *}>}
   */
  async roll(tableEntity) {
    const data = await BetterTables.prepareCardData(tableEntity);
    return getProperty(data, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.LOOT}`); //data.flags?.betterTables?.loot;
  }

  /**
   * Create a new RollTable by extracting entries from a compendium.
   *
   * @param {string} tableName the name of the table entity that will be created
   * @param {string} compendiumName the name of the compendium to use for the table generation
   * @param {function(Document)} weightPredicate a function that returns a weight (number) that will be used
   * for the tableResult weight for that given entity. returning 0 will exclude the entity from appearing in the table
   *
   * @deprecated use api.createRolltableFromCompendium instead
   */

  async createTableFromCompendium(tableName, compendiumName, { weightPredicate = null } = {}) {
    return await API.createTableFromCompendium(tableName, compendiumName, { weightPredicate });
  }

  /**
   * Update spell cache used for random spell scroll generation
   *
   * @returns {Promise<void>}
   */
  async updateSpellCache(pack) {
    if (game.user.isGM) {
      const defaultPack = game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.SPELL_COMPENDIUM_KEY),
        spellCompendium = game.packs.get(defaultPack);

      if ((!pack && spellCompendium) || pack === defaultPack) {
        const spellCompendiumIndex = await spellCompendium.getIndex({
          fields: [SETTINGS.SPELL_LEVEL_PATH, "img"],
        });
        this._spellCache = spellCompendiumIndex
          .filter((entry) => entry.type === "spell")
          .map((i) => mergeObject(i, { collection: spellCompendium.collection }));
      } else {
        ui.notifications.error(CONSTANTS.MODULE_ID + `| Spell cache could not be initialized/updated.`);
      }
    }
  }

  createLink(item) {
    if (!item) {
      return undefined;
    }
    if (!item.type || item.type > 0) {
      const id = item.id;
      const uuid = item.uuid;
      const text = item.name || item.text;
      const entity = item.documentName;
      const pack = item.pack || game.collections.get(item.collectionName)?.documentName || "";
      const packPart = pack !== "" ? `data-pack="${pack}"` : "";
      const icon = BRTUtils.getIconByEntityType(entity);
      return `<a class="content-link" draggable="true" ${packPart} data-entity="${entity}" data-id="${id}" data-uuid="${uuid}"><i class="fas ${icon}"></i>${text}</a>`;
    }

    return item.text;
  }

  /* =================================== */
  /* STATIC METHODS */
  /* =================================== */

  /**
   *
   * @param {HTMLElement} html
   * @param {Array} options
   */
  static async enhanceCompendiumContextMenu(html, options) {
    if (game.user.isGM) {
      options.push({
        name: i18n(`${BRTCONFIG.NAMESPACE}.api.msg.generateRolltableFromCompendium`),
        icon: '<i class="fas fa-th-list"></i>',
        callback: (li) => {
          API.createRolltableFromCompendium(li.data("pack"));
        },
      });

      if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU)) {
        options.push({
          name: i18n(`${BRTCONFIG.NAMESPACE}.api.msg.rollCompendiumAsRolltable`),
          icon: '<i class="fa-solid fa-dice"></i>',
          callback: (li) => {
            API.rollCompendiumAsRolltable(li.data("pack"));
          },
        });
      }
    }
  }

  /**
   * Add a roll option in context menu of rolltables
   * @param {HTMLElement} html
   * @param {Array} options
   */
  static async enhanceRolltableContextMenu(html, options) {
    if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU)) {
      options.unshift({
        name: "Roll table (BRT)",
        icon: '<i class="fa-solid fa-dice"></i>',
        callback: (li) => {
          BetterTables.menuCallBackRollTable(li.data("documentId"));
        },
      });
    }
  }

  /**
   *
   * @param {String} rolltableId ID of the rolltable to roll
   */
  static async menuCallBackRollTable(rolltableId) {
    const rolltable = game.tables.get(rolltableId);
    await API.betterTableRoll(rolltable);
  }

  /**
   * Create card content from compendium content
   *
   * @param {String} compendium compendium name
   *
   * @returns {Promise<{flavor: string, sound: string, user: *, content: *}>}
   *
   * @deprecated use api.rollCompendiumAsRolltable instead
   */
  static async rollCompendiumAsRolltable(compendium) {
    API.rollCompendiumAsRolltable(compendium);
  }

  static async _renderMessage(message) {
    const dataMessageLoot = getProperty(message, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.LOOT}`);
    const cardHtml = await renderTemplate(
      `modules/${CONSTANTS.MODULE_ID}/templates/card/loot-chat-card.hbs`,
      dataMessageLoot //message.flags.betterTables.loot
    );
    message.content = cardHtml;
    return message;
    /*
    return {
      flavor: message.data.flavor,
      sound: message.data.sound,
      user: message.data.user,
      content: cardHtml,
      flags: {
        better-rolltables: {
          loot: data
        }
      }
    }
    */
  }

  /**
   *
   * @param {String} compendium ID of the compendium to roll
   */
  static async menuCallBackRollCompendium(compendium) {
    const chatData = await API.rollCompendiumAsRolltable(compendium);
    ChatMessage.create(chatData);
  }

  /**
   * Create card content from rolltable
   * @param {RollTable} tableEntity rolltable to generate content from
   * @returns {Promise<{flavor: *, sound: string, user: *, content: *}>}
   */
  static async prepareCardData(tableEntity) {
    const brtBuilder = new BRTBuilder(tableEntity);
    const results = await brtBuilder.betterRoll();

    const br = new BetterResults(results);
    const betterResults = await br.buildResults(tableEntity);
    const currencyData = br.getCurrencyData();
    // TODO REPLACE LOOT CARD WITH DEFAULT ONE
    if (this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) !== CONSTANTS.TABLE_TYPE_BETTER) {
      const betterChatCard = new LootChatCard(betterResults, currencyData);
      return betterChatCard.prepareCharCart(tableEntity);
    } else if (
      this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) !== CONSTANTS.TABLE_TYPE_LOOT
    ) {
      const lootChatCard = new LootChatCard(betterResults, currencyData);
      return lootChatCard.prepareCharCart(tableEntity);
    } else if (
      this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) !== CONSTANTS.TABLE_TYPE_STORY
    ) {
      const storyChatCard = new StoryChatCard(betterResults);
      return storyChatCard.prepareCharCart(tableEntity);
    } else if (
      this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) !== CONSTANTS.TABLE_TYPE_HARVEST
    ) {
      const harvestChatCard = new HarvestChatCard(betterResults);
      return harvestChatCard.prepareCharCart(tableEntity);
    }
  }

  static async _toggleCurrenciesShareSection(message, html) {
    const section = html[0].querySelector(`section.${BRTCONFIG.NAMESPACE}-share-currencies`);
    section.classList.toggle(`${BRTCONFIG.NAMESPACE}-hidden`);
    // await BetterTables.updateChatMessage(message, html, {"force":true});
  }

  static async _addButtonsToMessage(message, html) {
    const tableDrawNode = $(html).find(".table-draw");
    const id = $(tableDrawNode).data("id");
    const pack = $(tableDrawNode).data("pack");
    if (!id && !pack) {
      return;
    }
    if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_REROLL_BUTTONS)) {
      // reroll button
      const rerollButton = $(
        `<a class="better-rolltables-roll-table-reroll-button" title="${game.i18n.localize(
          `${BRTCONFIG.NAMESPACE}.DrawReroll`
        )}">`
      ).append("<i class='fas fa-dice-d20'></i>");
      rerollButton.click(async () => {
        let cardContent;
        if (pack && !id) {
          cardContent = await API.rollCompendiumAsRolltable(pack, CONSTANTS.MODULE_ID);
        } else {
          let rolltable;
          if (pack && id) {
            rolltable = await game.packs.get(pack)?.getDocument(id);
          } else {
            rolltable = game.tables.get(id);
          }
          if (rolltable) {
            cardContent = await BetterTables.prepareCardData(rolltable);
          }
        }
        await BetterTables.updateChatMessage(message, cardContent, {
          flags: cardContent.flags,
        });
      });
      $(html).find(".message-delete").before(rerollButton);
    }

    if (
      game.system.id === "dnd5e" &&
      game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_CURRENCY_SHARE_BUTTON) &&
      getProperty(message, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.LOOT_CURRENCY}`) && // message.flags?.betterTables?.loot.currency &&
      Object.keys(getProperty(message, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.LOOT_CURRENCY}`)).length > 0 // message.flags.betterTables.loot.currency)
    ) {
      // Currency share button
      const currencyShareButton = $(
        `<a class="better-rolltables-roll-table-share-currencies" title="${game.i18n.localize(
          `${BRTCONFIG.NAMESPACE}.Buttons.Currency.Share`
        )}">`
      ).append("<i class='fas fa-coins'></i>");
      currencyShareButton.click(async () => BetterTables._toggleCurrenciesShareSection(message, html));
      $(html).find(".message-delete").before(currencyShareButton);
      const shareButton = html[0].querySelector(`button.${BRTCONFIG.NAMESPACE}-share-currencies-button`);
      shareButton.addEventListener("click", async (event) => {
        await BetterTables._shareCurrenciesToPlayers(message, html);
      });
    }

    if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_OPEN_BUTTONS)) {
      // Open link
      let document;
      if (pack && id) {
        document = await game.packs.get(pack)?.getDocument(id);
      } else {
        document = game.tables.get(id);
      }
      if (document) {
        const openLink = $(
          `<a class="better-rolltables-roll-table-open-table" title="${game.i18n.localize(
            `${BRTCONFIG.NAMESPACE}.OpenRolltable`
          )}">`
        ).append("<i class='fas fa-th-list'></i>");
        if (id) openLink.data("id", id);
        if (pack) openLink.data("pack", pack);
        openLink.click(async () => document.sheet.render(true));
        $(html).find(".message-delete").before(openLink);
      }
    }
  }

  /**
   *
   * @param {ChatMessage} message
   * @param {HTMLElement} html
   * @returns {Promise<undefined>}
   * @private
   */
  static async _shareCurrenciesToPlayers(message, html) {
    await BetterTables._toggleCurrenciesShareSection(message, html);
    const usersId = Array.from(
      html[0].querySelector(`section.${BRTCONFIG.NAMESPACE}-share-currencies`)?.querySelectorAll("input:checked")
    ).map((x) => x.dataset.userId);
    if (!usersId) return undefined;

    const currenciesToShare = getProperty(message, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.LOOT_CURRENCY}`); //message.flags.betterTables.loot.currency;
    const usersCount = usersId.length;
    const share = Object.keys(currenciesToShare)
      .map((x) => ({ [x]: Math.floor(currenciesToShare[x] / usersCount) }))
      .reduce((a, b) => Object.assign(a, b), {});

    for (const userId of usersId) {
      const user = game.users.get(userId);
      const currency = user.character.system.currency;
      for (let key of Object.keys(currency)) {
        const increment = share[key] || 0;
        if (increment > 0) {
          currency[key] += increment;
        }
      }
      await user.character.update({ currency: currency });
    }
    const newMessage = await BetterTables._renderMessage(
      mergeObject(message, { [`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.LOOT_SHARED}`]: true }) //"flags.betterTables.loot.shared"
    );
    await BetterTables.updateChatMessage(message, newMessage);
  }

  static async _addRollButtonsToEntityLink(html) {
    if (game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.ROLL_TABLE_FROM_JOURNAL)) {
      // handling rolltables imported in campaign
      $(html)
        .find("a.content-link[data-entity='RollTable']")
        .each((index, link) => {
          const id = $(link).data("id");
          const rolltable = game.tables.get(id);

          const rollNode = $(
            `<a class="better-rolltables-roll-table-roll-link" title="${game.i18n.localize(
              `${BRTCONFIG.NAMESPACE}.DrawReroll`
            )}"><i class="fas fa-dice-d20"></i></a>`
          ).click(async () => {
            await API.generateChatLoot(rolltable);
          });
          $(link).after(rollNode);
        });

      // handling rolltables in compendiums
      $(html)
        .find("a.content-link[data-pack]")
        .each(async (index, link) => {
          const packName = $(link).data("pack");
          const pack = game.packs.get(packName);
          if (!pack) return;

          const id = $(link).data("id");
          const document = await pack.getDocument(id);
          if (!document || document.documentName !== "RollTable") return;

          const rollNode = $(
            `<a class="better-rolltables-roll-table-roll-link" title="${game.i18n.localize(
              `${BRTCONFIG.NAMESPACE}.DrawReroll`
            )}"><i class="fas fa-dice-d20"></i></a>`
          ).click(async () => {
            await API.generateChatLoot(document);
          });
          $(link).after(rollNode);
        });
    }
  }

  /**
   * Handle Reroll buttons on cards
   * @param {ChatMessage} message newly created message
   * @param {Object} html message content
   * @returns {Promise<void>}
   */
  static async handleChatMessageButtons(message, html) {
    if (game.user.isGM) {
      BetterTables._addButtonsToMessage(message, html);
      BetterTables._addRollButtonsToEntityLink(html);
    }
  }

  /**
   * Update a message with a new content
   * @param {ChatMessage} message message to update
   * @param {ChatMessage} content new HTML content of message
   * @param {Object} options
   * @returns {Promise<void>}
   */
  static async updateChatMessage(message, content, options = {}) {
    if (game.user.isGM) {
      if (!options.force && game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_WARNING_BEFORE_REROLL)) {
        Dialog.confirm({
          title: game.i18n.localize(`${BRTCONFIG.NAMESPACE}.Settings.RerollWarning.Title`),
          content: game.i18n.localize(`${BRTCONFIG.NAMESPACE}.Settings.RerollWarning.Description`),
          yes: () => BetterTables.updateChatMessage(message, content, { force: true }),
          defaultYes: false,
        });
      } else {
        message.update({
          content: content.content,
          flags: options.flags,
          timestamp: Date.now(),
        });
      }
    }
  }

  static handleDropRollTableSheetData(rollTable, rollTableSheet, json) {
    if (json.event === "sort") {
      return false;
    } else {
      return true;
    }
  }

  static async handleRolltableLink(sheet, html) {
    if (game.user.isGM && game.settings.get(CONSTANTS.MODULE_ID, BRTCONFIG.ROLL_TABLE_FROM_JOURNAL)) {
      // handling rolltables imported in campaign
      $(html)
        .find("a.content-link[data-uuid^='RollTable']")
        .each((index, link) => {
          const id = $(link).data("id");
          const rolltable = game.tables.get(id);

          const rollNode = $(
            `<a class="better-rolltables-roll-table-roll-link" title="${game.i18n.localize(
              `${BRTCONFIG.NAMESPACE}.DrawReroll`
            )}"><i class="fas fa-dice-d20"></i></a>`
          ).click(async () => {
            await API.generateChatLoot(rolltable);
          });
          $(link).after(rollNode);
        });

      // handling rolltables in compendiums
      $(html)
        .find("a.content-link[data-pack]")
        .each(async (index, link) => {
          const packName = $(link).data("pack");
          const pack = game.packs.get(packName);
          if (!pack) return;

          const id = $(link).data("id");
          const document = await pack.getDocument(id);
          if (!document || document.documentName !== "RollTable") return;

          const rollNode = $(
            `<a class="better-rolltables-roll-table-roll-link" title="${game.i18n.localize(
              `${BRTCONFIG.NAMESPACE}.DrawReroll`
            )}"><i class="fas fa-dice-d20"></i></a>`
          ).click(async () => {
            await API.generateChatLoot(document);
          });
          $(link).after(rollNode);
        });
    }
  }
}
