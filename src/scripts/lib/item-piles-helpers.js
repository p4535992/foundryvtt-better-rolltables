import Logger from "./Logger";

export default class ItemPilesHelpers {
  // ===================
  // CURRENCIES HELPERS
  // ===================

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   */
  static async addCurrencies(actorOrToken, currencies) {
    Logger.debug("addCurrencies | Currencies:", currencies);
    // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
    const currenciesForItemPiles = [];
    for (const currency of currencies) {
      if (currency.cost && currency.abbreviation) {
        const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
        Logger.debug("addCurrencies | Currency for Item Piles:", currencyForItemPilesS);
        currenciesForItemPiles.push(currencyForItemPilesS);
      }
    }
    Logger.debug("addCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
    const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
    Logger.debug("addCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
    await game.itempiles.API.addCurrencies(actorOrToken, currenciesForItemPilesS);
  }

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   * @returns {void}
   */
  static async removeCurrencies(actorOrToken, currencies) {
    Logger.debug("removeCurrencies | Currencies:", currencies);
    // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
    const currenciesForItemPiles = [];
    for (const currency of currencies) {
      if (currency.cost && currency.abbreviation) {
        const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
        Logger.debug("removeCurrencies | Currency for Item Piles:", currencyForItemPilesS);
        currenciesForItemPiles.push(currencyForItemPilesS);
      }
    }
    Logger.debug("removeCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
    const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
    Logger.debug("removeCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
    await game.itempiles.API.removeCurrencies(actorOrToken, currenciesForItemPilesS);
  }

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   */
  static async updateCurrencies(actorOrToken, currencies) {
    Logger.debug("updateCurrencies | Currencies:", currencies);
    // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
    const currenciesForItemPiles = [];
    for (const currency of currencies) {
      if (currency.cost && currency.abbreviation) {
        const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
        Logger.debug("updateCurrencies | Currency for Item Piles:", currencyForItemPilesS);
        currenciesForItemPiles.push(currencyForItemPilesS);
      }
    }
    Logger.debug("updateCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
    const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
    Logger.debug("updateCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
    await game.itempiles.API.updateCurrencies(actorOrToken, currenciesForItemPilesS);
  }

  /**
   *
   * @param {Actor|Token|TokenDocument} actorOrToken The actor or token to update
   * @param {Object[]} currencies - The array of currencies to pass to the actor
   * @param {string} currencies[].cost - The currency cost can be a number or a roll formula.
   * @param {string} currencies[].abbreviation - The currency abbreviation e.g. GP, SP.
   * @returns {boolean} The actor or token has enough money
   */
  static hasEnoughCurrencies(actorOrToken, currencies) {
    Logger.debug("hasEnoughCurrencies | Currencies:", currencies);
    // TODO waiting for item piles to fix this const currencyS = game.itempiles.API.getStringFromCurrencies(currencies);
    const currenciesForItemPiles = [];
    for (const currency of currencies) {
      if (currency.cost && currency.abbreviation) {
        const currencyForItemPilesS = (Math.abs(Number(currency.cost)) + currency.abbreviation).trim();
        Logger.debug("hasEnoughCurrencies | Currency for Item Piles:", currencyForItemPilesS);
        currenciesForItemPiles.push(currencyForItemPilesS);
      }
    }
    Logger.debug("hasEnoughCurrencies | Currencies for Item Piles:", currenciesForItemPiles);
    const currenciesForItemPilesS = currenciesForItemPiles.join(" ");
    Logger.debug("hasEnoughCurrencies | Currencies string for Item Piles:" + currenciesForItemPilesS);
    const currencyData = game.itempiles.API.getPaymentData(currenciesForItemPilesS, { target: actorOrToken });
    return currencyData.canBuy;
  }

  // ===================
  // LOOT HELPERS
  // ===================

  /**
   * Adds item to an actor, increasing item quantities if matches were found
   *
   * @param {Actor/TokenDocument/Token} actorOrToken            The target to add an item to
   * @param {Array} itemsToAdd                                  An array of objects, with the key "item" being an item object or an Item class (the foundry class), with an optional key of "quantity" being the amount of the item to add
   * @param {object} options                                    Options to pass to the function
   * @param {boolean} [options.removeExistingActorItems=false]  Whether to remove the actor's existing items before adding the new ones
   * @param {boolean} [options.skipVaultLogging=false]          Whether to skip logging this action to the target actor if it is a vault
   * @param {string/boolean} [options.interactionId=false]      The interaction ID of this action
   *
   * @returns {Promise<array>}                                  An array of objects, each containing the item that was added or updated, and the quantity that was added
   */
  static async addItems(
    actorOrToken,
    itemsToAdd,
    { removeExistingActorItems = false, skipVaultLogging = false, interactionId = false } = {}
  ) {
    const itemsData = game.itempiles.API.addItems(actorOrToken, itemsToAdd, {
      mergeSimilarItems: true,
    });
    Logger.debug(`addItems | Added ${itemsToAdd.length} items to ${targetedToken.name}`, itemsData);
    return itemsData;
  }
}
