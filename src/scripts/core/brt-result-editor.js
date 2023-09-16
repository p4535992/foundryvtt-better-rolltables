import { CONSTANTS } from "../constants/constants";

export class RichResultEdit extends DocumentSheet {
  /**
   * @param {TableResult} result
   */
  constructor(result, options) {
    super(result, options);
    this.options.id = `richedit-${result.uuid}`;
    this.options.title = game.i18n.format(`${CONSTANTS.MODULE_ID}.label.RichEdit.Title`, {
      table: result.parent.name,
      result: result.id,
    });

    this.resolve = options.resolve;

    result.parent.apps[this.appId] = this;
  }

  get template() {
    return `modules/${CONSTANTS.MODULE_ID}/templates/sheet/brt-result-editor.hbs`;
  }

  static get defaultOptions() {
    const _default = super.defaultOptions;
    return {
      ..._default,
      classes: [..._default.classes, `${CONSTANTS.MODULE_ID}-rolltable-result-richedit`],
      width: 540,
      height: 360,
      resizable: true,
      submitOnChange: true,
      closeOnSubmit: true,
      submitOnClose: false,
    };
  }

  async getData() {
    const context = super.getData();
    context.result = this.document;
    return context;
  }

  close(options) {
    delete this.document.parent.apps[this.appId];

    super.close(options);
    this.resolve(this.result);
  }

  _updateObject(event, formData) {
    this.object.update(formData);
    this.close();
  }

  static open(result) {
    return new Promise((resolve) => new RichResultEdit(result, { resolve }).render(true, { focus: true }));
  }
}
