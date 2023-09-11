export const CONSTANTS = {
  MODULE_ID: "better-rolltables",
  PATH: "modules/better-rolltables",
  TYPES: ["none", "better", "loot", "harvest", "story"],
};

export const BRTCONFIG = {
  NAMESPACE: "better-rolltables",

  // saved data keys (used e.g. in the rolltableEntity.data.flags)
  TABLE_TYPE_KEY: "table-type",
  LOOT_CURRENCY_KEY: "table-currency-string",
  LOOT_ROLLS_AMOUNT_KEY: "loot-amount-key",
  LOOT_ACTOR_NAME_KEY: "loot-actor-name",

  HARVEST_ROLLS_AMOUNT_KEY: "harvest-amount-key",
  HARVEST_ACTOR_NAME_KEY: "harvest-actor-name",

  RESULTS_FORMULA_KEY: "brt-result-formula",
  HIDDEN_TABLE: "brt-hidden-table",

  // different type of table type the mod will support. none will basically keep the basic rolltable functionality
  TABLE_TYPE_NONE: "none",
  TABLE_TYPE_BETTER: "better",
  TABLE_TYPE_LOOT: "loot",
  TABLE_TYPE_HARVEST: "harvest",
  TABLE_TYPE_STORY: "story",

  SPELL_COMPENDIUM_KEY: "default-spell-compendium",
  LOOT_SHEET_TO_USE_KEY: "loot-sheet-to-use",
  SHOW_REROLL_BUTTONS: "show-reroll-buttons",
  SHOW_OPEN_BUTTONS: "show-open-buttons",
  USE_CONDENSED_BETTERROLL: "use-condensed-betterroll",
  ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU: "add-roll-on-compendium-contextmenu",
  ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU: "add-roll-on-rolltable-contextmenu",
  SHOW_WARNING_BEFORE_REROLL: "show-warning-before-reroll",
  STICK_ROLLTABLE_HEADER: "stick-rolltable-header",
  ROLL_TABLE_FROM_JOURNAL: "roll-table-from-journal",

  // Loot
  SHOW_CURRENCY_SHARE_BUTTON: "show-currency-share-button",
  ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE: "always-show-generated-loot-as-message",

  // Harvest
  ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE: "always-show-generated-harvest-as-message",

  // in fp2e quantity is in system.quantity.value , in 5e system.quantity
  QUANTITY_PROPERTY_PATH: "system.quantity",
  PRICE_PROPERTY_PATH: "system.price",
  SPELL_LEVEL_PATH: "system.level",

  // in 5e a valid item type is loot
  ITEM_LOOT_TYPE: "loot",
  REGEX: {
    scroll: /\s*Spell\s*Scroll\s*(\d+|cantrip)/i,
  },
  SCROLL_REGEX: /\s*Spell\s*Scroll\s*(\d+|cantrip)/i,
  TAGS: {
    USE: "use-tags",
    DEFAULTS: "tag-defaults",
  },
};
