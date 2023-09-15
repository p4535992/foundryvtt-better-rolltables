import { i18n, stringInject } from "../utils.js";
import { CONSTANTS } from "./config.js";

export class BetterRollGenericTable extends RollTable {
  async draw({ roll, recursive = true, results = [], displayChat = true, rollMode } = {}) {
    const draw = await super.draw({ roll, recursive, results, displayChat: false, rollMode });

    let newResults = [];
    for (let i = 0; i < draw.results.length; i++) {
      const r = draw.results[i];
      const qtFormula = getProperty(r, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_AMOUNT_KEY}`)?.trim();
      if (qtFormula == null || qtFormula === "" || qtFormula === "1") {
        newResults.push(r);
      } else {
        const qtRoll = Roll.create(qtFormula);
        const qt = (await qtRoll.evaluate({ async: true })).total;
        console.log(qt);
        newResults = newResults.concat(Array(qt).fill(r));
      }
    }
    draw.results = newResults;

    console.log(draw);

    // Forward drawn results to create chat messages
    if (displayChat) {
      await this.toMessage(draw.results, {
        roll: roll,
        messageOptions: { rollMode },
      });
    }

    // If flag is on, auto import
    // if (this.flags['better-rolltables']?.enabled) {
    //     await this.addResultsToControlledTokens(draw.results);
    // }
    console.log(draw.results);
    return draw;
  }
}
