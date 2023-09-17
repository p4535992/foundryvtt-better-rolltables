import API from "../API";
import { CONSTANTS } from "../constants/constants";
import { BetterRollTableBetterConfig } from "../core/brt-rolltable-config";
import { i18n } from "../lib";

export class BetterRollTableLootConfig extends BetterRollTableBetterConfig {
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "roll-table-config", `${CONSTANTS.MODULE_ID}-roll-table-config`],
      template: `modules/${CONSTANTS.MODULE_ID}/templates/sheet/brt-roll-table-config.hbs`,
      width: 800,
      height: "auto",
      closeOnSubmit: false,
      viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
      scrollY: ["ol.table-results"],
      // dragDrop: [{ dragSelector: null, dropSelector: null }],
      dragDrop: [
        { dragSelector: null, dropSelector: null },
        {
          dragSelector: "section.results .table-results .table-result",
          dropSelector: "section.results .table-results",
        },
      ],
    });
  }

  /**
   * @override
   */
  async getData(options = {}) {
    let brtData = await super.getData(options);
    // Set brt type
    if (this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY) !== CONSTANTS.TABLE_TYPE_LOOT) {
      await this.document.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.TABLE_TYPE_KEY, CONSTANTS.TABLE_TYPE_LOOT);
    }
    brtData = foundry.utils.mergeObject(brtData, duplicate(this.document.flags));
    brtData.textType =
      i18n(`${CONSTANTS.MODULE_ID}.${"TypePrefixLabel"}`) + " " + i18n(`${CONSTANTS.MODULE_ID}.${"TypeLoot"}`) + "";
    return brtData;
  }

  /**
   * @param {JQuery} jq
   */
  activateListeners(jq) {
    super.activateListeners(jq);
    const html = jq[0];
    html.querySelector("#BRT-gen-loot").addEventListener("click", this._onBetterRollTablesGenerateLoot.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle drawing a result from the RollTable
   * @param {Event} event
   * @private
   */
  async _onBetterRollTablesGenerateLoot(event) {
    event.preventDefault();
    await this.submit({ preventClose: true, preventRender: true });
    if (event.currentTarget) {
      event.currentTarget.disabled = true;
    } else {
      event.target.disabled = true;
    }
    const tableEntity = this.document;
    await API.generateLoot(tableEntity);
    if (event.currentTarget) {
      event.currentTarget.disabled = false;
    } else {
      event.target.disabled = false;
    }
  }
}
