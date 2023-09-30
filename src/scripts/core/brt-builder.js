import { BRTCONFIG } from "./config.js";
import { BRTUtils } from "../core/utils.js";
import { CONSTANTS } from "../constants/constants.js";
import { BRTBetterHelpers } from "./brt-helper.js";
import { BetterRollTable } from "./brt-table.js";

export class BRTBuilder {
  constructor(tableEntity) {
    this.table = tableEntity;
  }

  /**
   *
   * @param {*} rollsAmount
   * @returns {array} results
   */
  async betterRoll(options) {
    let rollsAmount = options?.rollsAmount || (await BRTBetterHelpers.rollsAmount(this.table)) || undefined;
    let dc =
      options?.dc ||
      getProperty(this.table, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_DC_VALUE_KEY}`) ||
      undefined;
    let skill =
      options?.skill ||
      getProperty(this.table, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) ||
      undefined;

    this.mainRoll = undefined;

    let resultsBrt = await this.rollManyOnTable(rollsAmount, this.table, options);
    // Patch add uuid to every each result for better module compatibility
    let resultsTmp = [];
    for (const r of resultsBrt?.results ?? []) {
      let rTmp = r;
      let rDoc = await BRTBetterHelpers.retrieveDocumentFromResult(r, false);
      if (!getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`) && rDoc.uuid) {
        setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`, rDoc.uuid ?? "");
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
    if (rollMode) {
      BRTUtils.addRollModeToChatData(msgData.messageData, rollMode);
    }
    await this.table.toMessage(results, msgData);
  }

  /**
   * Draw multiple results from a RollTable, constructing a final synthetic Roll as a dice pool of inner rolls.
   * @param {amount} amount               The number of results to draw
   * @param {RollTable} table             The rollTable object
   * @param {object} [options={}]         Optional arguments which customize the draw
   * @param {Roll} [options.roll]                   An optional pre-configured Roll instance which defines the dice roll to use
   * @param {boolean} [options.recursive=true]      Allow drawing recursively from inner RollTable results
   * @param {boolean} [options.displayChat=true]    Automatically display the drawn results in chat? Default is true
   * @param {number} [options._depth]  The rolls amount value
   *
   * @returns {Promise<Array{RollTableResult}>} The drawn results
   */
  async rollManyOnTable(amount, table, { roll = null, recursive = true, _depth = 0, dc = null, skill = null } = {}) {
    let options = {
      roll: roll,
      recursive: recursive,
      _depth: _depth,
      dc: dc,
      skill: skill,
    };

    /*
    if (!table.formula) {
      let msg = game.i18n.format(`${BRTCONFIG.NAMESPACE}.RollTable.NoFormula`, {
        name: table.name,
      });
      ui.notifications.error(CONSTANTS.MODULE_ID + " | " + msg);
      return;
    }

    let brtTable = new BetterRollTable(table, options);
    const draw = await brtTable.drawMany(amount, {
      roll: roll,
      recursive: recursive,
      displayChat: false,
      rollMode: "gmroll",
    });
    if (!this.mainRoll) {
      this.mainRoll = draw.roll;
    }
    return draw.results;
    */
    // =================================

    const maxRecursions = 5;
    let msg = "";
    // Prevent infinite recursion
    if (_depth > maxRecursions) {
      let msg = game.i18n.format(`${BRTCONFIG.NAMESPACE}.Strings.Warnings.MaxRecursion`, {
        maxRecursions: maxRecursions,
        tableId: table.id,
      });
      throw new Error(CONSTANTS.MODULE_ID + " | " + msg);
    }

    let drawnResults = [];

    while (amount > 0) {
      let resultToDraw = amount;
      // if we draw without replacement we need to reset the table once all entries are drawn
      if (!table.replacement) {
        const resultsLeft = table.results.reduce(function (n, r) {
          return n + !r.drawn;
        }, 0);

        if (resultsLeft === 0) {
          await table.resetResults();
          continue;
        }

        resultToDraw = Math.min(resultsLeft, amount);
      }

      if (!table.formula) {
        let msg = game.i18n.format(`${BRTCONFIG.NAMESPACE}.RollTable.NoFormula`, {
          name: table.name,
        });
        ui.notifications.error(CONSTANTS.MODULE_ID + " | " + msg);
        return;
      }

      let brtTable = new BetterRollTable(table, options);
      const draw = await brtTable.drawMany(amount, {
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
          const innerOptions = mergeObject(options, { _depth: _depth + 1 });
          const innerResults = await this.rollManyOnTable(entryAmount, innerTable, innerOptions);
          drawnResults = drawnResults.concat(innerResults);
        } else {
          drawnResults = drawnResults.concat(Array(entryAmount).fill(entry));
        }
      }
      amount -= resultToDraw;
    }

    return {
      roll: this.mainRoll,
      results: drawnResults,
    };
    // return drawnResults;
  }

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
  async roll({ roll = null, recursive = true, _depth = 0, dc = null, skill = null } = {}) {
    let resultsBrt = await this.rollManyOnTable(1, this.table, { roll, recursive, _depth, dc, skill });
    // Patch add uuid to every each result for better module compatibility
    let resultsTmp = [];
    for (const r of resultsBrt?.results ?? []) {
      let rTmp = r;
      let rDoc = await BRTBetterHelpers.retrieveDocumentFromResult(r, false);
      if (!getProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`) && rDoc.uuid) {
        setProperty(rTmp, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`, rDoc.uuid ?? "");
      }
      resultsTmp.push(rTmp);
    }
    return {
      roll: resultsBrt.roll,
      results: resultsTmp,
    };
  }
}
