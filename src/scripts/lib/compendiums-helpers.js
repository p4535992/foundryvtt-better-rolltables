import { CONSTANTS } from "../constants/constants";
import ItemPilesHelpers from "./item-piles-helpers";
import { RetrieveHelpers } from "./retrieve-helpers";

export default class CompendiumsHelpers {
    static PACK_ID = `world.${CONSTANTS.MODULE_ID}-backup-do-not-delete`;

    static COMPENDIUM_CACHE = {};

    static async initializeCompendiumCache() {
        Hooks.on("updateItem", async (item) => {
            if (!item?.pack || !item?.pack.startsWith(CompendiumsHelpers.PACK_ID)) return;
            COMPENDIUM_CACHE[item.uuid] = item.toObject();
        });

        const pack = game.packs.get(CompendiumsHelpers.PACK_ID);
        if (pack) {
            for (const index of pack.index) {
                const item = await pack.getDocument(index._id);
                COMPENDIUM_CACHE[item.uuid] = item.toObject();
            }
        }

        // setTimeout(async () => {
        //     await updateCache();
        //     Hooks.on("updateCompendium", updateCache);
        // }, 250);
    }

    static async getItemCompendium() {
        return (
            game.packs.get(CompendiumsHelpers.PACK_ID) ||
            (await CompendiumCollection.createCompendium({
                label: `BRT: Item Backup (DO NOT DELETE)`,
                id: CompendiumsHelpers.PACK_ID,
                private: true,
                type: "Item",
            }))
        );
    }

    static async addItemsToCompendium(items) {
        return Item.createDocuments(items, { pack: CompendiumsHelpers.PACK_ID });
    }

    static async findSimilarItemInCompendium(itemReference) {
        const itemToFind = await RetrieveHelpers.getItemAsync(itemReference);
        const pack = await CompendiumsHelpers.getItemCompendium();
        const item = game.packs.get(CompendiumsHelpers.PACK_ID).index.find((compendiumItem) => {
            return compendiumItem.name === itemToFind.name && compendiumItem.type === itemToFind.type;
        });
        return item?._id ? pack.getDocument(item._id) : false;
    }

    static getItemFromCache(uuid) {
        return COMPENDIUM_CACHE[uuid] ?? false;
    }

    static async findOrCreateItemInCompendium(itemData) {
        let compendiumItem = await CompendiumsHelpers.findSimilarItemInCompendium(itemData);
        if (!compendiumItem) {
            compendiumItem = (await CompendiumsHelpers.addItemsToCompendium([itemData]))[0];
        }
        COMPENDIUM_CACHE[compendiumItem.uuid] = itemData;
        return compendiumItem;
    }

    static findSimilarItemInCompendiumSync(itemToFind) {
        return (
            Object.values(COMPENDIUM_CACHE).find((compendiumItem) => {
                return compendiumItem.name === itemToFind.name && compendiumItem.type === itemToFind.type;
            }) ?? false
        );
    }

    // =================================
    // ADDITIONAL METHODS
    // =================================

    // static async recursivelyAddItemsToCompendium(itemData) {
    //     const flagData = PileUtilities.getItemFlagData(itemData);
    //     for (const priceGroup of flagData?.prices ?? []) {
    //         for (const price of priceGroup) {
    //             if (price.type !== "item" || !price.data.item) continue;
    //             const compendiumItemUuid = await CompendiumsHelpers.recursivelyAddItemsToCompendium(price.data.item)
    //                 .uuid;
    //             price.data = { uuid: compendiumItemUuid };
    //         }
    //     }
    //     setProperty(itemData, ItemPilesHelpers.FLAGS.ITEM, PileUtilities.cleanItemFlagData(flagData, { addRemoveFlag: true }));
    //     return CompendiumsHelpers.findOrCreateItemInCompendium(itemData);
    // }
}
