import { BetterRT } from "../better-table-view.js";
import { BetterTables } from "../better-tables.js";
import { BRTUtils } from "../core/utils.js";
import { setApi } from "../../module.js";
import API from "../API.js";
import { registerSettings } from "../settings.js";
import { CONSTANTS } from "../constants/constants.js";
import { BetterRollTableBetterConfig } from "../better/brt-rolltable-config.js";
import SETTINGS from "../constants/settings.js";
import { BetterRollTableLootConfig } from "../loot/loot-rolltable-config.js";
import { BetterRollTableStoryConfig } from "../story/story-rolltable-config.js";
import { BetterRollTableHarvestConfig } from "../harvest/harvest-rolltable-config.js";
import { registerSocket } from "../socket.js";
import { isEmptyObject } from "../lib.js";

/**
 * @module BetterRollTables.BetterRolltableHooks
 * @typicalname BetterRolltableHooks
 *
 * @version 1.0.0
 *
 */
class BetterRolltableHooks {
  // /**
  //  * Hooks on game hooks and attaches methods
  //  */
  // static init() {
  //   Hooks.once("init", BetterRolltableHooks.foundryInit);
  //   Hooks.once("ready", BetterRolltableHooks.foundryReady);
  //   Hooks.once("aipSetup", BetterRolltableHooks.onAIPSetup);
  //   Hooks.once("devModeReady", BetterRolltableHooks.onDevModeReady);
  //   Hooks.once("setup", BetterRolltableHooks.foundrySetup);
  // }

  static foundrySetup() {
    // game.modules.get("better-rolltables").api
    setApi(API);

    // For retrocompatibility only...
    // game.betterTables
    game.betterTables = game.modules.get(CONSTANTS.MODULE_ID).api.betterTables;

    // game.modules.get(CONSTANTS.MODULE_ID).public.API;
    game.modules.get(CONSTANTS.MODULE_ID).public = {
      API: game.modules.get(CONSTANTS.MODULE_ID).api,
    };

    // Freeze the public API so it can't be modified.
    Object.freeze(game.modules.get(CONSTANTS.MODULE_ID).public);
  }

