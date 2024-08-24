import Document from "../abstract/document.mjs";
import {mergeObject} from "../utils/helpers.mjs";
import * as documents from "./module.mjs";
import * as fields from "../data/fields.mjs";

/**
 * @typedef {Object} RollTableData
 * @property {string} _id                 The _id which uniquely identifies this RollTable document
 * @property {string} name                The name of this RollTable
 * @property {string} [img]               An image file path which provides the thumbnail artwork for this RollTable
 * @property {string} [description]       The HTML text description for this RollTable document
 * @property {Collection<BaseTableResult>} [results=[]] A Collection of TableResult embedded documents which belong to this RollTable
 * @property {string} formula             The Roll formula which determines the results chosen from the table
 * @property {boolean} [replacement=true] Are results from this table drawn with replacement?
 * @property {boolean} [displayRoll=true] Is the Roll result used to draw from this RollTable displayed in chat?
 * @property {string|null} folder         The _id of a Folder which contains this RollTable
 * @property {number} [sort]              The numeric sort value which orders this RollTable relative to its siblings
 * @property {object} [ownership]         An object which configures ownership of this RollTable
 * @property {object} [flags]             An object of optional key/value flags
 * @property {DocumentStats} [_stats]     An object of creation and access information
 */

/**
 * The Document definition for a RollTable.
 * Defines the DataSchema and common behaviors for a RollTable which are shared between both client and server.
 */
class BaseRollTable extends Document {

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
    labelPlural: "DOCUMENT.RollTables"
  }, {inplace: false}));

  /** @inheritDoc DataModel.defineSchema */
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
  /*  Deprecations and Compatibility              */
  /* -------------------------------------------- */

  /** @inheritDoc DataModel.migrateData */
  static migrateData(data) {
    /**
     * Rename permission to ownership
     * @deprecated since v10
     */
    this._addDataFieldMigration(data, "permission", "ownership");
    return super.migrateData(data);
  }

  /* ---------------------------------------- */

  /** @inheritdoc */
  static shimData(data, options) {
    this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
    return super.shimData(data, options);
  }
}
export default BaseRollTable;

