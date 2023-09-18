import { CONSTANTS } from "./constants/constants";
import SETTINGS from "./constants/settings";
import { BRTCONFIG } from "./core/config";
import { BetterRolltableSettingsConfig } from "./core/settingsConfig";
import { i18n } from "./lib";
import { SYSTEMS } from "./systems";

export const WORLD = "world";
export const GROUP_DEFAULT = "defaults";
export const GROUP_UI = "UI";
export const GROUP_LOOT = "Loot";
export const GROUP_HARVEST = "Harvest";
export const GROUP_TAGS = "Tags";

// /**
//  * Register the game settings during InitHook required by contextmenues
//  */
// function _registerSettingsDuringInit() {
//   game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU, {
//     name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInCompediumContextMenu.Title`),
//     hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInCompediumContextMenu.Description`),
//     scope: WORLD,
//     group: GROUP_UI,
//     config: false,
//     default: false,
//     type: Boolean,
//   });
//   game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU, {
//     name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInRolltableContextMenu.Title`),
//     hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInRolltableContextMenu.Description`),
//     scope: WORLD,
//     group: GROUP_UI,
//     config: false,
//     default: false,
//     type: Boolean,
//   });
// }

export function registerSettings() {
  //   let defaultSpellCompendium = undefined;
  //   let defaultLootSheet = undefined;

  //   if (game.system.id === "dnd5e") {
  //     defaultSpellCompendium = "dnd5e.spells";
  //     (defaultLootSheet = "dnd5e.LootSheet5eNPC"),
  //       (systemSheets = Object.values(CONFIG.Actor.sheetClasses.npc).map((s) => ({
  //         id: s.id,
  //         label: s.label,
  //       })));

  //     BRTCONFIG.QUANTITY_PROPERTY_PATH = "system.quantity";
  //     BRTCONFIG.PRICE_PROPERTY_PATH = "system.price";
  //     BRTCONFIG.SPELL_LEVEL_PATH = "system.level";
  //   }

  //   if (game.system.id === "pf2e") {
  //     defaultLootSheet = "pf2e.LootSheetPF2e";
  //     defaultSpellCompendium = "pf2e.spells-srd";

  //     BRTCONFIG.QUANTITY_PROPERTY_PATH = "system.quantity.value";
  //     BRTCONFIG.PRICE_PROPERTY_PATH = "system.price.value";
  //     BRTCONFIG.SPELL_LEVEL_PATH = "system.level.value";
  //     BRTCONFIG.ITEM_LOOT_TYPE = "treasure";
  //     // pf2e scroll is "Scroll of 1st-level Spell"
  //     BRTCONFIG.SCROLL_REGEX = /\s*Scroll\s*of\s*(\d+)/gi;
  //   }

  //   if (game.system.id === "pf1") {
  //     defaultLootSheet = "PF1.ActorSheetPFNPCLoot";
  //     defaultSpellCompendium = "pf1.spells";

  //     BRTCONFIG.QUANTITY_PROPERTY_PATH = "system.quantity";
  //     BRTCONFIG.PRICE_PROPERTY_PATH = "system.price";
  //     BRTCONFIG.SPELL_LEVEL_PATH = "system.level";
  //     BRTCONFIG.ITEM_LOOT_TYPE = "loot";
  //     BRTCONFIG.SCROLL_REGEX = /\s*Scroll\s*of\s*(\d+)/gi;
  //   }

  for (let [name, data] of Object.entries(SETTINGS.GET_DEFAULT())) {
    game.settings.register(CONSTANTS.MODULE_ID, name, data);
  }

  let defaultSpellCompendium = SYSTEMS.DATA.DEFAULT_LOOT_SHEET;
  let defaultActorNpcType = SYSTEMS.DATA.DEFAULT_ACTOR_NPC_TYPE;
  let defaultLootSheet = SYSTEMS.DATA.DEFAULT_SPELL_COMPENDIUM;
  BRTCONFIG.QUANTITY_PROPERTY_PATH = SYSTEMS.DATA.QUANTITY_PROPERTY_PATH;
  BRTCONFIG.PRICE_PROPERTY_PATH = SYSTEMS.DATA.PRICE_PROPERTY_PATH;
  BRTCONFIG.SPELL_LEVEL_PATH = SYSTEMS.DATA.SPELL_LEVEL_PATH;
  BRTCONFIG.ITEM_LOOT_TYPE = SYSTEMS.DATA.ITEM_LOOT_TYPE;
  BRTCONFIG.SCROLL_REGEX = SYSTEMS.DATA.SCROLL_REGEX;

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "helpersOptions", {
    name: i18n("User Interface Integration"),
    label: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Module.AdvancedSettings.Title`),
    icon: "fas fa-user-cog",
    type: BetterRolltableSettingsConfig,
    restricted: true,
  });

  //   _registerSettingsDuringInit()

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInCompediumContextMenu.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInCompediumContextMenu.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });
  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInRolltableContextMenu.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AddRollInRolltableContextMenu.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  // /**
  //  * Base Settings Sheet
  //  */
  // game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.LOOT_SHEET_TO_USE_KEY, {
  //   name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.LootSheet.Title`),
  //   hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.LootSheet.Description`),
  //   scope: WORLD,
  //   group: GROUP_DEFAULT,
  //   config: false,
  //   default: defaultLootSheet,
  //   type: String,
  //   // choices: systemSheets,
  //   // choices: Object.values(CONFIG.Actor.sheetClasses.npc).map((s) => ({id: s.id, label: s.label}))
  // });

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.SPELL_COMPENDIUM_KEY, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.SpellCompendium.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.SpellCompendium.Description`),
    scope: WORLD,
    group: GROUP_DEFAULT,
    config: false,
    default: defaultSpellCompendium,
    type: String,
  });

  /**
   * User Interface Integration
   */

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.USE_CONDENSED_BETTERROLL, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.UseCondensedBetterRoll.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.UseCondensedBetterRoll.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_REROLL_BUTTONS, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Buttons.Reroll.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Buttons.Reroll.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_WARNING_BEFORE_REROLL, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.ShowWarningBeforeReroll.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.ShowWarningBeforeReroll.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_OPEN_BUTTONS, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Buttons.Open.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Buttons.Open.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.ROLL_TABLE_FROM_JOURNAL, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.RollTableFromJournal.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.RollTableFromJournal.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  //   _registerTagsSettings();

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.TAGS.USE, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Use.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Use.Description`),
    scope: WORLD,
    group: GROUP_TAGS,
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.TAGS.DEFAULTS, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Defaults.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Defaults.Description`),
    scope: WORLD,
    group: GROUP_TAGS,
    config: false,
    default: {},
    type: Object,
  });

  /**
   * Loot / Merchant specific
   */
  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.SHOW_CURRENCY_SHARE_BUTTON, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.ShareCurrencyButton.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.ShareCurrencyButton.Description`),
    scope: WORLD,
    group: GROUP_LOOT,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AlwaysShowGeneratedLootAsMessage.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AlwaysShowGeneratedLootAsMessage.Description`),
    scope: WORLD,
    group: GROUP_LOOT,
    config: false,
    default: false,
    type: Boolean,
  });

  /**
   * Harvest specific
   */
  game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE, {
    name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AlwaysShowGeneratedHarvestAsMessage.Title`),
    hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.AlwaysShowGeneratedHarvestAsMessage.Description`),
    scope: WORLD,
    group: GROUP_HARVEST,
    config: false,
    default: false,
    type: Boolean,
  });

  // =====================================================================

  game.settings.register(CONSTANTS.MODULE_ID, "enableOldBehavior", {
    name: `${CONSTANTS.MODULE_ID}.Settings.enableOldBehavior.name`,
    hint: `${CONSTANTS.MODULE_ID}.Settings.enableOldBehavior.hint`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });

  // =====================================================================

  game.settings.register(CONSTANTS.MODULE_ID, "debug", {
    name: `${CONSTANTS.MODULE_ID}.Settings.debug.name`,
    hint: `${CONSTANTS.MODULE_ID}.Settings.debug.hint`,
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
  });

  // ========================================================================
}

// /**
//  *
//  */
// function _registerTagsSettings() {
//   game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.TAGS.USE, {
//     name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Use.Title`),
//     hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Use.Description`),
//     scope: WORLD,
//     group: GROUP_TAGS,
//     config: false,
//     default: true,
//     type: Boolean,
//   });

