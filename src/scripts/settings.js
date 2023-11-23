import { CONSTANTS } from "./constants/constants";
import SETTINGS from "./constants/settings";
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
//   game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU, {
//     name: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInCompediumContextMenu.Title`),
//     hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInCompediumContextMenu.Description`),
//     scope: WORLD,
//     group: GROUP_UI,
//     config: false,
//     default: false,
//     type: Boolean,
//   });
//   game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU, {
//     name: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInRolltableContextMenu.Title`),
//     hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInRolltableContextMenu.Description`),
//     scope: WORLD,
//     group: GROUP_UI,
//     config: false,
//     default: false,
//     type: Boolean,
//   });
// }

export function registerSettings() {
  for (let [name, data] of Object.entries(SETTINGS.GET_DEFAULT())) {
    game.settings.register(CONSTANTS.MODULE_ID, name, data);
  }

  let defaultSpellCompendium = SYSTEMS.DATA.DEFAULT_SPELL_COMPENDIUM;
  let defaultActorNpcType = SYSTEMS.DATA.DEFAULT_ACTOR_NPC_TYPE;
  let defaultLootSheet = SYSTEMS.DATA.DEFAULT_LOOT_SHEET;
  CONSTANTS.QUANTITY_PROPERTY_PATH = SYSTEMS.DATA.QUANTITY_PROPERTY_PATH;
  CONSTANTS.WEIGHT_PROPERTY_PATH = SYSTEMS.DATA.WEIGHT_PROPERTY_PATH;
  CONSTANTS.PRICE_PROPERTY_PATH = SYSTEMS.DATA.PRICE_PROPERTY_PATH;
  CONSTANTS.SPELL_LEVEL_PATH = SYSTEMS.DATA.SPELL_LEVEL_PATH;
  CONSTANTS.ITEM_LOOT_TYPE = SYSTEMS.DATA.ITEM_LOOT_TYPE;
  CONSTANTS.SCROLL_REGEX = SYSTEMS.DATA.SCROLL_REGEX;

  game.settings.registerMenu(CONSTANTS.MODULE_ID, "helpersOptions", {
    name: i18n("User Interface Integration"),
    label: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Title`),
    icon: "fas fa-user-cog",
    type: BetterRolltableSettingsConfig,
    restricted: true,
  });

  //   _registerSettingsDuringInit()

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.ADD_ROLL_IN_COMPENDIUM_CONTEXTMENU, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInCompediumContextMenu.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInCompediumContextMenu.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });
  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.ADD_ROLL_IN_ROLLTABLE_CONTEXTMENU, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInRolltableContextMenu.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.AddRollInRolltableContextMenu.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  // /**
  //  * Base Settings Sheet
  //  */
  // game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.LOOT_SHEET_TO_USE_KEY, {
  //   name: i18n(`${CONSTANTS.MODULE_ID}.Settings.LootSheet.Title`),
  //   hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.LootSheet.Description`),
  //   scope: WORLD,
  //   group: GROUP_DEFAULT,
  //   config: false,
  //   default: defaultLootSheet,
  //   type: String,
  //   // choices: systemSheets,
  //   // choices: Object.values(CONFIG.Actor.sheetClasses.npc).map((s) => ({id: s.id, label: s.label}))
  // });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SPELL_COMPENDIUM_KEY, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.SpellCompendium.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.SpellCompendium.Description`),
    scope: WORLD,
    group: GROUP_DEFAULT,
    config: false,
    default: defaultSpellCompendium,
    type: String,
  });

  /**
   * User Interface Integration
   */

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.USE_CONDENSED_BETTERROLL, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.UseCondensedBetterRoll.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.UseCondensedBetterRoll.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SHOW_REROLL_BUTTONS, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Buttons.Reroll.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Buttons.Reroll.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SHOW_WARNING_BEFORE_REROLL, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.ShowWarningBeforeReroll.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.ShowWarningBeforeReroll.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SHOW_OPEN_BUTTONS, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Buttons.Open.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Buttons.Open.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.ROLL_TABLE_FROM_JOURNAL, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.RollTableFromJournal.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.RollTableFromJournal.Description`),
    scope: WORLD,
    group: GROUP_UI,
    config: false,
    default: false,
    type: Boolean,
  });

  //   _registerTagsSettings();

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.TAGS.USE, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Use.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Use.Description`),
    scope: WORLD,
    group: GROUP_TAGS,
    config: false,
    default: true,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.TAGS.DEFAULTS, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Defaults.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Defaults.Description`),
    scope: WORLD,
    group: GROUP_TAGS,
    config: false,
    default: {},
    type: Object,
  });

  /**
   * Loot / Merchant specific
   */
  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.SHOW_CURRENCY_SHARE_BUTTON, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.ShareCurrencyButton.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.ShareCurrencyButton.Description`),
    scope: WORLD,
    group: GROUP_LOOT,
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.ALWAYS_SHOW_GENERATED_LOOT_AS_MESSAGE, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.AlwaysShowGeneratedLootAsMessage.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.AlwaysShowGeneratedLootAsMessage.Description`),
    scope: WORLD,
    group: GROUP_LOOT,
    config: false,
    default: false,
    type: Boolean,
  });

  /**
   * Harvest specific
   */
  game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.ALWAYS_SHOW_GENERATED_HARVEST_AS_MESSAGE, {
    name: i18n(`${CONSTANTS.MODULE_ID}.Settings.AlwaysShowGeneratedHarvestAsMessage.Title`),
    hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.AlwaysShowGeneratedHarvestAsMessage.Description`),
    scope: WORLD,
    group: GROUP_HARVEST,
    config: false,
    default: false,
    type: Boolean,
  });

  // =====================================================================

  // game.settings.register(CONSTANTS.MODULE_ID, "enableOldBehavior", {
  //   name: `${CONSTANTS.MODULE_ID}.Settings.enableOldBehavior.name`,
  //   hint: `${CONSTANTS.MODULE_ID}.Settings.enableOldBehavior.hint`,
  //   scope: "world",
  //   config: true,
  //   default: false,
  //   type: Boolean,
  // });

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
//   game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.TAGS.USE, {
//     name: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Use.Title`),
//     hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Use.Description`),
//     scope: WORLD,
//     group: GROUP_TAGS,
//     config: false,
//     default: true,
//     type: Boolean,
//   });

//   game.settings.register(CONSTANTS.MODULE_ID, CONSTANTS.TAGS.DEFAULTS, {
//     name: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Defaults.Title`),
//     hint: i18n(`${CONSTANTS.MODULE_ID}.Settings.Tags.Defaults.Description`),
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
