import * as BRTHelper from "./brt-helper.js";
import * as Utils from "../core/utils.js";
import { BRTCONFIG } from "./config.js";
import { addRollModeToChatData } from "../core/utils.js";
import { CONSTANTS } from "../constants/constants.js";

export class BRTBuilder {
  constructor(tableEntity) {
    this.table = tableEntity;
  }

  /**
   *
   * @param {*} rollsAmount
   * @returns {array} results
   */
  async betterRoll(rollsAmount = undefined) {
    this.mainRoll = undefined;
    rollsAmount = rollsAmount || (await BRTHelper.rollsAmount(this.table));
    this.results = await this.rollManyOnTable(rollsAmount, this.table);
    return this.results;
  }

  /**
   *
   * @param {array} results
   */
  async createChatCard(results, rollMode = null) {
    let msgData = { roll: this.mainRoll, messageData: {} };
    if (rollMode) addRollModeToChatData(msgData.messageData, rollMode);
    await this.table.toMessage(results, msgData);
  }

  /**
   *
   * @param {number} amount
   * @param {RollTable} table
   * @param {object} options
   *
   * @returns {array}
   */
  async rollManyOnTable(amount, table, { _depth = 0 } = {}) {
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
      /** if we draw without replacement we need to reset the table once all entries are drawn */
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

      const draw = await table.drawMany(resultToDraw, {
        displayChat: false,
        recursive: false,
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
        const entryAmount = await BRTHelper.tryRoll(formulaAmount);

        let innerTable;
        if (entry.type === CONST.TABLE_RESULT_TYPES.DOCUMENT && entry.documentCollection === "RollTable") {
          innerTable = game.tables.get(entry.documentId);
        } else if (entry.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
          const entityInCompendium = await Utils.findInCompendiumByName(entry.documentCollection, entry.text);
          if (entityInCompendium !== undefined && entityInCompendium.documentName === "RollTable") {
            innerTable = entityInCompendium;
          }
        }

        if (innerTable) {
          const innerResults = await this.rollManyOnTable(entryAmount, innerTable, { _depth: _depth + 1 });
          drawnResults = drawnResults.concat(innerResults);
        } else {
          //   for (let i = 0; i < entryAmount; i++) {
          //     drawnResults.push(entry);
          //   }
          drawnResults = drawnResults.concat(Array(entryAmount).fill(entry));
        }
      }
      amount -= resultToDraw;
    }

    return drawnResults;
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
  async roll(tableEntity, { roll, recursive = true, _depth = 0 } = {}) {
    this.rollManyOnTable(amount, tableEntity, { roll, recursive, _depth });
  }

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
  async draw({ table, roll, recursive = true, results = [], displayChat = true, rollMode } = {}) {
    // If an array of results were not already provided, obtain them from the standard roll method
    if (!results.length) {
      const r = await table.roll({ roll, recursive });
      roll = r.roll;
      results = r.results;
    }
    if (!results.length) {
      return { roll, results };
    }

    // Mark results as drawn, if replacement is not used, and we are not in a Compendium pack
    if (!table.replacement && !table.pack) {
      const draws = table.getResultsForRoll(roll.total);
      await table.updateEmbeddedDocuments(
        "TableResult",
        draws.map((r) => {
          return { _id: r.id, drawn: true };
        })
      );
    }

    // Mark any nested table results as drawn too.
    let updates = results.reduce((obj, r) => {
      const parent = r.parent;
      if (parent === table || parent.replacement || parent.pack) {
        return obj;
      }
      if (!obj[parent.id]) {
        obj[parent.id] = [];
      }
      obj[parent.id].push({ _id: r.id, drawn: true });
      return obj;
    }, {});

    if (Object.keys(updates).length) {
      updates = Object.entries(updates).map(([id, results]) => {
        return { _id: id, results };
      });
      await RollTable.implementation.updateDocuments(updates);
    }

    // Forward drawn results to create chat messages
    if (displayChat) {
      await table.toMessage(results, {
        roll: roll,
        messageOptions: { rollMode },
      });
    }

    // Return the roll and the produced results
    return { roll, results };
  }
}