//   game.settings.register(CONSTANTS.MODULE_ID, BRTCONFIG.TAGS.DEFAULTS, {
//     name: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Defaults.Title`),
//     hint: i18n(`${BRTCONFIG.NAMESPACE}.Settings.Tags.Defaults.Description`),
//     scope: WORLD,
//     group: GROUP_TAGS,
//     config: false,
//     default: {},
//     type: Object,
//   });
// }

export async function applyDefaultSettings() {
  const settings = SETTINGS.GET_SYSTEM_DEFAULTS();
  for (const [name, data] of Object.entries(settings)) {
    await game.settings.set(Constants.MODULE_ID, name, data.default);
  }
  await game.settings.set(Constants.MODULE_ID, SETTINGS.SYSTEM_VERSION, SYSTEMS.DATA.VERSION);
}

export function applySystemSpecificStyles(data = false) {
  // TODO ?
}

export async function checkSystem() {
  if (!SYSTEMS.HAS_SYSTEM_SUPPORT) {
    if (game.settings.get(Constants.MODULE_ID, SETTINGS.SYSTEM_NOT_FOUND_WARNING_SHOWN)) return;

    let settingsValid = true;
    for (const [name, data] of Object.entries(SETTINGS.GET_DEFAULT())) {
      settingsValid = settingsValid && game.settings.get(Constants.MODULE_ID, name).length !== new data.type().length;
    }

    if (settingsValid) return;

    new Dialog({
      title: game.i18n.localize(`${Constants.MODULE_ID}.Dialog.systemfound.title`),
      content: warn(game.i18n.localize(`${Constants.MODULE_ID}.Dialog.systemfound.content`), true),
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${Constants.MODULE_ID}.Dialog.systemfound.confirm`),
          callback: () => {
            applyDefaultSettings();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("No"),
        },
      },
      default: "cancel",
    }).render(true);

    return game.settings.set(Constants.MODULE_ID, SETTINGS.SYSTEM_NOT_FOUND_WARNING_SHOWN, true);
  }

  if (game.settings.get(Constants.MODULE_ID, SETTINGS.SYSTEM_FOUND) || SYSTEMS.DATA.INTEGRATION) {
    const currentVersion = game.settings.get(Constants.MODULE_ID, SETTINGS.SYSTEM_VERSION);
    const newVersion = SYSTEMS.DATA.VERSION;
    debug(`Comparing system version - Current: ${currentVersion} - New: ${newVersion}`);
    if (foundry.utils.isNewerVersion(newVersion, currentVersion)) {
      debug(`Applying system settings for ${game.system.title}`);
      await applyDefaultSettings();
    }
    return;
  }

  await game.settings.set(Constants.MODULE_ID, SETTINGS.SYSTEM_FOUND, true);

  if (game.settings.get(Constants.MODULE_ID, SETTINGS.SYSTEM_NOT_FOUND_WARNING_SHOWN)) {
    dialogWarning(game.i18n.localize(`${Constants.MODULE_ID}.Dialog.nosystemfound.content`));
  }

  return applyDefaultSettings();
}
