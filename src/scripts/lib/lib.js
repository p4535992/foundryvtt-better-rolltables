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
