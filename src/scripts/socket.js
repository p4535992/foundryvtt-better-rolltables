import API from "./API";
import { CONSTANTS } from "./constants/constants";
import { debug } from "./lib";

export let betterRolltablesSocket;
export function registerSocket() {
  //debug("Registered betterRolltablesSocket");
  if (betterRolltablesSocket) {
    return betterRolltablesSocket;
  }
  //@ts-ignore
  // eslint-disable-next-line no-undef
  betterRolltablesSocket = socketlib.registerModule(CONSTANTS.MODULE_ID);
  /**
   * Automated EvocationsVariant sockets
   */
  betterRolltablesSocket.register("invokeBetterChatCardCreateArr", (...args) =>
    API.invokeBetterChatCardCreateArr(...args)
  );
  betterRolltablesSocket.register("invokeLootChatCardCreateArr", (...args) => API.invokeLootChatCardCreateArr(...args));
  betterRolltablesSocket.register("invokeStoryChatCardCreateArr", (...args) =>
    API.invokeStoryChatCardCreateArr(...args)
  );
  betterRolltablesSocket.register("invokeHarvestChatCardCreateArr", (...args) =>
    API.invokeHarvestChatCardCreateArr(...args)
  );
  betterRolltablesSocket.register("invokeBetterTableRollArr", (...args) => API.invokeBetterTableRollArr(...args));

  // Basic
  setSocket(betterRolltablesSocket);
  return betterRolltablesSocket;
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
