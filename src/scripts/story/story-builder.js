import { StoryBoolCondition } from "./story-bool-condition.js";
import { BRTUtils } from "../core/utils.js";
import { error, log, warn } from "../lib.js";
import { CONSTANTS } from "../constants/constants.js";
import { BetterRollTable } from "../core/brt-table.js";

export class StoryBuilder {
  constructor(tableEntity) {
    let brtTable = new BetterRollTable(tableEntity, {});
    this.table = brtTable;
    /** the story tokens with the respective values, either pulled from a rolltable or rolled with a formula */
    this._storyTokens = {};
    /** string containing the story, to be replaced with the tokens */
    this._story = "";
    /** a story part that will only be showned to the GM */
    this._storyGm = "";
  }

  /**
   * Draw story from entity
   *
   */
  async drawStory() {
    await this.table.initialize();
    const draw = await this.table.drawMany(1, { displayChat: false });

    let journalContent, errorString;

    for (const entry of draw.results) {
      /** entity type 1 is when an entity in the world is linked */
      if (entry.type === CONST.TABLE_RESULT_TYPES.DOCUMENT && entry.documentCollection === "JournalEntry") {
        const storyJournal = game.journal.get(entry.documentId);
        if (storyJournal) {
          const pages = [...storyJournal.pages];
          journalContent = pages[0].text.content?.replaceAll("</p>", "</p>\n");
        } else {
          errorString = `Journal Entry ${entry.name} not found inside your world`;
        }
      } else if (entry.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
        /** entity type 2 is when an entity inside a compendium is linked */
        let nameEntry = getProperty(
          entry,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`
        )
          ? getProperty(entry, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`)
          : entry.text;
        const entity = await BRTUtils.findInCompendiumByName(entry.documentCollection, nameEntry);
        if (!entity) {
          errorString = `entity ${entry.text} not found in compendium ${entry.documentCollection}`;
        } else if (entity.documentCollection === "JournalEntry") {
          const pages = [...entity.pages];
          journalContent = pages[0].text.content?.replaceAll("</p>", "</p>\n");
        } else {
          errorString = "Only Journal entries are supported in the story generation as table results";
        }
      } else {
        errorString = "Only Journal entries are supported in the story generation as table results";
      }

      if (journalContent) {
        await this._parseStoryDefinition(journalContent);
      }

      if (errorString) {
        error(errorString, true);
      }
    }
    // log("this._storyTokens ", this._storyTokens);
    // log("story ", this._story);
  }

  /**
   *
   * @param {string} storyDefinition
   */
  async _parseStoryDefinition(storyDefinition) {
    const PARSE_MODE = {
      NONE: 0,
      DEFINITION: 1,
      STORY: 2,
      STORYGM: 3,
    };

    /** remove html spaces and replacing with a space */
    storyDefinition = storyDefinition.replace(/(&nbsp;|<br>)+/g, " ");
    //splt the content by lines
    let lines = storyDefinition.split(/\r\n|\r|\n/);
    //remove empty lines
    lines = lines.filter((line) => {
      let lineTmp = line;
      return lineTmp?.replaceAll("<p>", "")?.replaceAll("</p>", "").trim().length > 0;
    });

    let parseMode = PARSE_MODE.DEFINITION;

    for (const line of lines) {
      // log("LINE ", line);
      const sectionMatch = /.*#([a-zA-Z]+)/.exec(line);
      if (sectionMatch) {
        switch (sectionMatch[1].toLowerCase()) {
          case "story":
            parseMode = PARSE_MODE.STORY;
            break;
          case "storygm":
            parseMode = PARSE_MODE.STORYGM;
            break;
          case "definition":
            parseMode = PARSE_MODE.DEFINITION;
            break;
        }
      } else {
        if (parseMode === PARSE_MODE.STORY) {
          this._story += line;
        } else if (parseMode === PARSE_MODE.STORYGM) {
          this._storyGm += line;
        } else if (parseMode === PARSE_MODE.DEFINITION) {
          const matches = /\s*<p>(.+)\sas\s(.+)<\/p>/i.exec(line);
          if (matches) {
            await this._processDefinition(matches[1], matches[2]);
          }
        }
      }
    }
  }

