export const CONSTANTS = {
  MODULE_ID: "better-rolltables",
  PATH: "modules/better-rolltables",
  TYPES: ["none", "better", "loot", "harvest", "story"],
  FLAGS: {
    // saved data keys (used e.g. in the rolltableEntity.data.flags)
    TABLE_TYPE_KEY: "table-type",
    GENERIC_AMOUNT_KEY: "loot-amount-key",

    LOOT_CURRENCY_STRING_KEY: "table-currency-string",
    LOOT_AMOUNT_KEY: "loot-amount-key",
    LOOT_ACTOR_NAME_KEY: "loot-actor-name",

    HARVEST_AMOUNT_KEY: "loot-amount-key",
    HARVEST_DC_VALUE_KEY: "harvest-dc-value",
    HARVEST_SKILL_VALUE_KEY: "harvest-skill-value",
    // TODO HARVEST_ACTOR_NAME_KEY: "harvest-actor-name",

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
};
