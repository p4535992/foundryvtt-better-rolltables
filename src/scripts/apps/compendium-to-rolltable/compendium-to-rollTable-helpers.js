import { CONSTANTS } from "../../constants/constants";
import { warn } from "../../lib";
import { CompendiumToRollTableDialog } from "./compendium-to-rollTable-dialog";
import { CompendiumToRollTableSpecialHarvestDialog } from "./compendium-to-rollTable-dialog-special-harvest-";

/**
 * @href https://gist.github.com/crazycalya/0cd20cd12b1a344d21302a794cb229ff
 * @href https://gist.github.com/p4535992/3151778781055a6f68281a0bfd8da1a2
 * @href https://www.reddit.com/r/FoundryVTT/comments/11lbjln/converting_a_compendium_into_a_rollable_table/
 */
export class CompendiumToRollTableHelpers {
  /**
   * Tested to work with FoundryVTT V11, direct compatibility with DnD5e & SFRPG. Thorough testing still required.
   */
  static async compendiumToRollTableWithDialog(compendiumName, { weightPredicate = null } = {}) {
    let allCompendiums = [];
    if (compendiumName) {
      if (!game.packs.getName(compendiumName)) {
        warn(`No compendium found with id '${compendiumName}'`, true);
        return;
      }
      allCompendiums = [game.packs.get(compendiumName)];
    } else {
      allCompendiums = await game.packs.contents;
    }
    let itemTypes = await game.documentTypes.Item.sort();
    const documents = new CompendiumToRollTableDialog(
      allCompendiums,
      itemTypes,
      ({ weightPredicate = null } = {})
    ).render(true);
    return documents;
  }

  /**
   * Tested to work with FoundryVTT V11, direct compatibility with DnD5e & SFRPG. Thorough testing still required.
   */
  static async compendiumToRollTableWithDialogSpecialCaseHarvester({ weightPredicate = null } = {}) {
    if (!game.modules.get("harvester")?.active) {
      warn(`You must activate the module 'harvester'`, true);
      return;
    }
    let allCompendiums = [game.packs.get("harvester.harvest")];
    let itemTypes = await game.documentTypes.Item.sort();
    const documents = new CompendiumToRollTableSpecialHarvestDialog(
      allCompendiums,
      itemTypes,
      ({ weightPredicate = null } = {})
    );
    return documents;
  }

  static async compendiumToRollTable(compendiumName, tableName, { weightPredicate = null } = {}) {
    const compendium = game.packs.get(compendiumName);
    let msg = { name: compendiumName, tableName: tableName };
    let api_msg = CONSTANTS.MODULE_ID + ".api | ";

    if (compendium === undefined) {
      api.msg += game.i18n.format(`${CONSTANTS.MODULE_ID}.api.msg.compendiumNotFound`, msg);
      ui.notifications.warn(CONSTANTS.MODULE_ID + " | " + api_msg);
      return;
    }

    msg.title = compendium.title;
    msg.compendiumSize = (await compendium.getIndex()).size;

    if (!msg.compendiumSize) {
      ui.notifications.warn(api.msg + game.i18n.format(`${CONSTANTS.MODULE_ID}.api.msg.compendiumEmpty`, msg));
      return;
    }

    ui.notifications.info(api_msg + game.i18n.format(`${CONSTANTS.MODULE_ID}.api.msg.startRolltableGeneration`, msg));

    const document = compendium
      .getDocuments()
      .then((compendiumItems) => {
        return compendiumItems.map((item) => ({
          type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
          collection: compendiumName,
          text: item.name,
          img: item.thumbnail || item.img || CONFIG.RollTable.resultIcon,
          weight: weightPredicate ? weightPredicate(item) : 1,
          range: [1, 1],
        }));
      })
      .then((results) =>
        RollTable.create({
          name: tableName,
          results: results.filter((x) => x.weight !== 0), // remove empty results due to null weight
        })
      )
      .then((rolltable) => {
        rolltable.normalize();
        ui.notifications.info(
          api_msg + game.i18n.format(`${CONSTANTS.MODULE_ID}.api.msg.rolltableGenerationFinished`, msg)
        );
        return rolltable;
      });
    return document;
  }
}
