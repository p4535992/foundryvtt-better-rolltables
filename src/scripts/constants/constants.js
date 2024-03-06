import SETTINGS from "./settings";

export const CONSTANTS = {
    MODULE_ID: "better-rolltables",
    PATH: "modules/better-rolltables",
    TYPES: ["none", "better", "loot", "harvest", "story"],
    PRE_RESULT_TEXT_ROLL: "/roll",
    PRE_RESULT_TEXT_ROLLED: "Rolled: ",
    FLAGS: {
        LOOT: "loot",
        BETTER: "better",
        LOOT_CURRENCY: "loot.currency",
        LOOT_SHARED: "loot.shared",
        // saved data keys (used e.g. in the rolltableEntity.data.flags)
        TABLE_TYPE_KEY: "table-type",
        GENERIC_AMOUNT_KEY: "loot-amount-key",
        GENERIC_SHOW_HIDDEN_RESULT_ON_CHAT: "brt-show-hidden-result-on-chat",
        GENERIC_DISTINCT_RESULT: "brt-distinct-result",
        GENERIC_DISTINCT_RESULT_KEEP_ROLLING: "brt-distinct-result-keep-rolling",
        GENERIC_USE_PERCENTAGE: "brt-use-percentage",

        GENERIC_RESULT_UUID: "brt-result-uuid",
        GENERIC_RESULT_CUSTOM_NAME: "brt-result-custom-name",
        GENERIC_RESULT_ORIGINAL_NAME: "brt-result-original-name",
        GENERIC_RESULT_CUSTOM_ICON: "brt-result-custom-icon",
        GENERIC_RESULT_ORIGINAL_ICON: "brt-result-original-icon",
        GENERIC_RESULT_HIDDEN_TABLE: "brt-hidden-table",
        GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT: "brt-show-hidden-result-on-chat",
        GENERIC_RESULT_PERCENTAGE_LOW_VALUE: "brt-percentage-low-value",
        GENERIC_RESULT_PERCENTAGE_HIGH_VALUE: "brt-percentage-high-value",
        GENERIC_RESULT_JOURNAL_PAGE_UUID: "brt-result-journal-page-uuid",

        GENERIC_RESULT_CUSTOM_QUANTITY: "brt-result-custom-quantity",
        GENERIC_RESULT_ORIGINAL_QUANTITY: "brt-result-original-quantity",
        // TODO
        // GENERIC_RESULT_CUSTOM_PRICE: "brt-result-custom-price",
        // GENERIC_RESULT_ORIGINAL_PRICE: "brt-result-original-price",

        LOOT_CURRENCY_STRING_KEY: "table-currency-string",
        LOOT_AMOUNT_KEY: "loot-amount-key",
        LOOT_ACTOR_NAME_KEY: "loot-actor-name",

        HARVEST: "harvest",
        HARVEST_AMOUNT_KEY: "loot-amount-key",
        HARVEST_DC_VALUE_KEY: "brt-dc-value",
        HARVEST_SKILL_VALUE_KEY: "brt-skill-value",
        HARVEST_SOURCE_VALUE_KEY: "brt-source-value",
        HARVEST_ACTOR_NAME_KEY: "loot-actor-name",

        // /** @deprecated used on the old html view */
        // RESULTS_FORMULA_KEY: "brt-result-formula",
        /** @deprecated it should be replaced in favor of GENERIC_RESULT_CUSTOM_QUANTITY */
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

    // SETTINGS
    SPELL_COMPENDIUM_KEY: SETTINGS.SPELL_COMPENDIUM_KEY,
    // LOOT_SHEET_TO_USE_KEY: SETTINGS.LOOT_SHEET_TO_USE_KEY,
    SHOW_REROLL_BUTTONS: SETTINGS.SHOW_REROLL_BUTTONS,
    SHOW_OPEN_BUTTONS: SETTINGS.SHOW_OPEN_BUTTONS,
    USE_CONDENSED_BETTERROLL: SETTINGS.USE_CONDENSED_BETTERROLL,
    ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU: SETTINGS.ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU,
    ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU: SETTINGS.ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU,
    SHOW_WARNING_BEFORE_REROLL: SETTINGS.SHOW_WARNING_BEFORE_REROLL,
    STICK_ROLLTABLE_HEADER: SETTINGS.STICK_ROLLTABLE_HEADER,
    ROLL_TABLE_FROM_JOURNAL: SETTINGS.ROLL_TABLE_FROM_JOURNAL,

    // Loot
    SHOW_CURRENCY_SHARE_BUTTON: SETTINGS.SHOW_CURRENCY_SHARE_BUTTON,
    ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE: SETTINGS.ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE,

    // Harvest
    ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE: SETTINGS.ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE,

    TAGS: {
        USE: SETTINGS.TAGS.USE,
        DEFAULTS: SETTINGS.TAGS.DEFAULTS,
    },
    // this are setted on registerSettings
    // QUANTITY_PROPERTY_PATH: null,
    // WEIGHT_PROPERTY_PATH: null,
    // PRICE_PROPERTY_PATH: null,
    // SPELL_LEVEL_PATH: null,
    // ITEM_LOOT_TYPE: null,
    // SCROLL_REGEX: null,
};