  static async foundryReady() {
    // const moduleSettings = new Settings();
    // moduleSettings.registerSettings();

    // if (game.settings.get(CONSTANTS.MODULE_ID, SETTINGS.ENABLE_OLD_BEHAVIOR)) {
    //   Hooks.on("renderRollTableConfig", BetterRT.enhanceRollTableView);
    // }
    Hooks.on("renderRollTableConfig", BetterTables.checkRenderDefaultRollTableConfig);
    Hooks.on("renderChatMessage", BetterTables.handleChatMessageButtons);
    Hooks.on("renderJournalPageSheet", BetterTables.handleRolltableLink);
    Hooks.on("renderItemSheet", BetterTables.handleRolltableLink);
    // Hooks.on("dropRollTableSheetData", BetterTables.handleDropRollTableSheetData);

    // TODO we really need this ???
    if (game.system.id === "dnd5e") {
      Hooks.on("renderActorSheet", BetterTables.handleChatMessageButtons);
    }

    // Handlebars.registerHelper("brt-ifequals", function (arg1, arg2, options) {
    //   return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    // });

    // https://stackoverflow.com/questions/47681668/handlebars-if-else-if-else-with-string-equality-function
    // Handlebars.registerHelper("brt-eq", function () {
    //   const args = Array.prototype.slice.call(arguments, 0, -1);
    //   return args.every(function (expression) {
    //       return args[0] === expression;
    //   });
    // });

    /** Register Handlebar helpers **/
    /** checks if the first argument is equal to any of the subsequent arguments */
    Handlebars.registerHelper("ifcontain", function () {
      const options = arguments[arguments.length - 1];
      for (let i = 1; i < arguments.length - 1; i++) {
        if (arguments[0] === arguments[i]) {
          return options.fn(this);
        }
      }
      return options.inverse(this);
    });

    // Handlebars.registerHelper("brt-ifEquals", function (arg1, arg2, options) {
    //   return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    // });

    /** checks if the first argument is greater than the second argument */
    Handlebars.registerHelper("ifgt", function (a, b, options) {
      return a > b ? options.fn(this) : options.inverse(this);
    });

    // Handlebars.registerHelper("brt-ifeq", function (a, b, options) {
    //   return a == b ? options.fn(this) : options.inverse(this);
    // });

    // Handlebars.registerHelper("brt-uneq", function (a, b, options) {
    //   return a != b ? options.fn(this) : options.inverse(this);
    // });

    /** return fas icon based on document name */
    Handlebars.registerHelper("entity-icon", function (documentName) {
      return BRTUtils.getIconByEntityType(documentName);
    });

    Handlebars.registerHelper("format-currencies", function (currenciesData) {
      let currencyString = "";
      for (const key in currenciesData) {
        if (currencyString !== "") currencyString += ", ";
        currencyString += `${currenciesData[key]}${key}`;
      }
      return currencyString;
    });

    Handlebars.registerHelper("switch", function (value, options) {
      this.switch_value = value;
      return options.fn(this);
    });

    Handlebars.registerHelper("brt-isEmpty", function (value, options) {
      // return value === undefined ||
      //   value === null ||
      //   (value instanceof Object && Object.keys(value).length === 0) ||
      //   (value instanceof Array && value.length === 0)
      //   ? options.fn(this)
      //   : options.inverse(this);
      return isEmptyObject(value) || value === "" ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("brt-unlessEmpty", function (value, options) {
      // return value !== undefined &&
      //   value !== null &&
      //   ((value instanceof Object && Object.keys(value).length > 0) || (value instanceof Array && value.length > 0))
      //   ? options.fn(this)
      //   : options.inverse(this);
      return !isEmptyObject(value) && value !== "" ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("case", function (value, options) {
      if (value == this.switch_value) {
        return options.fn(this);
      }
    });

    await API.updateSpellCache();
  }

  static foundryInit() {
    registerSettings();

    Hooks.on("getCompendiumDirectoryEntryContext", BetterTables.enhanceCompendiumContextMenu);
    Hooks.on("getRollTableDirectoryEntryContext", BetterTables.enhanceRolltableContextMenu);
    Hooks.once("aipSetup", BetterRolltableHooks.onAIPSetup);

    // WE DON'T NEED THIS WITH BRT WE ALREADY OVERRRIDE THE ROLL MODE
    // libWrapper.register(CONSTANTS.MODULE_ID, "RollTable.prototype.draw", BetterTables.rolltableDrawHandler, "MIXED");

    RollTables.registerSheet(CONSTANTS.MODULE_ID, BetterRollTableBetterConfig, {
      label: "BRT - Better Rolltable",
      makeDefault: false,
    });
    RollTables.registerSheet(CONSTANTS.MODULE_ID, BetterRollTableLootConfig, {
      label: "BRT - Loot Rolltable",
      makeDefault: false,
    });
    RollTables.registerSheet(CONSTANTS.MODULE_ID, BetterRollTableStoryConfig, {
      label: "BRT - Story Rolltable",
      makeDefault: false,
    });
    RollTables.registerSheet(CONSTANTS.MODULE_ID, BetterRollTableHarvestConfig, {
      label: "BRT - Harvest Rolltable",
      makeDefault: false,
    });
  }

  /**
   * Register with AIP
   *
   * Register fields with autocomplete inline properties
   */
  static async onAIPSetup() {
    const autocompleteInlinePropertiesApi = game.modules.get("autocomplete-inline-properties").API;
    const DATA_MODE = autocompleteInlinePropertiesApi.CONST.DATA_MODE;

    // AIP
    // Define the config for our package
    const config = {
      packageName: CONSTANTS.MODULE_ID,
      sheetClasses: [
        {
          name: "RolltableConfig", // this _must_ be the class name of the `Application` you want it to apply to
          fieldConfigs: [
            {
              selector: `.tags .tagger input`,
              showButton: true,
              allowHotkey: true,
              dataMode: DATA_MODE.OWNING_ACTOR_DATA,
            },
          ],
        },
      ],
    };

    // Add our config
    autocompleteInlinePropertiesApi.PACKAGE_CONFIG.push(config);
  }

  //   static onDevModeReady({ registerPackageDebugFlag }) {
  //     registerPackageDebugFlag(CONSTANTS.MODULE_ID);
  //   }
}

export { BetterRolltableHooks };
