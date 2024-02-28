import { CONSTANTS } from "../constants/constants.js";
import { error, i18n } from "../lib/lib.js";
import { GROUP_DEFAULT, GROUP_LOOT, GROUP_TAGS, GROUP_UI } from "../settings.js";

/**
 * A game settings configuration application
 * This form renders the settings defined via the game.settings.register API which have config = true
 *
 * @extends {FormApplication}
 */
export class BetterRolltableSettingsConfig extends FormApplication {
  constructor() {
    super();
    this.app = null;

    loadTemplates([
      `${CONSTANTS.PATH}/templates/config/settings.hbs`,
      `${CONSTANTS.PATH}/templates/config/new_rule_form.hbs`,
      `${CONSTANTS.PATH}/templates/partials/actions.hbs`,
      `${CONSTANTS.PATH}/templates/partials/dropdown_options.hbs`,
      `${CONSTANTS.PATH}/templates/partials/filters.hbs`,
      `${CONSTANTS.PATH}/templates/partials/settings.hbs`,
      `${CONSTANTS.PATH}/templates/partials/menu.hbs`,
    ]);

    return this;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Title`),
      id: "betterrolltables-settings",
      template: `${CONSTANTS.PATH}/templates/config/settings.hbs`,
      width: 650,
      height: "auto",
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".content",
          initial: "general",
        },
      ],
    });
  }

  /** @override */
  getData(options) {
    /**
     * The settings assigned to this need a "group" that is either of these tabs.name
     */
    const data = this.getTabData();

    // Classify all settings
    for (let setting of game.settings.settings.values()) {
      // Only concerned about loot populator settings
      if (setting.namespace !== CONSTANTS.MODULE_ID) continue;

      // Exclude settings the user cannot change
      if (!game.user.isGM) continue;

      // Update setting data
      const s = duplicate(setting);
      s.name = i18n(s.name);
      s.hint = i18n(s.hint);
      s.value = game.settings.get(s.namespace, s.key);
      s.type = setting.type instanceof Function ? setting.type.name : "String";
      s.isCheckbox = setting.type === Boolean;
      s.isSelect = s.choices !== undefined;
      s.isRange = setting.type === Number && s.range;

      // Classify setting
      const name = s.namespace;
      if (name === CONSTANTS.MODULE_ID) {
        const group = s.group;
        let groupTab = data.tabs.find((tab) => tab.name === group) ?? false;
        if (groupTab) {
          groupTab.settings.push(s);
        }
      }
    }

    // Return data
    return {
      systemTitle: game.system.title,
      data: data,
    };
  }

  /** @override */
  async _updateObject(event, formData) {
    event.preventDefault();
    // formData = expandObject(formData)[MODULE.ns];
    for (let [k, v] of Object.entries(formData)) {
      await game.settings.set(CONSTANTS.MODULE_ID, k.substring(k.indexOf(".") + 1), v);
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @override */
  async activateListeners(html) {
    if (!this.app) {
      this.app = document.getElementById("betterrolltables-settings");
    }

    super.activateListeners(html);

    html.find(".submenu button").click(this._onClickSubmenu.bind(this));
    html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
  }

  /**
   * Handle activating the button to configure User Role permissions
   * @param event {Event}   The initial button click event
   * @private
   */
  _onClickSubmenu(event) {
    event.preventDefault();
    const menu = game.settings.menus.get(event.currentTarget.dataset.key);
    if (!menu) {
      return error("No submenu found for the provided key", true);
    }
    const app = new menu.type();
    return app.render(true);
  }

  /**
   * Handle button click to reset default settings
   * @param event {Event}   The initial button click event
   * @private
   */
  _onResetDefaults(event) {
    event.preventDefault();
    const resetOptions = event.currentTarget.form.querySelectorAll(".tab.active .settings-list [data-default]");
    for (let input of resetOptions) {
      if (input && input.type === "checkbox") input.checked = input.dataset.default;
      else if (input) input.value = input.dataset.default;
    }
  }

  getTabData() {
    return {
      tabs: [
        {
          name: GROUP_DEFAULT,
          description: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.Base.Description`),
          i18nName: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.Base.Title`),
          class: "fas fa-table",
          menus: [],
          settings: [],
        },
        {
          name: GROUP_UI,
          description: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.UI.Description`),
          i18nName: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.UI.Title`),
          class: "fas fa-cog",
          menus: [],
          settings: [],
        },
        {
          name: GROUP_LOOT,
          description: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.Loot.Description`),
          i18nName: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.Loot.Title`),
          class: "fas fa-cog",
          menus: [],
          settings: [],
        },
        {
          name: GROUP_TAGS,
          description: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.Tags.Description`),
          i18nName: i18n(`${CONSTANTS.MODULE_ID}.Settings.Module.AdvancedSettings.Menu.Tags.Title`),
          class: "fas fa-tags",
          menus: [],
          settings: [],
        },
      ],
    };
  }
}

export const PATH = `modules/${CONSTANTS.MODULE_ID}`;
