import { SYSTEMS } from "../systems.js";
import { applySystemSpecificStyles } from "../settings.js";

const SETTINGS = {
  // Client settings

  // Module Settings

  // Style settings

  // System Settings

  DEFAULT_LOOT_SHEET: "systemDefaultLootSheet",
  DEFAULT_SPELL_COMPENDIUM: "systemDefaultSpellCompendium",
  QUANTITY_PROPERTY_PATH: "systemQuantityPropertyPath",
  PRICE_PROPERTY_PATH: "systemPricePropertyPath",
  SPELL_LEVEL_PATH: "systemSpellLevelPath",
  ITEM_LOOT_TYPE: "systemItemLootType",
  SCROLL_REGEX: "systemScrollRegex",

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
  }),
};

export default SETTINGS;
