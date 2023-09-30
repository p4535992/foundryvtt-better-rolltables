import { BRTCONFIG } from "../core/config.js";
import { CONSTANTS } from "../constants/constants.js";
import { BRTUtils } from "../core/utils.js";
import { HarvestCreator } from "./harvest-creator.js";
import { BRTBetterHelpers } from "../core/brt-helper.js";

/**
 * create a chat card based on the content of the object HarvestData
 */
export class HarvestChatCard {
  /**
   * @param {object} betterResults
   */
  constructor(betterResults, rollMode) {
    this.betterResults = betterResults;
    this.rollMode = rollMode;

    this.itemsData = [];
    this.numberOfDraws = 0;
  }

  async findOrCreateItems() {
    const harvestCreator = new HarvestCreator(this.betterResults);
    for (const item of this.betterResults) {
      if (item.type === CONST.TABLE_RESULT_TYPES.TEXT) {
        await this.addToItemData({
          id: item.text,
          text: item.text,
          img: item.img,
          isText: true,
        });
        continue;
      }

      this.numberOfDraws++;
      /** we pass though the data, since we might have some data manipulation that changes an existing item, in that case even if it was initially
       * existing or in a compendium we have to create a new one */
      const itemData = await harvestCreator.buildItemData(item);
      if (item.collection) {
        const itemEntity = await BRTUtils.getItemFromCompendium(item);

        if (itemEntity && itemEntity.name === itemData.name) {
          await this.addToItemData(itemEntity, itemData);
          continue;
        }
      }

      const itemEntity = game.items.getName(itemData.name);
      if (itemEntity) {
        await this.addToItemData(itemEntity, itemData);
        continue;
      }

      const itemFolder = await this.getBRTFolder();
      itemData.folder = itemFolder.id;

      setProperty(itemData, "permission.default", CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER);
      const newItem = await Item.create(itemData);
      await this.addToItemData(newItem, itemData);
    }
  }

  async addToItemData(itemEntity, data) {
    const existingItem = this.itemsData.find((i) => i.item.id === itemEntity.id);
    const quantity = getProperty(data, BRTCONFIG.QUANTITY_PROPERTY_PATH) || 1;

    if (existingItem) {
      existingItem.quantity = +existingItem.quantity + +quantity;
    } else {
      // we will scale down the font size if an item name is too long
      const fontSize = Math.max(60, 100 - Math.max(0, (itemEntity.name || itemEntity.text).length - 27) * 2);

      let type = undefined;
      if (itemEntity.isText) {
        type = CONST.TABLE_RESULT_TYPES.TEXT;
      } else if (itemEntity.pack) {
        type = CONST.TABLE_RESULT_TYPES.COMPENDIUM;
      } else {
        type = CONST.TABLE_RESULT_TYPES.DOCUMENT;
      }

      const resultDoc = itemEntity; // await BRTBetterHelpers.retrieveDocumentFromResult(itemEntity);

      this.itemsData.push({
        documentName: itemEntity.documentName,
        compendiumName: itemEntity.pack,
        type: type,
        item: {
          id: itemEntity.id,
          _id: itemEntity.id,
          name: itemEntity.name,
          img: itemEntity.img,
          text: itemEntity.text,
          uuid: resultDoc?.uuid ?? "",
        },
        quantity: quantity,
        fontSize: fontSize,
      });
    }
  }

  async renderMessage(data) {
    return renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/card/harvest-chat-card.hbs`, data);
  }

  async getBRTFolder() {
    if (!this.historyFolder) {
      let historyFolder = game.folders.getName("Better RollTable Items");
      if (!historyFolder) {
        historyFolder = await Folder.create({
          name: "Better RollTable Items",
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

    const chatCardData = {
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

    return {
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
  }

  async createChatCard(table) {
    const chatData = await this.prepareCharCart(table);
    BRTUtils.addRollModeToChatData(chatData, this.rollMode);
    ChatMessage.create(chatData);
  }
}
