import { CONSTANTS } from "../../constants/constants.js";
import Logger from "../../lib/Logger.js";
import ItemPilesHelpers from "../../lib/item-piles-helpers.js";
import { RetrieveHelpers } from "../../lib/retrieve-helpers.js";
import API from "../../API.js";
import { BRTUtils } from "../../core/utils.js";

export default class BRTActorList extends FormApplication {
    static initializeActorList(app, array) {
        if (!game.user.isGM) {
            return;
        }
        const listButton = {
            class: CONSTANTS.MODULE_ID,
            icon: "fa-solid fa-table-rows",
            onclick: async () => new BRTActorList(app.document).render(true),
            label: game.i18n.localize(`${CONSTANTS.MODULE_ID}.label.HeaderActorList`),
        };
        const isChar2 = app.constructor.name === "ActorSheet5eCharacter2";
        if (!isChar2 && !game.settings.get(CONSTANTS.MODULE_ID, "headerActorListLabel")) {
            delete listButton.label;
        }
        array.unshift(listButton);
    }

    constructor(actor, options = {}) {
        super(actor, options);
        this.actor = actor;
        this.clone = actor.clone({}, { keepId: true });
    }

    /** @override */
    get title() {
        return game.i18n.format(`${CONSTANTS.MODULE_ID}.label.TitleActorList`, { name: this.actor.name });
    }

