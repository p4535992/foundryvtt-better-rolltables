/**
 * The Application responsible for displaying and editing a single RollTable document.
 * @param {RollTable} table                 The RollTable document being configured
 * @param {DocumentSheetOptions} [options]  Additional application configuration options
 */
class RollTableConfig extends DocumentSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "roll-table-config"],
      template: "templates/sheets/roll-table-config.html",
      width: 720,
      height: "auto",
      closeOnSubmit: false,
      viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
      scrollY: ["table.table-results"],
      dragDrop: [{dragSelector: null, dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  get title() {
    return `${game.i18n.localize("TABLE.SheetTitle")}: ${this.document.name}`;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options={}) {
    const context = super.getData(options);
    context.descriptionHTML = await TextEditor.enrichHTML(this.object.description, {async: true, secrets: this.object.isOwner});
    const results = this.document.results.map(result => {
      result = result.toObject(false);
      result.isText = result.type === CONST.TABLE_RESULT_TYPES.TEXT;
      result.isDocument = result.type === CONST.TABLE_RESULT_TYPES.DOCUMENT;
      result.isCompendium = result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM;
      result.img = result.img || CONFIG.RollTable.resultIcon;
      result.text = TextEditor.decodeHTML(result.text);
      return result;
    });
    results.sort((a, b) => a.range[0] - b.range[0]);

    // Merge data and return;
    return foundry.utils.mergeObject(context, {
      results: results,
      resultTypes: Object.entries(CONST.TABLE_RESULT_TYPES).reduce((obj, v) => {
        obj[v[1]] = v[0].titleCase();
        return obj;
      }, {}),
      documentTypes: CONST.COMPENDIUM_DOCUMENT_TYPES,
      compendiumPacks: Array.from(game.packs.keys())
    });
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Roll the Table
    const button = html.find("button.roll");
    button.click(this._onRollTable.bind(this));
    button[0].disabled = false;

    // The below options require an editable sheet
    if (!this.isEditable) return;

    // Reset the Table
    html.find("button.reset").click(this._onResetTable.bind(this));

    // Save the sheet on checkbox change
    html.find('input[type="checkbox"]').change(this._onSubmit.bind(this));

    // Create a new Result
    html.find("a.create-result").click(this._onCreateResult.bind(this));

    // Delete a Result
    html.find("a.delete-result").click(this._onDeleteResult.bind(this));

    // Lock or Unlock a Result
    html.find("a.lock-result").click(this._onLockResult.bind(this));

    // Modify Result Type
    html.find(".result-type select").change(this._onChangeResultType.bind(this));

    // Re-normalize Table Entries
    html.find(".normalize-results").click(this._onNormalizeResults.bind(this));
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a TableResult in the RollTable document
   * @param {MouseEvent} event        The originating mouse event
   * @param {object} [resultData]     An optional object of result data to use
   * @returns {Promise}
   * @private
   */
  async _onCreateResult(event, resultData={}) {
    event.preventDefault();

    // Save any pending changes
    await this._onSubmit(event);

    // Get existing results
    const results = Array.from(this.document.results.values());
    let last = results[results.length - 1];

    // Get weight and range data
    let weight = last ? (last.weight || 1) : 1;
    let totalWeight = results.reduce((t, r) => t + r.weight, 0) || 1;
    let minRoll = results.length ? Math.min(...results.map(r => r.range[0])) : 0;
    let maxRoll = results.length ? Math.max(...results.map(r => r.range[1])) : 0;

    // Determine new starting range
    const spread = maxRoll - minRoll + 1;
    const perW = Math.round(spread / totalWeight);
    const range = [maxRoll + 1, maxRoll + Math.max(1, weight * perW)];

    // Create the new Result
    resultData = foundry.utils.mergeObject({
      type: last ? last.type : CONST.TABLE_RESULT_TYPES.TEXT,
      documentCollection: last ? last.documentCollection : null,
      weight: weight,
      range: range,
      drawn: false
    }, resultData);
    return this.document.createEmbeddedDocuments("TableResult", [resultData]);
  }

  /* -------------------------------------------- */

  /**
   * Submit the entire form when a table result type is changed, in case there are other active changes
   * @param {Event} event
   * @private
   */
  _onChangeResultType(event) {
    event.preventDefault();
    const rt = CONST.TABLE_RESULT_TYPES;
    const select = event.target;
    const value = parseInt(select.value);
    const resultKey = select.name.replace(".type", "");
    let documentCollection = "";
    if ( value === rt.DOCUMENT ) documentCollection = "Actor";
    else if ( value === rt.COMPENDIUM ) documentCollection = game.packs.keys().next().value;
    const updateData = {[resultKey]: {documentCollection, documentId: null}};
    return this._onSubmit(event, {updateData});
  }

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
    const data = TextEditor.getDragEventData(event);
    const allowed = Hooks.call("dropRollTableSheetData", this.document, this, data);
    if ( allowed === false ) return;

    // Get the dropped document
    if ( !CONST.DOCUMENT_TYPES.includes(data.type) ) return;
    const cls = getDocumentClass(data.type);
    const document = await cls.fromDropData(data);
    if ( !document || document.isEmbedded ) return;

    // Delegate to the onCreate handler
    const isCompendium = !!document.compendium;
    return this._onCreateResult(event, {
      type: isCompendium ? CONST.TABLE_RESULT_TYPES.COMPENDIUM : CONST.TABLE_RESULT_TYPES.DOCUMENT,
      documentCollection: isCompendium ? document.pack : document.documentName,
      text: document.name,
      documentId: document.id,
      img: document.img || null
    });
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
    if ( !isHeader ) {
      const li = img.closest(".table-result");
      const result = this.document.results.get(li.dataset.resultId);
      if (result.type !== CONST.TABLE_RESULT_TYPES.TEXT) return;
      current = result.img;
    }
    const fp = new FilePicker({
      type: "image",
      current: current,
      callback: path => {
        img.src = path;
        return this._onSubmit(event);
      },
      top: this.position.top + 40,
      left: this.position.left + 10
    });
    return fp.browse();
  }

  /* -------------------------------------------- */

  /**
   * Handle a button click to re-normalize dice result ranges across all RollTable results
   * @param {Event} event
   * @private
   */
  async _onNormalizeResults(event) {
    event.preventDefault();
    if ( !this.rendered || this._submitting) return false;

    // Save any pending changes
    await this._onSubmit(event);

    // Normalize the RollTable
    return this.document.normalize();
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling the drawn status of the result in the table
   * @param {Event} event
   * @private
   */
  _onLockResult(event) {
    event.preventDefault();
    const tableResult = event.currentTarget.closest(".table-result");
    const result = this.document.results.get(tableResult.dataset.resultId);
    return result.update({drawn: !result.drawn});
  }

  /* -------------------------------------------- */

  /**
   * Reset the Table to it's original composition with all options unlocked
   * @param {Event} event
   * @private
   */
  _onResetTable(event) {
    event.preventDefault();
    return this.document.resetResults();
  }

  /* -------------------------------------------- */

  /**
   * Handle drawing a result from the RollTable
   * @param {Event} event
   * @private
   */
  async _onRollTable(event) {
    event.preventDefault();
    await this.submit({preventClose: true, preventRender: true});
    event.currentTarget.disabled = true;
    let tableRoll = await this.document.roll();
    const draws = this.document.getResultsForRoll(tableRoll.roll.total);
    if ( draws.length ) {
      if (game.settings.get("core", "animateRollTable")) await this._animateRoll(draws);
      await this.document.draw(tableRoll);
    }
    event.currentTarget.disabled = false;
  }

  /* -------------------------------------------- */

  /**
   * Configure the update object workflow for the Roll Table configuration sheet
   * Additional logic is needed here to reconstruct the results array from the editable fields on the sheet
   * @param {Event} event            The form submission event
   * @param {Object} formData        The validated FormData translated into an Object for submission
   * @returns {Promise}
   * @private
   */
  async _updateObject(event, formData) {
    // Expand the data to update the results array
    const expanded = foundry.utils.expandObject(formData);
    expanded.results = expanded.hasOwnProperty("results") ? Object.values(expanded.results) : [];
    for (let r of expanded.results) {
      r.range = [r.rangeL, r.rangeH];
      switch (r.type) {

        // Document results
        case CONST.TABLE_RESULT_TYPES.DOCUMENT:
          const collection = game.collections.get(r.documentCollection);
          if (!collection) continue;

          // Get the original document, if the name still matches - take no action
          const original = r.documentId ? collection.get(r.documentId) : null;
          if (original && (original.name === r.text)) continue;

          // Otherwise, find the document by ID or name (ID preferred)
          const doc = collection.find(e => (e.id === r.text) || (e.name === r.text)) || null;
          r.documentId = doc?.id ?? null;
          r.text = doc?.name ?? null;
          r.img = doc?.img ?? null;
          r.img = doc?.thumb || doc?.img || null;
          break;

        // Compendium results
        case CONST.TABLE_RESULT_TYPES.COMPENDIUM:
          const pack = game.packs.get(r.documentCollection);
          if (pack) {

            // Get the original entry, if the name still matches - take no action
            const original = pack.index.get(r.documentId) || null;
            if (original && (original.name === r.text)) continue;

            // Otherwise, find the document by ID or name (ID preferred)
            const doc = pack.index.find(i => (i._id === r.text) || (i.name === r.text)) || null;
            r.documentId = doc?._id || null;
            r.text = doc?.name || null;
            r.img = doc?.thumb || doc?.img || null;
          }
          break;

        // Plain text results
        default:
          r.type = 0;
          r.documentCollection = null;
          r.documentId = null;
      }
    }

    // Update the object
    return this.document.update(expanded, {diff: false, recursive: false});
  }

  /* -------------------------------------------- */

  /**
   * Display a roulette style animation when a Roll Table result is drawn from the sheet
   * @param {TableResult[]} results     An Array of drawn table results to highlight
   * @returns {Promise}                  A Promise which resolves once the animation is complete
   * @protected
   */
  async _animateRoll(results) {

    // Get the list of results and their indices
    const tableResults = this.element[0].querySelector(".table-results > tbody");
    const drawnIds = new Set(results.map(r => r.id));
    const drawnItems = Array.from(tableResults.children).filter(item => drawnIds.has(item.dataset.resultId));

    // Set the animation timing
    const nResults = this.object.results.size;
    const maxTime = 2000;
    let animTime = 50;
    let animOffset = Math.round(tableResults.offsetHeight / (tableResults.children[0].offsetHeight * 2));
    const nLoops = Math.min(Math.ceil(maxTime/(animTime * nResults)), 4);
    if ( nLoops === 1 ) animTime = maxTime / nResults;

    // Animate the roulette
    await this._animateRoulette(tableResults, drawnIds, nLoops, animTime, animOffset);

    // Flash the results
    const flashes = drawnItems.map(li => this._flashResult(li));
    return Promise.all(flashes);
  }

  /* -------------------------------------------- */

  /**
   * Animate a "roulette" through the table until arriving at the final loop and a drawn result
   * @param {HTMLOListElement} ol     The list element being iterated
   * @param {Set<string>} drawnIds    The result IDs which have already been drawn
   * @param {number} nLoops           The number of times to loop through the animation
   * @param {number} animTime         The desired animation time in milliseconds
   * @param {number} animOffset       The desired pixel offset of the result within the list
   * @returns {Promise}               A Promise that resolves once the animation is complete
   * @protected
   */
  async _animateRoulette(ol, drawnIds, nLoops, animTime, animOffset) {
    let loop = 0;
    let idx = 0;
    let item = null;
    return new Promise(resolve => {
      let animId = setInterval(() => {
        if (idx === 0) loop++;
        if (item) item.classList.remove("roulette");

        // Scroll to the next item
        item = ol.children[idx];
        ol.scrollTop = (idx - animOffset) * item.offsetHeight;

        // If we are on the final loop
        if ( (loop === nLoops) && drawnIds.has(item.dataset.resultId) ) {
          clearInterval(animId);
          return resolve();
        }

        // Continue the roulette and cycle the index
        item.classList.add("roulette");
        idx = idx < ol.children.length - 1 ? idx + 1 : 0;
      }, animTime);
    });
  }

  /* -------------------------------------------- */

  /**
   * Display a flashing animation on the selected result to emphasize the draw
   * @param {HTMLElement} item      The HTML &lt;li> item of the winning result
   * @returns {Promise}              A Promise that resolves once the animation is complete
   * @protected
   */
  async _flashResult(item) {
    return new Promise(resolve => {
      let count = 0;
      let animId = setInterval(() => {
        if (count % 2) item.classList.remove("roulette");
        else item.classList.add("roulette");
        if (count === 7) {
          clearInterval(animId);
          resolve();
        }
        count++;
      }, 50);
    });
  }
}
