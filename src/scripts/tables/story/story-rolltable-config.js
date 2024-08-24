import API from "../../API";
import { CONSTANTS } from "../../constants/constants";
import { BRTBetterHelpers } from "../better/brt-helper";
import { RichResultEdit } from "../../core/brt-result-editor";
import { BetterRollTableBetterConfig } from "../better/brt-rolltable-config";
import Logger from "../../lib/Logger";
import { BRTUtils } from "../../core/utils";

/**
 * The Application responsible for displaying and editing a single RollTable document.
 * @param {RollTable} table                 The RollTable document being configured
 * @param {DocumentSheetOptions} [options]  Additional application configuration options
 */
export class BetterRollTableStoryConfig extends RollTableConfig {
    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["sheet", "roll-table-config", `${CONSTANTS.MODULE_ID}-roll-table-config`],
            template: `modules/${CONSTANTS.MODULE_ID}/templates/sheet/brt-roll-table-config.hbs`,
            width: 1000,
            height: "auto",
            closeOnSubmit: false,
            viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
            // scrollY: ["table.table-results tbody"],
            // dragDrop: [{ dragSelector: null, dropSelector: null }],
            dragDrop: [
                // { dragSelector: null, dropSelector: null },
                {
                    dragSelector: "section.results .table-results .table-result",
                    dropSelector: "section.results .table-results",
                },
            ],
            scrollY: [".table-results tbody"],
            resizable: true,
        });
    }

    /* -------------------------------------------- */

    //  /** @inheritdoc */
    //  get title() {
    //    return `${game.i18n.localize("TABLE.SheetTitle")}: ${this.document.name}`;
    //  }

    /* -------------------------------------------- */

    /**
     * @override
     */
    async getData(options = {}) {
        const context = await super.getData(options);
        context.descriptionHTML = await TextEditor.enrichHTML(this.object.description, {
            secrets: this.object.isOwner,
        });
        const results = await Promise.all(
            this.document.results.map(async (result) => {
                const obj = await BRTBetterHelpers.updateTableResult(result);
                if (obj?.result) {
                    return obj.result;
                }
            }),
        );
        results.sort((a, b) => a.range[0] - b.range[0]);

        // Merge data and return;
        let brtData = foundry.utils.mergeObject(context, {
            results: results,
            resultTypes: Object.entries(CONST.TABLE_RESULT_TYPES).reduce((obj, v) => {
                obj[v[1]] = game.i18n.localize(`TABLE.RESULT_TYPES.${v[0]}.label`);
                return obj;
            }, {}),
            documentTypes: CONST.COMPENDIUM_DOCUMENT_TYPES.map((d) => ({
                value: d,
                label: game.i18n.localize(getDocumentClass(d).metadata.label),
            })),
            compendiumPacks: Array.from(game.packs.keys()).map((k) => ({ value: k, label: k })),
        });

        const brtTypeToCheck = BRTUtils.retrieveBRTType(this.document);

        // Set brt type
        if (brtTypeToCheck !== CONSTANTS.TABLE_TYPE_STORY) {
            await this.document.setFlag(
                CONSTANTS.MODULE_ID,
                CONSTANTS.FLAGS.TABLE_TYPE_KEY,
                CONSTANTS.TABLE_TYPE_STORY,
            );
        }
        brtData.usePercentage = this.document.getFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.GENERIC_USE_PERCENTAGE);
        brtData.useDynamicDc = false;
        brtData.tableType = CONSTANTS.TABLE_TYPE_STORY;
        brtData.textType =
            Logger.i18n(`${CONSTANTS.MODULE_ID}.${"TypePrefixLabel"}`) +
            " " +
            Logger.i18n(`${CONSTANTS.MODULE_ID}.${"TypeStory"}`) +
            "";

        brtData = foundry.utils.mergeObject(brtData, foundry.utils.duplicate(this.document.flags));
        brtData.disabled = !this.isEditable;
        brtData.uuid = this.document.uuid;
        brtData.owner = this.document.isOwner;
        // TODO
        // brtData.enrichedDescription = await TextEditor.enrichHTML(context.data.description, { async: true });

        this.canRoll = this.document.ownership[game.user.id]
            ? this.document.ownership[game.user.id] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER ||
              this.document.ownership[game.user.id] === CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER
            : this.isEditable;

        return brtData;
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /**
     * @param {JQuery} jq
     */
    activateListeners(jq) {
        super.activateListeners(jq);

        const html = jq[0];

        if (this.canRoll) {
            // html.querySelector(".better-rolltables-roll-story").addEventListener(
            //     "click",
            //     this._onBetterRollTablesRoll.bind(this),
            // );
            html.querySelectorAll(".better-rolltables-roll-story").forEach((el) => {
                el.disabled = false;
                el.addEventListener("click", this._onBetterRollTablesRoll.bind(this));
            });
        }

        // The below options require an editable sheet
        if (!this.isEditable) {
            return;
        }

        // Save the sheet on refresh of the table
        // html
        //   .querySelector("button.refresh")
        //   .addEventListener("click", this._onRefreshTable.bind(this));

        // Re-normalize Table Entries
        html.querySelector(".normalize-weights").addEventListener("click", this._onNormalizeWeights.bind(this));

        html.querySelectorAll(".rich-edit-result").forEach((el) =>
            el.addEventListener("click", this._openRichEditor.bind(this)),
        );

        // Edit a Image
        // html.find("img[data-edit]").on("click", this._onEditImage.bind(this));
        // html.querySelectorAll("img[data-edit]").forEach((el) =>
        //     el.addEventListener("click", this._onEditImage.bind(this)),
        // );

        // Edit a Result
        html.querySelectorAll("a.edit-result").forEach((el) =>
            el.addEventListener("click", this._onEditResult.bind(this)),
        );
        html.querySelectorAll("a.rich-edit-result").forEach((el) =>
            el.addEventListener("click", this._openRichEditor.bind(this)),
        );

        // Modify Page Id
        let selectPages = html.querySelector(".result-details .result-details-journal-page-id");
        selectPages?.addEventListener("change", this._onChangeResultJournalPageId.bind(this));

        // TODO
        // html.querySelector(".toggle-editor").addEventListener("click", (ev) => this._toggleSimpleEditor(ev, html));
    }

    /* -------------------------------------------- */

    //   /**
    //    * Handle creating a TableResult in the RollTable document
    //    * @param {MouseEvent} event        The originating mouse event
    //    * @param {object} [resultData]     An optional object of result data to use
    //    * @returns {Promise}
    //    * @private
    //    */
    //   async _onCreateResult(event, resultData={}) {
    //     event.preventDefault();

    //     // Save any pending changes
    //     await this._onSubmit(event);

    //     // Get existing results
    //     const results = Array.from(this.document.results.values());
    //     let last = results[results.length - 1];

    //     // Get weight and range data
    //     let weight = last ? (last.weight || 1) : 1;
    //     let totalWeight = results.reduce((t, r) => t + r.weight, 0) || 1;
    //     let minRoll = results.length ? Math.min(...results.map(r => r.range[0])) : 0;
    //     let maxRoll = results.length ? Math.max(...results.map(r => r.range[1])) : 0;

    //     // Determine new starting range
    //     const spread = maxRoll - minRoll + 1;
    //     const perW = Math.round(spread / totalWeight);
    //     const range = [maxRoll + 1, maxRoll + Math.max(1, weight * perW)];

    //     // Create the new Result
    //     resultData = foundry.utils.mergeObject({
    //       type: last ? last.type : CONST.TABLE_RESULT_TYPES.TEXT,
    //       documentCollection: last ? last.documentCollection : null,
    //       weight: weight,
    //       range: range,
    //       drawn: false
    //     }, resultData);
    //     return this.document.createEmbeddedDocuments("TableResult", [resultData]);
    //   }

    /* -------------------------------------------- */

    //   /**
    //    * Submit the entire form when a table result type is changed, in case there are other active changes
    //    * @param {Event} event
    //    * @private
    //    */
    //   _onChangeResultType(event) {
    //     event.preventDefault();
    //     const rt = CONST.TABLE_RESULT_TYPES;
    //     const select = event.target;
    //     const value = parseInt(select.value);
    //     const resultKey = select.name.replace(".type", "");
    //     let documentCollection = "";
    //     if ( value === rt.DOCUMENT ) documentCollection = "Actor";
    //     else if ( value === rt.COMPENDIUM ) documentCollection = game.packs.keys().next().value;
    //     const updateData = {[resultKey]: {documentCollection, documentId: null}};
    //     return this._onSubmit(event, {updateData});
    //   }

    /* -------------------------------------------- */

    /**
     * Handle deleting a TableResult from the RollTable document
     * @param {MouseEvent} event        The originating click event
     * @returns {Promise<TableResult>}   The deleted TableResult document
     * @private
     */
    async _onDeleteResult(event) {
        event.preventDefault();
        await this._onSubmit(event);
        const li = event.currentTarget.closest(".table-result");
        const result = this.object.results.get(li.dataset.resultId);
        return result.delete();
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _onDrop(event) {
        const json = TextEditor.getDragEventData(event);
        if (json.event === "sort") {
            const eel = event.target;
            const el = eel.dataset.resultId ? eel : eel.closest(".table-result[data-result-id]");
            if (!el) {
                Logger.warn("Drop target not found.", true);
                return;
            }
            return this.reorderIndex(event, json.result, el.dataset.resultId);
        } else {
            if (json.type === "JournalEntryPage") {
                const journalPage = await fromUuid(json.uuid);

                const data = await fromUuid(journalPage.parent.uuid);
                data.type = data.documentName;
                const allowed = Hooks.call("dropRollTableSheetData", this.document, this, data);
                if (allowed === false) return;

                // Get the dropped document
                if (!CONST.COMPENDIUM_DOCUMENT_TYPES.includes(data.type)) return;
                //const cls = getDocumentClass(data.type);
                //const document = await cls.fromDropData(data);
                const document = data;
                if (!document || document.isEmbedded) return;

                // Delegate to the onCreate handler
                const isCompendium = !!document.compendium;
                return await this._onCreateResult(event, {
                    type: isCompendium ? CONST.TABLE_RESULT_TYPES.COMPENDIUM : CONST.TABLE_RESULT_TYPES.DOCUMENT,
                    documentCollection: isCompendium ? document.pack : document.documentName,
                    text: document.name,
                    documentId: document.id,
                    img: document.img || null,
                    flags: {
                        [`${CONSTANTS.MODULE_ID}`]: {
                            [`${CONSTANTS.FLAGS.GENERIC_RESULT_JOURNAL_PAGE_UUID}`]: json.uuid,
                        },
                    },
                });
            } else {
                return super._onDrop(event);
            }
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle changing the actor profile image by opening a FilePicker
     * @param {Event} event
     * @private
     */
    _onEditImage(event) {
        const img = event.currentTarget;
        const isHeader = img.dataset.edit === "img";
        let current = this.document.img;
        if (!isHeader) {
            const li = img.closest(".table-result");
            const result = this.document.results.get(li.dataset.resultId);
            // MOD 4535992 removed we want to customize the image
            // if (result.type !== CONST.TABLE_RESULT_TYPES.TEXT) return;
            current = result.img;
        }
        const fp = new FilePicker({
            type: "image",
            current: current,
            callback: async (path) => {
                // MOD 4535992 make async
                img.src = path;
                // START MOD 4535992 added we want to customize the image
                const resultImage = img.closest(".result-image");
                let resultImageInputs = resultImage.querySelectorAll("input");
                let inputCustomIcon = resultImageInputs[0].value || "";
                if (inputCustomIcon !== path) {
                    resultImageInputs[0].value = path;
                }
                // const resultDocUuid = foundry.utils.getProperty(
                //     result,
                //     `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_UUID}`,
                // );
                // const resultDoc = await fromUuid(resultDocUuid);
                // await result.setFlag(CONSTANTS.MODULE_ID, CONSTANTS.FLAGS.GENERIC_RESULT_CUSTOM_ICON, path);
                // END MOD 4535992 added we want to customize the image
                return this._onSubmit(event);
            },
            top: this.position.top + 40,
            left: this.position.left + 10,
        });
        return fp.browse();
    }

    /* -------------------------------------------- */

    //   /**
    //    * Handle a button click to re-normalize dice result ranges across all RollTable results
    //    * @param {Event} event
    //    * @private
    //    */
    //   async _onNormalizeResults(event) {
    //     event.preventDefault();
    //     if ( !this.rendered || this._submitting) return false;

    //     // Save any pending changes
    //     await this._onSubmit(event);

    //     // Normalize the RollTable
    //     return this.document.normalize();
    //   }

    /* -------------------------------------------- */

    //   /**
    //    * Handle toggling the drawn status of the result in the table
    //    * @param {Event} event
    //    * @private
    //    */
    //   _onLockResult(event) {
    //     event.preventDefault();
    //     const tableResult = event.currentTarget.closest(".table-result");
    //     const result = this.document.results.get(tableResult.dataset.resultId);
    //     return result.update({drawn: !result.drawn});
    //   }

    /* -------------------------------------------- */

    //   /**
    //    * Reset the Table to it's original composition with all options unlocked
    //    * @param {Event} event
    //    * @private
    //    */
    //   _onResetTable(event) {
    //     event.preventDefault();
    //     return this.document.resetResults();
    //   }

    /* -------------------------------------------- */

    /**
     * Handle drawing a result from the RollTable
     * @param {Event} event
     * @private
     */
    async _onRollTable(event) {
        // event.preventDefault();
        // await this.submit({preventClose: true, preventRender: true});
        // event.currentTarget.disabled = true;
        // let tableRoll = await this.document.roll();
        // const draws = this.document.getResultsForRoll(tableRoll.roll.total);
        // if ( draws.length ) {
        //   if (game.settings.get("core", "animateRollTable")) await this._animateRoll(draws);
        //   await this.document.draw(tableRoll);
        // }
        // event.currentTarget.disabled = false;
        return await super._onRollTable(event);
    }

    /* -------------------------------------------- */

    //   /**
    //    * Configure the update object workflow for the Roll Table configuration sheet
    //    * Additional logic is needed here to reconstruct the results array from the editable fields on the sheet
    //    * @param {Event} event            The form submission event
    //    * @param {Object} formData        The validated FormData translated into an Object for submission
    //    * @returns {Promise}
    //    * @private
    //    */
    //   async _updateObject(event, formData) {
    //     // Expand the data to update the results array
    //     const expanded = foundry.utils.expandObject(formData);
    //     expanded.results = expanded.hasOwnProperty("results") ? Object.values(expanded.results) : [];
    //     for (let r of expanded.results) {
    //       r.range = [r.rangeL, r.rangeH];
    //       switch (r.type) {

    //         // Document results
    //         case CONST.TABLE_RESULT_TYPES.DOCUMENT:
    //           const collection = game.collections.get(r.documentCollection);
    //           if (!collection) continue;

    //           // Get the original document, if the name still matches - take no action
    //           const original = r.documentId ? collection.get(r.documentId) : null;
    //           if (original && (original.name === r.text)) continue;

    //           // Otherwise, find the document by ID or name (ID preferred)
    //           const doc = collection.find(e => (e.id === r.text) || (e.name === r.text)) || null;
    //           r.documentId = doc?.id ?? null;
    //           r.text = doc?.name ?? null;
    //           r.img = doc?.img ?? null;
    //           r.img = doc?.thumb || doc?.img || null;
    //           break;

    //         // Compendium results
    //         case CONST.TABLE_RESULT_TYPES.COMPENDIUM:
    //           const pack = await getCompendiumCollectionAsync(r.documentCollection, true, false);
    //           if (pack) {

    //             // Get the original entry, if the name still matches - take no action
    //             const original = pack.index.get(r.documentId) || null;
    //             if (original && (original.name === r.text)) continue;

    //             // Otherwise, find the document by ID or name (ID preferred)
    //             const doc = pack.index.find(i => (i._id === r.text) || (i.name === r.text)) || null;
    //             r.documentId = doc?._id || null;
    //             r.text = doc?.name || null;
    //             r.img = doc?.thumb || doc?.img || null;
    //           }
    //           break;

    //         // Plain text results
    //         default:
    //           r.type = CONST.TABLE_RESULT_TYPES.TEXT;
    //           r.documentCollection = null;
    //           r.documentId = null;
    //       }
    //     }

    //     // Update the object
    //     return this.document.update(expanded, {diff: false, recursive: false});
    //   }

    /* -------------------------------------------- */

    /**
     * MOD Modified copy of core _animateRoll to ensure it does not constantly break with the changed layout.
     * Display a roulette style animation when a Roll Table result is drawn from the sheet
     * @param {TableResult[]} results     An Array of drawn table results to highlight
     * @returns {Promise}                  A Promise which resolves once the animation is complete
     * @protected
     */
    async _animateRoll(results) {
        // Get the list of results and their indices
        const tableResults = this.element[0].querySelector(".table-results > tbody"); // MOD ".table-results" instead ".table-results > tbody"
        const drawnIds = new Set(results.map((r) => r.id));
        const drawnItems = Array.from(tableResults.children).filter((item) => drawnIds.has(item.dataset.resultId));

        // Set the animation timing
        const nResults = this.object.results.size;
        const maxTime = 2000;
        let animTime = 50;
        let animOffset = Math.round(tableResults.offsetHeight / (tableResults.children[1].offsetHeight * 2)); // MOD [1] instead [0]
        const nLoops = Math.min(Math.ceil(maxTime / (animTime * nResults)), 4);
        if (nLoops === 1) animTime = maxTime / nResults;

        // Animate the roulette
        await this._animateRoulette(tableResults, drawnIds, nLoops, animTime, animOffset);

        // Flash the results
        const flashes = drawnItems.map((li) => this._flashResult(li));
        return Promise.all(flashes);
    }

    /* -------------------------------------------- */

    //   /**
    //    * Animate a "roulette" through the table until arriving at the final loop and a drawn result
    //    * @param {HTMLOListElement} ol     The list element being iterated
    //    * @param {Set<string>} drawnIds    The result IDs which have already been drawn
    //    * @param {number} nLoops           The number of times to loop through the animation
    //    * @param {number} animTime         The desired animation time in milliseconds
    //    * @param {number} animOffset       The desired pixel offset of the result within the list
    //    * @returns {Promise}               A Promise that resolves once the animation is complete
    //    * @protected
    //    */
    //   async _animateRoulette(ol, drawnIds, nLoops, animTime, animOffset) {
    //     let loop = 0;
    //     let idx = 0;
    //     let item = null;
    //     return new Promise(resolve => {
    //       let animId = setInterval(() => {
    //         if (idx === 0) loop++;
    //         if (item) item.classList.remove("roulette");

    //         // Scroll to the next item
    //         item = ol.children[idx];
    //         ol.scrollTop = (idx - animOffset) * item.offsetHeight;

    //         // If we are on the final loop
    //         if ( (loop === nLoops) && drawnIds.has(item.dataset.resultId) ) {
    //           clearInterval(animId);
    //           return resolve();
    //         }

    //         // Continue the roulette and cycle the index
    //         item.classList.add("roulette");
    //         idx = idx < ol.children.length - 1 ? idx + 1 : 0;
    //       }, animTime);
    //     });
    //   }

    /* -------------------------------------------- */

    //   /**
    //    * Display a flashing animation on the selected result to emphasize the draw
    //    * @param {HTMLElement} item      The HTML &lt;li> item of the winning result
    //    * @returns {Promise}              A Promise that resolves once the animation is complete
    //    * @protected
    //    */
    //   async _flashResult(item) {
    //     return new Promise(resolve => {
    //       let count = 0;
    //       let animId = setInterval(() => {
    //         if (count % 2) item.classList.remove("roulette");
    //         else item.classList.add("roulette");
    //         if (count === 7) {
    //           clearInterval(animId);
    //           resolve();
    //         }
    //         count++;
    //       }, 50);
    //     });
    //   }

    /* ============================================== */

    /**
     * @param {DragEvent} event
     */
    _onDragStart(event) {
        const eel = event.target;
        const el = eel.dataset.resultId ? eel : eel.closest(".table-result[data-result-id]");
        event.dataTransfer?.setData(
            "text/plain",
            JSON.stringify({ event: "sort", index: el.dataset.index, result: el.dataset.resultId }),
        );
    }

    /**
     * @param {String} source Source ID
     * @param {String} target Target ID
     */
    async reorderIndex(event, source, target) {
        if (!this.rendered || this._submitting) return false;
        // Save any pending changes
        await this._onSubmit(event);

        // Normalize weights just in case
        /** @type {Object[]} */
        const results = this.document.results.map((result) => result.toObject(false));
        results.sort((a, b) => a.range[0] - b.range[0]);

        const sourceIx = results.findIndex((r) => r._id === source),
            targetIx = results.findIndex((r) => r._id === target);

        if (sourceIx == targetIx) {
            Logger.warn("Can't move result onto itself.", true);
            return;
        }

        // Move result
        const [moved] = results.splice(sourceIx, 1);
        results.splice(targetIx, 0, moved);

        // Update weight
        results.forEach((r) => (r.weight = r.range[1] - (r.range[0] - 1)));
        let totalWeight = 1;
        const updates = [];
        for (const result of results) {
            const w = result.weight;
            updates.push({ _id: result._id, weight: w, range: [totalWeight, totalWeight + w - 1] });
            totalWeight = totalWeight + w;
        }
        return this.document.updateEmbeddedDocuments("TableResult", updates);
    }

    /**
     * Sets weights based on ranges
     * @param {Event} event
     */
    async _onNormalizeWeights(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.rendered || this._submitting) return false;

        // Save any pending changes
        await this._onSubmit(event);

        const results = this.document.results.map((result) => result.toObject(false));

        const updates = results.map((r) => ({ _id: r._id, weight: r.range[1] - (r.range[0] - 1) }));

        return this.document.updateEmbeddedDocuments("TableResult", updates);
    }

    /**
     * @param {Event} event
     */
    async _openRichEditor(event) {
        event.preventDefault();
        event.stopPropagation();

        // Save any pending changes
        await this._onSubmit(event);

        const parent = event.target.closest(".table-result[data-result-id]");
        const id = parent.dataset.resultId;
        const result = this.document.results.get(id);

        const uuid = `richedit-${result.uuid}`;
        const old = Object.values(ui.windows).find((app) => app.options.id === uuid);
        if (old) return old.render(true, { focus: true });

        const update = await RichResultEdit.open(result);
    }

    /**
     * @param {Event} event
     */
    _toggleSimpleEditor(event, html) {
        event.preventDefault();
        event.stopPropagation();

        const simpleEditor = document.createElement("textarea");
        simpleEditor.name = "description";
        simpleEditor.innerHTML = this.object.description;
        const editor = html.querySelector(".description-editor");
        editor?.replaceChildren(simpleEditor);
        this.editors = {}; // Bust rich edit
    }

    _getSubmitData(updateData) {
        const data = super._getSubmitData(updateData);
        // HACK: Zero description caused by ProseMirror
        if (data.description == "<p></p>") data.description = "";
        return data;
    }

    /* -------------------------------------------- */

    /**
     * Handle toggling the drawn status of the result in the table
     * @param {Event} event
     * @private
     */
    async _onEditResult(event) {
        event.preventDefault();
        const tableResult = event.currentTarget.closest(".table-result");
        const result = this.document.results.get(tableResult.dataset.resultId);
        let findDocument = await BRTBetterHelpers.retrieveDocumentFromResult(result, true);

        let isJournal = findDocument instanceof JournalEntry;
        let docJournalPageUuid = foundry.utils.getProperty(
            result,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_JOURNAL_PAGE_UUID}`,
        );
        if (isJournal && docJournalPageUuid) {
            findDocument = await fromUuid(docJournalPageUuid);
        }

        if (findDocument) {
            findDocument.sheet.render(true);
        } else {
            Logger.warn(`No document is been found to edit`, true);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle drawing a result from the RollTable
     * @param {Event} event
     * @private
     */
    async _onBetterRollTablesRoll(event) {
        event.preventDefault();
        await this.submit({ preventClose: true, preventRender: true });
        if (event.currentTarget) {
            event.currentTarget.disabled = true;
        } else {
            event.target.disabled = true;
        }

        const brtTypeToCheck = BRTUtils.retrieveBRTType(this.document);

        // Set brt type
        if (brtTypeToCheck !== CONSTANTS.TABLE_TYPE_STORY) {
            await this.document.setFlag(
                CONSTANTS.MODULE_ID,
                CONSTANTS.FLAGS.TABLE_TYPE_KEY,
                CONSTANTS.TABLE_TYPE_STORY,
            );
        }
        const tableEntity = this.document;
        await API.generateChatStory(tableEntity);
        if (event.currentTarget) {
            event.currentTarget.disabled = false;
        } else {
            event.target.disabled = false;
        }
    }

    /* -------------------------------------------- */

    /**
     * Submit the entire form when a table result type is changed, in case there are other active changes
     * @param {Event} event
     * @private
     */
    async _onChangeResultJournalPageId(event) {
        event.preventDefault();
        const select = event.target;
        const value = select.value;
        const resultKey = select.name;
        const tableResult = event.currentTarget.closest(".table-result");
        const result = this.document.results.get(tableResult.dataset.resultId);

        foundry.utils.setProperty(
            result,
            `flags.${CONSTANTS.MODULE_ID}.${CONSTANTS.FLAGS.GENERIC_RESULT_JOURNAL_PAGE_UUID}`,
            value,
        );
        // Save any pending changes
        await this._onSubmit(event);

        await result.update({
            flags: {
                [`${CONSTANTS.MODULE_ID}`]: {
                    [`${CONSTANTS.FLAGS.GENERIC_RESULT_JOURNAL_PAGE_UUID}`]: value ?? "",
                },
            },
        });
    }

    /* -------------------------------------------- */
}
