import { debug } from "../../lib";
import { CompendiumToRollTableDialog } from "./compendium-to-rollTable-dialog";

/**
 * @href https://gist.github.com/crazycalya/0cd20cd12b1a344d21302a794cb229ff
 * @href https://gist.github.com/p4535992/3151778781055a6f68281a0bfd8da1a2
 * @href https://www.reddit.com/r/FoundryVTT/comments/11lbjln/converting_a_compendium_into_a_rollable_table/
 */
export class CompendiumToRollTableSpecialHarvestDialog extends CompendiumToRollTableDialog {
  constructor(allCompendiums, itemTypes) {
    super(allCompendiums, itemTypes);
  }

  /**
   * Group an array of objects by a specified property.
   * @param {Array<T>} array - The array of objects to group.
   * @param {string} property - The property to group the objects by.
   * @returns {Object} An object where the keys are the unique values of the specified property and the values are arrays of objects with that property value.
   * @template T
   *
   * @example
   * const arr = [{type:"A"}, {type:"A"}, {type:"B"}];
   * const result = groupBy(arr, "type");
   * console.log(result); // Output: { A: [{type: "A"}, {type: "A"}], B: [{type: "B"}] }
   */
  groupBy(array, property) {
    return array.reduce((memo, x) => {
      memo[x[property]] ||= [];
      memo[x[property]].push(x);
      return memo;
    }, {});
  }

  /**
   * @override
   * @param {*} compendiumName
   * @param {*} results
   * @param {*} formula
   * @param {*} options
   */
  async createCompendiumFromData(compendiumName, results, formula, options = {}) {
    const resultsGroupedBySystemOrigin = this.groupBy(results, `system.origin`);
    const documents = [];

    for (const [key, value] of Object.entries(resultsGroupedBySystemOrigin)) {
      //options.renderSheet = options.renderSheet ?? true;
      const document = await RollTable.create(
        {
          name: "Better Harvester | " + key + " RollTable",
          description: `A random table created from the contents of the ${compendiumName} compendium filter for the system origin value '${key}'.`,
          results: value,
          formula: formula ?? `1d${value.length}`,
        },
        options
      );
      documents.push(document);
    }
    return documents;
  }
}
