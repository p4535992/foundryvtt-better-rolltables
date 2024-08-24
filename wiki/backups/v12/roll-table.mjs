import Document from "../abstract/document.mjs";
import {mergeObject} from "../utils/helpers.mjs";
import * as documents from "./_module.mjs";
import * as fields from "../data/fields.mjs";

/**
 * @typedef {import("./_types.mjs").RollTableData} RollTableData
 * @typedef {import("../types.mjs").DocumentConstructionContext} DocumentConstructionContext
 */

/**
 * The RollTable Document.
 * Defines the DataSchema and common behaviors for a RollTable which are shared between both client and server.
 * @mixes RollTableData
 */
export default class BaseRollTable extends Document {
  /**
   * Construct a RollTable document using provided data and context.
   * @param {Partial<RollTableData>} data           Initial data from which to construct the RollTable
   * @param {DocumentConstructionContext} context   Construction context options
   */
  constructor(data, context) {
    super(data, context);
  }

  /* -------------------------------------------- */
  /*  Model Configuration                         */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static metadata = Object.freeze(mergeObject(super.metadata, {
    name: "RollTable",
    collection: "tables",
    indexed: true,
    compendiumIndexFields: ["_id", "name", "description", "img", "sort", "folder"],
    embedded: {TableResult: "results"},
    label: "DOCUMENT.RollTable",
    labelPlural: "DOCUMENT.RollTables",
    schemaVersion: "12.324"
  }, {inplace: false}));

  /** @inheritDoc */
  static defineSchema() {
    return {
      _id: new fields.DocumentIdField(),
      name: new fields.StringField({required: true, blank: false, textSearch: true}),
      img: new fields.FilePathField({categories: ["IMAGE"], initial: () => this.DEFAULT_ICON}),
      description: new fields.HTMLField({textSearch: true}),
      results: new fields.EmbeddedCollectionField(documents.BaseTableResult),
      formula: new fields.StringField(),
      replacement: new fields.BooleanField({initial: true}),
      displayRoll: new fields.BooleanField({initial: true}),
      folder: new fields.ForeignDocumentField(documents.BaseFolder),
      sort: new fields.IntegerSortField(),
      ownership: new fields.DocumentOwnershipField(),
      flags: new fields.ObjectField(),
      _stats: new fields.DocumentStatsField()
    }
  }

  /**
   * The default icon used for newly created Macro documents
   * @type {string}
   */
  static DEFAULT_ICON = "icons/svg/d20-grey.svg";

  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData(source) {
    /**
     * Migrate sourceId.
     * @deprecated since v12
     */
    this._addDataFieldMigration(source, "flags.core.sourceId", "_stats.compendiumSource");

    return super.migrateData(source);
  }
}
