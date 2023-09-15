// ↓ IMPORT SYSTEMS HERE ↓
import dnd5e from "./systems/dnd5e/dnd5e.js";
import sw5e from "./systems/sw5e/sw5e.js";
import generic from "./systems/generic/generic.js";
import pf2e from "./systems/pf2e/pf2e.js";
import pf1 from "./systems/pf1/pf1.js";
import sfrpg from "./systems/sfrpg/sfrpg.js";
// ↑ IMPORT SYSTEMS HERE ↑

/**
 * NOTE: YOUR PULL REQUEST WILL NOT BE ACCEPTED IF YOU DO NOT
 * FOLLOW THE CONVENTION IN THE D&D 5E SYSTEM FILE
 */
export const SYSTEMS = {
  SUPPORTED_SYSTEMS: {
    // ↓ ADD SYSTEMS HERE ↓
    alienrpg: {
      latest: generic,
    },
    dnd4e: {
      latest: generic,
    },
    dnd5e: {
      latest: dnd5e,
    },
    pf1: {
      latest: pf1,
    },
    pf2e: {
      latest: pf2e,
    },
    ds4: {
      latest: generic,
    },
    d35e: {
      latest: generic,
    },
    "blade-runner": {
      latest: generic,
    },
    sfrpg: {
      latest: sfrpg,
    },
    swade: {
      latest: generic,
    },
    tormenta20: {
      latest: generic,
    },
    wfrp4e: {
      latest: generic,
    },
    splittermond: {
      latest: generic,
    },
    "forbidden-lands": {
      latest: generic,
    },
    icrpg: {
      latest: generic,
    },
    icrpgme: {
      latest: generic,
    },
    swse: {
      latest: generic,
    },
    sw5e: {
      latest: sw5e,
    },
    fallout: {
      latest: generic,
    },
    "cyberpunk-red-core": {
      latest: generic,
    },
    knave: {
      latest: generic,
    },
    t2k4e: {
      latest: generic,
    },
    yzecoriolis: {
      latest: generic,
    },
    kamigakari: {
      latest: generic,
    },
    wwn: {
      latest: generic,
    },
    symbaroum: {
      latest: generic,
    },
    cyphersystem: {
      latest: generic,
    },
    ptu: {
      latest: generic,
    },
    dcc: {
      latest: generic,
    },
    a5e: {
      latest: generic,
    },
    "dark-heresy": {
      latest: generic,
    },
    naheulbeuk: {
      latest: generic,
    },
    // ↑ ADD SYSTEMS HERE ↑
  },

  DEFAULT_SETTINGS: {
    DEFAULT_LOOT_SHEET: "",
    DEFAULT_SPELL_COMPENDIUM: "",
    QUANTITY_PROPERTY_PATH: "",
    PRICE_PROPERTY_PATH: "",
    SPELL_LEVEL_PATH: "",
    ITEM_LOOT_TYPE: "",
    SCROLL_REGEX: "",
  },

  get HAS_SYSTEM_SUPPORT() {
    return !!this.SUPPORTED_SYSTEMS?.[game.system.id.toLowerCase()];
  },

  _currentSystem: false,

  get DATA() {
    if (this._currentSystem) return this._currentSystem;

    const system = this.SUPPORTED_SYSTEMS?.[game.system.id.toLowerCase()];
    if (!system) return this.DEFAULT_SETTINGS;

    if (system[game.system.version]) {
      this._currentSystem = foundry.utils.mergeObject(this.DEFAULT_SETTINGS, system[game.system.version]);
      return this._currentSystem;
    }

    const versions = Object.keys(system);
    if (versions.length === 1) {
      this._currentSystem = foundry.utils.mergeObject(this.DEFAULT_SETTINGS, system[versions[0]]);
      return this._currentSystem;
    }

    versions.sort((a, b) => {
      return a === "latest" || b === "latest" ? -Infinity : isNewerVersion(b, a) ? -1 : 1;
    });
    const version = versions.find((version) => {
      return version === "latest" || !isNewerVersion(game.system.version, version);
    });

    this._currentSystem = foundry.utils.mergeObject(this.DEFAULT_SETTINGS, system[version]);

    return this._currentSystem;
  },

  addSystem(data) {
    this.SUPPORTED_SYSTEMS[game.system.id.toLowerCase()] = { latest: data };
  },
};