    /** @override */
    get id() {
        return `${CONSTANTS.MODULE_ID}-${this.actor.uuid.replaceAll(".", "-")}`;
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: [CONSTANTS.MODULE_ID],
            template: `modules/${CONSTANTS.MODULE_ID}/templates/sheet/brt-actor-config-list.hbs`,
            dragDrop: [{ dropSelector: "[data-action='drop']" }],
            scrollY: [".roll-table-list"],
            width: 550,
            height: "auto",
        });
    }

    /**
     * Get the roll table types that can have quantity and type.
     * @returns {Set<string>}     The valid roll table types.
     */
    static get validRollTableTypes() {
        return new Set(CONSTANTS.TYPES);
    }

    get validRollTableTypes() {
        return this.constructor.validRollTableTypes;
    }

    /** @override */
    async getData(options = {}) {
        const currencies = this._gatherCurrencies();

        const rollTableList = this._gatherTables()
            .reduce((acc, data) => {
                const rollTable = RetrieveHelpers.getRollTableSync(data.uuid); // fromUuidSync(data.uuid ?? "");
                if (rollTable) {
                    acc.push({ ...data, name: rollTable.name, img: rollTable.img });
                }
                return acc;
            }, [])
            .sort((a, b) => a.name.localeCompare(b.name));

        /*
    const currs = this._gatherCurrencies();
    const currencies = currs.map((c) => {
        return {
            key: c.abbreviation,
            value: ItemPilesHelpers.retrieveCurrency(this.actor, c.abbreviation) ?? 0,
            label: c.name
        };
    });
    */
        return {
            rollTableList: rollTableList,
            currencies: currencies,
            brtTypes: CONSTANTS.TYPES,
        };
    }

    // /** @override */
    // async _onChangeInput(event) {
    //     if (event.currentTarget.closest("[data-currencies]")?.dataset?.currencies) {
    //         // const currencies = event.currentTarget.closest("[data-currencies]").value;
    //         // this.clone.updateSource({[`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.CURRENCIES}`]: currencies});
    //         const data = this._getSubmitData();
    //         this.clone.updateSource(data);
    //     } else {
    //         const uuid = event.currentTarget.closest("[data-uuid]").dataset.uuid;
    //         const quantity = event.currentTarget.closest("[data-quantity]").dataset.quantity;
    //         const brtType= event.currentTarget.closest("[data-brtType]").dataset.brtType;
    //         this._updateQuantity(uuid, quantity, brtType);
    //     }
    //     return this.render();
    // }

    /**
     * Get an object of update data used to update the form's target object
     * @param {object} updateData     Additional data that should be merged with the form data
     * @returns {object}               The prepared update data
     * @protected
     * @override
     */
    _getSubmitData(updateData = {}) {
        let dataTmp = super._getSubmitData(updateData);
        dataTmp = foundry.utils.expandObject(dataTmp);

        let currencies = foundry.utils.getProperty(
            dataTmp,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.CURRENCIES}`,
        );

        let rollTableListToPatch = foundry.utils.getProperty(
            dataTmp,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`,
        );

        const rollTableList = [];
        if (rollTableListToPatch) {
            for (const [key, value] of Object.entries(rollTableListToPatch)) {
                rollTableList.push(value);
            }
        }
        this.clone.updateSource({
            [`flags.${CONSTANTS.MODULE_ID}`]: {
                [`${CONSTANTS.FLAGS.ACTOR_LIST.CURRENCIES}`]: currencies,
                [`${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`]: rollTableList,
            },
        });

        foundry.utils.setProperty(dataTmp, `flags.${CONSTANTS.MODULE_ID}`, {});
        foundry.utils.setProperty(
            dataTmp,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`,
            rollTableList,
        );
        foundry.utils.setProperty(
            dataTmp,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.CURRENCIES}`,
            currencies,
        );

        dataTmp = foundry.utils.flattenObject(dataTmp);

        return dataTmp;
    }

    /** @override */
    async _onDrop(event) {
        event.stopPropagation();
        event.target.closest("[data-action='drop']").classList.remove("drag-over");
        const data = TextEditor.getDragEventData(event);
        const rollTables = await this._validateDrops(data);
        if (!rollTables) {
            return;
        }
        for (const rollTable of rollTables) {
            const uuid = rollTable.uuid;
            const name = rollTable.name;
            this._updateQuantity(
                uuid,
                BRTUtils.retrieveBRTRollAmount(rollTable) || "1",
                BRTUtils.retrieveBRTType(rollTable),
            );
        }
        Logger.info(
            Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningAddedRollTables`, {
                amount: rollTables.length,
                name: this.clone.name,
            }),
            true,
        );
        return this.render();
    }

    /**
     * Update the quantity of an existing roll table on the list.
     * @param {string} uuid           The uuid of the roll table to update. Add it if not found.
     * @param {string} [quantity]     A specific value to set it to, otherwise add 1.
     * @param {string} [brtType]
     * @returns {void}
     */
    _updateQuantity(uuid, quantity = null, brtType = null) {
        const list = this._gatherTables();
        const existing = list.find((e) => e.uuid === uuid);
        if (existing) {
            existing.quantity = quantity ? quantity : existing.quantity;
            existing.brtType = brtType ? brtType : existing.brtType;
        } else {
            list.push({
                quantity: quantity ? quantity : "1",
                brtType: brtType ? brtType : "none",
                uuid: uuid,
            });
        }
        this.clone.updateSource({
            [`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`]: list,
        });
    }

    /** @override */
    async _onDragOver(event) {
        event.target.closest("[data-action='drop']")?.classList.add("drag-over");
    }

    /** @override */
    async _updateObject() {
        const update = this.clone.flags[CONSTANTS.MODULE_ID];
        return this.actor.update({ [`flags.${CONSTANTS.MODULE_ID}`]: update });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html[0].querySelectorAll("[data-action]").forEach((n) => {
            switch (n.dataset.action) {
                case "delete":
                    n.addEventListener("click", this._onClickRollTableDelete.bind(this));
                    break;
                case "render":
                    n.addEventListener("click", this._onClickRollTableName.bind(this));
                    break;
                case "drop":
                    n.addEventListener("dragleave", this._onDragLeaveBox.bind(this));
                    break;
                case "clear":
                    n.addEventListener("click", this._onClickClear.bind(this));
                    break;
                case "grant":
                    n.addEventListener("click", this._onClickGrant.bind(this));
                    break;
            }
        });
        html[0].querySelectorAll("input[type=text]").forEach((n) => {
            n.addEventListener("focus", (event) => event.currentTarget.select());
        });
    }

    /**
     * Grant the loot and currency list to the targeted token's actor.
     * @param {PointerEvent} event      The initiating click event.
     * @returns {Promise<void>}
     */
    async _onClickGrant(event) {
        const rollTablesArrayBase = this._gatherTables();
        const currencies = this._gatherCurrencies();
        const target = game.user.targets.first()?.actor;
        if (!target) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningNoTarget`, {}), true);
            return;
        }

        const data = target.getRollData();

        const rollTables = [];
        const rollTableArray = await Promise.all(
            rollTablesArrayBase.map(async ({ quantity, brtType, uuid }) => {
                const rollTable = await RetrieveHelpers.getRollTableAsync(uuid);
                return {
                    quantity: quantity,
                    brtType: brtType,
                    uuid: uuid,
                    rollTable: rollTable,
                };
            }),
        );

        /*
    const rollTablesUpdates = [];
    const update = {};
    let created = 0;
    const rollTableArray = await Promise.all(rollTablesArrayBase.map(async ({quantity, uuid}) => {
       const rollTable = await RetrieveHelpers.getRollTableAsync(uuid);
       return [quantity, uuid, rollTable];
    }));
    for (const [quantity, uuid, rollTable] of rollTableArray) {
      if (!rollTable) {
        Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningRollTableNotFound`,{uuid:uuid}),true);
        continue;
      }
      const {total} = await new Roll(quantity, data).evaluate();
      const rollTableData = await RetrieveHelpers.getRollTableAsync(rollTable);
      rollTableData.system.quantity = Math.max(1, total);
      if (rollTableData.system.attunement > 1) {
        rollTableData.system.attunement = 1;
      }
      delete rollTableData.system.equipped;

      const existing = target.items.find(item => item.flags.core?.sourceId === uuid);
      if (existing && ["loot", "consumable"].includes(existing.type)) {
        rollTablesUpdates.push({_id: existing.id, "system.quantity": existing.system.quantity + rollTableData.system.quantity})
      } else rollTables.push(rollTableData);
      created += rollTableData.system.quantity;
    }
    for (const [key, value] of Object.entries(currencies)) {
      try {
        const {total} = await new Roll(value, data).evaluate();
        update[`system.currency.${key}`] = target.system.currency[key] + Math.max(0, total);
      } catch (err) {
        console.warn(err);
      }
    }
    */

        /**
         * A hook that is called before updates are performed.
         * @param {Actor} target               The target to receive currencies and roll tables.
         * @param {RollTable[]} rollTables     The roll table data for new roll tables to be created.
         */
        Hooks.callAll(`${CONSTANTS.MODULE_ID}.preGrantRollTables`, target, rollTableArray);

        /*
    await target.update(update);
    await target.updateEmbeddedDocuments("Item", rollTablesUpdates);
    await target.createEmbeddedDocuments("Item", rollTables);
    Logger.info(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningCreatedRollTables`, {amount: created, name: target.name}), true);
    */

        for (const rollTableElement of rollTableArray) {
            await API.addRollTableItemsToActor({
                table: rollTableElement.uuid,
                actor: target,
                options: {
                    rollsAmount: rollTableElement.quantity,
                    rollAsTableType: rollTableElement.brtType,
                },
            });
        }

        await ItemPilesHelpers.addCurrencies(target, currencies);

        /**
         * A hook that is called after updates are performed.
         * @param {Actor} target               The target to receive currencies and roll tables.
         * @param {RollTable[]} rollTables     The roll table data for new roll tables to be created.
         */
        Hooks.callAll(`${CONSTANTS.MODULE_ID}.grantRollTables`, target, rollTables);
    }

    /**
     * Remove all roll tables on the sheet. This does not stick unless saved.
     * @param {PointerEvent} event      The initiating click event.
     * @returns {BRTActorList}
     */
    _onClickClear(event) {
        this.clone.updateSource({
            [`flags.${CONSTANTS.MODULE_ID}`]: {
                [`${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`]: [],
                [`${CONSTANTS.FLAGS.ACTOR_LIST.CURRENCIES}`]: "",
            },
        });
        return this.render();
    }

    /**
     * Remove a single roll table on the sheet. This does not stick unless saved.
     * @param {PointerEvent} event      The initiating click event.
     * @returns {BRTActorList}
     */
    _onClickRollTableDelete(event) {
        const uuid = event.currentTarget.closest("[data-uuid]").dataset.uuid;
        const list = this._gatherTables();
        list.findSplice((i) => i.uuid === uuid);
        this.clone.updateSource({
            [`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`]: list,
        });
        return this.render();
    }

    /**
     * Render an roll table sheet by clicking its name.
     * @param {PointerEvent} event        The initiating click event.
     * @returns {Promise<ItemSheet>}      The rendered roll table sheet.
     */
    async _onClickRollTableName(event) {
        const rollTable = await fromUuid(event.currentTarget.closest("[data-uuid]").dataset.uuid);
        return rollTable.sheet.render(true);
    }

    /**
     * Remove the 'active' class from the drop area when left.
     * @param {DragEvent} event      The initiating drag event.
     * @returns {void}
     */
    _onDragLeaveBox(event) {
        event.currentTarget.classList.remove("drag-over");
    }

    /**
     * Read all roll tables on the sheet.
     * @returns {{uuid:string; quantity:number; brtType:string}[]}      An array of objects with quantity, uuid, and name.
     */
    _gatherTables() {
        return (
            foundry.utils.getProperty(
                this.clone,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`,
            ) ?? []
        );
    }

    /**
     * Read all currencies on the sheet.
     * @returns {string} An object with the currency keys and value (string).
     */
    _gatherCurrencies() {
        const curr =
            foundry.utils.getProperty(
                this.clone,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.CURRENCIES}`,
            ) ?? "";
        /*
    for (const k in curr) {
        const currencies = ItemPilesHelpers.retrieveCurrenciesRegistered();
        if (!(k in currencies)) {
            delete curr[k];
        }
    }
    */
        return curr ? String(curr) : null;
    }

    /**
     * Validate the dropped document and return an array of valid roll tables from it.
     * If a single valid roll table, return it in an array.
     * If a folder with at least 1 valid roll table in it, return that array.
     * If a rolltable with at least 1 valid roll table in it, return that array.
     * If a compendium with at least 1 valid roll table in it, return that array.
     * If no valid roll tables, returns false.
     * @param {object} data                     The dropped data object.
     * @returns {Promise<RollTable[]|boolean>}     The array of valid roll tables, or false if none found.
     */
    async _validateDrops(data) {
        const isFolder = data.type === "Folder";
        // const isItem = data.type === "Item";
        const isTable = data.type === "RollTable";
        const isPack = data.type === "Compendium";

        // if (!isFolder && !isItem && !isTable && !isPack) {
        if (!isFolder && !isTable && !isPack) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningInvalidDocument`, {}), true);
            return false;
        }

        // Case 1: Single roll table dropped.
        // if (isItem) {
        //     return this._dropSingleRollTable(data);
        // }
        // Case 2: Folder of roll tables dropped.
        if (isFolder) {
            return await this._dropFolder(data);
        }
        // Case 3: RollTable dropped.
        if (isTable) {
            return await this._dropRollTable(data);
        }
        // Case 4: Compendium dropped.
        if (isPack) {
            return await this._dropPack(data);
        }
    }

    /**
     * Validate a single dropped roll table.
     * @param {object} data                     The dropped roll table's data.
     * @returns {Promise<RollTable[]|boolean>}     The single dropped roll table in an array, or false if invalid.
     */
    async _dropSingleRollTable(data) {
        const rollTable = await RetrieveHelpers.getRollTableAsync(data.uuid);

        /* TODO
    // Owned roll tables are not allowed.
    if (rollTable.parent instanceof Actor) {
      Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningActorRollTAble`,{}), true);
      return false;
    }

    // Must be a valid roll table type.
    if (!this.validRollTableTypes.has(BRTUtils.retrieveBRTType(rollTable))) {
      Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningActorRollTable`,{brtType: BRTUtils.retrieveBRTType(rollTable)}), true);
      return false;
    }
    */

        return [rollTable];
    }

    /**
     * Validate a folder of roll tables.
     * @param {object} data                     The dropped folder's data.
     * @returns {Promise<RollTable[]|boolean>}     The array of valid roll tables, or false if none found.
     */
    async _dropFolder(data) {
        const folder = await fromUuid(data.uuid);
        // Must be a folder of roll tables.
        if (folder.type !== "RollTable") {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningInvalidDocument`, {}), true);
            return false;
        }

        /* TODO
    // Must have at least one valid roll table.
    const rollTables = folder.contents.filter(rollTable => {
      return this.validRollTableTypes.has(BRTUtils. rollTable.type);
    });
    */
        const rollTables = folder.contents;

        if (!rollTables.length) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningEmptyDocument`, {}), true);
            return false;
        }

        return rollTables;
    }

    /**
     * Validate a dropped rolltable.
     * @param {object} data                     The dropped table's data.
     * @returns {Promise<RollTable[]|boolean>}     The array of valid roll tables, or false if none found.
     */
    async _dropRollTable(data) {
        // Checkout the extract items from rolltbale utility method on BRTUtils
        return await this._dropSingleRollTable(data);
    }

    /**
     * Validate a dropped compendium.
     * @param {object} data                   The dropped pack's data.
     * @returns {Promise<RollTable[]|boolean>}     The array of valid roll tables, or false if none found.
     */
    async _dropPack(data) {
        const pack = RetrieveHelpers.getCompendiumCollectionSync(data.id); // game.packs.get(data.id);
        if (pack.metadata.type !== "RollTable") {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningInvalidDocument`, {}), true);
            return false;
        }
        /*
    const index = await pack.getIndex({fields: ["system.quantity"]});
    const rollTables = index.reduce((acc, rollTable) => {
      if (!this.validRollTableTypes.has(rollTable.type)) {
        return acc;
      }
      return acc.concat([{...rollTable, quantity: rollTable.system.quantity}]);
    }, []);
    */
        const index = await pack.getIndex();
        const rollTables = index.reduce((acc, rollTable) => {
            return acc.concat([
                {
                    ...rollTable,
                    quantity: BRTUtils.retrieveBRTRollAmount(rollTable) || "1",
                    brtType: BRTUtils.retrieveBRTType(rollTable),
                },
            ]);
        }, []);
        if (!rollTables.length) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningEmptyDocument`, {}), true);
            return false;
        }
        return rollTables;
    }

    // =========================================================
    // STATIC
    // =======================================================

    /**
     * Method to add some rolltables to the actor list
     * @param {Actor|UUID|string} actor
     * @param {RollTable|Folder|CompendiumCollection} data
     * @param {Object} [options={}]
     * @returns {Promise<RollTable[]>}
     */
    static async addRollTablesToActorList(actor, data, options = {}) {
        const isFolder = data.type === "Folder";
        const isTable = data.type === "RollTable";
        const isPack = data.type === "Compendium";

        const rollTables = null;

        // if (!isFolder && !isItem && !isTable && !isPack) {
        if (!isFolder && !isTable && !isPack) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningInvalidDocument`, {}), true);
            return false;
        }

        // Case 2: Folder of roll tables dropped.
        if (isFolder) {
            const folder = await fromUuid(data.uuid);
            // Must be a folder of roll tables.
            if (folder.type !== "RollTable") {
                Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningInvalidDocument`, {}), true);
                return false;
            }
            rollTables = folder.contents;
        }
        // Case 3: RollTable dropped.
        if (isTable) {
            const rollTable = await RetrieveHelpers.getRollTableAsync(data.uuid);
            rollTables = [rollTable];
        }
        // Case 4: Compendium dropped.
        if (isPack) {
            const pack = RetrieveHelpers.getCompendiumCollectionSync(data.id); // game.packs.get(data.id);
            if (pack.metadata.type !== "RollTable") {
                Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningInvalidDocument`, {}), true);
                return false;
            }

            const index = await pack.getIndex();
            rollTables = index.reduce((acc, rollTable) => {
                return acc.concat([
                    {
                        ...rollTable,
                        quantity: BRTUtils.retrieveBRTRollAmount(rollTable) || "1",
                        brtType: BRTUtils.retrieveBRTType(rollTable),
                    },
                ]);
            }, []);
        }

        if (!rollTables?.length) {
            Logger.warn(Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningEmptyDocument`, {}), true);
            return false;
        }

        for (const rollTable of rollTables) {
            const uuid = rollTable.uuid;
            const name = rollTable.name;

            const quantity = BRTUtils.retrieveBRTRollAmount(rollTable) || "1";
            const brtType = BRTUtils.retrieveBRTType(rollTable);

            const list =
                foundry.utils.getProperty(
                    actor,
                    `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`,
                ) ?? [];

            const existing = list.find((e) => e.uuid === uuid);
            if (existing) {
                existing.quantity = quantity ? quantity : existing.quantity;
                existing.brtType = brtType ? brtType : existing.brtType;
            } else {
                list.push({
                    quantity: quantity ? quantity : "1",
                    brtType: brtType ? brtType : "none",
                    uuid: uuid,
                });
            }
            actor.update({
                [`flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`]: list,
            });
        }
        Logger.info(
            Logger.i18nFormat(`${CONSTANTS.MODULE_ID}.label.WarningAddedRollTables`, {
                amount: rollTables.length,
                name: actor.name,
            }),
            true,
        );
        return rollTables;
    }

    /**
     * Method to add some rolltables to the actor list
     * @param {Actor|UUID|string} actor
     * @param {('none'|'better'|'loot'|'harvest'|'story')} brtType
     * @returns {Promise<{rollTableList:{rollTable:RollTable;options:{rollsAmount:string;rollAsTableType:string;}}[];currencies:string}>}
     */
    static async retrieveActorList(actor, brtType) {
        const list =
            foundry.utils.getProperty(
                actor,
                `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.ROLL_TABLES_LIST}`,
            ) ?? [];
        const curr =
            foundry.utils.getProperty(actor, `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.ACTOR_LIST.CURRENCIES}`) ??
            "";

        let listTmp = [];
        if (brtType && brtType !== "none") {
            listTmp = list.filter((rl) => {
                return rl.brtType === brtType;
            });
        } else {
            listTmp = list;
        }

        const rollTableArray = await Promise.all(
            listTmp.map(async ({ quantity, brtType, uuid }) => {
                const rollTable = await RetrieveHelpers.getRollTableAsync(uuid);
                return {
                    rollTable: rollTable,
                    options: {
                        rollsAmount: quantity,
                        rollAsTableType: brtType,
                    },
                };
            }),
        );

        return {
            rollTableList: rollTableArray,
            currencies: curr,
        };
    }
}
