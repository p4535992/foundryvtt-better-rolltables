import { CONSTANTS } from "../constants/constants.js";
import { log } from "../lib.js";
import { BRTBetterHelpers } from "../better/brt-helper.js";
import { BRTCONFIG } from "./config.js";
import { BRTUtils } from "./utils.js";

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

    // Render the chat card which combines the dice roll with the drawn results
    // messageData.content = await renderTemplate(CONFIG.RollTable.resultTemplate, {
    messageData.content = await renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/card/better-chat-card.hbs`, {
      description: await TextEditor.enrichHTML(this.table.description, { documents: true, async: true }),
      results: results.map((result) => {
        const r = result.toObject(false);
        r.text = result.getChatText();
        r.icon = result.icon;
        return r;
      }),
      rollHTML: this.table.displayRoll && roll ? await roll.render() : null,
      table: this.table,
    });

    // Create the chat message
    return ChatMessage.implementation.create(messageData, messageOptions);
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

      let formulaAmount = getProperty(r, `flags.${BRTCONFIG.NAMESPACE}.${BRTCONFIG.RESULTS_FORMULA_KEY_FORMULA}`) || "";

      if (r.type === CONST.TABLE_RESULT_TYPES.TEXT) {
        formulaAmount = "";
      }
      const qtFormula = await BRTBetterHelpers.tryRoll(formulaAmount);

      if (qtFormula == null || qtFormula === "" || qtFormula === "1") {
        newResults.push(r);
      } else {
        const qtRoll = Roll.create(qtFormula);
        const qt = (await qtRoll.evaluate({ async: true })).total;
        log(qt);
        newResults = newResults.concat(Array(qt).fill(r));
      }
    }
    draw.results = newResults;

    log(draw);

    // Forward drawn results to create chat messages
    if (displayChat) {
      await this.toMessage(draw.results, {
        roll: roll,
        messageOptions: { rollMode },
      });
    }
    console.log(draw.results);
    return draw;
  }

  /* -------------------------------------------- */

  /**
   * Draw multiple results from a RollTable, constructing a final synthetic Roll as a dice pool of inner rolls.
   * @param {number} number               The number of results to draw
   * @param {object} [options={}]         Optional arguments which customize the draw
   * @param {Roll} [options.roll]                   An optional pre-configured Roll instance which defines the dice
   *                                                roll to use
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
    results.map((r) => {
      if (
        isTableHidden ||
        String(getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`)) === "true"
      ) {
        setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`, true);
      } else {
        setProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`, false);
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
      throw new Error(`Maximum recursion depth exceeded when attempting to draw from RollTable ${this.table.id}`);
    }

    // If there is no formula, automatically calculate an even distribution
    if (!this.table.formula) {
      await this.table.normalize();
    }

    // Reference the provided roll formula
    roll = roll instanceof Roll ? roll : Roll.create(this.table.formula);
    let results = [];

    // Ensure that at least one non-drawn result remains
    const available = this.table.results.filter((r) => !r.drawn);
    if (!available.length) {
      ui.notifications.warn(game.i18n.localize("TABLE.NoAvailableResults"));
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
      ui.notifications.warn("No results can possibly be drawn from this table and formula.");
      return { roll, results };
    }

    // Continue rolling until one or more results are recovered
    let iter = 0;
    while (!results.length) {
      if (iter >= 10000) {
        ui.notifications.error(
          `Failed to draw an available entry from Table ${this.table.name}, maximum iteration reached`
        );
        break;
      }
      roll = await roll.reroll({ async: true });
      results = this.getResultsForRoll(roll.total);
      iter++;
    }

    // Draw results recursively from any inner Roll Tables
    if (recursive) {
      let inner = [];
      for (let result of results) {
        let formulaAmount =
          getProperty(result, `flags.${BRTCONFIG.NAMESPACE}.${BRTCONFIG.RESULTS_FORMULA_KEY_FORMULA}`) || "";

        if (result.type === CONST.TABLE_RESULT_TYPES.TEXT) {
          formulaAmount = "";
        }
        const resultAmount = await BRTBetterHelpers.tryRoll(formulaAmount);

        let pack;
        let documentName;
        if (result.type === CONST.TABLE_RESULT_TYPES.DOCUMENT) documentName = result.documentCollection;
        else if (result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
          pack = game.packs.get(result.documentCollection);
          documentName = pack?.documentName;
        }
        if (documentName === "RollTable") {
          const id = result.documentId;
          const innerTable = pack ? await pack.getDocument(id) : game.tables.get(id);
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
    let resultsUpdate = this.table.results.filter((r) => !r.drawn && Number.between(value, ...r.range));

    if (this.table.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) === CONSTANTS.TABLE_TYPE_HARVEST) {
      // Filter by dc
      if (dc && parseInt(dc) > 0) {
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

    let resultsBrt = await this.rollManyOnTable(amount);
    // Patch add uuid to every each result for better module compatibility
    let resultsTmp = [];
    for (const r of resultsBrt?.results ?? []) {
      let rTmp = r;
      if (rTmp.type !== CONST.TABLE_RESULT_TYPES.TEXT) {
        let rDoc = await BRTBetterHelpers.retrieveDocumentFromResultOnlyUuid(r, false);
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
   * @param {RollTable} table             The rollTable object
   * @param {object} [options={}]         Optional arguments which customize the draw
   * @param {Roll} [options.roll]                   An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true]      Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=false]    Automatically display the drawn results in chat? Default is true
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
      let msg = game.i18n.format(`${BRTCONFIG.NAMESPACE}.Strings.Warnings.MaxRecursion`, {
        maxRecursions: maxRecursions,
        tableId: this.table.id,
      });
      throw new Error(CONSTANTS.MODULE_ID + " | " + msg);
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
        let msg = game.i18n.format(`${BRTCONFIG.NAMESPACE}.RollTable.NoFormula`, {
          name: this.table.name,
        });
        ui.notifications.error(CONSTANTS.MODULE_ID + " | " + msg);
        return;
      }

      // let brtTable = new BetterRollTable(this.table, options);
      // await brtTable.initialize();
      // const draw = await brtTable.drawMany(amount, {
      //   roll: roll,
      //   recursive: recursive,
      //   displayChat: false,
      //   rollMode: "gmroll",
      // });
      const draw = await this.drawMany(amount, {
        roll: roll,
        recursive: recursive,
        displayChat: false,
        rollMode: "gmroll",
      });
      if (!this.mainRoll) {
        this.mainRoll = draw.roll;
      }

      for (const entry of draw.results) {
        let formulaAmount =
          getProperty(entry, `flags.${BRTCONFIG.NAMESPACE}.${BRTCONFIG.RESULTS_FORMULA_KEY_FORMULA}`) || "";

        if (entry.type === CONST.TABLE_RESULT_TYPES.TEXT) {
          formulaAmount = "";
        }
        const entryAmount = await BRTBetterHelpers.tryRoll(formulaAmount);

        let innerTable;
        if (entry.type === CONST.TABLE_RESULT_TYPES.DOCUMENT && entry.documentCollection === "RollTable") {
          innerTable = game.tables.get(entry.documentId);
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
      amount -= resultToDraw;
    }

    let resultsTmp = [];

    for (const r of drawnResults ?? []) {
      let rTmp = r;
      if (rTmp.type !== CONST.TABLE_RESULT_TYPES.TEXT) {
        // Patch add uuid to every each result for better module compatibility
        let rDoc = await BRTBetterHelpers.retrieveDocumentFromResultOnlyUuid(r, false);
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
      }

      if (
        getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`) &&
        getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`) !== r.icon
      ) {
        // setProperty(
        //   rTmp,
        //   `icon`,
        //   getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)
        // );
        // setProperty(rTmp,`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`, rTmp.icon);
      }

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
