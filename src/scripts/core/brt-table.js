import { CONSTANTS } from "../constants/constants.js";
import { isRealNumber } from "../lib/lib.js";
import { BRTBetterHelpers } from "../tables/better/brt-helper.js";
import { BRTUtils } from "./utils.js";
import { LootChatCard } from "../tables/loot/loot-chat-card.js";
import { StoryChatCard } from "../tables/story/story-chat-card.js";
import { HarvestChatCard } from "../tables/harvest/harvest-chat-card.js";
import { BetterChatCard } from "../tables/better/brt-chat-card.js";
import Logger from "../lib/Logger.js";
import { RetrieveHelpers } from "../lib/retrieve-helpers.js";

export class BetterRollTable {
  // extends RollTable {

  get rollMode() {
    return this.options.rollMode;
  }

  constructor(table, options) {
    this.table = table;
    this.options = mergeObject(
      {
        roll: null,
        results: [],
        recursive: true,
        displayChat: false,
        rollMode: null,
        _depth: 0,
      },
      options
    );
    this.mainRoll = undefined;
    this.blackListForDistinct = [];
  }

  async initialize() {
    let optionsTmp = await BRTUtils.updateOptions(this.table, this.options);
    this.options = mergeObject(
      {
        roll: null,
        results: [],
        recursive: true,
        displayChat: false,
        rollMode: null,
        _depth: 0,
      },
      optionsTmp
    );
    this.mainRoll = undefined;
  }

