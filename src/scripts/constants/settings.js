import { SYSTEMS } from "../systems";

const SETTINGS = {
  // Client settings

  // Module Settings

  SPELL_COMPENDIUM_KEY: "default-spell-compendium",
  // LOOT_SHEET_TO_USE_KEY: "loot-sheet-to-use",
  SHOW_REROLL_BUTTONS: "show-reroll-buttons",
  SHOW_OPEN_BUTTONS: "show-open-buttons",
  USE_CONDENSED_BETTERROLL: "use-condensed-betterroll",
  ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU: "add-roll-on-compendium-contextmenu",
  ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU: "add-roll-on-rolltable-contextmenu",
  SHOW_WARNING_BEFORE_REROLL: "show-warning-before-reroll",
  STICK_ROLLTABLE_HEADER: "stick-rolltable-header",
  ROLL_TABLE_FROM_JOURNAL: "roll-table-from-journal",
  ENABLE_OLD_BEHAVIOR: "enableOldBehavior",

  // Loot
  SHOW_CURRENCY_SHARE_BUTTON: "show-currency-share-button",
  ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE: "always-show-generated-loot-as-message",

  // Harvest
  ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE: "always-show-generated-harvest-as-message",

  TAGS: {
    USE: "use-tags",
    DEFAULTS: "tag-defaults",
  },

  // Style settings

  // System Settings
  DEFAULT_ACTOR_NPC_TYPE: "systemDefaultActorNpcType",
  DEFAULT_LOOT_SHEET: "systemDefaultLootSheet",
  DEFAULT_SPELL_COMPENDIUM: "systemDefaultSpellCompendium",
  QUANTITY_PROPERTY_PATH: "systemQuantityPropertyPath",
  PRICE_PROPERTY_PATH: "systemPricePropertyPath",
  SPELL_LEVEL_PATH: "systemSpellLevelPath",
  ITEM_LOOT_TYPE: "systemItemLootType",
  SCROLL_REGEX: "systemScrollRegex",
  MATCH_ATTRIBUTES_BLACKLIST: "systemMatchAttributesBlacklist",

  // Hidden settings
  SYSTEM_FOUND: "systemFound",
  SYSTEM_NOT_FOUND_WARNING_SHOWN: "systemNotFoundWarningShown",
  SYSTEM_VERSION: "systemVersion",

  GET_DEFAULT() {
    return foundry.utils.deepClone(SETTINGS.DEFAULTS());
  },

  GET_SYSTEM_DEFAULTS() {
    return Object.fromEntries(
      Object.entries(SETTINGS.GET_DEFAULT()).filter((entry) => {
        return entry[1].system;
      })
    );
  },

  DEFAULTS: () => ({
    [SETTINGS.DEFAULT_ACTOR_NPC_TYPE]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.DEFAULT_ACTOR_NPC_TYPE,
    },
    [SETTINGS.DEFAULT_LOOT_SHEET]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.DEFAULT_LOOT_SHEET,
    },
    [SETTINGS.DEFAULT_SPELL_COMPENDIUM]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.DEFAULT_SPELL_COMPENDIUM,
    },
    [SETTINGS.QUANTITY_PROPERTY_PATH]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.QUANTITY_PROPERTY_PATH,
    },
    [SETTINGS.PRICE_PROPERTY_PATH]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.PRICE_PROPERTY_PATH,
    },
    [SETTINGS.SPELL_LEVEL_PATH]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.SPELL_LEVEL_PATH,
    },
    [SETTINGS.ITEM_LOOT_TYPE]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.ITEM_LOOT_TYPE,
    },
    [SETTINGS.SCROLL_REGEX]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.SCROLL_REGEX,
    },
    [SETTINGS.MATCH_ATTRIBUTES_BLACKLIST]: {
      scope: "world",
      config: false,
      system: true,
      type: String,
      default: SYSTEMS.DATA.MATCH_ATTRIBUTES_BLACKLIST,
    },
  }),
};

export default SETTINGS;
