import { CONSTANTS } from "./config";

export class BetterRollTableGenericSheet extends RollTableConfig {
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "roll-table-config", `${CONSTANTS.MODULE_ID}-config`],
      template: `modules/${CONSTANTS.MODULE_ID}/templates/sheet/brt-roll-table-config.hbs`,
      width: 800,
      height: "auto",
      closeOnSubmit: false,
      viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
      scrollY: ["ol.table-results"],
      dragDrop: [{ dragSelector: null, dropSelector: null }],
    });
  }

  /**
   * @override
   */
  getData(options) {
    const results = this.document.results.map((result) => {
      result = result.toObject(false);
      result.isText = result.type === CONST.TABLE_RESULT_TYPES.TEXT;
      result.isDocument = result.type === CONST.TABLE_RESULT_TYPES.DOCUMENT;
      result.isCompendium = result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM;
      result.img = result.thumbnail || result.img || CONFIG.RollTable.resultIcon;
      result.text = TextEditor.decodeHTML(result.text);
      // grab the formula
      // result.qtFormula = getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.}`;
      return result;
    });
    results.sort((a, b) => a.range[0] - b.range[0]);

    // Merge data and return;
    let brtData = foundry.utils.mergeObject(super.getData(options), {
      results: results,
      resultTypes: Object.entries(CONST.TABLE_RESULT_TYPES).reduce((obj, v) => {
        obj[v[1]] = v[0].titleCase();
        return obj;
      }, {}),
      documentTypes: CONST.COMPENDIUM_DOCUMENT_TYPES,
      compendiumPacks: Array.from(game.packs.keys()),
    });

    brtData = foundry.utils.mergeObject(brtData, duplicate(this.document.flags));
    brtData.disabled = !this.editable;
    return brtData;
  }
}