  /* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

  /**
   * Display a result drawn from a RollTable in the Chat Log along.
   * Optionally also display the Roll which produced the result and configure aspects of the displayed messages.
   *
   * @param {TableResult[]} results         An Array of one or more TableResult Documents which were drawn and should
   *                                        be displayed.
   * @param {object} [options={}]           Additional options which modify message creation
   * @param {Roll} [options.roll]                 An optional Roll instance which produced the drawn results
   * @param {Object} [options.messageData={}]     Additional data which customizes the created messages
   * @param {Object} [options.messageOptions={}]  Additional options which customize the created messages
   */
  async toMessage(results, { roll = null, messageData = {}, messageOptions = {} } = {}) {
    const speaker = ChatMessage.getSpeaker();

    // Construct chat data
    const flavorKey = `TABLE.DrawFlavor${results.length > 1 ? "Plural" : ""}`;
    messageData = foundry.utils.mergeObject(
      {
        flavor: game.i18n.format(flavorKey, { number: results.length, name: this.table.name }),
        user: game.user.id,
        speaker: speaker,
        type: roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.OTHER,
        roll: roll,
        sound: roll ? CONFIG.sounds.dice : null,
        flags: { "core.RollTable": this.table.id },
      },
      messageData
    );

    // // Render the chat card which combines the dice roll with the drawn results
    // // messageData.content = await renderTemplate(CONFIG.RollTable.resultTemplate, {
    // messageData.content = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/card/better-chat-card.hbs`, {
    //   description: await TextEditor.enrichHTML(this.table.description, { documents: true, async: true }),
    //   results: results.map((result) => {
    //     const r = result.toObject(false);
    //     r.text = result.getChatText();
    //     r.icon = result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`;
    //     return r;
    //   }),
    //   rollHTML: this.table.displayRoll && roll ? await roll.render() : null,
    //   table: this.table,
    // });

    // // Create the chat message
    // return ChatMessage.implementation.create(messageData, messageOptions);
    // const rollHTML = this.table.displayRoll && roll ? await roll.render() : null;
    let betterResults = results.map((result) => {
      const r = result.toObject(false);
      r.text = result.getChatText();
      r.icon = result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`;
      return r;
    });

    if (this.table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_BETTER) {
      const betterChatCard = new BetterChatCard(betterResults, this.rollMode, roll);
      await betterChatCard.createChatCard(this.table);
    } else if (this.table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_LOOT) {
      const currencyData = br.getCurrencyData();
      const lootChatCard = new LootChatCard(betterResults, currencyData, this.rollMode, roll);
      await lootChatCard.createChatCard(this.table);
    } else if (this.table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_STORY) {
      const storyChatCard = new StoryChatCard(betterResults, this.rollMode, roll);
      await storyChatCard.createChatCard(this.table);
    } else if (
      this.table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_HARVEST
    ) {
      const harvestChatCard = new HarvestChatCard(betterResults, this.rollMode, roll);
      await harvestChatCard.createChatCard(this.table);
    } else {
      // Render the chat card which combines the dice roll with the drawn results
      messageData.content = await renderTemplate(CONFIG.RollTable.resultTemplate, {
        // messageData.content = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/card/better-chat-card.hbs`, {
        description: await TextEditor.enrichHTML(this.table.description, { documents: true, async: true }),
        results: results.map((result) => {
          const r = result.toObject(false);
          r.text = result.getChatText();
          r.icon = result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`;
          return r;
        }),
        rollHTML: this.table.displayRoll && roll ? await roll.render() : null,
        table: this.table,
      });

      // Create the chat message
      return ChatMessage.implementation.create(messageData, messageOptions);
    }
  }

  /* -------------------------------------------- */

  /**
   * Draw a result from the RollTable based on the table formula or a provided Roll instance
   * @param {object} [options={}]         Optional arguments which customize the draw behavior
   * @param {Roll} [options.roll]                   An existing Roll instance to use for drawing from the table
   * @param {boolean} [options.recursive=true]      Allow drawing recursively from inner RollTable results
   * @param {TableResult[]} [options.results]       One or more table results which have been drawn
   * @param {boolean} [options.displayChat=true]    Whether to automatically display the results in chat
   * @param {string} [options.rollMode]             The chat roll mode to use when displaying the result
   * @returns {Promise<{RollTableDraw}>}  A Promise which resolves to an object containing the executed roll and the
   *                                      produced results.
   */
  async draw({ roll, recursive = true, results = [], displayChat = true, rollMode } = {}) {
    const draw = await this.table.draw({ roll, recursive, results, displayChat: false, rollMode });

    let newResults = [];
    for (let i = 0; i < draw.results.length; i++) {
      const r = draw.results[i];

      let formulaAmount = "";
      if (hasProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`)) {
        formulaAmount =
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`) || "";
      } else {
        formulaAmount =
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.RESULTS_FORMULA_KEY_FORMULA}`) || "";
      }
      if (r.type === CONST.TABLE_RESULT_TYPES.TEXT) {
        formulaAmount = "";
      }
      const qtFormula = await BRTBetterHelpers.tryRoll(formulaAmount);

      if (qtFormula == null || qtFormula === "" || qtFormula === "1") {
        newResults.push(r);
      } else {
        const qtRoll = Roll.create(qtFormula);
        const qt = (await qtRoll.evaluate({ async: true })).total;
        Logger.log(qt);
        newResults = newResults.concat(Array(qt).fill(r));
      }
    }
    draw.results = newResults;

    Logger.log(draw);

    // Forward drawn results to create chat messages
    if (displayChat) {
      await this.toMessage(draw.results, {
        roll: roll,
        messageOptions: { rollMode },
      });
    }
    Logger.log(`Draw results:`, false, draw.results);
    return draw;
  }

  /* -------------------------------------------- */

  /**
   * Draw multiple results from a RollTable, constructing a final synthetic Roll as a dice pool of inner rolls.
   * @param {number} number               The number of results to draw
   * @param {object} [options={}]         Optional arguments which customize the draw
   * @param {Roll} [options.roll]                   An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true]      Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true]    Automatically display the drawn results in chat? Default is true
   * @param {string} [options.rollMode]             Customize the roll mode used to display the drawn results
   * @returns {Promise<{RollTableDraw}>}  The drawn results
   */
  async drawMany(number, { roll = null, recursive = true, displayChat = false, rollMode = null, _depth = 0 } = {}) {
    let results = [];
    let updates = [];
    const rolls = [];

    // Roll the requested number of times, marking results as drawn
    for (let n = 0; n < number; n++) {
      let draw = await this.roll({ roll, recursive, _depth });
      if (draw.results.length) {
        rolls.push(draw.roll);
        results = results.concat(draw.results);
      } else break;

      // Mark results as drawn, if replacement is not used, and we are not in a Compendium pack
      if (!this.table.replacement && !this.table.pack) {
        updates = updates.concat(
          draw.results.map((r) => {
            r.drawn = true;
            return { _id: r.id, drawn: true };
          })
        );
      }
    }

    // Construct a Roll object using the constructed pool
    const pool = PoolTerm.fromRolls(rolls);
    roll = Roll.defaultImplementation.fromTerms([pool]);

    // Commit updates to child results
    if (updates.length) {
      await this.table.updateEmbeddedDocuments("TableResult", updates, { diff: false });
    }

    // PATCH SET FLAG FOR HIDDEN RESULT
    const isTableHidden = getProperty(this.table, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`);
    const isShowHiddenResultOnChat = getProperty(
      this.table,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_SHOW_HIDDEN_RESULT_ON_CHAT}`
    );
    results.map((r) => {
      if (
        isTableHidden ||
        String(getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`)) === "true"
      ) {
        setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`, true);
      } else {
        setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`, false);
      }
      if (
        isShowHiddenResultOnChat ||
        String(
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`)
        ) === "true"
      ) {
        setProperty(
          r,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`,
          true
        );
      } else {
        setProperty(
          r,
          `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`,
          false
        );
      }
      return r;
    });

    // Forward drawn results to create chat messages
    if (displayChat && results.length) {
      await this.toMessage(results, {
        roll: roll,
        messageOptions: { rollMode },
      });
    }

    // Return the Roll and the array of results
    return { roll, results };
  }

  /* -------------------------------------------- */

  // /**
  //  * Normalize the probabilities of rolling each item in the RollTable based on their assigned weights
  //  * @returns {Promise<RollTable>}
  //  */
  // async normalize() {
  //   let totalWeight = 0;
  //   let counter = 1;
  //   const updates = [];
  //   for (let result of this.table.results) {
  //     const w = result.weight ?? 1;
  //     totalWeight += w;
  //     updates.push({ _id: result.id, range: [counter, counter + w - 1] });
  //     counter = counter + w;
  //   }
  //   return this.table.update({ results: updates, formula: `1d${totalWeight}` });
  // }

  /* -------------------------------------------- */

  // /**
  //  * Reset the state of the RollTable to return any drawn items to the table
  //  * @returns {Promise<RollTable>}
  //  */
  // async resetResults() {
  //   const updates = this.table.results.map((result) => ({ _id: result.id, drawn: false }));
  //   return this.table.updateEmbeddedDocuments("TableResult", updates, { diff: false });
  // }

  /* -------------------------------------------- */

  /**
   * Evaluate a RollTable by rolling its formula and retrieving a drawn result.
   *
   * Note that this function only performs the roll and identifies the result, the RollTable#draw function should be
   * called to formalize the draw from the table.
   *
   * @param {object} [options={}]       Options which modify rolling behavior
   * @param {Roll} [options.roll]                   An alternative dice Roll to use instead of the default table formula
   * @param {boolean} [options.recursive=true]   If a RollTable document is drawn as a result, recursively roll it
   * @param {number} [options._depth]            An internal flag used to track recursion depth
   * @returns {Promise<RollTableDraw>}  The Roll and results drawn by that Roll
   *
   * @example Draw results using the default table formula
   * ```js
   * const defaultResults = await table.roll();
   * ```
   *
   * @example Draw results using a custom roll formula
   * ```js
   * const roll = new Roll("1d20 + @abilities.wis.mod", actor.getRollData());
   * const customResults = await table.roll({roll});
   * ```
   */
  async roll({ roll, recursive = true, _depth = 0 } = {}) {
    // Prevent excessive recursion
    if (_depth > 5) {
      throw Logger.error(`Maximum recursion depth exceeded when attempting to draw from RollTable ${this.table.id}`);
    }

    // If there is no formula, automatically calculate an even distribution
    if (!this.table.formula) {
      await this.table.normalize();
    }

    // Reference the provided roll formula
    // roll = roll instanceof Roll ? roll : Roll.create(this.table.formula);
    let results = [];

    // // Ensure that at least one non-drawn result remains
    // const available = this.table.results.filter((r) => !r.drawn);
    // if (!available.length) {
    //   Logger.warn(game.i18n.localize("TABLE.NoAvailableResults"), true);
    //   return { roll, results };
    // }

    if (this.options.usePercentage) {
      // Reference the provided roll formula
      roll = Roll.create(`1d1000`);

      // Ensure that at least one non-drawn result remains
      const available = this.table.results.filter((r) => !r.drawn);
      if (!available.length) {
        Logger.warn(game.i18n.localize("TABLE.NoAvailableResults"), true);
        return { roll, results };
      }

      // Ensure that results are available within the minimum/maximum range
      const minRoll = 10;
      const maxRoll = 1000;
      const availableRange = available.reduce(
        (range, result) => {
          const percentageValueLFlag =
            getProperty(
              result,
              `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_PERCENTAGE_LOW_VALUE}`
            ) ?? null;
          let percentageValueLTmp = isRealNumber(percentageValueLFlag) ? percentageValueLFlag : 0;
          percentageValueLTmp = percentageValueLTmp * 10;

          const percentageValueHFlag =
            getProperty(
              result,
              `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_PERCENTAGE_HIGH_VALUE}`
            ) ?? null;
          let percentageValueHTmp = isRealNumber(percentageValueHFlag) ? percentageValueHFlag : 100;
          percentageValueHTmp = percentageValueHTmp * 10;

          const r = [percentageValueLTmp, percentageValueHTmp];
          if (!range[0] || r[0] < range[0]) range[0] = r[0];
          if (!range[1] || r[1] > range[1]) range[1] = r[1];
          return range;
        },
        [null, null]
      );
      if (availableRange[0] > maxRoll || availableRange[1] < minRoll) {
        // Logger.warn("No results can possibly be drawn from this table and formula.", true);
        return { roll, results };
      }

      roll = await roll.reroll({ async: true });
      // results = this.getResultsForRoll(roll.total);
      let resultsTmp = this.getResultsForRoll(roll.total);
      if (resultsTmp?.length > 0) {
        let resultTmp = resultsTmp[Math.floor(Math.random() * resultsTmp.length)];
        results = [resultTmp];
      }
    } else {
      if (this.options.roll) {
        roll = this.options.roll instanceof Roll ? this.options.roll : Roll.create(this.options.roll);
      }
      // Reference the provided roll formula
      roll = roll instanceof Roll ? roll : Roll.create(this.table.formula);

      // Ensure that at least one non-drawn result remains
      const available = this.table.results.filter((r) => !r.drawn);
      if (!available.length) {
        Logger.warn(game.i18n.localize("TABLE.NoAvailableResults"), true);
        return { roll, results };
      }
      // Ensure that results are available within the minimum/maximum range
      const minRoll = (await roll.reroll({ minimize: true, async: true })).total;
      const maxRoll = (await roll.reroll({ maximize: true, async: true })).total;
      const availableRange = available.reduce(
        (range, result) => {
          const r = result.range;
          if (!range[0] || r[0] < range[0]) range[0] = r[0];
          if (!range[1] || r[1] > range[1]) range[1] = r[1];
          return range;
        },
        [null, null]
      );
      if (availableRange[0] > maxRoll || availableRange[1] < minRoll) {
        Logger.warn("No results can possibly be drawn from this table and formula.", true);
        return { roll, results };
      }

      // Continue rolling until one or more results are recovered
      let iter = 0;
      while (!results.length) {
        if (iter >= 10000) {
          // START PATCH DISTINCT VALUES
          const isTableDistinct = getProperty(
            this.table,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT}`
          );
          const isTableDistinctKeepRolling = getProperty(
            this.table,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT_KEEP_ROLLING}`
          );
          if (isTableDistinct && !isTableDistinctKeepRolling) {
            // Failed to draw an available entry from Table ${this.table.name}, maximum iteration reached, but is ok because is under the 'distinct' behavior
          } else {
            Logger.error(
              `Failed to draw an available entry from Table ${this.table.name}, maximum iteration reached`,
              true
            );
          }
          // END PATCH
          // Logger.error(
          //   `Failed to draw an available entry from Table ${this.table.name}, maximum iteration reached`, true
          // );
          break;
        }
        roll = await roll.reroll({ async: true });
        results = this.getResultsForRoll(roll.total);
        iter++;
      }
    }

    // Draw results recursively from any inner Roll Tables
    if (recursive) {
      let inner = [];
      for (let result of results) {
        let formulaAmount = "";
        if (hasProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`)) {
          formulaAmount =
            getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`) || "";
        } else {
          formulaAmount =
            getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.RESULTS_FORMULA_KEY_FORMULA}`) || "";
        }

        if (result.type === CONST.TABLE_RESULT_TYPES.TEXT) {
          formulaAmount = "";
        }
        const resultAmount = await BRTBetterHelpers.tryRoll(formulaAmount);

        let pack;
        let documentName;
        if (result.type === CONST.TABLE_RESULT_TYPES.DOCUMENT) documentName = result.documentCollection;
        else if (result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
          pack = await RetrieveHelpers.getCompendiumCollectionAsync(result.documentCollection, false, false);
          documentName = pack?.documentName;
        }
        if (documentName === "RollTable") {
          const id = result.documentId;
          const innerTable = pack ? await pack.getDocument(id) : RetrieveHelpers.getRollTableSync(id, true);
          if (innerTable) {
            const innerOptions = this.options;
            const brtInnerTable = new BetterRollTable(innerTable, innerOptions);
            await brtInnerTable.initialize();
            const innerRoll = await brtInnerTable.drawMany(resultAmount, {
              roll: formulaAmount,
              recursive: true,
              displayChat: false,
              rollMode: "gmroll",
              _depth: _depth + 1,
            });
            inner = inner.concat(innerRoll.results);
          }
        } else inner.push(result);
      }
      results = inner;
    }

    // Return the Roll and the results
    return { roll, results };
  }

  /* -------------------------------------------- */

  /**
   * Get an Array of valid results for a given rolled total
   * @param {number} value    The rolled value
   * @returns {TableResult[]} An Array of results
   */
  getResultsForRoll(value) {
    // return this.table.results.filter((r) => !r.drawn && Number.between(value, ...r.range));
    let dc = this.options.dc || undefined;
    let skill = this.options.skill || undefined;

    //  let resultsUpdate = this.table.results.filter((r) => !r.drawn && Number.between(value, ...r.range));
    // START PATCH USE PERCENTAGE
    let resultsUpdate = [];
    if (this.options.usePercentage) {
      resultsUpdate = this.table.results.filter((r) => {
        const percentageValueLFlag =
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_PERCENTAGE_LOW_VALUE}`) ?? null;
        let percentageValueLTmp = isRealNumber(percentageValueLFlag) ? percentageValueLFlag : 0;
        percentageValueLTmp = percentageValueLTmp * 10;

        const percentageValueHFlag =
          getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_PERCENTAGE_HIGH_VALUE}`) ??
          null;
        let percentageValueHTmp = isRealNumber(percentageValueHFlag) ? percentageValueHFlag : 100;
        percentageValueHTmp = percentageValueHTmp * 10;
        return !r.drawn && Number.between(value, percentageValueLTmp, percentageValueHTmp, true);
      });
    } else {
      resultsUpdate = this.table.results.filter((r) => {
        return !r.drawn && Number.between(value, ...r.range);
      });
    }

    if (this.table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_HARVEST) {
      // Filter by dc
      if (isRealNumber(dc) && parseInt(dc) > 0) {
        resultsUpdate = resultsUpdate.filter((r) => {
          return getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_DC_VALUE_KEY}`) <= parseInt(dc);
        });
      }
      // Filter by skill
      if (skill) {
        resultsUpdate = resultsUpdate.filter((r) => {
          return getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) === skill;
        });
      }
    }

    // START PATCH DISTINCT VALUES
    const isTableDistinct = getProperty(
      this.table,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT}`
    );
    const isTableDistinctKeepRolling = getProperty(
      this.table,
      `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT_KEEP_ROLLING}`
    );

    const available = this.table.results.filter((r) => !r.drawn);

    if (isTableDistinct) {
      resultsUpdate = resultsUpdate.filter((r) => {
        const blackId = this.table.uuid + "|" + r.id;
        if (this.blackListForDistinct.includes(blackId)) {
          if (this.blackListForDistinct.length >= available.length) {
            if (isTableDistinctKeepRolling) {
              return true;
            }
          }
          return false;
        } else {
          this.blackListForDistinct.push(blackId);
          return true;
        }
      });
    }
    // END PATCH

    return resultsUpdate;
  }

  /* -------------------------------------------- */
  /*  Event Handlers                              */
  /* -------------------------------------------- */

  // /** @inheritdoc */
  // _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
  //   this.table.table._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
  //   if (options.render !== false) this.table.collection.render();
  // }

  /* -------------------------------------------- */

  // /** @inheritdoc */
  // _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
  //   this.table.table._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
  //   if (options.render !== false) this.table.collection.render();
  // }

  /* -------------------------------------------- */
  /*  Importing and Exporting                     */
  /* -------------------------------------------- */

  // /** @override */
  // toCompendium(pack, options = {}) {
  //   const data = this.table.toCompendium(pack, options);
  //   if (options.clearState) {
  //     for (let r of data.results) {
  //       r.drawn = false;
  //     }
  //   }
  //   return data;
  // }

  /* -------------------------------------------- */

  /**
   * Create a new RollTable document using all of the Documents from a specific Folder as new results.
   * @param {Folder} folder       The Folder document from which to create a roll table
   * @param {object} options      Additional options passed to the RollTable.create method
   * @returns {Promise<RollTable>}
   */
  static async fromFolder(folder, options = {}) {
    const results = folder.contents.map((e, i) => {
      return {
        text: e.name,
        type: folder.pack ? CONST.TABLE_RESULT_TYPES.COMPENDIUM : CONST.TABLE_RESULT_TYPES.DOCUMENT,
        documentCollection: folder.pack ? folder.pack : folder.type,
        documentId: e.id,
        img: e.thumbnail || e.img,
        weight: 1,
        range: [i + 1, i + 1],
        drawn: false,
      };
    });
    options.renderSheet = options.renderSheet ?? true;
    return this.create(
      {
        name: folder.name,
        description: `A random table created from the contents of the ${folder.name} Folder.`,
        results: results,
        formula: `1d${results.length}`,
      },
      options
    );
  }

  /* -------------------------------------------- */
  /*  Methods BRT                                   */
  /* -------------------------------------------- */

  /**
   * @param {number} rollsAmount               The number of results to draw
   *
   * @returns {Promise<RollTableDraw>}  The Roll and results drawn by that Roll
   */
  async betterRoll(rollsAmount = null) {
    const amount = rollsAmount
      ? await BRTBetterHelpers.tryRoll(rollsAmount)
      : this.options?.customRoll ?? this.options?.rollsAmount;

    this.mainRoll = undefined;
    // TODO add this setting to the API ??? (DONE ?)
    const firstResults = {
      roll: this.options.roll,
      recursive: this.options.recursive,
      displayChat: this.options.displayChat,
      _depth: 0,
    };
    let resultsBrt = await this.rollManyOnTable(amount, firstResults);
    // Patch add uuid to every each result for better module compatibility
    let resultsTmp = [];
    for (const r of resultsBrt?.results ?? []) {
      let rTmp = r;
      if (rTmp.type !== CONST.TABLE_RESULT_TYPES.TEXT) {
        let rDoc = await BRTBetterHelpers.retrieveDocumentFromResultOnlyUuid(r, false);
        if (!rDoc || !rDoc.uuid) {
          Logger.warn(`Cannot find document for result`, false, r);
          if (!rDoc) {
            rDoc = {};
          }
        }
        if (!getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`) && rDoc.uuid) {
          setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`, rDoc.uuid ?? "");
        }
      }
      resultsTmp.push(rTmp);
    }

    this.results = resultsTmp;
    return {
      roll: this.mainRoll,
      results: this.results,
    };
  }

  /**
   *
   * @param {array} results
   */
  async createChatCard(results, rollMode = null) {
    let msgData = { roll: this.mainRoll, messageData: {} };
    let rollModeToUse = rollMode ? rollMode : this.options.rollMode;
    BRTUtils.addRollModeToChatData(msgData.messageData, rollModeToUse);
    await this.toMessage(results, msgData);
  }

  /**
   * Draw multiple results from a RollTable, constructing a final synthetic Roll as a dice pool of inner rolls.
   * @param {amount} amount               The number of results to draw
   * @param {object} [options={}]         Optional arguments which customize the draw
   * @param {Roll} [options.roll]                   An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true]      Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=false]    Automatically display the drawn results in chat? Default is false for brt (is true on standard)
   * @param {number} [options._depth]  The rolls amount value
   *
   * @returns {Promise<RollTableDraw>}  The Roll and results drawn by that Roll
   */
  async rollManyOnTable(amount, { roll = null, recursive = true, displayChat = false, _depth = 0 } = {}) {
    let options = mergeObject(this.options, {
      roll: roll,
      recursive: recursive,
      displayChat: displayChat,
      _depth: _depth,
    });

    const maxRecursions = 5;
    // Prevent infinite recursion
    if (_depth > maxRecursions) {
      let msg = game.i18n.format(`${CONSTANTS.MODULE_ID}.Strings.Warnings.MaxRecursion`, {
        maxRecursions: maxRecursions,
        tableId: this.table.id,
      });
      throw Logger.error(msg);
    }

    let drawnResults = [];

    while (amount > 0) {
      let resultToDraw = amount;
      // if we draw without replacement we need to reset the table once all entries are drawn
      if (!this.table.replacement) {
        const resultsLeft = this.table.results.reduce(function (n, r) {
          return n + !r.drawn;
        }, 0);

        if (resultsLeft === 0) {
          await this.table.resetResults();
          continue;
        }

        resultToDraw = Math.min(resultsLeft, amount);
      }

      if (!this.table.formula) {
        let msg = game.i18n.format(`${CONSTANTS.MODULE_ID}.RollTable.NoFormula`, {
          name: this.table.name,
        });
        Logger.error(msg, true);
        return;
      }

      // TODO understand why there is this behaviour with the percentage feature
      let draw = {};
      if (this.options.usePercentage) {
        draw = await this.drawMany(1, {
          roll: roll,
          recursive: recursive,
          displayChat: false,
          rollMode: "gmroll",
        });
      } else {
        draw = await this.drawMany(amount, {
          roll: roll,
          recursive: recursive,
          displayChat: false,
          rollMode: "gmroll",
        });
      }

      if (!this.mainRoll) {
        this.mainRoll = draw.roll;
      }

      for (const entry of draw.results) {
        let formulaAmount = "";
        if (hasProperty(entry, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`)) {
          formulaAmount =
            getProperty(entry, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_QUANTITY}`) || "";
        } else {
          formulaAmount =
            getProperty(entry, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.RESULTS_FORMULA_KEY_FORMULA}`) || "";
        }

        if (entry.type === CONST.TABLE_RESULT_TYPES.TEXT) {
          formulaAmount = "";
        }
        const entryAmount = await BRTBetterHelpers.tryRoll(formulaAmount);

        let innerTable;
        if (entry.type === CONST.TABLE_RESULT_TYPES.DOCUMENT && entry.documentCollection === "RollTable") {
          innerTable = RetrieveHelpers.getRollTableSync(entry.documentId, true);
        } else if (entry.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
          const entityInCompendium = await BRTUtils.findInCompendiumByName(entry.documentCollection, entry.text);
          if (entityInCompendium !== undefined && entityInCompendium.documentName === "RollTable") {
            innerTable = entityInCompendium;
          }
        }

        if (innerTable) {
          const innerOptions = options;
          const innerBrtTable = new BetterRollTable(innerTable, innerOptions);
          await innerBrtTable.initialize();
          const innerResults = await innerBrtTable.rollManyOnTable(entryAmount, {
            roll: roll,
            recursive: recursive,
            displayChat: false,
            _depth: _depth + 1,
          });
          drawnResults = drawnResults.concat(innerResults);
        } else {
          drawnResults = drawnResults.concat(Array(entryAmount).fill(entry));
        }
      }
      if (this.options.usePercentage) {
        if (draw.results?.length > 0) {
          amount -= draw.results?.length;
        } else {
          amount -= 1;
        }
      } else {
        amount -= resultToDraw ?? 1;
      }
    }

    let resultsTmp = [];

    for (const r of drawnResults ?? []) {
      let rTmp = r;
      if (rTmp.type !== CONST.TABLE_RESULT_TYPES.TEXT) {
        // Patch add uuid to every each result for better module compatibility
        let rDoc = await BRTBetterHelpers.retrieveDocumentFromResultOnlyUuid(r, false);
        if (!rDoc || !rDoc.uuid) {
          Logger.warn(`Cannot find document for result`, false, r);
          if (!rDoc) {
            rDoc = {};
          }
        }
        if (!getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`) && rDoc.uuid) {
          setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`, rDoc.uuid ?? "");
        }
        setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`, r.text);
        if (
          getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`) &&
          getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`) !== r.text
        ) {
          // setProperty(
          //   rTmp,
          //   `text`,
          //   getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)
          // );
          // setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`, rTmp.text);
        }
        setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_ICON}`, r.icon);
        if (
          getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`) &&
          getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`) !== r.icon
        ) {
          // setProperty(
          //   rTmp,
          //   `icon`,
          //   getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)
          // );
          // setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`, rTmp.icon);
        }
      }

      // REMOVED 2024-03-03
      // if (
      //   getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`) &&
      //   getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`) !== r.icon
      // ) {
      //   // setProperty(
      //   //   rTmp,
      //   //   `icon`,
      //   //   getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)
      //   // );
      //   // setProperty(rTmp,`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`, rTmp.icon);
      // }

      resultsTmp.push(rTmp);
    }

    return {
      roll: this.mainRoll,
      results: resultsTmp,
    };
  }

  // /**
  //  * Evaluate a RollTable by rolling its formula and retrieving a drawn result.
  //  *
  //  * Note that this function only performs the roll and identifies the result, the RollTable#draw function should be
  //  * called to formalize the draw from the table.
  //  *
  //  * @param {object} [options={}]       Options which modify rolling behavior
  //  * @param {Roll} [options.roll]                   An alternative dice Roll to use instead of the default table formula
  //  * @param {boolean} [options.recursive=true]   If a RollTable document is drawn as a result, recursively roll it
  //  * @param {number} [options._depth]            An internal flag used to track recursion depth
  //  *
  //  * @returns {Promise<RollTableDraw>}  The Roll and results drawn by that Roll
  //  *
  //  * @example Draw results using the default table formula
  //  * ```js
  //  * const defaultResults = await table.roll();
  //  * ```
  //  *
  //  * @example Draw results using a custom roll formula
  //  * ```js
  //  * const roll = new Roll("1d20 + @abilities.wis.mod", actor.getRollData());
  //  * const customResults = await table.roll({roll});
  //  * ```
  //  */
  // async roll({ roll = null, recursive = true, displayChat = false, _depth = 0 } = {}) {
  //   let resultsBrt = await this.rollManyOnTable(1, { roll, recursive, displayChat, _depth });
  //   // Patch add uuid to every each result for better module compatibility
  //   let resultsTmp = [];
  //   for (const r of resultsBrt?.results ?? []) {
  //     let rTmp = r;
  //     if (rTmp.type !== CONST.TABLE_RESULT_TYPES.TEXT) {
  //       let rDoc = await BRTBetterHelpers.retrieveDocumentFromResultOnlyUuid(r, false);
  //      if(!rDoc || !rDoc.uuid) {
  //        Logger.warn(`Cannot find document for result`, false, r);
  //        if(!rDoc) {
  //          rDoc = {};
  //        }
  //      }
  //       if (!getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`) && rDoc.uuid) {
  //         setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`, rDoc.uuid ?? "");
  //       }
  //     }
  //     resultsTmp.push(rTmp);
  //   }
  //   return {
  //     roll: resultsBrt.roll,
  //     results: resultsTmp,
  //   };
  // }
}
