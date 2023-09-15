import { CONSTANTS } from "./scripts/core/config.js";
import { BetterRolltableHooks } from "./scripts/hooks/init.js";

//   BetterRolltableHooks.init();

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async () => {
  // log(`${CONSTANTS.MODULE_ID} | Initializing ${CONSTANTS.MODULE_ID}`);

  // Register custom module settings
  //   registerSettings();
  //   initHooks();

  BetterRolltableHooks.foundryInit();

  // Preload Handlebars templates
  //await preloadTemplates();
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
  // Do anything after initialization but before ready
  //   setupHooks();
  BetterRolltableHooks.foundrySetup();
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", async () => {
  // Do anything once the module is ready
  // if (!game.modules.get('lib-wrapper')?.active && game.user?.isGM) {
  //   let word = 'install and activate';
  //   if (game.modules.get('lib-wrapper')) word = 'activate';
  //   throw error(`Requires the 'libWrapper' module. Please ${word} it.`);
  // }
  // if (!game.modules.get('socketLib')?.active && game.user?.isGM) {
  //   let word = 'install and activate';
  //   if (game.modules.get('socketLib')) word = 'activate';
  //   throw error(`Requires the 'socketLib' module. Please ${word} it.`);
  // }
  //   readyHooks();
  BetterRolltableHooks.foundryReady();
});

/* ------------------------------------ */
/* Other Hooks							*/
/* ------------------------------------ */

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(CONSTANTS.MODULE_ID);
});

/**
 * Initialization helper, to set API.
 * @param api to set to game module.
 */
export function setApi(api) {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  data.api = api;
}

/**
 * Returns the set API.
 * @returns Api from games module.
 */
export function getApi() {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  return data.api;
}

/**
 * Initialization helper, to set Socket.
 * @param socket to set to game module.
 */
export function setSocket(socket) {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  data.socket = socket;
}

/*
 * Returns the set socket.
 * @returns Socket from games module.
 */
export function getSocket() {
  const data = game.modules.get(CONSTANTS.MODULE_ID);
  return data.socket;
}
