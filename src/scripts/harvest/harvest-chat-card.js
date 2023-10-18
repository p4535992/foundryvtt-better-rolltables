import { BRTCONFIG } from "../core/config.js";
import { CONSTANTS } from "../constants/constants.js";
import { BRTUtils } from "../core/utils.js";
import { BRTBetterHelpers } from "../better/brt-helper.js";
import { RollTableToActorHelpers } from "../apps/rolltable-to-actor/rolltable-to-actor-helpers.js";
import { i18n, warn } from "../lib.js";

/**
 * create a chat card based on the content of the object HarvestData
 */
export class HarvestChatCard {
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
      let customResultNameHidden = undefined;
      let customResultImgHidden = undefined;
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

      let isResultHidden = false;
      if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`)) {
        // customResultNameHidden = CONSTANTS.DEFAULT_HIDDEN_RESULT_TEXT;
        // customResultImgHidden = CONSTANTS.DEFAULT_HIDDEN_RESULT_IMAGE;
        isResultHidden = true;
      }

      if (result.type === CONST.TABLE_RESULT_TYPES.TEXT) {
        this.itemsDataGM = await BRTUtils.addToItemData(
          this.itemsDataGM,
          {
            id: result.text,
            text: result.text ?? result.name,
            img: result.icon ?? result.img,
            isText: true,
          },
          {},
          false
        );
        if (
          getProperty(
            result,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`
          )
        ) {
          continue;
        }
        this.itemsData = await BRTUtils.addToItemData(
          this.itemsData,
          {
            id: result.text,
            text: customResultNameHidden ?? result.text ?? result.name,
            img: customResultImgHidden ?? result.icon ?? result.img,
            isText: true,
          },
          {},
          isResultHidden
        );
        continue;
      }

      this.numberOfDraws++;

      /** we pass though the data, since we might have some data manipulation that changes an existing item, in that case even if it was initially
       * existing or in a compendium we have to create a new one */
      const itemData = await RollTableToActorHelpers.buildItemData(result);

      if (!itemData) {
        this.itemsDataGM = await BRTUtils.addToItemData(
          this.itemsDataGM,
          {
            id: result.text,
            text: result.text ?? result.name,
            img: result.icon ?? result.img,
            isText: true,
          },
          {},
          false
        );
        if (
          getProperty(
            result,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`
          )
        ) {
          continue;
        }
        this.itemsData = await BRTUtils.addToItemData(
          this.itemsData,
          {
            id: result.text,
            text: customResultNameHidden ?? result.text ?? result.name,
            img: customResultImgHidden ?? result.icon ?? result.img,
            isText: true,
          },
          {},
          isResultHidden
        );
        continue;
      }

      const itemEntityUuid = getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`);
      const itemEntity = await fromUuid(itemEntityUuid);
      if (itemEntity) {
        if (customResultName && customResultName !== itemEntity.name) {
          setProperty(itemEntity, `name`, customResultName);
        }
        if (customResultImg && customResultImg !== itemEntity.img) {
          setProperty(itemEntity, `img`, customResultImg);
        }

        this.itemsDataGM = await BRTUtils.addToItemData(this.itemsDataGM, itemEntity, itemData, false);

        if (customResultNameHidden && customResultNameHidden !== itemEntity.name) {
          setProperty(itemEntity, `name`, customResultNameHidden);
        }
        if (customResultImgHidden && customResultImgHidden !== itemEntity.img) {
          setProperty(itemEntity, `img`, customResultImgHidden);
        }
        if (isResultHidden) {
          if (
            !getProperty(
              result,
              `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`
            )
          ) {
            continue;
          }
          setProperty(
            itemEntity,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`,
            isResultHidden
          );
        }

        this.itemsData = await BRTUtils.addToItemData(this.itemsData, itemEntity, itemData, isResultHidden);

        continue;
      }

      /*
      const itemData = await RollTableToActorHelpers.buildItemData(result);
      if (result.collection) {
        const itemEntity = await BRTUtils.getItemFromCompendium(result);

        const itemEntityOriginalName = getProperty(itemEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`);
        if (itemEntity && itemEntity.name === itemEntityOriginalName) {
        // if (itemEntity && itemEntity.name === itemData.name) {
          if (customResultName && customResultName !== itemEntity.name) {
            setProperty(itemEntity, `name`, customResultName);
          }
          if (customResultImg && customResultImg !== itemEntity.img) {
            setProperty(itemEntity, `img`, customResultImg);
          }
          this.itemsDataGM = await BRTUtils.addToItemData(this.itemsDataGM, itemEntity, itemData, false);
          if (customResultNameHidden && customResultNameHidden !== itemEntity.name) {
            setProperty(itemEntity, `name`, customResultNameHidden);
          }
          if (customResultImgHidden && customResultImgHidden !== itemEntity.img) {
            setProperty(itemEntity, `img`, customResultImgHidden);
          }
          this.itemsData = await BRTUtils.addToItemData(this.itemsData, itemEntity, itemData, isResultHidden);
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
        this.itemsDataGM = await BRTUtils.addToItemData(this.itemsDataGM, itemEntity, itemData, false);
        if (customResultNameHidden && customResultNameHidden !== itemEntity.name) {
          setProperty(itemEntity, `name`, customResultNameHidden);
        }
        if (customResultImgHidden && customResultImgHidden !== itemEntity.img) {
          setProperty(itemEntity, `img`, customResultImgHidden);
        }
        this.itemsData = await BRTUtils.addToItemData(this.itemsData, itemEntity, itemData, isResultHidden);
        continue;
      }
      */

      const itemFolder = await this.getBRTFolder();
      if (itemFolder) {
        itemData.folder = itemFolder.id;
      } else {
        warn(`No folder tables found with name 'Better RollTable | Harvest Items'`);
      }

      setProperty(itemData, "permission.default", CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER);
      const newItem = await Item.create(itemData);
      if (customResultName && customResultName !== newItem.name) {
        setProperty(newItem, `name`, customResultName);
      }
      if (customResultImg && customResultImg !== newItem.img) {
        setProperty(newItem, `img`, customResultImg);
      }

      this.itemsDataGM = await BRTUtils.addToItemData(this.itemsDataGM, newItem, itemData, false);

      if (customResultNameHidden && customResultNameHidden !== itemEntity.name) {
        setProperty(itemEntity, `name`, customResultNameHidden);
      }
      if (customResultImgHidden && customResultImgHidden !== itemEntity.img) {
        setProperty(itemEntity, `img`, customResultImgHidden);
      }
      if (isResultHidden) {
        if (
          !getProperty(
            result,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`
          )
        ) {
          continue;
        }
        setProperty(
          itemEntity,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`,
          isResultHidden
        );
      }

      this.itemsData = await BRTUtils.addToItemData(this.itemsData, newItem, itemData, isResultHidden);
    }
  }

  async renderMessage(data) {
    return renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/card/harvest-chat-card.hbs`, data);
  }

  async getBRTFolder() {
    if (!this.historyFolder) {
      let historyFolder = game.folders.getName("Better RollTable | Harvest Items");
      if (!historyFolder) {
        historyFolder = await Folder.create({
          name: "Better RollTable | Harvest Items",
          parent: null,
          type: "Item",
        });
      }
      this.historyFolder = historyFolder;
    }
    return this.historyFolder;
  }

  async prepareCharCart(table) {
    // await this.findOrCreateItems();

    const htmlDescription = await TextEditor.enrichHTML(table.description, {
      async: true,
      secrets: table.isOwner,
      documents: true,
    });

    const rollHTML = table.displayRoll && this.roll ? await this.roll.render() : null;

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

    const chatCardData = {
      rollHTML: rollHTML,
      tableData: table,
      htmlDescription: htmlDescription,
      // gmTitleLabel: i18n(`${CONSTANTS.MODULE_ID}.label.tableTextGmTitleLabel`),
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

    const chatData = {
      flavor: flavorString,
      sound: "sounds/dice.wav",
      user: game.user._id,
      content: cardHtml,
      flags: {
        [`${CONSTANTS.MODULE_ID}`]: {
          [`${CONSTANTS.FLAGS.HARVEST}`]: chatCardData,
        },
      },
    };
    return chatData;
  }

  async prepareCharCartGM(table) {
    // await this.findOrCreateItems();

    const htmlDescription = await TextEditor.enrichHTML(table.description, {
      async: true,
      secrets: table.isOwner,
      documents: true,
    });

    const rollHTML = table.displayRoll && this.roll ? await this.roll.render() : null;

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

    const chatCardData = {
      rollHTML: rollHTML,
      tableData: table,
      htmlDescription: htmlDescription,
      gmTitleLabel: i18n(`${CONSTANTS.MODULE_ID}.label.tableTextGmTitleLabel`),
      itemsData: this.itemsDataGM,
      compendium: table.pack,
      id: table.id,
      users: game.users
        .filter((user) => user.isGM && user.character)
        .map((user) => ({
          id: user.id,
          name: user.character.name,
          img: user.character.token?.img || user.avatar,
        })),
    };

    const cardHtml = await this.renderMessage(chatCardData);

    const chatData = {
      flavor: flavorString,
      sound: "sounds/dice.wav",
      user: game.user._id,
      content: cardHtml,
      flags: {
        [`${CONSTANTS.MODULE_ID}`]: {
          [`${CONSTANTS.FLAGS.HARVEST}`]: chatCardData,
        },
      },
    };
    return chatData;
  }

  async createChatCard(table) {
    await this.findOrCreateItems();
    if (this.rollMode !== "gmroll") {
      const chatData = await this.prepareCharCart(table);
      BRTUtils.addRollModeToChatData(chatData, this.rollMode);
      ChatMessage.create(chatData);
    }
    if (this.atLeastOneRollIsHidden || this.rollMode === "gmroll") {
      const chatDataGM = await this.prepareCharCartGM(table);
      BRTUtils.addRollModeToChatData(chatDataGM, "gmroll");
      ChatMessage.create(chatDataGM);
    }
  }
}
