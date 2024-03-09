import { CONSTANTS } from "../constants/constants";
import Logger from "./Logger";

// =========================================================================================

/**
 * Here is a little function that checks the validity of both types of regexes, strings or patterns
 * The user will be able to test both 'test' and '/test/g'.
 * let a = validateRegex("/test/i");
 * let b = new RegExp("/test/i");
 * let s = "teSt";
 * let t1 = a.test(s); // true
 * let t2 = b.test(s); // false
 * @href https://stackoverflow.com/questions/17250815/how-to-check-if-the-input-string-is-a-valid-regular-expression
 * @param {*} pattern
 * @returns
 */
export function testWithRegex(nameToCheck, pattern = "") {
    function validateRegex(pattern) {
        let parts = pattern.split("/");
        let regex = pattern;
        let options = "";
        if (parts.length > 1) {
            regex = parts[1];
            options = parts[2];
        }
        try {
            return new RegExp(regex, options);
            //just remove this return and return true instead
        } catch (e) {
            return false;
        }
    }
    let patternTmp = pattern ? pattern : `/${nameToCheck}/i`;
    let a = validateRegex(patternTmp);
    if (a) {
        let t1 = a.test(s);
        return t1;
    } else {
        return false;
    }
}

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
