import { BRTUtils } from "../core/utils";
import { BRTStoryHelpers } from "./story-helpers";

export class StoryChatCard {
  /**
   * @param {object} betterResults
   * @param {object} currencyData
   */
  constructor(betterResults, rollMode, roll) {
    this.betterResults = betterResults;
    this.rollMode = rollMode;
    this.roll = roll;
  }

  /**
   * Create a chat card to display the story string
   * @param {string} story the html string of the story to display in chat
   * @param {Object} options set of options, if gmOnly = true then the card will be set to shown only to GM regardless of the chat preferences
   */
  async createChatCard(table, options = {}) {
    let story = null;
    if (options.gmOnly) {
      story = await BRTStoryHelpers.generateContentGMHtmlStory(table);
    } else {
      story = await BRTStoryHelpers.generateContentHtmlStory(table);
    }
    // quickfix for textselection of stories
    story = '<div class="better-rolltables-story-text-selectable">' + story + "</div>";

    const rollHTML = table.displayRoll && this.roll ? await this.roll.render() : null;

    const chatData = {
      rollHTML: rollHTML,
      flavor: table.name,
      sound: "sounds/dice.wav",
      user: game.user._id,
      content: story,
    };

    if (options.gmOnly) {
      chatData.whisper = [game.users.find((u) => u.isGM).id];
    } else {
      BRTUtils.addRollModeToChatData(chatData);
    }

    ChatMessage.create(chatData);
  }
}
