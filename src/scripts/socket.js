import API from "./API.js";
import { CONSTANTS } from "./constants/constants.js";

export let betterRolltablesSocket;
export function registerSocket() {
  //Logger.debug("Registered betterRolltablesSocket");
  if (betterRolltablesSocket) {
    return betterRolltablesSocket;
  }
  //@ts-ignore
  // eslint-disable-next-line no-undef
  betterRolltablesSocket = socketlib.registerModule(CONSTANTS.MODULE_ID);
  /**
   * Automated EvocationsVariant sockets
   */
  betterRolltablesSocket.register("invokeGenericChatCardCreateArr", (...args) =>
    API.invokeGenericChatCardCreateArr(...args)
  );
  // betterRolltablesSocket.register("invokeBetterChatCardCreateArr", (...args) =>
  //   API.invokeBetterChatCardCreateArr(...args)
  // );
  // betterRolltablesSocket.register("invokeLootChatCardCreateArr", (...args) => API.invokeLootChatCardCreateArr(...args));
  // betterRolltablesSocket.register("invokeStoryChatCardCreateArr", (...args) =>
  //   API.invokeStoryChatCardCreateArr(...args)
  // );
  // betterRolltablesSocket.register("invokeHarvestChatCardCreateArr", (...args) =>
  //   API.invokeHarvestChatCardCreateArr(...args)
  // );
  betterRolltablesSocket.register("invokeBetterTableRollArr", (...args) => API.invokeBetterTableRollArr(...args));

  // Basic
  game.modules.get(CONSTANTS.MODULE_ID).socket = betterRolltablesSocket;
  return betterRolltablesSocket;
}
