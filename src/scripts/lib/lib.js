import { CONSTANTS } from "../constants/constants";
import Logger from "./Logger";

// =========================================================================================

export function isEmptyObject(obj) {
  // because Object.keys(new Date()).length === 0;
  // we have to do some additional check
  if (obj === null || obj === undefined) {
    return true;
  }
  if (isRealNumber(obj)) {
    return false;
  }
  if (obj instanceof Object && Object.keys(obj).length === 0) {
    return true;
  }
  if (obj instanceof Array && obj.length === 0) {
    return true;
  }
  if (obj && Object.keys(obj).length === 0) {
    return true;
  }
  return false;
}

export function isRealNumber(inNumber) {
  return !isNaN(inNumber) && typeof inNumber === "number" && isFinite(inNumber);
}

export function isRealBoolean(inBoolean) {
  return String(inBoolean) === "true" || String(inBoolean) === "false";
}

export function isRealBooleanOrElseNull(inBoolean) {
  return isRealBoolean(inBoolean) ? inBoolean : null;
}

export function getSubstring(string, char1, char2) {
  return string.slice(string.indexOf(char1) + 1, string.lastIndexOf(char2));
}

// ================================
// Retrieve document utility
// ================================

export function getDocument(target) {
  if (stringIsUuid(target)) {
    target = fromUuidSync(target);
  }
  return target?.document ?? target;
}

export function stringIsUuid(inId) {
  return typeof inId === "string" && (inId.match(/\./g) || []).length && !inId.endsWith(".");
}

export function getUuid(target) {
  if (stringIsUuid(target)) {
    return target;
  }
  const document = getDocument(target);
  return document?.uuid ?? false;
}

export function getCompendiumCollectionSync(target, ignoreError = false, ignoreName = true) {
  let targetTmp = target;
  if (!targetTmp) {
    throw Logger.error(`CompendiumCollection is undefined`, true, targetTmp);
  }
  if (targetTmp instanceof CompendiumCollection) {
    return targetTmp;
  }
  // This is just a patch for compatibility with others modules
  if (targetTmp.document) {
    targetTmp = targetTmp.document;
  }
  if (targetTmp.uuid) {
    targetTmp = targetTmp.uuid;
  }

  if (targetTmp instanceof CompendiumCollection) {
    return targetTmp;
  }
  // if (stringIsUuid(targetTmp)) {
  //   target = fromUuid(targetTmp);
  // } else {
  targetTmp = game.packs.get(targetTmp);
  if (!targetTmp && !ignoreName) {
    targetTmp = game.packs.getName(targetTmp);
  }
  // }
  if (!targetTmp) {
    if (ignoreError) {
      Logger.warn(`CompendiumCollection is not found`, false, targetTmp);
      return;
    } else {
      throw Logger.error(`CompendiumCollection is not found`, true, targetTmp);
    }
  }
  // Type checking
  if (!(targetTmp instanceof CompendiumCollection)) {
    if (ignoreError) {
      Logger.warn(`Invalid CompendiumCollection`, true, targetTmp);
      return;
    } else {
      throw Logger.error(`Invalid CompendiumCollection`, true, targetTmp);
    }
  }
  return targetTmp;
}

export async function getCompendiumCollectionAsync(target, ignoreError = false, ignoreName = true) {
  let targetTmp = target;
  if (!targetTmp) {
    throw Logger.error(`CompendiumCollection is undefined`, true, targetTmp);
  }
  if (targetTmp instanceof CompendiumCollection) {
    return targetTmp;
  }
  // This is just a patch for compatibility with others modules
  if (targetTmp.document) {
    targetTmp = targetTmp.document;
  }
  if (targetTmp.uuid) {
    targetTmp = targetTmp.uuid;
  }

  if (targetTmp instanceof CompendiumCollection) {
    return targetTmp;
  }
  // if (stringIsUuid(targetTmp)) {
  //   target = await fromUuid(targetTmp);
  // } else {
  targetTmp = game.packs.get(targetTmp);
  if (!targetTmp && !ignoreName) {
    targetTmp = game.packs.getName(targetTmp);
  }
  // }
  if (!targetTmp) {
    if (ignoreError) {
      Logger.warn(`CompendiumCollection is not found`, false, targetTmp);
      return;
    } else {
      throw Logger.error(`CompendiumCollection is not found`, true, targetTmp);
    }
  }
  // Type checking
  if (!(targetTmp instanceof CompendiumCollection)) {
    if (ignoreError) {
      Logger.warn(`Invalid CompendiumCollection`, true, targetTmp);
      return;
    } else {
      throw Logger.error(`Invalid CompendiumCollection`, true, targetTmp);
    }
  }
  return targetTmp;
}
