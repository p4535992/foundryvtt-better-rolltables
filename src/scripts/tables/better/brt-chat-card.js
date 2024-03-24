import { CONSTANTS } from "../../constants/constants.js";
import { BRTUtils } from "../../core/utils.js";
import { BRTBetterHelpers } from "./brt-helper.js";
import { RollTableToActorHelpers } from "../../apps/rolltable-to-actor/rolltable-to-actor-helpers.js";
import { betterRolltablesSocket } from "../../socket.js";
import Logger from "../../lib/Logger.js";
import ItemPilesHelpers from "../../lib/item-piles-helpers.js";

/**
 * create a chat card based on the content of the object LootData
 */
export class BetterChatCard {
    /**
     * @param {object} betterResults
     */
    constructor(betterResults, rollMode, roll) {
        this.betterResults = betterResults;
        this.rollMode = rollMode;
        this.roll = roll;
        this.itemsData = [];
        this.itemsDataGM = [];
        this.numberOfDraws = 0;
        this.atLeastOneRollIsHidden = false;
        for (const result of this.betterResults) {
            if (getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`)) {
                this.atLeastOneRollIsHidden = true;
                break;
            }
        }
    }

    async findOrCreateItems() {
        // we will scale down the font size if an item name is too long
        // TODO transfer this property on the better result data ?
        for (const result of ItemPilesHelpers.stackTableResults(this.betterResults)) {
            this.numberOfDraws++;
            const quantity = result.quantity || 1;
            let type = undefined;
            if (result.isText || result.type === CONST.TABLE_RESULT_TYPES.TEXT) {
                type = CONST.TABLE_RESULT_TYPES.TEXT;
            } else if (result.pack || result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
                type = CONST.TABLE_RESULT_TYPES.COMPENDIUM;
            } else if (result.documentCollection || result.type === CONST.TABLE_RESULT_TYPES.DOCUMENT) {
                type = CONST.TABLE_RESULT_TYPES.DOCUMENT;
            } else {
                throw Logger.error(`No vaid type is been found for this result`, true, result);
            }

            let customResultNameHidden = undefined;
            let customResultImgHidden = undefined;

            let customResultName = undefined;
            if (hasProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`)) {
                customResultName =
                    getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_NAME}`) ||
                    "";
            }

            let customResultImg = undefined;
            if (hasProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`)) {
                customResultImg =
                    getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON}`) ||
                    "";
            }
            let isResultHidden = false;
            if (hasProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`)) {
                // if (
                //     !getProperty(
                //         result,
                //         `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`,
                //     )
                // ) {
                //     continue;
                // }
                // customResultNameHidden = CONSTANTS.DEFAULT_HIDDEN_RESULT_TEXT;
                // customResultImgHidden = CONSTANTS.DEFAULT_HIDDEN_RESULT_IMAGE;
                isResultHidden =
                    getProperty(
                        result,
                        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`,
                    ) || false;
            }
            const entityUuid = getProperty(
                result,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`,
            );
            let itemEntity = await fromUuid(entityUuid);

            const fontSize = itemEntity
                ? Math.max(60, 100 - Math.max(0, (customResultName || itemEntity.name || result.text).length - 27) * 2)
                : Math.max(60, 100 - Math.max(0, (result.name || result.text).length - 27) * 2);

            if (result.type === CONST.TABLE_RESULT_TYPES.TEXT || !itemEntity) {
                Logger.debug(`Cannot find document with '${entityUuid}'`);
                this.itemsDataGM.push({
                    id: result.text,
                    text: customResultName ?? result.text ?? result.name,
                    img: customResultImg ?? result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`,
                    isText: true,
                    documentName: result.documentName,
                    compendiumName: result.pack,
                    type: type,
                    item: {
                        id: result.id,
                        _id: result.id,
                        name: customResultName ?? result.text ?? result.name,
                        img:
                            customResultImg ?? result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`,
                        text: customResultName ?? result.text ?? result.name,
                        uuid: "",
                        isHidden: isResultHidden,
                        quantity: quantity,
                        // weight: weight,
                        fontSize: fontSize,
                    },
                    isHidden: false,
                    quantity: quantity,
                    // weight: weight,
                    fontSize: fontSize,
                });
                if (
                    !getProperty(
                        result,
                        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`,
                    ) &&
                    getProperty(result, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`)
                ) {
                    continue;
                }
                if (isResultHidden) {
                    this.itemsData.push({
                        id: result.text,
                        text: customResultNameHidden ?? result.text ?? result.name,
                        img:
                            customResultImgHidden ??
                            result.icon ??
                            result.img ??
                            result.src ??
                            `icons/svg/d20-highlight.svg`,
                        isText: true,
                        documentName: result.documentName,
                        compendiumName: result.pack,
                        type: type,
                        item: {
                            id: result.id,
                            _id: result.id,
                            name: customResultNameHidden ?? result.text ?? result.name,
                            img:
                                customResultImgHidden ??
                                result.icon ??
                                result.img ??
                                result.src ??
                                `icons/svg/d20-highlight.svg`,
                            text: customResultNameHidden ?? result.text ?? result.name,
                            uuid: "",
                            isHidden: isResultHidden,
                            quantity: quantity,
                            // weight: weight,
                            fontSize: fontSize,
                        },
                        isHidden: isResultHidden,
                        quantity: quantity,
                        // weight: weight,
                        fontSize: fontSize,
                    });
                } else {
                    this.itemsData.push({
                        id: result.text,
                        text: customResultName ?? result.text ?? result.name,
                        img:
                            customResultImg ?? result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`,
                        isText: true,
                        documentName: result.documentName,
                        compendiumName: result.pack,
                        type: type,
                        item: {
                            id: result.id,
                            _id: result.id,
                            name: customResultName ?? result.text ?? result.name,
                            img:
                                customResultImg ??
                                result.icon ??
                                result.img ??
                                result.src ??
                                `icons/svg/d20-highlight.svg`,
                            text: customResultName ?? result.text ?? result.name,
                            uuid: "",
                            isHidden: isResultHidden,
                            quantity: quantity,
                            // weight: weight,
                            fontSize: fontSize,
                        },
                        isHidden: isResultHidden,
                        quantity: quantity,
                        // weight: weight,
                        fontSize: fontSize,
                    });
                }

                continue;
            }

            const itemFolder = await this.getBRTFolder();
            if (itemFolder) {
                itemEntity.folder = itemFolder.id;
            } else {
                Logger.debug(`No folder tables found with name 'Better RollTable | Better Items'`);
            }

            if (customResultName && customResultName !== itemEntity.name) {
                setProperty(itemEntity, `name`, customResultName);
            }
            if (customResultImg && customResultImg !== itemEntity.img) {
                setProperty(itemEntity, `img`, customResultImg);
            }

            let isJournal = itemEntity instanceof JournalEntry;
            let docJournalPageUuid = getProperty(
                result,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_JOURNAL_PAGE_UUID}`,
            );
            if (isJournal && docJournalPageUuid) {
                itemEntity = await fromUuid(docJournalPageUuid);
            }
            this.itemsDataGM.push({
                id: result.text,
                text: customResultName ?? result.text ?? result.name,
                img: customResultImg ?? result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`,
                isText: false,
                documentName: itemEntity.documentName,
                compendiumName: itemEntity.pack,
                type: type,
                item: {
                    id: itemEntity.id,
                    _id: itemEntity.id,
                    name: itemEntity.name,
                    img: itemEntity.img ?? itemEntity.src ?? `icons/svg/d20-highlight.svg`,
                    text: itemEntity.text ?? itemEntity.name ?? "",
                    uuid: itemEntity?.uuid ?? "",
                    isHidden: false,
                    quantity: quantity,
                    // weight: weight,
                    fontSize: fontSize,
                },
                isHidden: false,
                quantity: quantity,
                // weight: weight,
                fontSize: fontSize,
            });

            if (isResultHidden) {
                if (
                    !getProperty(
                        result,
                        `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_SHOW_HIDDEN_RESULT_ON_CHAT}`,
                    )
                ) {
                    continue;
                }
            }

            if (customResultNameHidden && customResultNameHidden !== itemEntity.name) {
                setProperty(itemEntity, `name`, customResultNameHidden);
            }
            if (customResultImgHidden && customResultImgHidden !== itemEntity.img) {
                setProperty(itemEntity, `img`, customResultImgHidden);
            }
            setProperty(
                itemEntity,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_HIDDEN_TABLE}`,
                isResultHidden,
            );

            if (isResultHidden) {
                this.itemsData.push({
                    id: result.text,
                    text: customResultNameHidden ?? result.text ?? result.name,
                    img:
                        customResultImgHidden ??
                        result.icon ??
                        result.img ??
                        result.src ??
                        `icons/svg/d20-highlight.svg`,
                    isText: false,
                    documentName: itemEntity.documentName,
                    compendiumName: itemEntity.pack,
                    type: type,
                    item: {
                        id: itemEntity.id,
                        _id: itemEntity.id,
                        name: itemEntity.name,
                        img: itemEntity.img ?? itemEntity.src ?? `icons/svg/d20-highlight.svg`,
                        text: itemEntity.text ?? itemEntity.name ?? "",
                        uuid: itemEntity?.uuid ?? "",
                        isHidden: isResultHidden,
                        quantity: quantity,
                        // weight: weight,
                        fontSize: fontSize,
                    },
                    isHidden: isResultHidden,
                    quantity: quantity,
                    // weight: weight,
                    fontSize: fontSize,
                });
            } else {
                this.itemsData.push({
                    id: result.text,
                    text: customResultName ?? result.text ?? result.name,
                    img: customResultImg ?? result.icon ?? result.img ?? result.src ?? `icons/svg/d20-highlight.svg`,
                    isText: false,
                    documentName: itemEntity.documentName,
                    compendiumName: itemEntity.pack,
                    type: type,
                    item: {
                        id: itemEntity.id,
                        _id: itemEntity.id,
                        name: itemEntity.name,
                        img: itemEntity.img ?? itemEntity.src ?? `icons/svg/d20-highlight.svg`,
                        text: itemEntity.text ?? itemEntity.name ?? "",
                        uuid: itemEntity?.uuid ?? "",
                        isHidden: isResultHidden,
                        quantity: quantity,
                        // weight: weight,
                        fontSize: fontSize,
                    },
                    isHidden: isResultHidden,
                    quantity: quantity,
                    // weight: weight,
                    fontSize: fontSize,
                });
            }

            /*
            // TODO ???
            setProperty(itemData, "permission.default", CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER);
            let newItem = await Item.create(itemData);
            */
        }
    }

    async renderMessage(data) {
        return renderTemplate(`modules/${CONSTANTS.MODULE_ID}/templates/card/better-chat-card.hbs`, data);
    }

    async getBRTFolder() {
        if (!this.historyFolder) {
            let historyFolder = game.folders.getName("Better RollTable | Better Items");
            if (!historyFolder) {
                historyFolder = await Folder.create({
                    name: "Better RollTable | Better Items",
                    parent: null,
                    type: "Item",
                });
            }
            this.historyFolder = historyFolder;
        }
        return this.historyFolder;
    }

    async prepareCharCart(table) {
        // await this.findOrCreateItems();

        const htmlDescription = await TextEditor.enrichHTML(table.description, {
            async: true,
            secrets: table.isOwner,
            documents: true,
        });

        const rollHTML = null; // TODO ? table.displayRoll && this.roll ? await this.roll.render() : null;

        let flavorString;
        if (this.numberOfDraws > 1) {
            flavorString = game.i18n.format(`${CONSTANTS.MODULE_ID}.DrawResultPlural`, {
                amount: this.numberOfDraws,
                name: table.name,
            });
        } else if (this.numberOfDraws > 0) {
            flavorString = game.i18n.format(`${CONSTANTS.MODULE_ID}.DrawResultSingular`, {
                amount: this.numberOfDraws,
                name: table.name,
            });
        } else {
            flavorString = game.i18n.format(`${CONSTANTS.MODULE_ID}.DrawResultZero`, {
                name: table.name,
            });
        }

        const chatCardData = {
            rollHTML: rollHTML,
            tableData: table,
            htmlDescription: htmlDescription,
            // gmTitleLabel: Logger.i18n(`${CONSTANTS.MODULE_ID}.label.tableTextGmTitleLabel`),
            itemsData: this.itemsData,
            compendium: table.pack,
            id: table.id,
            users: game.users
                .filter((user) => !user.isGM && user.character)
                .map((user) => ({
                    id: user.id,
                    name: user.character.name,
                    img: user.character.token?.img || user.avatar,
                })),
        };

        const cardHtml = await this.renderMessage(chatCardData);

        const chatData = {
            flavor: flavorString,
            sound: "sounds/dice.wav",
            user: game.user._id,
            content: cardHtml,
            flags: {
                [`${CONSTANTS.MODULE_ID}`]: {
                    [`${CONSTANTS.FLAGS.BETTER}`]: chatCardData,
                },
            },
        };
        return chatData;
    }

    async prepareCharCartGM(table) {
        // await this.findOrCreateItems();

        const htmlDescription = await TextEditor.enrichHTML(table.description, {
            async: true,
            secrets: table.isOwner,
            documents: true,
        });

        const rollHTML = null; // TODO ? table.displayRoll && this.roll ? await this.roll.render() : null;

        let flavorString;
        if (this.numberOfDraws > 1) {
            flavorString = game.i18n.format(`${CONSTANTS.MODULE_ID}.DrawResultPlural`, {
                amount: this.numberOfDraws,
                name: table.name,
            });
        } else if (this.numberOfDraws > 0) {
            flavorString = game.i18n.format(`${CONSTANTS.MODULE_ID}.DrawResultSingular`, {
                amount: this.numberOfDraws,
                name: table.name,
            });
        } else {
            flavorString = game.i18n.format(`${CONSTANTS.MODULE_ID}.DrawResultZero`, {
                name: table.name,
            });
        }

        const chatCardData = {
            rollHTML: rollHTML,
            tableData: table,
            htmlDescription: htmlDescription,
            gmTitleLabel: Logger.i18n(`${CONSTANTS.MODULE_ID}.label.tableTextGmTitleLabel`),
            itemsData: this.itemsDataGM,
            compendium: table.pack,
            id: table.id,
            users: game.users
                .filter((user) => user.isGM && user.character)
                .map((user) => ({
                    id: user.id,
                    name: user.character.name,
                    img: user.character.token?.img || user.avatar,
                })),
        };

        const cardHtml = await this.renderMessage(chatCardData);

        const chatData = {
            flavor: flavorString,
            sound: "sounds/dice.wav",
            user: game.user._id,
            content: cardHtml,
            flags: {
                [`${CONSTANTS.MODULE_ID}`]: {
                    [`${CONSTANTS.FLAGS.BETTER}`]: chatCardData,
                },
            },
        };
        return chatData;
    }

    async createChatCard(table) {
        if (!game.user.isGM) {
            if (this.atLeastOneRollIsHidden || this.rollMode === "gmroll") {
                await betterRolltablesSocket.executeAsGM(
                    "invokeGenericChatCardCreateArr",
                    table.uuid,
                    this.betterResults,
                    this.rollMode,
                    this.roll,
                    false,
                );
            } else {
                await this.findOrCreateItems();
                const chatData = await this.prepareCharCart(table);
                BRTUtils.addRollModeToChatData(chatData, this.rollMode);
                ChatMessage.create(chatData);
            }
        } else {
            // IF IS GM
            const isShowHiddenResultOnChat = getProperty(
                table,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_SHOW_HIDDEN_RESULT_ON_CHAT}`,
            );
            await this.findOrCreateItems();

            if (this.itemsData?.length > 0) {
                const chatData = await this.prepareCharCart(table);
                if (!isShowHiddenResultOnChat) {
                    BRTUtils.addRollModeToChatData(chatData, this.rollMode);
                }
                ChatMessage.create(chatData);
            }

            if (this.atLeastOneRollIsHidden) {
                const chatDataGM = await this.prepareCharCartGM(table);
                BRTUtils.addRollModeToChatData(chatDataGM, "gmroll");
                ChatMessage.create(chatDataGM);
            }
        }
    }
}
