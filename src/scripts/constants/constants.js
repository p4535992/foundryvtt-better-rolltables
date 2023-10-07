export const CONSTANTS = {
  MODULE_ID: "better-rolltables",
  PATH: "modules/better-rolltables",
  TYPES: ["none", "better", "loot", "harvest", "story"],
  FLAGS: {
    LOOT: "loot",
    BETTER: "better",
    LOOT_CURRENCY: "loot.currency",
    LOOT_SHARED: "loot.shared",
    // saved data keys (used e.g. in the rolltableEntity.data.flags)
    TABLE_TYPE_KEY: "table-type",
    GENERIC_AMOUNT_KEY: "loot-amount-key",
    GENERIC_SHOW_HIDDEN_RESULT_ON_CHAT: "brt-show-hidden-result-on-chat",

    GENERIC_RESULT_UUID: "brt-result-uuid",
    GENERIC_RESULT_CUSTOM_NAME: "brt-result-custom-name",
    GENERIC_RESULT_ORIGINAL_NAME: "brt-result-original-name",
    GENERIC_RESULT_CUSTOM_ICON: "brt-result-custom-icon",
    GENERIC_RESULT_ORIGINAL_ICON: "brt-result-original-icon",
    GENERIC_RESULT_HIDDEN_TABLE: "brt-hidden-table",
    GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT: "brt-show-hidden-result-on-chat",

    LOOT_CURRENCY_STRING_KEY: "table-currency-string",
    LOOT_AMOUNT_KEY: "loot-amount-key",
    LOOT_ACTOR_NAME_KEY: "loot-actor-name",

    HARVEST: "harvest",
    HARVEST_AMOUNT_KEY: "loot-amount-key",
    HARVEST_DC_VALUE_KEY: "brt-dc-value",
    HARVEST_SKILL_VALUE_KEY: "brt-skill-value",
    HARVEST_SOURCE_VALUE_KEY: "brt-source-value",
    HARVEST_ACTOR_NAME_KEY: "loot-actor-name",

    /** @deprecated used on the old html view */
    RESULTS_FORMULA_KEY: "brt-result-formula",
    RESULTS_FORMULA_KEY_FORMULA: "brt-result-formula.formula",
    HIDDEN_TABLE: "brt-hidden-table",
  },

  // different type of table type the mod will support. none will basically keep the basic rolltable functionality
  TABLE_TYPE_NONE: "none",
  TABLE_TYPE_BETTER: "better",
  TABLE_TYPE_LOOT: "loot",
  TABLE_TYPE_HARVEST: "harvest",
  TABLE_TYPE_STORY: "story",
  // DEFAULT_HIDDEN_RESULT_IMAGE: "modules/better-rolltables/assets/artwork/unidentified-result.webp",
  // DEFAULT_HIDDEN_RESULT_TEXT: "???",
};
