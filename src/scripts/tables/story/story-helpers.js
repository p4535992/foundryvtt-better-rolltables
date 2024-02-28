import { BRTUtils } from "../../core/utils.js";
import { StoryBuilder } from "./story-builder";
import { StoryChatCard } from "./story-chat-card.js";

export class BRTStoryHelpers {
  static async getStoryResults(tableEntity) {
    const storyBuilder = new StoryBuilder(tableEntity);
    await storyBuilder.drawStory();
    const storyHtml = storyBuilder.getGeneratedStory();
    const storyGMHtml = storyBuilder.getGeneratedStoryGM();
    return { storyHtml, storyGMHtml };
  }

  static async generateChatStory(tableEntity) {
    const storyBuilder = new StoryBuilder(tableEntity);
    await storyBuilder.drawStory();
    const storyHtml = storyBuilder.getGeneratedStory();
    const storyGMHtml = storyBuilder.getGeneratedStoryGM();
    // const storyChat = new StoryChatCard(tableEntity);
    // storyChat.createChatCardByText(storyHtml);
    // storyChat.createChatCardByText(storyGMHtml, { gmOnly: true });
    this.createChatCardByText(tableEntity, storyHtml);
    this.createChatCardByText(tableEntity, storyGMHtml, { gmOnly: true });
  }

  static async generateContentHtmlStory(tableEntity) {
    const storyBuilder = new StoryBuilder(tableEntity);
    await storyBuilder.drawStory();
    const storyHtml = storyBuilder.getGeneratedStory();
    return storyHtml;
  }

  static async generateContentGMHtmlStory(tableEntity) {
    const storyBuilder = new StoryBuilder(tableEntity);
    await storyBuilder.drawStory();
    const storyGMHtml = storyBuilder.getGeneratedStoryGM();
    return storyGMHtml;
  }

  /**
   * Create a chat card to display the story string
   * @param {string} story the html string of the story to display in chat
   * @param {Object} options set of options, if gmOnly = true then the card will be set to shown only to GM regardless of the chat preferences
   */
  static createChatCardByText(tableEntity, story, options = {}) {
    if (!story) {
      return;
    }
    // quickfix for textselection of stories
    story = '<div class="story-text-selectable">' + story + "</div>";

    const chatData = {
      flavor: tableEntity.name,
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
