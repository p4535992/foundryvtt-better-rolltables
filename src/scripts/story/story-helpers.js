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
    const storyChat = new StoryChatCard(tableEntity);
    storyChat.createChatCard(storyHtml);
    storyChat.createChatCard(storyGMHtml, { gmOnly: true });
  }
}
