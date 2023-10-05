import { BRTCONFIG } from "../core/config.js";
import { CONSTANTS } from "../constants/constants.js";
import { BRTUtils } from "../core/utils.js";
import { BRTBetterHelpers } from "./brt-helper.js";
import { RollTableToActorHelpers } from "../apps/rolltable-to-actor/rolltable-to-actor-helpers.js";

/**
 * create a chat card based on the content of the object LootData
 */
export class BetterChatCard {
  /**
   * @param {object} betterResults
   */
  constructor(betterResults, rollMode, roll) {
    this.betterResults = betterResults;
    this.rollMode = rollMode;
    this.roll = roll;
    this.itemsData = [];
    this.itemsDataGM = [];
    this.numberOfDraws = 0;
    this.atLeastOneRollIsHidden = false;
    for (const result of this.betterResults) {
      if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`)) {
        this.atLeastOneRollIsHidden = true;
        break;
      }
    }
  }

  async findOrCreateItems() {
    for (const result of this.betterResults) {
      let customResultName = undefined;
      let customResultImg = undefined;
      if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)) {
        customResultName = getProperty(
          result,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`
        );
      }
      if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)) {
        customResultImg = getProperty(
          result,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`
        );
      }

      if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`)) {
        customResultName = CONSTANTS.DEFAULT_HIDDEN_RESULT_TEXT;
        customResultImg = CONSTANTS.DEFAULT_HIDDEN_RESULT_IMAGE;
      }

      if (result.type === CONST.TABLE_RESULT_TYPES.TEXT) {
        this.itemsData = await BRTUtils.addToItemData(this.itemsData, {
          id: result.text,
          text: result.text,
          img: result.img,
          isText: true,
        });
        continue;
      }

      this.numberOfDraws++;
      /** we pass though the data, since we might have some data manipulation that changes an existing item, in that case even if it was initially
       * existing or in a compendium we have to create a new one */
      const itemData = await RollTableToActorHelpers.buildItemData(result);
      if (result.collection) {
        const itemEntity = await BRTUtils.getItemFromCompendium(result);

        if (itemEntity && itemEntity.name === itemData.name) {
          if (customResultName && customResultName !== itemEntity.name) {
            setProperty(itemEntity, `name`, customResultName);
          }
          if (customResultImg && customResultImg !== itemEntity.img) {
            setProperty(itemEntity, `img`, customResultImg);
          }
          this.itemsData = await BRTUtils.addToItemData(this.itemsData, itemEntity, itemData);
          continue;
        }
      }

      const itemEntity = game.items.getName(itemData.name);
      if (itemEntity) {
        if (customResultName && customResultName !== itemEntity.name) {
          setProperty(itemEntity, `name`, customResultName);
        }
        if (customResultImg && customResultImg !== itemEntity.img) {
          setProperty(itemEntity, `img`, customResultImg);
        }
        this.itemsData = await BRTUtils.addToItemData(this.itemsData, itemEntity, itemData);
        continue;
      }

      const itemFolder = await this.getBRTFolder();
      itemData.folder = itemFolder.id;

      setProperty(itemData, "permission.default", CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER);
      const newItem = await Item.create(itemData);
      if (customResultName && customResultName !== newItem.name) {
        setProperty(newItem, `name`, customResultName);
      }
      if (customResultImg && customResultImg !== newItem.img) {
        setProperty(newItem, `img`, customResultImg);
      }
      this.itemsData = await BRTUtils.addToItemData(this.itemsData, newItem, itemData);
    }
  }

  async renderMessage(data) {
    return renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/card/better-chat-card.hbs`, data);
  }

  async getBRTFolder() {
    if (!this.historyFolder) {
      let historyFolder = game.folders.getName("Better RollTable Items");
      if (!historyFolder) {
        historyFolder = await Folder.create({
          name: "Better RollTable | Better Items",
          parent: null,
          type: "Item",
        });
      }
      this.historyFolder = historyFolder;
    }
    return this.historyFolder;
  }

  async prepareCharCart(table) {
    await this.findOrCreateItems();

    const htmlDescription = await TextEditor.enrichHTML(table.description, {
      async: true,
      secrets: table.isOwner,
      documents: true,
    });

    const rollHTML = table.displayRoll && this.roll ? await this.roll.render() : null;

    const chatCardData = {
      rollHTML: rollHTML,
      tableData: table,
      htmlDescription: htmlDescription,
      itemsData: this.itemsData,
      compendium: table.pack,
      id: table.id,
      users: game.users
        .filter((user) => !user.isGM && user.character)
        .map((user) => ({
          id: user.id,
          name: user.character.name,
          img: user.character.token?.img || user.avatar,
        })),
    };

    const cardHtml = await this.renderMessage(chatCardData);

    let flavorString;
    if (this.numberOfDraws > 1) {
      flavorString = game.i18n.format(`${BRTCONFIG.NAMESPACE}.DrawResultPlural`, {
        amount: this.numberOfDraws,
        name: table.name,
      });
    } else if (this.numberOfDraws > 0) {
      flavorString = game.i18n.format(`${BRTCONFIG.NAMESPACE}.DrawResultSingular`, {
        amount: this.numberOfDraws,
        name: table.name,
      });
    } else {
      flavorString = game.i18n.format(`${BRTCONFIG.NAMESPACE}.DrawResultZero`, {
        name: table.name,
      });
    }

    const chatData = {
      flavor: flavorString,
      sound: "sounds/dice.wav",
      user: game.user._id,
      content: cardHtml,
      flags: {
        [`${CONSTANTS.MODULE_ID}`]: {
          [`${CONSTANTS.FLAGS.BETTER}`]: chatCardData,
        },
      },
    };
    return chatData;
  }

  async createChatCard(table) {
    const chatData = await this.prepareCharCart(table);
    BRTUtils.addRollModeToChatData(chatData, this.rollMode);
    ChatMessage.create(chatData);
  }
}
