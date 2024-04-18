import { CONSTANTS } from "../constants/constants";
import { BRTBetterHelpers } from "../tables/better/brt-helper";
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
 * @param {string} stringToCheck The string passed to check
 * @param {string} [pattern=""] The regular expression to use on the string passed.
 * @param {boolean} [enableExactMatch=false] Enable Exact Match.
 * @param {boolean} [enableAnySuffixMatch=false] Enable Any Suffix Match.
 * @returns {boolean} The regular expression match the string passed.
 */
export function testWithRegex(stringToCheck, pattern = "", enableExactMatch = false, enableAnySuffixMatch = false) {
    if (!pattern) {
        return false;
    }
    if (enableExactMatch) {
        let t2 = stringToCheck?.toLowerCase()?.trim() === pattern?.toLowerCase()?.trim();
        if (t2) {
            Logger.debug(`testWithRegex | Regex found with enableExactMatch ${stringToCheck} === ${pattern}`, false);
        }
        return t2;
    }

    let stringToCheckTmp = stringToCheck?.toLowerCase()?.trim();
    let patternTmp = pattern?.toLowerCase()?.trim();
    if (enableAnySuffixMatch && !patternTmp.endsWith(`(.*?)`)) {
        patternTmp = `^${patternTmp}(.*?)$`;
    } else {
        patternTmp = `^${patternTmp}$`;
    }
    try {
        let t1 = new RegExp(patternTmp).test(stringToCheckTmp); // stringToCheck.match(patternTmp);
        if (t1) {
            Logger.debug(`testWithRegex | Regex found ${stringToCheck} <=> ${pattern}`, false);
        }
        return t1;
    } catch (e) {
        Logger.error(`testWithRegex | Regex error ${stringToCheck} <=> ${pattern}`, false, e);
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

/**
 * Parses the given object as an array.
 * If the object is a string, it splits it by commas and returns an array.
 * If the object is already an array, it returns the same array.
 * If the object is neither a string nor an array, it wraps it in an array and returns it.
 * @param {string|Array|any} obj - The object to be parsed as an array.
 * @returns {Array} - The parsed array.
 */
export function parseAsArray(obj) {
    if (!obj) {
        return [];
    }
    let arr = [];
    if (typeof obj === "string" || obj instanceof String) {
        arr = obj.split(",");
    } else if (obj.constructor === Array) {
        arr = obj;
    } else {
        arr = [obj];
    }
    return arr;
}

/**
 * Normalize the roll mode found by the pattern.
 * @param {String} mode the mode found by the pattern
 * @returns the corresponding value from `CONST.DICE_ROLL_MODES`
 */
export function getRollMode(mode) {
    switch (mode) {
        case "r":
        case "roll": {
            return "roll";
        }
        case "pr":
        case "publicroll": {
            return "publicroll";
        }
        case "gmr":
        case "gmroll": {
            return "gmroll";
        }
        case "br":
        case "broll":
        case "blindroll": {
            return "blindroll";
        }
        case "sr":
        case "selfroll": {
            return "selfroll";
        }
    }
}

/**
 * Utility method to convert the element to a number
 * @param {number|string} elementToConvertToNumber
 * @returns {Promise<number>} The number representation of the element
 */
export async function tryToConvertToNumber(elementToConvertToNumber) {
    if (elementToConvertToNumber) {
        if (isRealNumber(elementToConvertToNumber)) {
            // DO NOTHING
        } else if (String(elementToConvertToNumber) === "0") {
            elementToConvertToNumber = 0;
        } else {
            let elementI = null;
            try {
                elementI = Number(elementToConvertToNumber);
            } catch (e) {}
            if (elementI && isRealNumber(elementI)) {
                elementToConvertToNumber = elementI;
            } else {
                elementToConvertToNumber = await BRTBetterHelpers.tryRoll(elementToConvertToNumber, 0);
            }
        }
    } else {
        elementToConvertToNumber = 0;
    }
    return elementToConvertToNumber;
}

/**
 * Utility method to convert the element to a number
 * @param {number|string} elementToConvertToNumber
 * @returns {number} The number representation of the element
 */
export function tryToConvertToNumberSync(elementToConvertToNumber) {
    if (elementToConvertToNumber) {
        if (isRealNumber(elementToConvertToNumber)) {
            // DO NOTHING
        } else if (String(elementToConvertToNumber) === "0") {
            elementToConvertToNumber = 0;
        } else {
            let elementI = null;
            try {
                elementI = Number(elementToConvertToNumber);
            } catch (e) {}
            if (elementI && isRealNumber(elementI)) {
                elementToConvertToNumber = elementI;
            } else {
                elementToConvertToNumber = BRTBetterHelpers.tryRollSync(elementToConvertToNumber, 0);
            }
        }
    } else {
        elementToConvertToNumber = 0;
    }
    return elementToConvertToNumber;
}
