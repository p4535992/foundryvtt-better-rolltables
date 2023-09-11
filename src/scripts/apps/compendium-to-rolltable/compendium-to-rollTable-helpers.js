import { BRTCONFIG, CONSTANTS } from "../../core/config";
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
    static async compendiumToRollTableWithDialog({ weightPredicate = null } = {}) {
        let allCompendiums = await game.packs.contents;
        let itemTypes = await game.documentTypes.Item.sort();
        new CompendiumToRollTableDialog(allCompendiums , itemTypes, { weightPredicate = null } = {}).render(true);
    }

    /**
     * Tested to work with FoundryVTT V11, direct compatibility with DnD5e & SFRPG. Thorough testing still required.
     */
    static async compendiumHarvesterToRollTableWithDialog({ weightPredicate = null } = {}) {
        let allCompendiums = [game.packs.get("")];
        let itemTypes = await game.documentTypes.Item.sort();
        new CompendiumToRollTableSpecialHarvestDialog(allCompendiums, itemTypes, { weightPredicate = null } = {}).render(true);
    }

    static async compendiumToRollTable(compendiumName, tableName, { weightPredicate = null } = {}) {
        const compendium = game.packs.get(compendiumName);
        let msg = { name: compendiumName, tableName: tableName },
          api_msg = CONSTANTS.MODULE_ID + ".api | ";

        if (compendium === undefined) {
          api.msg += game.i18n.format(`${BRTCONFIG.NAMESPACE}.api.msg.compendiumNotFound`, msg);
          ui.notifications.warn(CONSTANTS.MODULE_ID + " | " + api_msg);
          return;
        }

        msg.title = compendium.title;
        msg.compendiumSize = (await compendium.getIndex()).size;

        if (!msg.compendiumSize) {
          ui.notifications.warn(api.msg + game.i18n.format(`${BRTCONFIG.NAMESPACE}.api.msg.compendiumEmpty`, msg));
          return;
        }

        ui.notifications.info(api_msg + game.i18n.format(`${BRTCONFIG.NAMESPACE}.api.msg.startRolltableGeneration`, msg));

        compendium
          .getDocuments()
          .then((compendiumItems) => {
            return compendiumItems.map((item) => ({
              type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
              collection: compendiumName,
              text: item.name,
              img: item.thumbnail || item.img,
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
              api_msg + game.i18n.format(`${BRTCONFIG.NAMESPACE}.api.msg.rolltableGenerationFinished`, msg)
            );
          });
    }

}
