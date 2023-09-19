import { CONSTANTS } from "../../constants/constants";
import { BRTUtils } from "../../core/utils";
import { warn } from "../../lib";

export class RollFromCompendiumAsRollTableHelpers {
  /**
   *
   * @param {String} compendium ID of the compendium to roll
   */
  static async rollCompendiumAsRollTable(compendium = null, hideChatMessage) {
    if (!game.user.isGM) {
      warn(`Only gm can roll directly from compendium`, true);
      return;
    }
    if (!compendium) {
      warn(`No reference to a compendium is been passed`, true);
      return;
    }

    // Get random item from compendium
    const item = await BRTUtils.getRandomItemFromCompendium(compendium);

    // prepare card data
    const fontSize = Math.max(60, 100 - Math.max(0, item.name.length - 27) * 2);
    const chatCardData = {
      compendium: compendium,
      itemsData: [{ item: item, quantity: 1, fontSize: fontSize, type: 2 }],
    };
    const cardHtml = await renderTemplate(
      `modules/${CONSTANTS.MODULE_ID}/templates/card/loot-chat-card.hbs`,
      chatCardData
    );
    let chatData = {
      flavor: `Rolled from compendium ${item.pack}`,
      sound: "sounds/dice.wav",
      user: game.user.id,
      content: cardHtml,
    };

    if (!hideChatMessage) {
      ChatMessage.create(chatData);
    }
    return chatData;
  }
}
