import { BRTBetterHelpers } from "../tables/better/brt-helper";
import { CONSTANTS } from "../constants/constants";
import { getRollMode, isRealBoolean, isRealBooleanOrElseNull, isRealNumber, parseAsArray } from "../lib/lib";
import SETTINGS from "../constants/settings";
import Logger from "../lib/Logger";
import { RetrieveHelpers } from "../lib/retrieve-helpers";

export class BRTUtils {
    static addRollModeToChatData(chatData, rollMode) {
        rollMode = rollMode ?? game.settings.get("core", "rollMode");
        if (String(getProperty(chatData, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`)) === "true") {
            rollMode = "gmroll";
        }

        switch (rollMode) {
            case "blindroll":
                chatData.blind = true;
            // no break needed, if so please change this comment ?

            case "gmroll":
                chatData.whisper = [game.users.find((u) => u.isGM).id];
                break;
            case "selfroll":
                chatData.whisper = [game.userId];
                break;
        }
    }

    /**
     *
     * @param {string} compendiumName
     * @param {string} entityName
     *
     * @returns {Item}
     */
    static async findInCompendiumByName(compendiumName, entityName) {
        const myPack = await RetrieveHelpers.getCompendiumCollectionAsync(compendiumName, true, false);
        const compendium = myPack;
        if (compendium) {
            const entry = compendium.index.getName(entityName);
            if (entry) {
                return await compendium.getDocument(entry._id);
            }
        } else {
            switch (compendiumName) {
                case "RollTable":
                    return game.tables.getName(entityName);
                case "Actor":
                    return game.actors.getName(entityName);
                case "Item":
                    return game.items.getName(entityName);
                case "JournalEntry":
                    return game.journal.getName(entityName);
                case "Playlist":
                    return game.playlists.getName(entityName);
                case "Scene":
                    return game.scenes.getName(entityName);
                case "Macro":
                    return game.macros.getName(entityName);
                case "Card":
                    return game.cards.getName(entityName);
            }
        }
    }

    static async findInCompendiumById(compendiumName, entityId) {
        const myPack = await RetrieveHelpers.getCompendiumCollectionAsync(compendiumName, false, false);
        return await myPack?.getDocument(entityId);
    }

    static separateIdComendiumName(stringWithComendium) {
        const split = stringWithComendium.split(".");
        const nameOrId = split.pop().trim();
        const compendiumName = split.join(".").trim();
        return {
            nameOrId: nameOrId,
            compendiumName: compendiumName,
        };
    }

    /**
     *
     * @param {TableResult} result reference to item
     * @returns {object|boolean} item from compendium
     */
    static async getItemFromCompendium(result) {
        let nameEntry = getProperty(
            result,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`,
        )
            ? getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_ORIGINAL_NAME}`)
            : result.text;
        return BRTUtils.findInCompendiumByName(result.collection, nameEntry);
    }

    /**
     *
     * @param {object} compendium reference to compendium to roll
     * @returns {object} item from compendium
     */
    static async getRandomItemFromCompendium(compendium) {
        const myPack = await RetrieveHelpers.getCompendiumCollectionAsync(compendium, true, false);
        const pack = myPack;
        if (!pack) {
            return;
        }
        const size = pack.index.size;
        if (size === 0) {
            Logger.warn(`Compendium ${pack.title} is empty.`, true);
            return;
        }
        const randonIndex = Math.floor(Math.random() * size);
        const randomItem = pack.index.contents[randonIndex];
        return pack.getDocument(randomItem._id);
    }

    static getIconByEntityType(entityType) {
        switch (entityType) {
            case "RollTable":
                return "fa-th-list";
            case "Actor":
                return "fa-user";
            case "Item":
                return "fa-suitcase";
            case "JournalEntry":
                return "fa-book-open";
            case "Playlist":
                return "fa-music";
            case "Scene":
                return "fa-map";
            case "Macro":
                return "fa-terminal";
            default:
                return "";
        }
    }

    /**
     *
     * @param {RollTable} tableEntity
     * @param {Object} options
     * @param {Roll|string} options.roll An optional pre-configured Roll instance which defines the dice roll to use
     * @param {boolean} options.recursive Allow drawing recursively from inner RollTable results
     * @param {boolean} options.displayChat Whether to automatically display the results in chat
     * @param {number} options.rollsAmount
     * @param {number} options.dc
     * @param {string} options.skill
     * @param {boolean} options.isTokenActor
     * @param {boolean} options.stackSame
     * @param {string} options.customRoll
     * @param {number} options.itemLimit
     * @param {string} options.rollMode
     * @param {string} options.distinct
     * @param {string} options.distinctKeepRolling
     * @param {string} options.rollAsTableType
     * @returns {Promise<{rollsAmount: number, dc: number, skill: string, isTokenActor: boolean, stackSame: boolean, customRoll: string, itemLimit: number, rollMode: string, distinct: boolean, distinctKeepRolling: string; rollAsTableType:string;}>},
     */
    static async updateOptions(tableEntity, options = {}) {
        let newOptions = {};
        if (!options) {
            options = {};
        }

        let rollsAmount = undefined;
        if (options?.rollsAmount) {
            if (isRealNumber(options?.rollsAmount)) {
                rollsAmount = options?.rollsAmount;
            } else {
                rollsAmount = await BRTBetterHelpers.tryRoll(options?.rollsAmount);
            }
        } else {
            rollsAmount = await BRTBetterHelpers.rollsAmount(tableEntity);
        }

        newOptions.rollsAmount = rollsAmount;

        let dc =
            options?.dc ||
            getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_DC_VALUE_KEY}`) ||
            undefined;

        if (dc) {
            if (isRealNumber(dc)) {
                // DO NOTHING
            } else if (String(dc) === "0") {
                dc = 0;
            } else {
                let dcI = null;
                try {
                    dcI = Number(dc);
                } catch (e) {}
                if (dcI && isRealNumber(dcI)) {
                    dc = dcI;
                } else {
                    dc = await BRTBetterHelpers.tryRoll(dc);
                }
            }
        }
        newOptions.dc = dc;

        newOptions.skill =
            options?.skill ||
            getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_SKILL_VALUE_KEY}`) ||
            undefined;

        newOptions.skills = parseAsArray(newOptions.skill);

        newOptions.isTokenActor = isRealBoolean(options?.isTokenActor)
            ? String(options?.isTokenActor) === "true"
                ? true
                : false
            : false;

        newOptions.stackSame = isRealBoolean(options?.stackSame)
            ? String(options?.stackSame) === "true"
                ? true
                : false
            : true;

        let customRole = options?.customRole ? options.customRole : undefined;
        if (!customRole) {
            customRole = options?.customRoll ? options.customRoll : undefined;
        }
        newOptions.customRoll = customRole;

        newOptions.itemLimit = options?.itemLimit && isRealNumber(options.itemLimit) ? Number(options.itemLimit) : 0;

        let rollMode = options?.rollMode ?? null;
        if (
            String(getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HIDDEN_TABLE}`)) === "true"
        ) {
            rollMode = "gmroll";
        }
        newOptions.rollMode = getRollMode(rollMode);

        let distinct = isRealBooleanOrElseNull(options?.distinct);
        if (distinct === null) {
            distinct = isRealBooleanOrElseNull(
                getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT}`),
            );
        }
        if (distinct === null) {
            distinct = undefined;
        }

        newOptions.distinct = isRealBoolean(distinct) ? (String(distinct) === "true" ? true : false) : false;

        let distinctKeepRolling = isRealBooleanOrElseNull(options?.distinctKeepRolling);
        if (distinctKeepRolling === null) {
            distinctKeepRolling = isRealBooleanOrElseNull(
                getProperty(
                    tableEntity,
                    `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_DISTINCT_RESULT_KEEP_ROLLING}`,
                ),
            );
        }
        if (distinctKeepRolling === null) {
            distinctKeepRolling = undefined;
        }

        newOptions.distinctKeepRolling = isRealBoolean(distinctKeepRolling)
            ? String(distinctKeepRolling) === "true"
                ? true
                : false
            : false;

        newOptions.resetTable = isRealBoolean(options?.resetTable)
            ? String(options?.resetTable) === "true"
                ? true
                : false
            : true;

        newOptions.normalizeTable = isRealBoolean(options?.normalizeTable)
            ? String(options?.normalizeTable) === "true"
                ? true
                : false
            : false;

        newOptions.displayChat = isRealBoolean(options?.displayChat)
            ? String(options?.displayChat) === "true"
                ? true
                : false
            : true;

        let usePercentage = isRealBooleanOrElseNull(options?.usePercentage);
        if (usePercentage === null) {
            usePercentage = isRealBooleanOrElseNull(
                getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_USE_PERCENTAGE}`),
            );
        }
        if (usePercentage === null) {
            usePercentage = undefined;
        }

        newOptions.usePercentage = isRealBoolean(usePercentage)
            ? String(usePercentage) === "true"
                ? true
                : false
            : false;

        let useDynamicDc = isRealBooleanOrElseNull(options?.useDynamicDc);
        if (useDynamicDc === null) {
            useDynamicDc = isRealBooleanOrElseNull(
                getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.HARVEST_USE_DYNAMIC_DC}`),
            );
        }
        if (useDynamicDc === null) {
            useDynamicDc = undefined;
        }

        newOptions.useDynamicDc = isRealBoolean(useDynamicDc)
            ? String(useDynamicDc) === "true"
                ? true
                : false
            : false;

        newOptions.recursive = isRealBoolean(options.recursive)
            ? String(options.recursive) === "true"
                ? true
                : false
            : true;
        newOptions.roll = options.roll ? String(options.roll) : null;

        let brtTypeToCheck = BRTUtils.retrieveBRTType(tableEntity, options?.rollAsTableType);
        if (!CONSTANTS.TYPES.includes(brtTypeToCheck)) {
            brtTypeToCheck = null;
        }
        if (brtTypeToCheck === "none") {
            brtTypeToCheck = null;
        }
        newOptions.rollAsTableType = brtTypeToCheck;

        newOptions.rollAsTableTypeAllTheTables = isRealBoolean(options.rollAsTableTypeAllTheTables)
            ? String(options.rollAsTableTypeAllTheTables) === "true"
                ? true
                : false
            : false;

        return newOptions;
    }

    /**
     * @deprecated try to not use this anymore
     * @param {*} itemsData
     * @param {*} itemEntity
     * @param {*} itemData
     * @param {*} isHidden
     * @returns
     */
    static async addToItemData(itemsData, itemEntity, itemData = {}, isHidden = false) {
        const existingItem = itemsData.find((i) => i.item.id === itemEntity.id);
        const quantity = getProperty(itemData, game.itempiles.API.ITEM_QUANTITY_ATTRIBUTE) || 1; // getProperty(itemData, SETTINGS.QUANTITY_PROPERTY_PATH) || 1;
        // const weight = getProperty(itemData, SETTINGS.WEIGHT_PROPERTY_PATH) || 0;

        if (existingItem) {
            existingItem.quantity = existingItem.quantity + quantity;
            // existingItem.weight = existingItem.weight +weight;
        } else {
            // we will scale down the font size if an item name is too long
            const fontSize = Math.max(60, 100 - Math.max(0, (itemEntity.name || itemEntity.text).length - 27) * 2);

            let type = undefined;
            if (itemEntity.isText) {
                type = CONST.TABLE_RESULT_TYPES.TEXT;
            } else if (itemEntity.pack) {
                type = CONST.TABLE_RESULT_TYPES.COMPENDIUM;
            } else {
                type = CONST.TABLE_RESULT_TYPES.DOCUMENT;
            }

            // let resultDoc = await BRTBetterHelpers.retrieveDocumentFromResult(itemEntity);
            let resultDoc = itemEntity;

            itemsData.push({
                documentName: resultDoc.documentName,
                compendiumName: resultDoc.pack,
                type: type,
                item: {
                    id: resultDoc.id,
                    _id: resultDoc.id,
                    name: resultDoc.name,
                    img: resultDoc.img ?? resultDoc.src ?? `icons/svg/d20-highlight.svg`,
                    text: resultDoc.text ?? resultDoc.name ?? "",
                    uuid: resultDoc?.uuid ?? "",
                    isHidden: isHidden,
                },
                quantity: quantity,
                // weight: weight,
                fontSize: fontSize,
            });
        }

        return itemsData;
    }

    static isTableResultText(result) {
        return result?.type === CONST.TABLE_RESULT_TYPES.TEXT;
    }

    static isTableResultDocument(result) {
        return result?.type === CONST.TABLE_RESULT_TYPES.DOCUMENT;
    }

    static isTableResultCompendium(result) {
        return result?.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM;
    }

    static retrieveBRTType(tableEntity, rollAsTableType = null, returnFlag = false) {
        let brtTypeToCheck = rollAsTableType
            ? rollAsTableType
            : getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.TABLE_TYPE_KEY}`);
        if (returnFlag) {
            return brtTypeToCheck;
        }
        if (!CONSTANTS.TYPES.includes(brtTypeToCheck)) {
            brtTypeToCheck = null;
        }
        if (brtTypeToCheck === "none") {
            brtTypeToCheck = null;
        }
        return brtTypeToCheck;
    }

    static retrieveBRTRollAmount(tableEntity, rollAmount = null) {
        let brtRollAmountToCheck = rollAmount
            ? rollAmount
            : getProperty(tableEntity, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_AMOUNT_KEY}`);
        if (!brtRollAmountToCheck && tableEntity.quantity) {
            brtRollAmountToCheck = tableEntity.quantity;
        }
        return brtRollAmountToCheck;
    }

    /**
     * @href https://github.com/krbz999/simple-loot-list/blob/main/module/module.mjs
     * @param {RollTable|string|UUID} tableEntity
     * @returns {Promise<Item[]>}
     */
    static async extractItemsFromRollTAble(tableEntity) {
        const table = await RetrieveHelpers.getRollTableAsync(tableEntity);
        const TYPES = CONST.TABLE_RESULT_TYPES;
        // Must have valid results embedded.
        const uuids = table.results
            .filter((result) => {
                return [TYPES.DOCUMENT, TYPES.COMPENDIUM].includes(result.type) && !!result.documentCollection;
            })
            .map((result) => {
                if (result.type === TYPES.DOCUMENT) {
                    return `${result.documentCollection}.${result.documentId}`;
                }
                return `Compendium.${result.documentCollection}.Item.${result.documentId}`;
            });

        if (!uuids.length) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningEmptyDocument`, {}), true);
            return false;
        }

        // Get the items and check validity.
        const promises = uuids.map((uuid) => fromUuid(uuid));
        const resolved = await Promise.all(promises);
        const items = resolved; // TODO FILTER BY TYPE ??? .filter(r => this.validRollTableTypes.has(r?.type));

        if (!items.length) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningEmptyDocument`, {}), true);
            return false;
        }

        return items;
    }
}