  /**
   *
   * @param {*} defValue
   * @param {string} definitionName
   * @returns
   */
  async _processDefinition(defValue, definitionName) {
    // log("value ", defValue);

    const match = /{ *([^}]*?) *}/.exec(definitionName);
    if (!match) {
      error(`definition error, ${definitionName} is malformed. After keyword AS we expect a name in brackets {}`, true);
      return;
    }
    const definition = match[1];
    if (hasProperty(this._storyTokens, definition)) {
      log(`definition ${definition} is already defined, skipping line`);
      return;
    }

    // log("definition ", definition);
    const regexIF = /IF\s*\((.+)\)/;
    const ifMatch = regexIF.exec(defValue);
    let conditionMet = true;
    if (ifMatch) {
      const storyCondition = new StoryBoolCondition(defValue);
      conditionMet = storyCondition.evaluate();
    }

    if (!conditionMet) {
      return;
    }
    const regexTable = /\s*@(RollTable|Compendium)\[ *([^\]]*?) *\]/;
    const tableMatch = regexTable.exec(defValue);
    let valueResult;
    /** there is a table definition on the left of the AS */
    if (tableMatch) {
      /** if it's a compendium the match is 'tablename.id' if it's a rolltable the match is directly the id */

      const out = BRTUtils.separateIdComendiumName(tableMatch[2]);
      const tableId = out.nameOrId;
      const compendiumName = out.compendiumName;
      let table;
      if (compendiumName) {
        table = await BRTUtils.findInCompendiumById(compendiumName, tableId);
      } else {
        table = game.tables.get(tableId);
      }

      if (!table) {
        error(`table with id ${tableId} not found in the world, check the generation journal for broken links`, true);
        return;
      }
      let draw = await table.drawMany(1, { displayChat: false });
      if (!draw) {
        await table.resetResults();
        draw = await table.drawMany(1, { displayChat: false });
      }

      if (draw.results.length !== 1) {
        error(
          `0 or more than 1 result was drawn from table ${table.name}, only 1 result is supported check your table config`,
          true
        );
        return;
      }

      const tableResult = draw.results[0];
      if (tableResult.type !== 0) {
        warn(`only text result from table are supported at the moment, check table ${table.name}`, true);
      }
      valueResult = tableResult.text;
    } else {
      const regexRoll = /\s*\[\[ *([^\]]*?) *\]\]/;
      /** if no table match, lets check for a formula */
      const rollMatch = regexRoll.exec(defValue);
      if (rollMatch) {
        const rollFormula = rollMatch[1];
        try {
          valueResult = new Roll(rollFormula).roll({ async: false }).total || 0;
        } catch (e) {
          error(e.message, false, e);
          valueResult = 0;
        }
      } else {
        error("on the left side of the AS in a story definition a rolltable or rollformula must be provided", true);
      }
    }

    if (valueResult) {
      setProperty(this._storyTokens, definition, valueResult);
    }
  }

  getGeneratedStory() {
    return this._generateStory(this._story);
  }

  getGeneratedStoryGM() {
    return this._generateStory(this._storyGm);
  }

  /**
   * @param {*} story
   * @returns {string}
   */
  _generateStory(story) {
    if (!story) {
      warn(`No story is been passed in th correct format`, true);
      return story;
    }
    const regex = /{ *([^}]*?) *}/g;
    let replacedStory = story;
    let matches;

    while ((matches = regex.exec(story)) != null) {
      const value = getProperty(this._storyTokens, matches[1]);
      if (!value) {
        error(`cannot find a value for token ${matches[1]} in #story definition`, true);
        continue;
      }
      replacedStory = replacedStory.replace(matches[0], value);
    }
    return replacedStory;
  }
}
